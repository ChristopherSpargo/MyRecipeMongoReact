'use strict';
import * as React from 'react';
import AboutHeading from './AboutHeadingComponent';


// Help component for CHANGE PASSWORD

class AboutChangepassword extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>Change Password</b> form allows you to change the password associated your account.<br/>
        The fields and buttons are:

        <AboutHeading fIcon="mail_outline" fText="Email Address" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;This is the email that is currently associated with your account.
        The value is filled in by the program.

        <AboutHeading fIcon="lock_open" fText="Current Password" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Enter the password currently associated with this account.

        <AboutHeading fIcon="lock_outline" fText="New Password" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Enter the new password to be associated with this account.

        <AboutHeading fButton="Change"/>
        &nbsp;&nbsp;Press the Change button to submit your change request.  If successful, you will
        receive a brief notification.
      </div>
    )
  }

}

export default AboutChangepassword;