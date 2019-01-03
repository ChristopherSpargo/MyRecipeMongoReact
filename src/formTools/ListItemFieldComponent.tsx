'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { FieldErrorMsgs, FieldErrorMsg } from './FieldErrorsComponent';
import { StringMsgList } from './StringMsgList'
import IconInput from './IconInputComponent'
import FabControl from './FabControlComponent';

@observer
class ListItemField extends React.Component<{


  fCheckAll    ?: boolean,  // flag to check all fields for errors (not just touched fields)
  fName        ?: string,   // unique name for <select> field
  fValue       ?: string,   // model for <select> field
  fClearFn     ?: Function, // function to use to clear the field, causes clear button on field
  fList        ?: any[],    // array of list items for <select>
  fClearListFn ?: Function, // function to use to clear the list, causes clear button on field
  fEmptyListLabel ?: string, // label to show when list is empty 
  fListValue   ?: string,   // indicates how to structure <select> options
  fLabel       ?: string,   // label for <select>
  fIcon        ?: string,   // icon for <select>
  fColor       ?: string,   // color for icon
  fRequired    ?: boolean,  // if input is required
  fDisabled    ?: boolean,   // indicates field is disabled
  fOnDelete    ?: Function, // function for item delete action
  fOnFocus     ?: Function, // function to execute on <select> focus
  fOnChange    ?: Function, // function to execute on <select> change
  fShowNew     ?: boolean,  // allow a "New" selection but don't collect the new value
  fAllowNew    ?: boolean,  // should <select> have a New Item (value '999') entry at the top
  fActionButtons ?: boolean, // should <input> field have action buttons
  fAllowAny    ?: boolean,  // should <select> have a Any Item (value '') entry at the top
  fEqual       ?: boolean,  // true if test select value EQUAL_TO fNewTest string
  fNewTest     ?: string,   // string to test against to see if selected item can be edited
                            // use fEqual="true" and fNewTest="999" if only new items can be edited
                            // use fEqual="false" and fNewTest="" if all items can be edited
  fNewValue    ?: string,    // location to store new item value
  fCapitalize  ?: boolean,   // true if capitalize each word in new value
  fNewLabel    ?: string,   // new item label
  fNewName     ?: string,   // unique name for new item field
  fNewItemCheck?: string,   // when to show text input errors
  fErrorMulti  ?: boolean,  // 'true' if allow multiple error messages
  fExtraCSS    ?: string,   // additional css classes to include on main div
  fNewBlurFn   ?: Function  // function to call when listValue changes
},  {} > {


  fRef: any;
  @observable fieldValue: string;
  @observable touched = false;
  fMsgs: FieldErrorMsg[] = [];
  @observable errorStatus = new StringMsgList();
  @observable focused: boolean = false;
  emptyListLabel = this.props.fEmptyListLabel || 'empty';
  allowNew = this.props.fAllowNew || true;

  componentWillReceiveProps(nextProps : any) {
    if (nextProps.fValue !== this.fieldValue) {
      this.fieldValue = nextProps.fValue;
    }
  }

  // shouldComponentUpdate(nextProps, nextState) : boolean {
  //   return (nextProps.fValue !== this.fieldValue)
  // }
  
  currentLabel = () : string => {
    return this.props.fLabel + ' (' + 
     (this.props.fList && this.props.fList.length ? this.props.fList.length : this.emptyListLabel) + ')';
  }

  showFocused = () => {
    this.focused = true;
    this.touched = false;
    if (this.props.fOnFocus) { this.props.fOnFocus(); }
  }

  showNotFocused = () => {
    this.focused = false;
    this.touched = true;
    this.checkForErrors();
  }

  // return true if the fValue field has a non-empty value
  hasValue = () : boolean => {
    return (this.fieldValue !== undefined && this.fieldValue !== '');
  }

  // return true if the fValue field has a non-empty value
  hasList = () : boolean => {
    return (this.props.fList !== undefined && this.props.fList.length !== 0);
  }

  changeFieldValue = (v: any) => {
    this.fieldValue = v;
    if (this.props.fOnChange) { this.props.fOnChange(v); }
    if (this.allowNew && (this.props.fEqual ? (v === this.props.fNewTest) : (v !== this.props.fNewTest))) {
      this.focusOnField(this.props.fNewName);    
    }
  }

  valueChange = evt => {
    this.touched = true;
    let v = evt.target.value;
    this.changeFieldValue(v);
  }

  newValueChange = evt => {
    if (this.props.fNewBlurFn) {
      this.props.fNewBlurFn(this.fieldValue);
    }
  }

  deleteItem = evt => {
    this.props.fOnDelete();
  }

  cancelEdit = evt => {
    this.changeFieldValue('');
    if (this.props.fNewName) {
      this.newValueChange(evt);
    }
    this.touched = false;
    if (this.props.fOnFocus) { this.props.fOnFocus(); }
  }

  focusOnField = (name : string) => {
    setTimeout(() => {
      document.getElementById(name + 'ID').focus();
    }, 400)    
  }

  callClearList = evt => {
    this.props.fClearListFn();
  }

  keyInFMsgs = (key: string) : boolean => {
    return this.fMsgs.some(msg => msg.props.name === key);
  }

  checkForErrors = () => {
    if (!this.fRef.validity.valid) {    // any errors?
      for ( var key in this.fRef.validity ) { // go through the list of validity checks
        if (this.keyInFMsgs(key)) {              // do we care about this validity check?
          if (this.fRef.validity[key]) {    // did it fail?
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

  render() {

   const listValue      = this.props.fListValue || '';
   const showNew        = this.props.fShowNew || false;
   const allowNew       = this.props.fAllowNew || true;
   const actionButtons  = this.props.fActionButtons || true;
   const allowAny       = this.props.fAllowAny || false;
   const capitalize     = this.props.fCapitalize || false;
   const extraCSS       = this.props.fExtraCSS || '';
   const newLabel       = this.props.fNewLabel === undefined ? this.props.fLabel : this.props.fNewLabel;
   const newTest        = this.props.fNewTest;
   const equal          = this.props.fEqual;
   const color          = this.props.fColor || 'app-active-input-icon-color';

    return (
      <div 
        className={'app-list-item-field-container' +
                    (allowNew && actionButtons ? ' app-list-item-height-2' : ' app-list-item-height-1')}
      >

        {/* Item select field */}

        <div 
          className={'app-list-item-field-container-element' +
              (allowNew && (equal ? (this.fieldValue === newTest) : 
              (this.fieldValue !== newTest)) ? ' app-z--1' : ' app-z-3')}
        >
          <div className={'app-icon-input-field-container ' + extraCSS}>
            <label 
              className={'app-icon-input-field-label-sm' +
                    (this.props.fDisabled ? ' app-disabled-opacity' : '') +
                    (this.hasValue() ? ' has-value' : '') +
                    (this.focused ? ' has-focus' : '') +
                    (this.props.fRequired && !this.hasValue() ? ' app-show-required' : '')}
            >
              {this.currentLabel()}
            </label>
            <div className="d-flex flex-row justify-content-start align-items-center">
              <i className={'material-icons app-input-icon ' + color}>{this.props.fIcon}</i>
              <select 
                name={this.props.fName}
                id={this.props.fName + 'ID'}
                required={this.props.fRequired ? true : undefined}
                disabled={this.props.fDisabled ? true : undefined}
                value={this.fieldValue}
                ref={select => this.fRef = select}
                className={'app-form-input d-flex' + (!this.props.fDisabled ? ' app-cursor-pointer' : '')}
                onFocus={this.showFocused} 
                onBlur={this.showNotFocused} 
                onChange={this.valueChange}
              >
                <option key={'opDisabled'} disabled={true} className="app-no-display"/>
                {(allowNew || showNew) && 
                <option key={'opNew'} value="999" className="app-form-theme-select-menu-lg">New {newLabel}</option>}
                {allowAny && 
                  <option 
                    key={'opAny'} 
                    value="0"
                    className="app-form-theme-select-menu-lg"
                  >
                    Any {this.props.fLabel}
                  </option>}
                {(listValue === 'index' && this.props.fList) &&
                  this.props.fList.map((item, i) => 
                    <option key={item} value={i} className="app-form-theme-select-menu">
                            {item}
                    </option>)                      
                }
                {((listValue === 'idName' || listValue === 'player') && this.props.fList) && 
                  this.props.fList.map((item) => 
                    <option 
                      key={item.id} 
                      disabled = {item.disabled}
                      value={item.id} 
                      className="app-form-theme-select-menu"
                    >
                      {item.name}
                    </option>)}
                {((listValue === '') && this.props.fList) &&
                  this.props.fList.map((item) => 
                  <option key={item} value={item} className="app-form-theme-select-menu">
                          {item}
                  </option>)}
              </select>
              {this.props.fClearListFn &&
              <div className="app-input-clear-btn">
                <i 
                  className={'material-icons app-input-icon app-icon-xsm' +
                        (this.hasList() ? ' app-warn app-cursor-pointer' : ' app-disabled-text')}
                  data-toggle="tooltip" 
                  data-placement="top" 
                  title="Clear List" 
                  data-delay="200"
                  onClick={this.callClearList}
                >
                  close
                </i>            
              </div>}
            </div>
            <div 
              className={'app-field-messages' +
                    (this.touched ? ' app-visible' : ' app-invisible')}
            >
              <FieldErrorMsgs 
                vMultiple={this.props.fErrorMulti}
                fMsgs={this.fMsgs} 
                eList={this.errorStatus}
              />
                <FieldErrorMsg key="valueMissing" fMsgs={this.fMsgs} name="valueMissing">
                      {this.props.fLabel} selection is required.
                </FieldErrorMsg>
            </div>
          </div>
        </div>

         {/* Item input field */}
        
        {allowNew && 
        <div className="d-flex flex-column app-list-item-field-container-element">
          <div 
            className={'d-flex flex-column app-fade-in' +
                ((equal ? (this.fieldValue === newTest) : 
                (this.fieldValue !== newTest)) ? ' app-open' : '')}
          >
            <IconInput
              fCheckAll     = {this.props.fCheckAll}
              fName         = {this.props.fNewName} 
              fRequired     = {(equal ? (this.fieldValue === newTest) : (this.fieldValue !== newTest))}
              fDisabled     = {this.props.fDisabled}
              fCapitalize   = {capitalize}
              fType         = "text" 
              fPattern      = "^[ /@.#,!?'$\\-\\w]+$"
              fMaxlength    = {30}
              fLabel        = {(this.fieldValue === '999' ? 'New ' : 'Edit ') + newLabel}  
              fIcon         = {(this.fieldValue === '999' ? 'add_circle_outline' : 'edit')}
              fColor        = {this.props.fColor} 
              fValue        = {this.props.fNewValue} 
              fClearFn      = {this.props.fClearFn}
              fErrors       = "valueMissing|patternMismatch"
              fErrorMsgs    = {'New ' + newLabel + ' is required.|Invalid character or format for ' + newLabel + '.'}
              fExtraCSS     = "mb-2"
              fBlurFn       = {this.props.fNewBlurFn}
              fOnInput      = {this.props.fNewBlurFn}
              fFocusFn      = {this.props.fOnFocus}
            />
            {!this.props.fDisabled && actionButtons && 
              (equal ? (this.fieldValue === newTest) : (this.fieldValue !== newTest)) &&
            <div
              className="d-flex flex-row justify-content-center align-items-center app-flex-wrap"
            >
              <div className="app-smaller-font mb-0">
                <FabControl
                  fType       = "submit"
                  fLabel      = "Save"
                  fLabelCSS   = "app-white"
                  fOpen       = {true}
                  fButtonCSS  = "app-fab-sm-sq app-oval-button mr-1 mb-1"
                  fDelay      = {200}
                  fAria       = "add"
                  fIcon       = "check_circle_outline"
                  fIconCSS    = "app-fab-icon-sm"
                  fIconColor  = "app-white"
                />
              </div>
              {(this.fieldValue !== '999') && 
              <div className="app-smaller-font mb-0">
                <FabControl
                  fType       = "button"
                  fLabel      = "Remove"
                  fLabelCSS   = "app-white"
                  fOpen       = {true}
                  fButtonCSS  = "app-fab-sm-sq app-oval-button mr-1 mb-1"
                  fDelay      = {200}
                  fOnClick    = {this.deleteItem}
                  fAria       = "remove"
                  fIcon       = "remove_circle_outline"
                  fIconCSS    = "app-fab-icon-sm"
                  fIconColor  = "app-white"
                />
              </div>}
              <div className="app-smaller-font mb-0"> 
                <FabControl
                  fId         = {this.props.fNewName + 'Cancel'}
                  fType       = "button"
                  fLabel      = "Cancel"
                  fLabelCSS   = "app-white"
                  fOpen       = {true}
                  fButtonCSS  = "app-fab-sm-sq app-oval-button mb-1"
                  fDelay      = {200}
                  fOnClick    = {this.cancelEdit}
                  fAria       = "cancel"
                  fIcon       = "highlight_off"
                  fIconCSS    = "app-fab-icon-sm"
                  fIconColor  = "app-white"
                />
              </div>
            </div>}
            {!actionButtons && (equal ? (this.fieldValue === newTest) : (this.fieldValue !== newTest)) &&
            <div className="d-flex flex-row justify-content-end align-items-center">
              <div className="app-small-list-field-cancel-fab mb-0">
                <FabControl 
                  fType       = "button"
                  fLabel      = "Cancel"
                  fOpen       = {true}
                  fButtonCSS  = "app-fab-xsm-sq app-oval-button mb-1"
                  fDelay      = {1}
                  fOnClick    = {this.cancelEdit}
                  fAria       = "cancel"
                  fIcon       = "highlight_off"
                  fIconCSS    = "app-icon-xsm"
                  fIconColor  = "app-brite-orange"
                />
              </div>
            </div>}
          </div>
        </div>}
      </div>
    )
  }

}

export default ListItemField;