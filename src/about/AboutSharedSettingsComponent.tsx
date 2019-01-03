'use strict';
import * as React from 'react';
import AboutHeading from './AboutHeadingComponent';

// Help component for SHARED SETTINGS

class AboutSharedSettings extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>Shared Recipe Settings</b> form allows you to change
        the settings for a recipe you have Shared.<br/>
        The fields and buttons are:

        <AboutHeading fIcon="check" fText="Stop sharing this Recipe" fIconColor="app-about-checkbox-icon"/>
        &nbsp;&nbsp;Check this box to stop sharing the recipe.

        <AboutHeading fIcon="mail_outline" fText="Authorized Users" fIconColor="app-active-input-icon-color app-mb--2"/>
        &nbsp;&nbsp;This is an optional list that you can create to control sees the shared version of this recipe.
        The list
        contains email addresses associated with the accounts of other
        <i><b> MyRecipeMongo</b></i> users that you want to share this recipe with.
        Leave this list empty to share with all users.<br />
        &nbsp;&nbsp;From the drop-down list, select an email address to change/remove or select 
        <b> New Authorized User</b> to add a new email address to the list.

        <AboutHeading fButton="Cancel"/>
        &nbsp;&nbsp;This button cancels making changes to the Shared Settings.

        <AboutHeading fButton="Save"/>
        &nbsp;&nbsp;This button saves changes to the Shared Settings.

        <AboutHeading fButton="Stop Sharing"/>
        &nbsp;&nbsp;This button cancels sharing the recipe.
      </div>
      )
  }

}

export default AboutSharedSettings;