'use strict';
import * as React from 'react';
import AboutHeading from './AboutHeadingComponent';


// Help component for DELETE ACCOUNT

class AboutAccountDelete extends React.Component {

  render() {
    return (
      <div>
      &nbsp;&nbsp;The <b>Delete Account</b> function allows you to delete your account.<br/>
      The fields and buttons are:
  
      <AboutHeading fIcon="mail_outline" fText="Email Address" fIconColor="app-active-input-icon-color"/>
      &nbsp;&nbsp;This is the email that is associated with your account.  
      The value is filled in by the program.
  
      <AboutHeading fIcon="lock_outline" fText="Password" fIconColor="app-active-input-icon-color"/>
      &nbsp;&nbsp;Enter the password associated with this account.
  
      <AboutHeading fButton="Delete"/>
      &nbsp;&nbsp;Press the Delete button to submit your delete request.  You will immediately be prompted for
      confirmation of this action.  Press <b>Delete Account</b> to continue. If the delete is successful, 
      you will receive a brief notification and the user icon at the top of the page
      will become an outline.
    </div>
      )
  }

}

export default AboutAccountDelete;