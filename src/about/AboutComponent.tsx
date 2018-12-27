'use strict';
import * as React from 'react';
import { observer, inject } from 'mobx-react';

// import AboutMyRecipeMongo from './AboutMyRecipeMongo';
import { AboutModel } from './AboutModel'
// import AboutTextIcon from './AboutTextIcon';
import AboutMyRecipeMongo from './AboutMyRecipeMongoComponent';
import AboutContactUs from './AboutContactUs';
import AboutAccountAccess from './AboutAccountAccessComponent';
import AboutAccountDelete from './AboutAccountDeleteComponent';
import AboutChangeEmail from './AboutChangeEmailComponent';
import AboutChangePassword from './AboutChangePasswordComponent';
import AboutProfileUpdate from './AboutProfileUpdateComponent'
import AboutSignIn from './AboutSignInComponent';
import AboutCategories from './AboutCategoriesComponent';
import AboutViewRecipe from './AboutViewRecipeComponent'
import AboutEnterRecipes from './AboutEnterRecipesComponent';
import AboutRecipeSearch from './AboutRecipeSearchComponent';
import AboutRecipeMenu from './AboutRecipeMenuComponent';
import AboutMakeShared from './AboutMakeSharedComponent';
import AboutSharedSettings from './AboutSharedSettingsComponent';

export const HelpContextTitles = {
  UsingMyRecipeMongo  : ['local_dining', 'Using MyRecipeMongo'],
  RecipeSearch        : ['search', 'Searching for Recipes'],
  RecipesMenu         : ['restaurant', 'Recipe Search Results Menu'],
  ViewRecipe          : ['local_library', 'Viewing Recipes'],
  EnterRecipes        : ['edit', 'Entering Recipe Information'],
  ManageCategories    : ['assessment', 'Managing Recipe Categories'],
  MakeRecipeShared    : ['add_circle_outline', 'Adding a Shared Recipe'],
  ManageSharedSettings: ['settings_applications', 'Managing Shared Settings'],
  AccountAccess       : ['folder_open', 'Accessing Your Account'],
  ProfileUpdate       : ['person', 'Updating Your Profile'],
  ChangeEmail         : ['mail_outline', 'Changing Your Email Address'],
  ChangePassword      : ['lock', 'Changing Your Password'],
  DeleteAccount       : ['delete_forever', 'Deleting Your Account'],
  Login               : ['person_outline', 'Signing In'],
  ContactUs           : ['contact_mail', 'Contacting Us']
};


@inject('aboutModel')
@observer
class AboutComponent extends React.Component<{ aboutModel?: AboutModel }, {} > {

  // return the open status of the About panel
  aboutOpen = () : boolean => {
    return this.props.aboutModel.open;
  }

  // close the About panel
  closeAbout = event => {
    this.props.aboutModel.closeAbout();
  }

  // return current helpContext
  helpContext = () : string => {
    return this.props.aboutModel.helpContext;
  }

  // return the current helpContext title
  helpContextTitle = () : string => {
    var c = this.helpContext();
    if ( c !== undefined ) {
      if (HelpContextTitles[c] !== undefined) { return HelpContextTitles[c][1]; }
      alert(c);
    }
    return '';
  }

  // return the current helpContext icon name
  helpContextIcon = () : string => {
    var c = this.helpContext();
    if (c !== undefined) {
      if (HelpContextTitles[c] !== undefined) { return HelpContextTitles[c][0]; }
      alert(c);
    }
    return '';
  }

  render() {

    const { aboutModel } = this.props;

    return (
      <div>
        {/* define a backdrop container for click-outside-to-close functionality for the about panel */}
        {aboutModel.open && <div className="app-click-to-close-about" onClick={this.closeAbout}/>}
            

        <div 
          id="about-panel" 
          className={'d-flex flex-column app-about-container app-slide-right' + 
                    (aboutModel.open ? ' app-open' : '') + ' app-whiteframe-2dp app-card-corners mb-1'}
        >

          {/* Card Header */}
          <div className="app-card-top-corners">
            <div className="app-about-header-theme app-card-top-corners">
                <div className="d-flex flex-row justify-content-between align-items-center">
                  <div className="d-flex flex-row justify-content-start align-items-center ml-2"> 
                    <button 
                      id="aboutCloseBtn" 
                      type="button" 
                      className="btn app-form-close-button" 
                      onClick={this.closeAbout}
                    >
                      <i className="material-icons app-form-close-icon app-white" aria-label="close">arrow_back</i>
                    </button>
                    <div className="ml-2 d-flex app-about-title">{this.helpContextTitle()}</div> 
                  </div>
                </div>
            </div>
          </div> 

          {/* Section for context specific help information */}
          <div id="about-text" className="app-about-body-theme app-scroll-frame-left my-2">
            {aboutModel.helpContext === 'UsingMyRecipeMongo' &&   <AboutMyRecipeMongo/>}
            {aboutModel.helpContext === 'ContactUs' &&            <AboutContactUs/>} 
            {aboutModel.helpContext === 'ManageCategories' &&     <AboutCategories/>}
            {aboutModel.helpContext === 'RecipeSearch' &&         <AboutRecipeSearch/>}
            {aboutModel.helpContext === 'RecipesMenu' &&          <AboutRecipeMenu/>}
            {aboutModel.helpContext === 'EnterRecipes' &&         <AboutEnterRecipes/>}
            {aboutModel.helpContext === 'ViewRecipe' &&           <AboutViewRecipe/>}
            {aboutModel.helpContext === 'AccountAccess' &&        <AboutAccountAccess/>} 
            {aboutModel.helpContext === 'ProfileUpdate' &&        <AboutProfileUpdate/>} 
            {aboutModel.helpContext === 'ChangeEmail' &&          <AboutChangeEmail/>}
            {aboutModel.helpContext === 'ChangePassword' &&       <AboutChangePassword/>}
            {aboutModel.helpContext === 'DeleteAccount' &&        <AboutAccountDelete/>}
            {aboutModel.helpContext === 'Login' &&                <AboutSignIn/>}
            {aboutModel.helpContext === 'MakeRecipeShared' &&     <AboutMakeShared/>} 
            {aboutModel.helpContext === 'ManageSharedSettings' && <AboutSharedSettings/>} 
          </div>
        </div>
      </div>
    )
  }
}

export default AboutComponent;
