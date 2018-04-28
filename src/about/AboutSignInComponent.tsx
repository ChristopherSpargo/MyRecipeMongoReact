'use strict';
import * as React from 'react';
import AboutHeading from './AboutHeadingComponent';


// Help component for SIGN IN

class AboutSignIn extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>Account Sign In</b> form allows you to sign in to your account.<br/>
        The fields and buttons are:

        <AboutHeading fIcon="mail_outline" fText="Email Address" fIconColor="app-accent1 app-mb--2"/>
          &nbsp;&nbsp;Enter the email address to be associated with this account.  The value must be
          in the correct format for an email address.

        <AboutHeading fIcon="lock_open" fText="Password" fIconColor="app-accent1"/>
          &nbsp;&nbsp;Enter the password to be associated with this account.  This value must be between 6
          and 16 characters.

        <AboutHeading fIcon="check" fText="Create New Account" fIconColor="app-about-checkbox-icon"/>
          &nbsp;&nbsp;Check this box if you wish to use the email and password to create a new account.
          When checked, this will reveal the password confirmation field.

        <AboutHeading fIcon="lock_outline" fText="Confirm Password" fIconColor="app-accent1"/>
          &nbsp;&nbsp;Re-enter the value given in the Password field.  These values must match exactly.

        <AboutHeading fIcon="check" fText="Remember Me" fIconColor="app-about-checkbox-icon"/>
          &nbsp;&nbsp;Check this box to have your Email and Password automatically filled in for
          you when you log in.

        <AboutHeading fIcon="check_circle_outline" fButton="Sign In"/>
          &nbsp;&nbsp;Press this button to submit your information for verification.  If successful, you will
          receive a brief notification and the user icon at the top of the page
          will become solid. Also, the user status on the <b>About Menu</b>
          will show your email address.

        <AboutHeading fIcon="sentiment_dissatisfied" fButton="Reset Password"/>
          &nbsp;&nbsp;If the password entered is incorrect, this button will appear. Pressing this button will give
          you the option to receive an email containing a temporary password that can be used to sign in.<br />
          &nbsp;&nbsp;To retry your sign in, re-enter your password and press the Sign In button.
      </div>
    )
  }

}

export default AboutSignIn;