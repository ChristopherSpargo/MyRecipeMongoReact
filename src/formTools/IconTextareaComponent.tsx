'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { FieldErrorMsgs, FieldErrorMsg } from './FieldErrorsComponent';
import { StringMsgList } from './StringMsgList'


const L_EMPTY           =   0;   // line is empty
const LSW_NUMBER        =   1;   // line starts with a number
const LSW_BULLET        =   4;   // line starts with a bullet
const LSW_OTHER         =   8;
const LEW_SEMICOLON     =  16;   // line ends with semicolon /:$/g
const L_NUMBER_ONLY     =  32;   // line consists of a number and spaces only
const L_BULLET_ONLY     =  64;   // line consists of a bullet and spaces only
const LSW_SPACE         = 128;   // line starts with one or more spaces


@observer
class IconTextarea extends React.Component <{
  fName        ?: string,   // unique name for field
  fCheckAll    ?: boolean,  // flag to check all fields for errors (not just touched fields)
  fRequired    ?: boolean,  // if input is required
  fDisabled    ?: boolean,  // when input should be disabled
  fReadonly    ?: string,   // if the field is readonly
  fList        ?: string,   // if the field should be formatted as a list (with bullets)
  fLabel       ?: string,   // label for input
  fFocusedLabel?: string,   // label for field when focused or has a value
  fIcon        ?: string,   // icon for input
  fColor       ?: string,   // color for icon
  fValue       ?: any,      // model for this field
  fErrors      ?: string,   // array of error key names
  fErrorMsgs   ?: string,   // array of messages for the error keys
  fErrorMulti  ?: boolean,  // 'true' if allow multiple error messages
  fMaxlength   ?: number,   // value for maxlength (if any)
  fRows        ?: number,   // number of rows for text area
  fFocusFn     ?: Function, // function to execute on focus
  fBlurFn      ?: Function, // function to execute on blur
  fOnInput     ?: Function, // function to execute on input
  fExtraCSS    ?: string,   // CSS classes to add to main div
  fTextSize    ?: string    // CSS class to add to textarea element
}, {} > {

  listType = '';
  @observable fieldValue: string = '';
  fRef: any;
  @observable touched = false;
  fMsgs: FieldErrorMsg[] = [];
  @observable errorStatus = new StringMsgList();

  @observable focused: boolean = false;
  aErrors: string[];
  aMsgs:   string[];
  @observable containerOpen: boolean = false;
  @observable lastOp:   string;   // flag used to control opening/closing of the textarea container
  selStart: number;   // selected text start or cursor position in text
  selEnd:   number;   // selected text end or cursor position in text
  el:       any;      // DOM element for this textarea
 
  componentWillMount() {
    if (this.props.fErrors) {
      this.aErrors = this.props.fErrors.split('|');
    }
    if (this.props.fErrorMsgs) {
      this.aMsgs = this.props.fErrorMsgs.split('|');
    }
  }

  componentWillReceiveProps(nextProps : any) {
    if (nextProps.fValue !== this.fieldValue) {
      this.fieldValue = nextProps.fValue;
      this.listType = nextProps.fList || '';
    }
  }

  toggleContainer = () => { // toggle expanded state of textarea container
    if (this.lastOp !== 'blur') { 
      this.containerOpen = !this.containerOpen;
    }
    this.lastOp = 'toggle'
  }

  showFocused = () => {
    this.focused = this.containerOpen = true;
    if (this.props.fFocusFn) { this.props.fFocusFn(); }
  }

  showNotFocused = () => {
    this.lastOp = 'blur';
    this.touched = true;
    if (this.props.fBlurFn && (this.fieldValue !== this.props.fValue)) {
      this.props.fBlurFn(this.fieldValue)
    }
    this.focused = this.containerOpen = false;
    setTimeout(() => {  // do this so toggleContainer will work as expected after .2 second
      this.lastOp = 'toggle';
    }, 200)
  }
  
  hasValue = () : boolean => {
    return this.fieldValue !== '';
  }


  // return a number indicating the starting and ending characteristics for the given string
  checkLine = (l : string) : number  => {
    let result : number = L_EMPTY;
    if (l.length) {
      if (/:$/g.test(l))             { result += LEW_SEMICOLON; }
      if (/^ +/g.test(l))            { result += LSW_SPACE; }
      if (/^\.*\d+\.? *$/g.test(l))  { result += L_NUMBER_ONLY; 
      }  else {
        if (/^(\d|\.)/g.test(l))     { result += LSW_NUMBER; }
      }
      if (/^\u25CF *$/g.test(l))     { result += L_BULLET_ONLY;
      } else {
        if (/^\u25CF */g.test(l))    { result += LSW_BULLET; }
      }
      if (result === L_EMPTY)        { result  = LSW_OTHER; }
    }
    return result;
  }

  // change certain ingredient things to make them more consistent and concise
  makeIngrReplacements = (l : string) : string => {
    let res = l.replace(/tablespoon/ig, 'Tbsp');
    res = res.replace(/tbsp[s]*/ig, 'Tbsp');
    res = res.replace(/(teaspoon[s]*|tsps)/ig, 'tsp');
    res = res.replace(/pound[s]*/ig, 'lb');
    res = res.replace(/ounce[s]*/ig, 'oz');
    res = res.replace(/gram[s]*/ig, 'g');
    res = res.replace(/liter[s]*/ig, 'L');
    res = res.replace(/pint[s]*/ig, 'pt');
    res = res.replace(/quart[s]*/ig, 'qt');
    res = res.replace(/millileter[s]*/ig, 'ml');
    res = res.replace(/gallon[s]*/ig, 'gal');
    res = res.replace(/dozen[s]*/ig, 'doz');
    res = res.replace(/1\/4/g, String.fromCharCode(188));
    res = res.replace(/1\/2/g, String.fromCharCode(189));
    res = res.replace(/3\/4/g, String.fromCharCode(190));
    return res;
  }

  // change certain instruction things to make them more consistent and concise
  makeInstReplacements = (l : string) : string => {
    let res = l.replace(/(\-| )degree[s]? ?/ig, String.fromCharCode(176));
    res = res.replace(/ deg$/ig, String.fromCharCode(176));
    res = res.replace(/ deg[s]? ?/ig, String.fromCharCode(176) + ' ');
    return res;
  }

  valueChange = evt => {
    this.el = evt.target;
    if ((this.props.fList) && (this.el.value.charAt(this.el.selectionEnd - 1) === '\n')) {
      this.selStart = this.el.selectionStart;
      this.selEnd = this.el.selectionEnd;
      let sArray = this.el.value.split('\n');
      let lineInfo : number;
      let newVal = '';
      let itemNum = 1;
      let prevLineSubheading = false;
      
      for (var i=0; i < sArray.length - 1; i++) {
        let l = sArray[i];
        let offset : number;
        let oldL : number;

        lineInfo = this.checkLine(l);
        switch (this.props.fList) {

          // format entries (lines) as bullet items (eg. <bullet>  1/2 cup sugar)
          // leave blank lines alone
          // treat a line that ends in semicolon as a sub-heading
          // show sub-heading in all caps but don't bullet it
          // make sure there are blank lines before sub-headings except at the beginning
          case 'bullets':         
            offset = 0;
            switch (lineInfo) {
              case LSW_SPACE:
                offset = l.length;
                l = l.replace(/^ +/, '');  // remove leading spaces
                offset -= l.length;
              case LSW_NUMBER:
              case LSW_OTHER:
                break;
              case LSW_BULLET: 
              case LSW_BULLET + LEW_SEMICOLON:
                offset = l.length;
                l = l.replace(/^\u25CF */, '');  // remove leading bullet and spaces
                offset -= l.length;
                break;
              case LEW_SEMICOLON:
              case L_EMPTY:
              case L_EMPTY + L_BULLET_ONLY:
              default:
                break;
            }
            oldL = l.length;
            l = this.makeIngrReplacements(l);
            offset -= l.length - oldL;
            if (!prevLineSubheading && (lineInfo & LEW_SEMICOLON) && (i > 0 && sArray[i - 1].length !== 0)) {
              newVal += '\n';
              offset--;
            }
            prevLineSubheading = false;
            if (lineInfo !== L_EMPTY && lineInfo !== L_EMPTY + L_BULLET_ONLY) {
              if (lineInfo & LEW_SEMICOLON) {
                l = l.toUpperCase();
                prevLineSubheading = true
              } else {
                l = String.fromCharCode(9679) + '  ' + l;
                offset -= 3;
              }
              if (newVal.length < this.selStart - offset) { 
                this.selStart -= offset;  
                this.selEnd -= offset; 
              }
            }
            newVal += l + '\n';
            break;

          // format entries (lines) as numbered items (eg. 1. Preheat oven to 450)
          // leave blank lines alone
          // treat a line that ends in semicolon as a sub-heading
          // show sub-heading in all caps but don't number it
          // make sure there are blank lines before numbered lines and sub-headings except at the beginning
          case 'numbers':             
            offset = 0;
            let newNum = itemNum + '. ';
            switch (lineInfo) {
              case LSW_NUMBER + LEW_SEMICOLON:
                newNum = '';      // cause no number to be added
              case LSW_NUMBER:
              case LSW_SPACE:
                offset = l.length;
                l = l.replace(/^[0123456789.]*/g, '').replace(/^ */g, '');  // remove leading number and spaces
                offset -= l.length;
              case LSW_OTHER:
                itemNum++;
                break;
              case LSW_BULLET + LEW_SEMICOLON:
              case LSW_BULLET:
                offset = l.length;
                l = l.replace(/^\u25CF */, '');  // remove leading bullet and spaces
                offset -= l.length;
                itemNum++;
                break;
              case LEW_SEMICOLON:
              case L_EMPTY:
              case L_NUMBER_ONLY:
              default:
                newNum = '';
                break;
            }
            oldL = l.length;
            l = this.makeInstReplacements(l);
            offset -= l.length - oldL;
            // make sure there is a blank line between instructions and before sub-headings
            if (!prevLineSubheading && (newNum !== '' || (lineInfo & LEW_SEMICOLON)) && 
                (i > 0 && sArray[i - 1].length !== 0)) {
              newVal += '\n';
              offset--;
            }
            if (newVal.length < this.selStart) { 
              this.selStart += (newNum.length - offset);  
              this.selEnd += (newNum.length - offset);
            }
            prevLineSubheading = false;
            if (lineInfo & LEW_SEMICOLON) {
              newVal += l.toUpperCase() + '\n';
              itemNum = 1;
              prevLineSubheading = true;
            } else {
              newVal += newNum + l.substr(0, 1).toUpperCase() + l.substr(1) + '\n';
            }
            break;
          default:
        }
      }
      newVal += sArray[i];
      this.fieldValue = newVal;
      setTimeout(() => {
        this.el.value = newVal;
        this.el.setSelectionRange(this.selEnd, this.selEnd)
      }, 10);
    } else {
      this.fieldValue = this.el.value;      
    }
    if (this.props.fOnInput) { this.props.fOnInput(); } // call user's OnInput function (if any)
  }

  render() {

    const textSize  = this.props.fTextSize || 'app-smaller-font';
    const rows      = this.props.fRows || 5;
    const extraCSS  = this.props.fExtraCSS || '';
    const color     = this.props.fColor || 'app-active-input-icon-color';
    const readonly  = this.props.fReadonly || 'false';

    return(
      <div>
        <div 
          className={'app-icon-textarea-container ' + extraCSS +
              (this.containerOpen ? ' has-focus' : '') +
              (this.hasValue ? ' has-value' : '')}
        >
            <label 
              className={`app-icon-input-field-label-sm app-textarea-field-label 
                   app-width-100 app-cursor-pointer` +
                   (!this.props.fIcon ? ' app-no-icon-label' : '') +
                   (this.hasValue() ? ' has-value' : '') +
                   (this.focused ? ' has-focus' : '')}
              onClick={this.toggleContainer}
            >
              <div className="d-flex flex-row justify-content-start align-items-center">
                <div 
                  className={(this.props.fRequired && !this.hasValue()) ? 'app-show-required' : ''}
                >
                  {((this.hasValue() || this.focused) && this.props.fFocusedLabel) 
                    ? this.props.fFocusedLabel : this.props.fLabel}
                </div>
                {this.hasValue() &&
                <i className="material-icons app-cursor-pointer ml-2">
                  {!this.containerOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}</i>}
              </div>
            </label>
          <div  className="d-flex flex-row">
            {this.props.fIcon && 
            <i className={'material-icons app-input-icon ' + color}>{this.props.fIcon}</i>}
            <textarea 
              name={this.props.fName} 
              rows={rows}
              id={this.props.fName + 'ID'}
              maxLength={this.props.fMaxlength !== undefined ? this.props.fMaxlength : undefined}
              required={this.props.fRequired}
              disabled={this.props.fDisabled}
              read-only={readonly}
              value={this.fieldValue}
              className={'app-form-input app-scrollable d-flex ' + textSize +
                    (!this.containerOpen ? ' app-faint-text' : '') +
                    (!this.props.fDisabled ? ' app-cursor-pointer' : '')} 
              onFocus={this.showFocused} 
              onBlur={this.showNotFocused} 
              onChange={this.valueChange}
            />
          </div>
        </div>
        {((this.props.fErrors !== undefined) && this.props.fErrors.length)  && 
        <div 
          className={'app-field-messages' +
              (!this.props.fIcon ? ' app-no-icon-message' : '') +
              (this.touched ? ' app-visible' : ' app-invisible')}
        >
          <FieldErrorMsgs 
            vMultiple={this.props.fErrorMulti}
            fMsgs={this.fMsgs} 
            eList={this.errorStatus}
          />
            {this.aErrors.map((item, i) => {
              return <FieldErrorMsg key={item} fMsgs={this.fMsgs} name={item}>{this.aMsgs[i]}</FieldErrorMsg>
            })}
        </div>}
      </div>
    )
  }

}

export default IconTextarea;