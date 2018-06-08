'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { FieldErrorMsgs, FieldErrorMsg } from './FieldErrorsComponent';
import { StringMsgList } from './StringMsgList'

@observer
class IconInput extends React.Component <{
  fName        ?: string,   // unique name for field
  fCheckAll    ?: boolean,  // flag to check all fields for errors (not just touched fields)
  fRequired    ?: boolean,  // if input is required
  fDisabled    ?: boolean,  // when input should be disabled
  fReadonly    ?: string,   // if the field is readonly
  fType        ?: string,   // input type (password, email,..)
  fAccept      ?: string,   // accept value for file input type
  fLabel       ?: string,   // label for input
  fFocusedLabel?: string,   // label for field when focused or has a value
  fIcon        ?: string,   // icon for input
  fColor       ?: string,   // color for icon
  fInputCSS    ?: string,   // extra css for the input element
  fValue       ?: any,      // model for this field
  fClearFn     ?: Function, // function to use to clear the field, causes clear button on field
  fErrors      ?: string,   // array of error key names
  fErrorMsgs   ?: string,   // array of messages for the error keys
  fErrorMulti  ?: boolean,  // 'true' if allow multiple error messages
  fMinlength   ?: number,   // value for minlength (if any)
  fMaxlength   ?: number,   // value for maxlength (if any)
  fPattern     ?: string,   // value for pattern (if any)
  fFocusFn     ?: Function, // function to execute on focus
  fBlurFn      ?: Function, // function to execute on blur
  fOnInput     ?: Function, // function to execute on input
  fExtraCSS    ?: string,   // CSS classes to add to main div
  fCapitalize  ?: boolean   // true if input should be capitalized
}, {} > {

  @observable fieldValue: string;
  fRef: any;
  @observable touched = false;
  fMsgs: FieldErrorMsg[] = [];
  @observable errorStatus = new StringMsgList();
  fCapitalize = this.props.fCapitalize || false;

  @observable focused: boolean = false;
  aErrors: string[];
  aMsgs:   string[];
 
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
    }
  }

  // shouldComponentUpdate(nextProps, nextState) : boolean {
  //   return (nextProps.fValue !== this.fieldValue)
  // }

  showFocused = () => {
    this.focused = true;
    this.touched = false;
    if (this.props.fFocusFn) { this.props.fFocusFn(); }
  }

  showNotFocused = evt => {
    this.focused = false;
    if (evt.relatedTarget && evt.relatedTarget.id === (this.props.fName + 'Cancel')) {
      this.touched = false;
    } else {
      this.touched = true;
    }
    if (this.props.fBlurFn && (this.fieldValue !== this.props.fValue)) {
      this.props.fBlurFn(this.fieldValue)
    }
    this.checkForErrors();
  }

  keyInFMsgs = (key: string) : boolean => {
    return this.fMsgs.some(msg => msg.props.name === key);
  }

  checkForErrors = () => {
    if (!this.fRef.validity.valid) {    // any errors?
      for ( var key in this.fRef.validity ) { // go through the list of validity checks
        if (this.keyInFMsgs(key)) {           // do we care about this validity check?
          if (this.fRef.validity[key]) {      // did it fail?
            if (!this.errorStatus.hasMsg(key)) { this.errorStatus.addMsg(key); } // add to display if necessary
          } else {
            this.errorStatus.removeMsg(key);  // remove from display if nec
          }
        }
      }
    } else {
      this.errorStatus.clearMsgs(); // no errors at this time
    }
  }

  hasValue = () : boolean => {
    return (this.fieldValue !== undefined && this.fieldValue !== '');
  }

  clearFn = event => {
    this.props.fClearFn();
  }

  valueChange = evt => {
    this.touched = true;
    let v;
    if (this.props.fType === 'file') {
      var input : any = document.getElementById(this.props.fName + 'ID');
      v = input.files;
    } else {
      let selEnd = evt.target.selectionEnd;
      v = evt.target.value;
      if (this.fCapitalize) { // capitalize every word?
        v = v.toLowerCase().replace(/^[a-z]/g,
                        (x : string) : string => { return x.charAt(0).toUpperCase() + x.substr(1); } );
        v = v.replace(/[ \-\(\/][a-z]/g,
                          (x : string) : string => { 
                            return x.charAt(0) + x.charAt(1).toUpperCase() + x.substr(2); } );
        evt.target.value = v;
        evt.target.setSelectionRange(selEnd, selEnd)
      }
    }
    this.fieldValue = v;
    if (this.props.fOnInput) { this.props.fOnInput(v); }
    this.checkForErrors();
  }

  handleKeyPress = evt => {
    if (evt.charCode === 13) {
      evt.target.blur();
    }
  }

  render() {

    const fRequired = this.props.fRequired || false;
    const fDisabled = this.props.fDisabled || false;
    const fReadonly = this.props.fReadonly || 'false';
    const fFocusedLabel = this.props.fFocusedLabel || '';
    const fIcon     = this.props.fIcon || '';
    const fType     = this.props.fType;
    const extraCSS  = this.props.fExtraCSS || '';
    const color     = this.props.fColor || 'app-active-input-icon-color';


    return(
      <div className={'app-icon-input-field-container ' + extraCSS}>
        <label 
          className={'app-icon-input-field-label-sm' +
                (fIcon === '' ? ' app-no-icon-label' : '') +
                (this.hasValue() ? ' has-value' : '') +
                (this.focused ? ' has-focus' : '') +
                (fRequired && !this.hasValue() ? ' app-show-required' : '')}
        >
          {((this.hasValue() || this.focused) && fFocusedLabel) ? fFocusedLabel : this.props.fLabel}
        </label>
          <div className="d-flex flex-row justify-content-start align-items-center">
            {fIcon && <i className={'material-icons app-input-icon ' + color}>{fIcon}</i>}
            <input 
              type={fType} 
              name={this.props.fName} 
              e-mail={fType === 'email' ? 'true' : undefined}
              id={this.props.fName + 'ID'}
              autoComplete="off"
              minLength={this.props.fMinlength}
              maxLength={this.props.fMaxlength}
              pattern={this.props.fPattern}
              accept={this.props.fAccept}
              required={fRequired}
              disabled={fDisabled}
              read-only={fReadonly}
              value={this.fieldValue}
              ref={input => this.fRef = input}
              className={'app-form-input d-flex' +
                      (!this.hasValue() && !this.focused && (fType === 'date') ? ' app-transparent-text' : '') +
                      (fDisabled && this.hasValue() ? ' app-bg-white' : '') +
                      (!fDisabled ? ' app-cursor-pointer' : '')}
              onKeyPress={this.handleKeyPress}
              onFocus={this.showFocused} 
              onBlur={this.showNotFocused} 
              onChange={this.valueChange}
            />
            {this.props.fClearFn && 
            <div className="app-input-clear-btn">
              <i 
                className={'material-icons app-input-icon app-icon-xsm' +
                      (this.fieldValue ? ' app-warn app-cursor-pointer' : ' app-disabled-text')}
                data-toggle="tooltip" 
                data-placement="top" 
                title="Clear" 
                data-delay="200"
                onClick={this.clearFn}
              >
                close
              </i>            
            </div>}
        </div>
          {((this.props.fErrors !== undefined) && this.props.fErrors.length)  && 
          <div 
            className={'app-field-messages' +
                (!fIcon ? ' app-no-icon-message' : '') +
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

export default IconInput
