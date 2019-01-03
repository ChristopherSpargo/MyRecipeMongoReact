'use strict';
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { UtilSvc } from '../utilities/UtilSvc';
import { User } from '../user/UserModel';
import FabControl from '../formTools/FabControlComponent';
import FormSection from '../formTools/FormSectionComponent';
import FormHeader from '../formTools/FormHeaderComponent'
import ProfileUpdate from './AccountProfileComponent';
import EmailChange from './AccountEmailComponent';
import PasswordChange from './AccountPasswordComponent';
import AccountDelete from './AccountDeleteComponent';

  // COMPONENT for ACCOUNT ACCESS feature


@inject('user', 'utilSvc', 'recipeSvc', 'currentRecipe')
@observer
export class AccountAccess extends React.Component <{
  editTabOpen   ?: boolean, 
  user          ?: User, 
  utilSvc       ?: UtilSvc 
  }, {} > {

  @observable viewOpen       : boolean   = false;
  @observable pageIsScrolled : boolean   = false;

  @observable profileOpen    : boolean   = false;  // show-hide toggle for Update Profile section
  @observable emailOpen      : boolean   = false;  // show-hide toggle for Change Email section
  @observable passwordOpen   : boolean   = false;  // show-hide toggle for Change Password section
  @observable deleteOpen     : boolean   = false;   // show-hide toggle for Delete Account section
  @observable formTitle      : string    = 'Account Access';  // title to display at top of template
  
  componentWillMount() {
    this.setMessageResponders();
    // make sure the user is signed in
    if (!this.props.user.isSignedIn) {
      this.props.utilSvc.returnToHomeMsg('signInToAccessAccount');
    }
  }

  componentDidMount() {
    this.props.utilSvc.setCurrentHelpContext('AccountAccess'); // set current help context
    setTimeout( () => { this.viewOpen = true; }, 300 );
  }

  componentWillUnmount() {
    this.deleteMessageResponders();
  }

  // set up the message responders for this module
  setMessageResponders() : void {
    document.addEventListener('AccountDeleted', this.closeView);
    window.addEventListener('scroll', this.handleScroll);
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
    document.removeEventListener('AccountDeleted', this.closeView);
    window.removeEventListener('scroll', this.handleScroll)
  }

  // return whether page has been scrolled vertically
  handleScroll = () => {
    this.pageIsScrolled = this.props.utilSvc.pageYOffset() !== 0;
  }
    
  toggleSectionOpen = (name: string) => {
    let delay = 200;

    switch (name) {
      case 'profile':
        this.props.utilSvc.setCurrentHelpContext(this.profileOpen ? 'AccountAccess' : 'ProfileUpdate');
        if (!this.profileOpen && (this.deleteOpen || this.emailOpen || this.passwordOpen)) {
          this.emailOpen = this.passwordOpen = this.deleteOpen = false;
          setTimeout( () => {
            this.profileOpen = true;
          }, delay)
        } else {
          this.profileOpen = !this.profileOpen;
        }
        break;
      case 'email':
        this.props.utilSvc.setCurrentHelpContext(this.emailOpen ? 'AccountAccess' : 'ChangeEmail');
        if (!this.emailOpen && (this.profileOpen || this.deleteOpen || this.passwordOpen)) {
          this.profileOpen = this.passwordOpen = this.deleteOpen = false;
          setTimeout( () => {
            this.emailOpen = true;
          }, delay)
        } else {
          this.emailOpen = !this.emailOpen;
        }
        break;
      case 'password':
        this.props.utilSvc.setCurrentHelpContext(this.passwordOpen ? 'AccountAccess' : 'ChangePassword');
        if (!this.passwordOpen && (this.profileOpen || this.emailOpen || this.deleteOpen)) {
          this.profileOpen = this.emailOpen = this.deleteOpen = false;
          setTimeout( () => {
            this.passwordOpen = true;
          }, delay)
        } else {
          this.passwordOpen = !this.passwordOpen;
        }
        break;
      case 'delete':
        this.props.utilSvc.setCurrentHelpContext(this.deleteOpen ? 'AccountAccess' : 'DeleteAccount');
        if (!this.deleteOpen && (this.profileOpen || this.emailOpen || this.passwordOpen)) {
          this.profileOpen = this.emailOpen = this.passwordOpen = false;
          setTimeout( () => {
            this.deleteOpen = true;
          }, delay)
        } else {
          this.deleteOpen = !this.deleteOpen;
        }
        break;
      default:
    }
  }

  // set view closed flag, wait for animation to complete before changing states to 'home'
  closeView  = () => {
    this.viewOpen = false;
    this.props.utilSvc.returnToHomeState(400);
  }
  
  render() {
    return(
      <div>
        <div 
          className={'d-flex flex-column app-full-frame app-bg-white app-fade-in' +
                (this.viewOpen ? ' app-open' : '')}
        >

          {/* Form Header */}

          <FormHeader       
            headerType      = "center" 
            headerIcon      = "folder_open"
            headerTitle     = "Account Access"
            headerTheme     = "app-recipes-header-theme"
            btnPositioning  = "app-pos-absolute"
            headerClose     = {this.closeView} 
          />

          {/* Main display area */}
          <div className="app-form-theme mx-2 my-2">
            <div className="app-page-label">
              Manage Account
            </div>
            <FormSection 
              fLabel="Update Profile" 
              fOpenFlag={this.profileOpen} 
              fSize="S" 
              fIcon="person"
              fName="profile" 
              fToggleFn={this.toggleSectionOpen} 
              fExtraCSS="px-1"
            >
              <ProfileUpdate/>
            </FormSection>
            <FormSection 
              fLabel="Change Email Address" 
              fOpenFlag={this.emailOpen} 
              fSize="S"
              fIcon="mail_outline" 
              fName="email" 
              fToggleFn={this.toggleSectionOpen} 
              fExtraCSS="px-1"
            >
              <EmailChange/>
            </FormSection>
            <FormSection 
              fLabel="Change Password" 
              fOpenFlag={this.passwordOpen} 
              fSize="S"
              fIcon="lock" 
              fName="password"
              fToggleFn={this.toggleSectionOpen} 
              fExtraCSS="px-1"
            >
              <PasswordChange/>
            </FormSection>
            <FormSection 
              fLabel="Delete Account" 
              fOpenFlag={this.deleteOpen} 
              fSize="S"
              fIcon="delete_forever" 
              fName="delete"
              fToggleFn={this.toggleSectionOpen} 
              fExtraCSS="px-1"
            >
              <AccountDelete/>
            </FormSection>
          </div>

          {/* Actions Area */}
          <div 
            className="d-flex flex-row app-form-theme justify-content-center align-items-center 
                      app-pos-relative pb-2"
            id="actions"
          >
            <FabControl
              fType       = "button"
              fLink       = "Done"
              fOnClick    = {this.closeView}
              fButtonCSS  = "app-fab-sm-sq app-oval-button"
              fAria       = "done"
            />
          </div>
        </div>
      </div>
    )
  }
}

export const accountAccessState = { name: 'accountAccess', url: '/account',  component: AccountAccess };

export default AccountAccess