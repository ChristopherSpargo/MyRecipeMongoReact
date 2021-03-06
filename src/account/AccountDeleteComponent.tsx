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
import { RecipeSvc } from '../recipe/RecipeSvc'
import { StatusMessages, StatusMessage } from '../formTools/StatusMessagesComponent';
import { FormStatusMessages } from '../formTools/FormStatusMessagesComponent';
import IconInput from '../formTools/IconInputComponent';
import UpdateActions from '../formTools/UpdateActionsComponent';


  // COMPONENT for ACCOUNT DELETE  feature

@inject('user', 'utilSvc', 'userSvc', 'cookieSvc', 'crossSvc', 'recipeSvc')
@observer
class AccountDelete extends React.Component <{
  user          ?: User, 
  userSvc       ?: UserSvc,
  cookieSvc     ?: CookieSvc,
  crossSvc      ?: CrossSvc,
  recipeSvc     ?: RecipeSvc,
  utilSvc       ?: UtilSvc 
  }, {} > {

  @observable requestStatus  = new StringMsgList();
  @observable statusMsgs     : StatusMessage[] = [];   
  @observable checkAll       : boolean   = false; // true if form fields to be checked for errors (touched or not)
  @observable userEmail      : string;
  @observable password   : string = '';
  @observable newPassword    : string = '';
  @observable rememberLogin  : boolean;

  componentDidMount() {
    if (!this.props.user.isSignedIn) {
      this.props.utilSvc.returnToHomeMsg('signInToAccessAccount'); // let user know they need to log in
    } else {
      // update the current help context and open the Email Change form
      this.resetForm();
      this.props.utilSvc.displayUserMessages();
    }
  }

  // emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.props.utilSvc.emitEvent(name, data);
  }

  // process request to delete user account and data
  submitRequest(form: any) : void {
    this.clearRequestStatus();
    this.checkAll = true;
    if (form.invalid) {
      this.requestStatus.addMsg('formHasErrors');
      return;
    }
    // Double check with user that they really want to do this
    this.props.utilSvc.getConfirmation('AccountDelete', 'Delete Account', 'delete_forever', 
      'Are you sure you want to delete your account?  All of your recipes will be permanently removed.', 
      'Delete Account')
     .then((proceed) => {
      this.props.utilSvc.displayWorkingMessage(true, 'Authorizing');
      // first, try to delete the user's login account
        this.props.userSvc.deleteAccount()
        .then((userAccountGone) => {
          this.props.utilSvc.displayWorkingMessage(true, 'Deleteing Account');
          // next, try to delete their profile and recipe database items
          this.deleteUserItems() 
          .then((userItemsGone) => {
            this.emit('AccountDeleted');
            this.props.utilSvc.displayWorkingMessage(false);
          })
          .catch((somethingHappenedBut) => {
            this.emit('AccountDeleted');
            this.props.utilSvc.displayWorkingMessage(false);
          });
        })
        .catch((accountDeleteFailed) => {
          switch (accountDeleteFailed) {  // decide which status message to give
            case 'auth/requires-recent-login':
              this.requestStatus.addMsg('requiresRecentLogin');
              break;
            default:
              this.props.utilSvc.setUserMessage('accountDeleteFailed');
          }
          this.requestStatus.addMsg('deleteFail');
          this.props.utilSvc.displayWorkingMessage(false);
        });
      })
      .catch((neverMind) => {
      });
  }

  // Finish up Account Delete process.  Remove user's cookie, profile & data.
  // Report status message.
  deleteUserItems() : Promise<any> {
    return new Promise((resolve, reject) => {
      this.props.userSvc.removeUserProfile(this.props.user)
      .then((profileGone) => {
        this.props.user.userEmail = '';
        this.props.user.password = '';
        this.props.cookieSvc.deleteCookie();
        this.props.recipeSvc.removeUserData(this.props.user.authData.uid)
        .then((success) => {
          this.props.user.authData = null;
          this.props.utilSvc.setUserMessage('accountDeleted');
          resolve('Ok');
        })
        .catch((error) => {
          this.props.user.authData = null;
          this.props.utilSvc.setUserMessage(error);      // display what happened
          this.props.utilSvc.setUserMessage('accountDeleted');
          resolve('Errors');
        })
      })
      .catch((error) => {
          this.props.utilSvc.setUserMessage('profileDeleteFail');
          reject('Fail');
      });
    })
  }

  // clear status messages object
  clearRequestStatus = () => {
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

  updatePassword = (val: string) => {
    this.password = val;
  }

  // return a reference to the form object from the DOM
  getForm = () => {
    return document.getElementById('deleteForm');
  }

  // reset the change form
  resetForm = () => {
    this.password = '';
    this.userEmail          = this.props.user.userEmail;
    this.rememberLogin      = (this.userEmail === this.props.cookieSvc.getCookieItem('userEmail'));
}

  render() {
    return(
      <div>
        <div className="app-scroll-frame-center px-0 pt-3">
          <form 
            id="deleteForm" 
            name="deleteForm" 
            role="form" 
            noValidate={true}
            onSubmit={this.handleSubmit}
          >
            <div className="d-flex flex-column px-2">

              {/* Email field */}
              <IconInput
                fName         = "deleteUserEmail" 
                fDisabled     = {true}                  
                fType         = "email" 
                fLabel        = "Account Email Address:"  
                fIcon         = "mail_outline"
                fColor        = "app-disabled-icon-color" 
                fValue        = {this.userEmail}
              />

              <div>
                Delete account for this email.
              </div>

              {/* Status Message Area */}
              <FormStatusMessages fMessageOpen = {this.haveStatusMessages()}>
                <StatusMessages eList={this.requestStatus} sMsgs={this.statusMsgs} mMax={2}/>
                  <StatusMessage sMsgs={this.statusMsgs} name="deleteFail" class="app-error">
                      Unable to delete account.
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
                fIcon         = "remove_circle_outline"
                fType         = "submit"
                fBgColor      = "app-bg-white"
                fButtonCSS    = "app-oval-button"
                fLabels       = {true}
                fSLabel       = "Delete"
              />
            </div>
          </form>
        </div>

      </div>
    )
  }

}

export default AccountDelete;