'use strict';
import * as React from 'react';
import AboutHeading from './AboutHeadingComponent';

// Help component for MAKE RECIPE SHARED

class AboutMakeShared extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>Add Shared Recipe</b> form allows you share a recipe with other users.<br/>
        The fields and buttons are:
        
        <AboutHeading fIcon="mail_outline" fText="Authorized Users" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;This is an optional list that you can create to control who sees the
        shared version of this recipe. The list
        contains email addresses associated with the accounts of other <i><b>MyRecipeMongo</b></i> users that you
        want to share this recipe with. Leave this list empty to share with all users.<br />
        &nbsp;&nbsp;From the drop-down list, select an email address to change/remove or select
        <b>New Authorized User</b> to add a new email address to the list.

        <AboutHeading fButton="Cancel"/>
        &nbsp;&nbsp;This button cancels sharing the recipe.

        <AboutHeading fButton="Share"/>
        &nbsp;&nbsp;This makes the recipe shared and/or saves the Authorized Users List if any.

        <AboutHeading fIcon="warning" fText="Tips and Warnings" fIconColor="app-checkbox" fDivider={true}/>
        &nbsp;&nbsp;If you create an Authorized Users list, only those users and you will be able to see the 
        shared version of this recipe.
      </div>
      )
  }

}

export default AboutMakeShared;