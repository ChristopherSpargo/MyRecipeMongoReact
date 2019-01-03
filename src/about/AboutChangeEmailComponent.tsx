'use strict';
import * as React from 'react';
import AboutHeading from './AboutHeadingComponent';


// Help component for CHANGE EMAIL

class AboutChangeEmail extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>Change Email</b> function allows you to change the email associated your account.<br/>
        The fields and buttons are:

        <AboutHeading fIcon="mail_outline" fText="Current Email Address" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;This is the email address that is currently associated with your account.
        The value is filled in by the program.

        <AboutHeading fIcon="lock_open" fText="Password" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Enter the password that is associated with this account.

        <AboutHeading fIcon="mail_outline" fText="New Email Address" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Enter the new email address to be associated with this account.

        <AboutHeading fButton="Change"/>
        &nbsp;&nbsp;Press the Change button to submit your change request.  If successful, you will
        receive a brief notification and the user status in the <b>About Menu</b> will reflect
        the new email address.
      </div>
      )
  }

}

export default AboutChangeEmail;