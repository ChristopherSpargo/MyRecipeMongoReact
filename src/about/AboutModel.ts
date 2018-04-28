'use strict';
import { observable } from 'mobx';

export class AboutModel { 
  @observable helpContext      = 'UsingMyRecipeMongo';   // current context for help information
  @observable open = false;                  // help panel is open if true

  // set the current help context id
  setHelpContext = (value: string) => {
    this.helpContext = value;
  }

  // toggle the about panel
  toggle = () => {
    this.open ? this.closeAbout() : this.openAbout();
  }

  // open the about panel
  openAbout = () => {
    // turn off scrolling on the body while the about panel is open so it can scroll but not the body
    document.body.style.overflowY = 'hidden';
    ( document.getElementById('about-text') as Element ).scrollTo(0, 0); // doesn't work if HTML has overflow-?: hidden
    this.open = true;
  }

  // close the about panel
  closeAbout = () => {
    document.body.style.overflowY = '';  // enable body scrolling
    this.open = false;
  }
}
