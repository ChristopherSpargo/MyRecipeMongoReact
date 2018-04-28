'use strict'
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { APP_VERSION } from '../app.constants'
import { UtilSvc } from '../utilities/UtilSvc'
import { User } from '../user/UserModel'
import { MainMenuModel } from './MainMenuModel'
import { AboutModel } from '../about/AboutModel'

@inject('user', 'mainMenu', 'aboutModel', 'utilSvc', 'stateService', 'versionLogo')
@observer
class MainMenu extends React.Component<{ user?: User, mainMenu?: MainMenuModel, aboutModel?: AboutModel, 
  utilSvc?: UtilSvc, stateService?: any, versionLogo?: any, smallScreen?: boolean}, {} > {

  closeMenu = evt => {
    this.props.mainMenu.close();
  }

  toggleRecipe = evt => {
    this.props.mainMenu.toggleSub('Recipe');
  }

  toggleAccount = evt => {
    this.props.mainMenu.toggleSub('Account');
  }

  toggleAbout = evt => {
    this.props.mainMenu.toggleSub('About');
  }

  menuItemSelected = (cmd: string, evt: any) => {
    if (!this.props.smallScreen) { this.closeSubmenus(evt); }
    this.props.mainMenu.close();
    this.props.stateService.go(cmd);
  }

  showAbout = (topic: string, evt: any) => {
    this.props.aboutModel.setHelpContext(topic);
    this.props.mainMenu.close();
    this.props.aboutModel.openAbout();
  }

  closeSubmenus = evt => {
    this.props.mainMenu.toggleSub('None');
  }

  // prompt the user for confirmation of log out and switch to login state
  logout = evt => {
    if (!this.props.smallScreen) { this.closeSubmenus(evt); }
    this.props.mainMenu.close();
    this.props.utilSvc.getConfirmation('SignOut', 'Signing Out', 'person', 
                        'Are you sure you want to Sign Out?', 'Sign Out')
     .then((leave) => {
       this.closeSubmenus(null);
       this.props.stateService.go('signOut');
     })
     .catch((stay) => {
     });
  }

  render() {
    const user  = this.props.user!;
    const mainMenu = this.props.mainMenu;

    return(
      <div className="app-inherit-bc">
        <ul 
          className={'d-flex app-slide-menu-ul app-menu-theme' + 
                        (this.props.smallScreen ? ' flex-column' : ' flex-row')}
        >
          <li id="myRecipesMenu" className="app-inherit-bc">
            <button type="button" className="btn app-slide-menu-listitem" onClick={this.toggleRecipe}>
              <div className="d-flex flex-row align-items-center">
                <i className="material-icons app-menu-icon-color app-menu-item-icon">local_dining</i>
                Recipes
                <i className="material-icons app-menu-icon-color ml-1">
                    {!mainMenu.isOpenSub('Recipe') ? 'arrow_drop_down' : 'arrow_drop_up'}</i>
              </div>
            </button>
            <div className={(mainMenu.isOpenSub('Recipe') ? 'app-open ' : '') + 'app-mainMenu-submenu'}>
              <ul className="app-slide-submenu-ul">
                <li>
                  <button 
                    type="button" 
                    className="btn app-slide-menu-listitem app-subitem-spacing" 
                    onClick={this.menuItemSelected.bind(this, 'searchMyRecipes')}
                  >
                    <div className="d-flex flex-row align-items-center">
                      <i className="material-icons app-menu-icon-color app-menu-item-icon-sm">folder</i>
                      Search My Recipes
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    className="btn app-slide-menu-listitem app-subitem-spacing" 
                    onClick={this.menuItemSelected.bind(this, 'searchSharedRecipes')}
                  >
                    <div className="d-flex flex-row align-items-center">
                      <i className="material-icons app-menu-icon-color app-menu-item-icon-sm">folder_shared</i>
                      Search Shared Recipes
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    className="btn app-slide-menu-listitem app-subitem-spacing" 
                    onClick={this.menuItemSelected.bind(this, 'recipeEntry')}
                  >
                    <div className="d-flex flex-row align-items-center">
                      <i className="material-icons app-menu-icon-color app-menu-item-icon-sm">edit</i>
                      Add a Recipe
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </li>
          <li className="app-inherit-bc app-mainMenu-item-spacing">
            <button 
              type="button"
              className="btn app-slide-menu-listitem" 
              onClick={this.menuItemSelected.bind(this, 'manageCategories')}
            >
              <div className="d-flex flex-row align-items-center">
                <i className="material-icons app-menu-icon-color app-menu-item-icon ">assessment</i>
                Categories
              </div>
            </button>
          </li>
          <li id="accountMenu" className="app-inherit-bc app-mainMenu-item-spacing">
            <button
              type="button" 
              className="btn app-slide-menu-listitem" 
              onClick={this.menuItemSelected.bind(this, 'accountAccess')}
            >
              <div className="d-flex flex-row align-items-center">
                <i className="material-icons app-menu-icon-color app-menu-item-icon ">folder_open</i>
                Account
              </div>
            </button>
          </li>
          <li id="aboutMenu" className="app-inherit-bc">
            <button 
              id="aboutMenuBtn" 
              type="button" 
              className="btn app-slide-menu-listitem" 
              onClick={this.toggleAbout}
            >
              <div className="d-flex flex-row align-items-center">
                <i className="material-icons app-menu-icon-color app-menu-item-icon ">info_outline</i>
                About
                <i className="material-icons app-menu-icon-color ml-1">
                {!mainMenu.isOpenSub('About') ? 'arrow_drop_down' : 'arrow_drop_up'}</i>
              </div>
            </button>
            <div className={(mainMenu.isOpenSub('About') ? 'app-open ' : '') +  'app-mainMenu-submenu'}>
              <ul className=" app-slide-submenu-ul ">
                <li>
                  <button 
                    type="button" 
                    className="btn app-slide-menu-listitem app-subitem-spacing" 
                    onClick={this.showAbout.bind(this, 'UsingMyRecipeMongo')}
                  >
                    <div className="d-flex flex-row align-items-center">
                      <i className="material-icons app-menu-icon-color app-menu-item-icon-sm">local_dining</i>
                      Using MyRecipeMongo
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    className="btn app-slide-menu-listitem app-subitem-spacing" 
                    onClick={this.showAbout.bind(this, 'ContactUs')}
                  >
                    <div className="d-flex flex-row align-items-center">
                      <i className="material-icons app-menu-icon-color app-menu-item-icon-sm">contact_mail</i>
                      Contacting Us
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    className="btn app-slide-menu-listitem app-subitem-spacing app-disabled"
                  >
                    <div className="d-flex flex-row align-items-center">
                      <i className="material-icons app-menu-icon-color app-menu-item-icon-sm">person</i>
                        {user.isSignedIn ? user.userEmail : 'Not signed in'}
                    </div>
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    className="btn app-small-font 
                                              app-slide-menu-listitem app-subitem-spacing app-disabled"
                  >
                    <div className="d-flex flex-row align-items-center">
                      <img src={this.props.versionLogo} className="app-version-logo"/>
                      Version: {APP_VERSION}
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </li>
          {!user.isSignedIn && <li>
            <button 
              type="button" 
              aria-label="sign in"
              className="btn app-slide-menu-listitem " 
              onClick={this.menuItemSelected.bind(this, 'signIn')}
            >
              <div className="d-flex flex-row align-items-center">
                <i className="material-icons app-menu-icon-color app-menu-item-icon">person_outline</i>
                Sign In
              </div>
            </button>
          </li>}
          {user.isSignedIn && <li>
            <button 
              type="button" 
              aria-label="sign out"
              className="btn app-slide-menu-listitem " 
              onClick={this.logout}
            >
              <div className="d-flex flex-row align-items-center">
                <i className="material-icons app-menu-icon-color app-menu-item-icon">person</i>
                Sign Out
              </div>
            </button>
          </li>}
        </ul>
      </div>
   )
  }
}
  export default MainMenu;
