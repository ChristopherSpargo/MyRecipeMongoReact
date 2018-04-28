'use strict';
import * as React from 'react';
import AboutTextIcon from './AboutTextIcon';
import AboutHeading from './AboutHeadingComponent';

// Help component for RECIPE MENU

class AboutRecipeMenu extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>Recipes</b> tab displays a menu of all the recipes meeting the parameters you
        specified in the <b>Search</b> tab.<br/>
        The fields and buttons are:

        <AboutHeading fIcon="share" fText="List Recipes that I have:" fIconColor="app-accent1"/>
        &nbsp;&nbsp;When displaying the results of a search of your <b>Personal</b> recipes collection,
        the top of the recipes list will contain a field that allows you to filter the results based
        on the shared status of those recipes.<br/>
        &nbsp;&nbsp;Select <b>Shared</b> to have the menu show only recipes that you have shared.<br/>
        &nbsp;&nbsp;Select <b>Not Shared</b> to have the menu show only recipes that you have not shared.<br/>
        &nbsp;&nbsp;Select <b>Either</b> to have the menu show all your recipes.

        <AboutHeading fIcon="share" fText="Share this Recipe" fIconColor="app-accent1"/>
        &nbsp;&nbsp;If present, this button displays at the bottom of a menu item and indicates that you 
        have not shared this recipe.<br/>
        &nbsp;&nbsp;Click this button to access the <b>Add Shared Recipe</b> form.

        <AboutHeading fIcon="settings" fText="Manage Shared Settings" fIconColor="app-secondary"/>
        &nbsp;&nbsp;If present, this button displays at the bottom of a menu item and indicates that you 
        have shared this recipe.<br/>
        &nbsp;&nbsp;Click this button to access the <b>Shared Recipe Settings</b> form.

        <AboutHeading fIcon="close" fText="Delete Recipe" fIconColor="app-warn app-mb--4"/>
        &nbsp;&nbsp;If present, this button displays at the bottom of each menu item
        and allows you to delete the recipe. 
        Clicking this button will display a confirmation prompt to verify the delete request.<br/> 
        &nbsp;&nbsp;Click
        <AboutTextIcon 
          fLabel="Cancel" 
          fSize="S" 
          fColor="app-white" 
          fLabelCSS="app-white" 
          fExtraCSS="app-bg-primary" 
          fBtn={true}
        />or
        <AboutTextIcon 
          fLabel="Delete" 
          fSize="S" 
          fColor="app-white" 
          fLabelCSS="app-white" 
          fExtraCSS="app-bg-primary" 
          fBtn={true}
        />
        as appropriate.<br/><br/>

        <AboutHeading fIcon="check" fText="Make a Selectioin" fIconColor="app-green" fDivider={true}/>
        &nbsp;&nbsp;To select a recipe, click on the menu item. 
        This will display that recipe in the <b>View</b> tab.<br/>
        &nbsp;&nbsp;For Personal Recipes, this will also populate
        the <b>EDIT</b> tab with the information for this recipe so you can make changes if necessary.
        
        <AboutHeading fIcon="warning" fText="Tips and Warnings" fIconColor="app-checkbox" fDivider={true}/>
        &nbsp;&nbsp;Once a recipe is removed it cannot be retrieved. Also, deleting a recipe that has been shared
        <b>does not</b> delete the Shared copy.<br/>  
        &nbsp;&nbsp;If you want to delete the Shared copy of a recipe you must do so first using ths
        Shared Recipe Settings form accessed via the
        <AboutTextIcon 
          fIcon="settings" 
          fSize="S" 
          fColor="app-secondary"
        /> button.
      </div>
      )
  }

}

export default AboutRecipeMenu;