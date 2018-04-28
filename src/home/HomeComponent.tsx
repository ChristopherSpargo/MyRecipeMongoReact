'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { Profile } from '../profile/Profile';
import { APP_TITLE1, APP_TITLE2 } from '../app.constants';
import MainMenu from '../home/MainMenuComponent';
import { User } from '../user/UserModel'
import { MainMenuModel } from './MainMenuModel'
import { AboutModel } from '../about/AboutModel'
import { UtilSvc } from '../utilities/UtilSvc';
import HelpButton from '../formTools/HelpButtonComponent';


@inject('user', 'mainMenu', 'aboutModel', 'stateService', 'utilSvc', 'versionLogo')
@observer
class HomeComponent extends React.Component<{ user?: User, mainMenu?: MainMenuModel,
         aboutModel?: AboutModel, stateService?: any, utilSvc?: UtilSvc, versionLogo?: any},  {} > {

 @observable  smallScreen = true;

  componentDidMount() {
    window.addEventListener('resize', this.checkScreenSize);
    this.checkScreenSize();
    if (!this.props.user.profile) {                          // if the user doesn't have a profile
      this.props.user.profile = Profile.build();             // assign them the default profile values
    }
    this.props.utilSvc.displayUserMessages();
    this.props.aboutModel.setHelpContext('UsingMyRecipeMongo'); // reset help context to base status

    // this.props.utilSvc.scrollToTop();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);    
  }

  // check the size of the screen and set the number of columns for the recipes menu
  checkScreenSize = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      this.smallScreen = false;
      this.closeSlidenav();
    } else {
      this.smallScreen = true;
    }
  }
  
  closeMenu = event => {
    this.closeSlidenav();
  }

  // make sure the slide menu is closed
  closeSlidenav() : void {
    this.props.mainMenu.close();
}

  toggleRecipe = event => {
    this.props.mainMenu.toggleSub('Recipe');
  }

  toggleAccount = event => {
    this.props.mainMenu.toggleSub('Account');
  }

  toggleAbout = event => {
    this.props.mainMenu.toggleSub('About');
  }

  menuItemSelected = (cmd: string, e: any) => {
    this.closeSubmenus(e);
    this.props.mainMenu.close();
    this.props.stateService.go(cmd);
  }

  showAbout = (topic: string, e: any) => {
    this.props.aboutModel.setHelpContext(topic);
    this.props.mainMenu.close();
    this.props.aboutModel.openAbout();
  }

  closeSubmenus = event => {
    this.props.mainMenu.toggleSub('None');
  }

  toggleMenu = event => {
    this.props.mainMenu!.toggle();
  }

  // prompt the user for confirmation of log out and switch to login state
  logout = event => {
    this.props.utilSvc.getConfirmation('SignOut', 'Signing Out', 'person', 
                              'Are you sure you want to Sign Out?', 'Sign Out')
     .then((leave) => {
       this.props.mainMenu.toggleSub('None');
       this.props.stateService.go('signOut');
     })
     .catch((stay) => {
       if (window.matchMedia('(min-width: 768px)').matches) {
         this.closeSlidenav();
       }
     });
  }

  render() {

    const mainMenu = this.props.mainMenu!;
    const user = this.props.user!;

    return (
      <div>
        {this.smallScreen && 
        <div>
          {mainMenu.isOpen && 
          <div 
            className="app-click-to-close-slidenav" 
            onClick={this.closeMenu}
          />}
          <div 
            id="slideDownMenu"
            className={(mainMenu.isOpen ? 'app-open ' : '') + 
                    'hidden-md-up app-slide-menu app-slide-down app-whiteframe-2dp app-bg-white'}
          >
            <div className="d-flex flex-column justify-content-start align-items-start app-scrollable">
              <MainMenu smallScreen={this.smallScreen}/>
            </div>
          </div>
          <div 
            id="mainToolbarSm"
            className="nav app-toolbar-theme app-main-short-toolbar hidden-md-up 
                d-flex flex-row justify-content-around align-items-center"
          >
            <div 
              className="d-flex flex-column justify-content-center align-items-center
                        app-logo-text-container app-cursor-pointer"
              onClick={this.showAbout.bind(this, 'UsingMyRecipeMongo')}
              data-toggle="tooltip" 
              data-placement="top" 
              title="Help" 
              data-delay="200"
            >
              <div className="app-logo-text1">{APP_TITLE1}</div>
              <div className="app-logo-text2">{APP_TITLE2}</div>
            </div>
            <button 
              type="button" 
              className="btn app-bar-feature-button"  
              id="searchMy"
              onClick={this.menuItemSelected.bind(this, 'searchMyRecipes')}
              data-toggle="tooltip" 
              data-placement="top" 
              title="Search Recipes" 
              data-delay="200"
            >
              <i 
                className="material-icons app-bar-feature-icon align-self-end" 
                aria-label="search recipes"
              >
                search
              </i>
            </button>
            <button 
              type="button" 
              className="btn app-bar-feature-button"
              id="recipeAdd"
              onClick={this.menuItemSelected.bind(this, 'recipeEntry')}
              data-toggle="tooltip" 
              data-placement="top" 
              title="Add Recipe" 
              data-delay="200"
            >
              <i className="material-icons app-bar-feature-icon" aria-label="add recipe">edit</i>
            </button>
            <button 
              type="button" 
              className="btn app-bar-feature-button"
              id="categories"
              onClick={this.menuItemSelected.bind(this, 'manageCategories')}
              data-toggle="tooltip" 
              data-placement="top" 
              title="Categories" 
              data-delay="200"
            >
              <i className="material-icons app-bar-feature-icon" aria-label="add recipe">assessment</i>
            </button>
            {!user.isSignedIn && 
            <button 
              type="button" 
              className="btn app-bar-feature-button " 
              id="signIn" 
              onClick={this.menuItemSelected.bind(this, 'signIn')}
              data-toggle="tooltip" 
              data-placement="top" 
              title="Sign In" 
              data-delay="200"
            >
              <i className="material-icons app-bar-feature-icon" aria-label="sign in">person_outline</i>
            </button>}
            {user.isSignedIn && 
            <button 
              type="button" 
              className="btn app-bar-feature-button " 
              id="signOut"
              onClick={this.logout}
              data-toggle="tooltip" 
              data-placement="top" 
              title="Sign Out" 
              data-delay="200"
            >
              <i className="material-icons app-bar-feature-icon" aria-label="sign out">person</i>
            </button>}
            <div className="d-flex flex-row app-slidedown-menu-button">
              <button 
                id="slideDownBtn" 
                type="button" 
                className="btn app-slidedown-menu-button app-menu-button m-0"  
                data-toggle="tooltip" 
                data-placement="top" 
                title="Menu" 
                data-delay="200"
                onClick={this.toggleMenu}
              >
                <i 
                  className={(mainMenu.isOpen ? '' : 'app-visible ') + 
                              'material-icons app-slidedown-menu-icon app-slide-open-icon app-font-normal'}
                  aria-label="open menu"
                >
                  more_vert
                </i>
                <i 
                  className={(mainMenu.isOpen ? 'app-visible ' : '') + 
                              'material-icons app-slidedown-menu-icon app-slide-close-icon app-font-normal'} 
                  aria-label="close menu"
                >
                  arrow_upward
                </i>
              </button>
            </div>
          </div>
        </div>}
        {/* Main Toolbar for Other Screen Sizes */}
        {/* Toolbar is a single row that starts with the Logo followed by
        a number of drop-down menus, a Sign In/Sign Out button and finally 
        an icon indicating signed in status */}

        {!this.smallScreen &&
        <div  
          id="mainToolbarLg"
          className="app-toolbar-theme app-main-short-toolbar 
                    d-flex flex-row justify-content-between align-items-center"
        >
          <div 
            className="app-logo-text-container app-cursor-pointer" 
            onClick={this.showAbout.bind(this, 'UsingMyRecipeMongo')}
            data-toggle="tooltip" 
            data-placement="top" 
            title="Help" 
            data-delay="200"
          >
            MyRecipeMongo
          </div>
          <MainMenu smallScreen={this.smallScreen}/>
          <div className="mr-4 d-flex flex-column align-items-center">
            <HelpButton fPosition="relative"/>
          </div>
        </div>}
      </div>
    )
  }
}

export const homeState = { name: 'home', url: '/home',  component: HomeComponent };

export default HomeComponent;
