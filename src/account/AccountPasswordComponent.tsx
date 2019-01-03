'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { UtilSvc } from '../utilities/UtilSvc';
import { StringMsgList } from '../formTools/StringMsgList';
import { User } from '../user/UserModel';
import { UserSvc } from '../user/UserSvc';
import { CookieSvc } from '../utilities/CookieSvc';
import { CrossSvc } from '../utilities/CrossSvc';
import { StatusMessages, StatusMessage } from '../formTools/StatusMessagesComponent';
import { FormStatusMessages } from '../formTools/FormStatusMessagesComponent';
import IconInput from '../formTools/IconInputComponent';
import UpdateActions from '../formTools/UpdateActionsComponent';


  // COMPONENT for CHANGE PASSWORD  feature

@inject('user', 'utilSvc', 'userSvc', 'cookieSvc', 'crossSvc')
@observer
class PasswordChange extends React.Component <{
  user          ?: User, 
  userSvc       ?: UserSvc,
  cookieSvc     ?: CookieSvc,
  crossSvc      ?: CrossSvc,
  utilSvc       ?: UtilSvc 
  }, {} > {

  @observable requestStatus  = new StringMsgList();
  @observable statusMsgs     : StatusMessage[] = [];   
  @observable checkAll       : boolean   = false; // true if form fields to be checked for errors (touched or not)
  @observable userEmail      : string;
  @observable currPassword   : string = '';
  @observable newPassword    : string = '';
  @observable rememberLogin  : boolean;

  componentDidMount() {
    if (!this.props.user.isSignedIn) {
      this.props.utilSvc.returnToHomeMsg('signInToAccessAccount'); // let user know they need to log in
    } else {
      // update the current help context and reset the change form
      this.resetForm();
      this.props.utilSvc.setCurrentHelpContext('ChangePassword'); // note current state
      this.props.utilSvc.displayUserMessages();
    }
  }

  // finish up Password Change process.  Update user's cookie.  Report status message.
  reportPasswordChange() : void {
    this.props.user.password = this.newPassword;
    if (this.rememberLogin) {
      this.props.cookieSvc.setCookieItem('password', 
            this.props.crossSvc.cross(this.userEmail, this.newPassword));
    }
    this.props.utilSvc.setUserMessage('passwordChanged');
    this.props.utilSvc.displayWorkingMessage(false);
    this.resetForm();
  }

  // send change password request to Firebase service
  submitRequest(form : any) : void {
    this.clearRequestStatus();
    if (this.checkForProblems(form)) {
      this.requestStatus.addMsg('formHasErrors');
      return;
    }
    this.props.utilSvc.displayWorkingMessage(true);
    this.props.userSvc.changePassword(this.newPassword)
    .then((success) => {
      this.reportPasswordChange();
    })
    .catch((error) => {
      switch (error) {  // decide which status message to give
        case 'auth/weak-password':
          this.requestStatus.addMsg('weakPassword');
          break;
        case 'auth/requires-recent-login':
          this.requestStatus.addMsg('requiresRecentLogin');
          break;
        default:
          this.props.utilSvc.setUserMessage('passwordChangeFailed');
      }
      this.requestStatus.addMsg('passwordChangeFail');
      this.props.utilSvc.displayWorkingMessage(false);
      this.resetForm()
    });
  }

  checkForProblems = (form: any) => {
    this.clearRequestStatus();
    if (this.newPassword === '') {
      this.requestStatus.addMsg('passwordIsBlank');
    }
    return (!form.checkValidity() || !this.requestStatus.empty); 
  }

  // clear status messages object
  clearRequestStatus= () => {
    this.requestStatus.clearMsgs();
  }

  // indicate whether there are any status messages
  haveStatusMessages = () : boolean => {
    return !this.requestStatus.empty();
  }

  handleSubmit = evt => {
    evt.preventDefault();
    this.submitRequest(evt.target);
  }

  updateCurrPassword = (val: string) => {
    this.currPassword = val;
  }

  updateNewPassword = (val: string) => {
    this.newPassword = val;
  }
  
  // return a reference to the form object from the DOM
  getForm = () => {
    return document.getElementById('passwordForm');
  }

  // reset the change form
  resetForm = () => {
    this.newPassword  = '';
    this.currPassword = '';
    this.userEmail          = this.props.user.userEmail;
    this.rememberLogin      = (this.userEmail === this.props.cookieSvc.getCookieItem('userEmail'));
}

  render() {
    return(
      <div>
        <div className="app-scroll-frame-center px-0 pt-3">
          <form 
            id="passwordForm" 
            name="passwordForm" 
            role="form" 
            noValidate={true}
            onSubmit={this.handleSubmit}
          >
            <div className="d-flex flex-column px-2">

              {/* Email field */}
              <IconInput
                fName         = "pwdUserEmail" 
                fDisabled     = {true}                  
                fType         = "email" 
                fLabel        = "Current Email Address?"  
                fFocusedLabel = "Current Email Address:"  
                fIcon         = "mail_outline"
                fColor        = "app-disabled-icon-color" 
                fValue        = {this.userEmail}
              />

              {/* Password field */}
              {/* <IconInput
                fCheckAll     ={this.checkAll}
                fName         ="pwdCurrPassword" 
                fRequired     ={true} 
                fType         ="password" 
                fLabel        ="What's your Password?" 
                fFocusedLabel = "Password:"  
                fIcon         ="lock_open"
                fColor        ="app-accent1" 
                fValue        ={this.currPassword} 
                fErrors       ="valueMissing|patternMismatch|tooShort"
                fErrorMsgs    ="A password is required.|Invalid password character/format.
                                |Password must be at least 6 characters."
                fMinlength    ={6} 
                fMaxlength    ={16} 
                fPattern      ="^[a-zA-Z]+[!#$%\^\-+*\w]*$" 
                fBlurFn       = {this.updateCurrPassword}
                fOnInput      = {this.updateCurrPassword}
                fFocusFn      ={this.clearRequestStatus}
              /> */}

              {/* New Email field */}
              <IconInput
                fCheckAll     ={this.checkAll}
                fName         ="pwdNewPassword" 
                fRequired     ={true} 
                fType         ="password" 
                fLabel        ="What's your New Password?" 
                fFocusedLabel = "New Password:"  
                fIcon         ="lock_outline"
                fColor        ="app-accent1" 
                fValue        ={this.newPassword} 
                fErrors       ="valueMissing|patternMismatch|tooShort"
                fErrorMsgs    ="A password is required.|Invalid password character/format.
                                |Password must be at least 6 characters."
                fMinlength    ={6} 
                fMaxlength    ={16} 
                fPattern      ="^[a-zA-Z]+[!#$%\^\-+*\w]*$" 
                fBlurFn       = {this.updateNewPassword}
                fOnInput      = {this.updateNewPassword}
                fFocusFn      ={this.clearRequestStatus}
              />

              {/* Status Message Area */}
              <FormStatusMessages fMessageOpen = {this.haveStatusMessages()}>
                <StatusMessages eList={this.requestStatus} sMsgs={this.statusMsgs} mMax={2}/>
                  <StatusMessage sMsgs={this.statusMsgs} name="passwordChangeFail" class="app-error">
                      Unable to change password.
                  </StatusMessage>
                  <StatusMessage sMsgs={this.statusMsgs} name="weakPassword" class="app-error">
                      Given password is too weak.
                  </StatusMessage>
                  <StatusMessage sMsgs={this.statusMsgs} name="passwordIsBlank" class="app-error">
                      New Password is blank.
                  </StatusMessage>
                  <StatusMessage sMsgs={this.statusMsgs} name="requiersRecentLogin" class="app-error">
                      Please sign in again and retry.
                  </StatusMessage>
                  <StatusMessage sMsgs={this.statusMsgs} name="formHasErrors" class="app-error">
                      Please correct the fields with errors.
                  </StatusMessage>
              </FormStatusMessages>                    
                                
            </div>

            {/* Actions Area */}
            <div className="pb-2">
              <UpdateActions
                fType         = "submit"
                fBgColor      = "app-bg-white"
                fButtonCSS    = "app-oval-button"
                fLabels       = {true}
                fSLabel       = "Change"
              />
            </div>                                    
          </form>
        </div>
      </div>
    )
  }

}

export default PasswordChange;