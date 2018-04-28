'use strict';
import * as React from 'react';
import AboutTextIcon from './AboutTextIcon';

// Help component for VIEW RECIPE

class AboutViewRecipe extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>View</b> tab displays all the information for the selected recipe.<br/><br/>
        &nbsp;&nbsp;If you are viewing a personal recipe and decide to click the <b>EDIT</b> tab to make changes,
        be sure to click
        <AboutTextIcon 
          fLabel="Save" 
          fIcon="check_circle_outline"
          fSize="L" 
          fColor="app-white" 
          fLabelCSS="app-white" 
          fExtraCSS="app-bg-primary" 
          fBtn={true}
        />
        on the edit tab before returning to the <b>VIEW</b> tab or your changes will not
        be reflected in the view.
      </div>
      )
  }

}

export default AboutViewRecipe;