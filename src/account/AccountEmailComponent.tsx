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


  // COMPONENT for EMAIL CHANGE feature

@inject('user', 'utilSvc', 'userSvc', 'cookieSvc', 'crossSvc')
@observer
class EmailChange extends React.Component <{
  user          ?: User, 
  userSvc       ?: UserSvc,
  cookieSvc     ?: CookieSvc,
  crossSvc      ?: CrossSvc,
  utilSvc       ?: UtilSvc 
  }, {} > {

  @observable requestStatus  = new StringMsgList();
  @observable statusMsgs     : StatusMessage[] = [];   
  @observable checkAll       : boolean   = false; // true if form fields to be checked for errors (touched or not)
  @observable currEmail          : string;
  @observable password           : string = '';
  @observable newEmail           : string = '';
  @observable rememberLogin      : boolean;

  componentDidMount() {
    if (!this.props.user.isSignedIn) {
      this.props.utilSvc.returnToHomeMsg('signInToAccessAccount'); // let user know they need to log in
    } else {
      // update the current help context and reset the Email Change form
      this.resetForm();
      this.props.utilSvc.setCurrentHelpContext('ChangeEmail'); // note current state
      this.props.utilSvc.displayUserMessages();
    }
  }

  // finish up Email Change process.  Update user's cookie and profile.  Report status message.
  reportEmailChange() {
    this.props.user.userEmail = this.props.user.profile.email = this.newEmail;
    if (this.rememberLogin) {
      this.props.cookieSvc.setCookieItem('password', this.props.crossSvc.cross(this.props.user.userEmail,
      this.props.user.password));
      this.props.cookieSvc.setCookieItem('userEmail', this.props.user.userEmail);
    }
    this.props.userSvc.updateUserProfile(this.props.user)
    .then((success) => {
      this.props.utilSvc.displayThisUserMessage('emailChanged');
      this.resetForm();
    })
    .catch((failure) => {
      this.props.utilSvc.setUserMessage('profileEmailChangeFailed');
      this.props.utilSvc.displayWorkingMessage(false);
      this.resetForm();
    })
  }

  // send change email request to Firebase service
  submitRequest(form : any) {
    this.checkAll = true;
    this.clearRequestStatus();
    if (form.invalid) {
      this.requestStatus.addMsg('formHasErrors');
      return;
    }
    this.props.utilSvc.displayWorkingMessage(true);
    this.props.userSvc.changeEmail(this.currEmail, this.password, this.newEmail)
    .then((success) => {
      this.reportEmailChange();
    })
    .catch((error) => {
      switch (error) {  // decide which status message to give
        case 'auth/email-already-in-use':
          this.requestStatus.addMsg('newEmailInUse');
          break;
        case 'auth/invalid-email':
          this.requestStatus.addMsg('newEmailInvalid');
          break;
        case 'auth/requires-recent-login':
          this.requestStatus.addMsg('requiresRecentLogin');
          break;
        default:
          this.props.utilSvc.setUserMessage('emailChangeFailed');
      }
      this.requestStatus.addMsg('emailChangeFail');
      this.props.utilSvc.displayWorkingMessage(false);
    });
  }

  // reset the change form
  resetForm = () => {
    this.newEmail = '';
    this.currEmail          = this.props.user.userEmail;
    this.rememberLogin      = (this.currEmail === this.props.cookieSvc.getCookieItem('userEmail'));
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

  updateNewEmail = (val: string) => {
    this.newEmail = val;
  }
  
  // return a reference to the form object from the DOM
  getForm = () => {
    return document.getElementById('emailForm');
  }

  render() {
    return(
      <div>
        <div className="app-scroll-frame-center px-0 pt-3">
          <form 
            id="emailForm" 
            name="emailForm" 
            role="form" 
            noValidate={true}
            onSubmit={this.handleSubmit}
          >
            <div className="d-flex flex-column px-2">

              {/* Email field */}
              <IconInput
                fName         = "emailCurrEmail" 
                fDisabled     = {true}                  
                fType         = "email" 
                fLabel        = "Current Email Address?"  
                fFocusedLabel = "Current Email Address:"  
                fIcon         = "mail_outline"
                fColor        = "app-disabled-icon-color" 
                fValue        = {this.currEmail}
              />

              {/* New Email field */}
              <IconInput
                fCheckAll     = {this.checkAll}
                fName         = "emailNewEmail" 
                fRequired     = {true} 
                fType         = "email" 
                fLabel        = "New Email Address?"  
                fFocusedLabel = "New Email Address:"  
                fIcon         = "mail_outline"
                fColor        = "app-accent1" 
                fValue        = {this.newEmail} 
                fErrors       = "valueMissing|typeMismatch"
                fErrorMsgs    = "An email address is required.|Invalid email address character/format."
                fBlurFn       = {this.updateNewEmail}
                fOnInput      = {this.updateNewEmail}
                fFocusFn      = {this.clearRequestStatus}
              />

              {/* Status Message Area */}
              <FormStatusMessages fMessageOpen = {this.haveStatusMessages()}>
                <StatusMessages eList={this.requestStatus} sMsgs={this.statusMsgs} mMax={2}/>
                  <StatusMessage sMsgs={this.statusMsgs} name="emailChangeFail" class="app-error">
                      Unable to change email address.
                  </StatusMessage>
                  <StatusMessage sMsgs={this.statusMsgs} name="newEmailInvalid" class="app-error">
                      New Email Address is invalid.
                  </StatusMessage>
                  <StatusMessage sMsgs={this.statusMsgs} name="newEmailInUse" class="app-error">
                      New Email Address already in use.
                  </StatusMessage>
                  <StatusMessage sMsgs={this.statusMsgs} name="requiresRecentLogin" class="app-error">
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
                fButtonCSS    = "app-bg-white"
                fIconColor    = "app-primary"
                fLabelCSS     = "app-primary"
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
export default EmailChange;