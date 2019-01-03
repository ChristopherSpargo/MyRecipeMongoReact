'use strict';
import * as React from 'react';
import AboutHeading from './AboutHeadingComponent';


// Help component for PROFILE UPDATE

class AboutProfileUpdate extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>Update Profile</b> function allows you to change the
        profile items associated with your account.<br/>The fields and buttons are:

        <AboutHeading 
          fIcon="mail_outline" 
          fText="Authorized Users for Shared Recipes" 
          fIconColor="app-active-input-icon-color"
        />
        &nbsp;&nbsp;If you have certain users that you always share recipies with and you don't want anyone
        else to see them, you can create that list of users here and have it applied automatically to recipes
        you share. You can edit/remove this list if necessary when you perform the Share function.
        If you don't set an authorzie users list on a recipe
        you share, all MyRecipeMongo users will be able to view that recipe.

        <AboutHeading fButton="Update"/>
        &nbsp;&nbsp;Press the Update button to save your authorized users list.  If successful, you will
        receive a brief notification.
      </div>
    )
  }

}

export default AboutProfileUpdate;