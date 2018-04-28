'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { StringMsgList } from '../formTools/StringMsgList';
import { Profile } from '../profile/Profile';
import { User } from '../user/UserModel';
import { UtilSvc } from '../utilities/UtilSvc';
import { CookieSvc } from '../utilities/CookieSvc';
import { CrossSvc } from '../utilities/CrossSvc'
import { UserSvc } from '../user/UserSvc';
import { RecipeSvc, CATEGORY_TABLE_NAME } from '../recipe/RecipeSvc'

import FormHeader from '../formTools/FormHeaderComponent';
import IconInput from '../formTools/IconInputComponent';
import { StatusMessages, StatusMessage } from '../formTools/StatusMessagesComponent';
import HelpButton from '../formTools/HelpButtonComponent';
import FabControl from '../formTools/FabControlComponent';
import { FormStatusMessages } from '../formTools/FormStatusMessagesComponent';

@inject('user', 'utilSvc', 'cookieSvc', 'crossSvc', 'userSvc', 'recipeSvc')
@observer
class SignInComponent extends React.Component< { user?: User, utilSvc?: UtilSvc, cookieSvc?: CookieSvc,
                    crossSvc?: CrossSvc, userSvc?: UserSvc, recipeSvc?: RecipeSvc}, {} > {

    @observable checkAll  = false; // true if form fields to be checked for errors (touched or not)
    @observable formOpen              = false;
    @observable userEmail;
    @observable userPassword;
    @observable passwordConfirm       = '';
    @observable requestStatus         = new StringMsgList();
    @observable createAccount         = false;
    @observable newAccount            = false;
    @observable rememberLogin         = true;           
    @observable showHelp              = false;  
    @observable statusMsgs            : StatusMessage[] = [];         
    componentDidMount() {
       this.props.utilSvc.displayUserMessages();
       // determine if user is loggin in or logging out
       if (this.props.user.authData) { // user needs to log out
            this.props.user.authData = null;
            this.props.user.profile = Profile.build();
            this.props.user.userEmail = '';
            this.props.user.password = '';
            this.props.utilSvc.setUserMessage('signOutSuccess');
            this.props.utilSvc.returnToHomeState();
       } else { // user needs to log in

           // fetch email and password from cookie if possible
           this.userEmail = this.props.cookieSvc.getCookieItem('userEmail');
           if (this.userEmail !== '') {
             this.userPassword = this.props.crossSvc.uncross(this.userEmail, 
            this.props.cookieSvc.getCookieItem('password'));
           } else {
            this.userPassword = '';
           }
           // update the current help context and open the Login form
           this.props.utilSvc.setCurrentHelpContext('Login'); 
           setTimeout( () => { this.formOpen = true; }, 300 );
       }
    }
  
    // finish up Login process.  Update user's cookie and read user's profile.  Report status message.
    reportLogin(authData : any) : void {
      this.props.user.userEmail = this.userEmail;
      this.props.user.password = this.userPassword;
      this.props.user.authData = authData;
      this.props.utilSvc.setUserMessage('signInSuccess');
      if (this.rememberLogin) {
        this.props.cookieSvc.setCookieItem('password', this.props.crossSvc.cross(this.userEmail, this.userPassword));
        this.props.cookieSvc.setCookieItem('userEmail', this.props.user.userEmail);
      } else {
        this.props.cookieSvc.setCookieItem('password', '');
        this.props.cookieSvc.setCookieItem('userEmail', '');
      }
      this.props.userSvc.readUserProfile(this.props.user)
      .then((profile) => {
        // maybe check here for difference in email in profile and login to correct error in 
        // Change Email updating profile. 
        this.props.user.profile = profile;
      })
      .catch((noProfile) => {
        this.props.user.profile = Profile.build();     // no profile yet, create a profile
        this.props.user.profile.id = authData.uid;
        this.props.user.profile.email = this.props.user.userEmail;
        this.props.userSvc.createUserProfile(this.props.user)
        .then((newProfile) => {
          this.props.user.profile = newProfile;
          this.props.recipeSvc.initializeTable(CATEGORY_TABLE_NAME, authData.uid) // initialize Categories List
          .then((success) => {})
          .catch((error) => {
              this.props.utilSvc.setUserMessage('errorInitializingCategoriesList');
          })
        })
        .catch((noNewProfile) => {
          this.props.utilSvc.setUserMessage('noProfile');
        })
      });
      this.props.utilSvc.displayWorkingMessage(false);
      this.closeForm();
    }
  
    // send login request to Firebase service
    sendLoginRequest = (form: any) => {
      this.checkAll = true;
      this.clearRequestStatus();
      let v = form.checkValidity();
      if (!v) {
        this.requestStatus.addMsg('formHasErrors');
        return;
      }
      if (this.createAccount && !this.newAccount) {  // creating new account
        this.props.utilSvc.displayWorkingMessage(true, 'Creating New Account');
        this.props.userSvc.createAccount(this.userEmail, this.userPassword)
        .then((success) => {
          this.requestStatus.addMsg('createSuccess');
          this.requestStatus.addMsg('accountCreated');
          this.setState({newAccount: true});
          this.props.utilSvc.displayWorkingMessage(false);
        })
        .catch((failure) => {
          this.requestStatus.addMsg('createFail');
          switch (failure) {
            case 'EMAIL_TAKEN':
              this.requestStatus.addMsg('emailInUse');
              break;
            case 'INVALID_EMAIL':
              this.requestStatus.addMsg('emailInvalid');
              break;
            default:
              this.requestStatus.addMsg('weirdProblem');
          }
          this.props.utilSvc.displayWorkingMessage(false);
        })
      } else {  // logging in
        this.props.utilSvc.displayWorkingMessage(true, 'Authorizing');
        this.props.userSvc.authWithPassword(this.userEmail, this.userPassword)
        .then((authData) => {
          this.reportLogin(authData);
        })
        .catch((error) => {
          switch (error) {  // decide which message to give
            case 'INVALID_USER':
              this.requestStatus.addMsg('unrecognizedEmail');
              break;
            case 'INVALID_EMAIL':
              this.requestStatus.addMsg('emailInvalid');
              break;
            case 'INVALID_PASSWORD':
              this.requestStatus.addMsg('incorrectPassword');
              break;
            default:
              this.requestStatus.addMsg('weirdProblem');
          }
          this.requestStatus.addMsg('authFail');
          this.props.user.authData = null;
          this.props.utilSvc.displayWorkingMessage(false);
        })
      }
    }
  
    // user got their password wrong and has clicked the FORGOT PASSWORD button
    // confirm that this is the case and allow them to receive an email with a temporary password
    requestPasswordReset = () => {
      this.clearRequestStatus();
      this.props.utilSvc.getConfirmation('ForgotPwd', 'Forgot Password:', 'info', 
      `You can receive an email containing a temporary password
        that you can use to log in.  You can then set your password to something else.
          Or, you can try to sign in again now.`, 'Send Email', 'Try Again')
      .then((sendEmail) => {
        this.props.utilSvc.displayWorkingMessage(true, 'Sending Email');
        this.props.userSvc.resetPassword(this.userEmail)
        .then((emailSent) => {
          this.props.utilSvc.displayWorkingMessage(false);
          this.requestStatus.addMsg('passwordResetSent');
          this.requestStatus.addMsg('enterTempPassword');
        })
        .catch((error) => {
          switch (error) {  // decide which message to give
            case 'INVALID_USER':
              this.requestStatus.addMsg('unrecognizedEmail');  // this probably should not happen
              break;
            default:
          }
          this.props.utilSvc.displayWorkingMessage(false);
          this.requestStatus.addMsg('passwordResetFail');
        })
      });
    }
  
    // clear status messages object
    clearRequestStatus = () => {
      this.requestStatus.clearMsgs();
    }
  
    // determine if fields for new account should be showing in Login form
    showNewAccountFields = () => {
      return (this.createAccount && !this.newAccount);
    }
  
    // reset some fields associated with a new account
    clearNewAccountFields = () => {
      this.clearRequestStatus();
      this.passwordConfirm = '';
    }
  
    // indicate whether there are any status messages
    @observable
    haveStatusMessages = () : boolean => {
      return !this.requestStatus.empty();
    }
  
    // indicated if the password has been found to be incorrect
    wrongPassword = () : boolean => {
      return this.requestStatus.hasMsg('incorrectPassword');
    }
  
    // set form closed flag, wait for animation to complete before changing states
    closeForm = () =>  {
      this.formOpen = false;
      this.props.utilSvc.returnToHomeState(400);
    }  

    changeCreateAccount = event => {
      this.createAccount = !this.createAccount;
      this.clearNewAccountFields();
    }

    changeRememberLogin = event => {
      this.rememberLogin = !this.rememberLogin;
      this.clearRequestStatus();
    }

    handleSubmit = () => {
      let form = document.getElementById('loginForm');
      this.sendLoginRequest(form);
    }

    updateEmail = (val: string) => {
      this.userEmail = val;
    }

    updatePassword = (val: string) => {
      this.userPassword = val;
    }

    updatePasswordConfirm = (val: string) => {
      this.passwordConfirm = val;
    }

    render() {
      return (
        <div>
          <div className={(this.formOpen ? 'app-open ' : '') + 'app-central-container-sm app-fade-in'}>
          
            {/* Form Header */}
          
            <FormHeader       
              headerType        = "center" 
              headerIcon        = "person_outline"
              headerTitle       = "Account Sign In" 
              headerTheme       = "app-account-header-theme"
              showHelp          = {this.showHelp}
              headerClose       = {this.closeForm}
            />
          
            {/* Start of Form */}
          
            <div className=" app-scroll-frame-center app-card-bottom-corners app-whiteframe-2dp">
              <div className="app-form-theme px-0 pt-3">
                <form name="loginForm" id="loginForm" role="form">
                  <div className="d-flex flex-column px-2">
          
                     {/* Email field */}
                    <IconInput
                      fCheckAll     = {this.checkAll}
                      fName         = "uEmail" 
                      fRequired     = {true} 
                      fType         = "email" 
                      fLabel        = "What's your Email Address?"  
                      fFocusedLabel = "Email Address:"
                      fIcon         = "mail_outline"
                      fColor        = "app-accent1" 
                      fValue        = {this.userEmail} 
                      fErrors       = "valueMissing|typeMismatch"
                      fErrorMsgs    = "An email address is required.|Invalid email address character/format."
                      fBlurFn       = {this.updateEmail}
                      fFocusFn      = {this.clearRequestStatus}
                    />
          
                    {/* Password field */}
                    <IconInput
                      fCheckAll     = {this.checkAll}
                      fName         ="uPassword" 
                      fRequired     = {true} 
                      fType         ="password" 
                      fLabel        ="What's your Password?" 
                      fFocusedLabel ="Password:"
                      fIcon         ="lock_open"
                      fColor        ="app-accent1" 
                      fValue        = {this.userPassword} 
                      fErrors       ="valueMissing|patternMismatch|tooShort"
                      fErrorMsgs    ="A password is required.|Invalid password character/format.
                                      |Password must be at least 6 characters."
                      fMinlength    = {6} 
                      fMaxlength    = {16}
                      fPattern      ="^[a-zA-Z]+[!#$%\^\-+*\w]*$" 
                      fExtraCSS     ="mt-2"
                      fBlurFn       = {this.updatePassword}
                      fFocusFn      = {this.clearRequestStatus}
                    />
          
                    {/* Hidden fields for creating a new account */}
                    <div 
                      className={this.showNewAccountFields() ? 'app-open' : '' +
                      ' d-flex flex-column app-vertical-expand'}
                    >
          
                      {/* Password confirmation field */}
                      <IconInput
                        fCheckAll   = {this.checkAll}
                        fName       ="cPassword" 
                        fRequired   ={this.showNewAccountFields()} 
                        fType       ="password" 
                        fLabel      ="Type your Password again (sorry)" 
                        fFocusedLabel ="Password Confirmation:"
                        fColor      ="app-accent1" 
                        fValue      = {this.passwordConfirm} 
                        fIcon       ="lock_outline"
                        fErrors     ="valueMissing|patternMismatch|tooShort" 
                        fErrorMsgs  ="Password confirmation is required.|This value must match the Password.
                                      |Password must be at least 6 characters."
                        fMinlength  = {6} 
                        fMaxlength  = {16} 
                        fPattern    ={this.userPassword} 
                        fExtraCSS   ="mt-1 mb-2"
                        fBlurFn     = {this.updatePasswordConfirm}
                        fFocusFn    = {this.clearRequestStatus}
                      />
          
                    </div>
          
                    {!this.newAccount && <div className="mt-1">
                      <label className="app-cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="app-input-icon-area app-cursor-pointer" 
                          name="createAcc" 
                          checked={this.createAccount} 
                          value={this.createAccount.toString()} 
                          onChange={this.changeCreateAccount}
                        />
                        I want to create new account
                      </label>
                    </div>}
          
                    {/* Remember Me field */}
                    {!this.wrongPassword() && <div>
                      <label className="app-cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="app-input-icon-area app-cursor-pointer" 
                          name="memberMe" 
                          checked={this.rememberLogin} 
                          value={this.rememberLogin.toString()}
                          onChange={this.changeRememberLogin}
                        />
                        Remember my Sign-In stuff
                      </label>
                    </div>}
          
                    {/* Status Message Area */}
                    <FormStatusMessages fMessageOpen={this.haveStatusMessages()}>
                      <StatusMessages eList={this.requestStatus} sMsgs={this.statusMsgs} mMax={2}/>
                      <StatusMessage sMsgs={this.statusMsgs} name="formHasErrors" class="app-error">
                          Please correct the fields with errors.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="createFail" class="app-error">
                          Unable to create new account.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="authFail" class="app-error">
                        Unable to sign in.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="createSuccess" class="app-success">
                        Success!
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="accountCreated" class="app-success">
                        Account created, press Continue to Sign In.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="emailInUse" class="app-error">
                        Email Address already in use.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="emailInvalid" class="app-error">
                        Email Address is invalid.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="weirdProblem" class="app-error">
                        Some weird problem occurred.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="unrecognizedEmail" class="app-error">
                        No account for current email.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="incorrectPassword" class="app-error">
                        Password value is incorrect.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="passwordResetSent" class="app-success">
                        Password reset email sent.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="enterTempPassword" class="app-success">
                        Enter the password from that email.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="passwordResetFail" class="app-error">
                        Unable to reset password.
                      </StatusMessage>
                    </FormStatusMessages>
                                      
                  </div>
          
                   {/* Actions Area */}
                  <div 
                    className="d-flex flex-row justify-content-center align-items-center 
                              app-pos-relative app-bg-primary pb-2" 
                    id="actions"
                  >
                    <HelpButton/>
                    {!this.newAccount && !this.wrongPassword() && 
                    <FabControl
                      fAria="sign in" 
                      fType="button"
                      fButtonCSS="app-fab-sm-sq app-white" 
                      fIconColor="app-white"
                      fLabel={this.createAccount ? 'Create Account' : 'Sign In'}
                      fIcon={this.createAccount ? 'add_circle_outline' : 'check_circle_outline'}
                      fDelay={0}
                      fOnClick={this.handleSubmit}
                    />}
                    {this.newAccount && 
                    <FabControl 
                      fAria="sign in" 
                      fLabel="Continue to Sign In"
                      fButtonCSS="app-fab-sm-sq app-white"
                      fIcon="arrow_forward" 
                      fIconColor="app-white"
                    />}
                    {this.wrongPassword() && 
                    <FabControl  
                      fAria="forgot password"
                      fLabel="Reset Password"
                      fButtonCSS="app-fab-sm-sq app-white"
                      fIcon="sentiment_dissatisfied" 
                      fIconColor="app-white"
                      fType="button" 
                      fOnClick={this.requestPasswordReset}
                    />}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )
    }
}

export const signInState = { name: 'signIn', url: '/signIn',  component: SignInComponent };
export const signOutState = { name: 'signOut', url: '/signOut',  component: SignInComponent };

export default SignInComponent;