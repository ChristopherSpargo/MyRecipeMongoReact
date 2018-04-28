'use strict';
import * as React from 'react';
import AboutTextIcon from './AboutTextIcon';
import AboutHeading from './AboutHeadingComponent';

// Help component for MY RECIPE MONGO

class AboutMyRecipeMongo extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;Here's a little 'How To' information to help you get started with <b>MyRecipeMongo</b>.

        <AboutHeading fIcon="local_dining" fText="What is MyRecipeMongo?"/>
          &nbsp;&nbsp;MyRecipeMongo is a website where you can organize and share recipes.<br/>&nbsp;&nbsp;Organize
          recipes by categories and keywords. Retreive recipies using categories and/or by keywords
          found in the title or ingredients.<br />&nbsp;&nbsp;Share recipes with everyone or just specific users.
          &nbsp;&nbsp;Recipes are stored in the cloud and can be accessed anytime from any device.

          <AboutHeading fIcon="folder_open" fText="Create an Account"/>
          &nbsp;&nbsp;The first thing you'll need to do to start using MyRecipeMongo is create an account.
          Since all data
          is stored in the cloud, we need to know which data is yours. MyRecipeMongo accounts are simple, just an
          email address and a password.<br/>
          &nbsp;&nbsp;To create an account click<AboutTextIcon fIcon="person_outline"/>on the main screen.<br />
          &nbsp;&nbsp;Then, on the Sign In form:<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;- Enter an email address and password<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;- Check the <b>Create new account</b> box<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;- Enter the same password again<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;- Finally, click
          <AboutTextIcon 
            fIcon="add_circle_outline" 
            fLabel="Create Account" 
            fSize="S" 
            fColor="app-white" 
            fLabelCSS="app-white" 
            fExtraCSS="app-bg-primary" 
            fBtn={true}
          />

          <AboutHeading fIcon="help_outline" fText="Getting Help"/>
          &nbsp;&nbsp;If at any time you are unsure of what to do just click the help icon and a help panel, 
          like this one, will be displayed that has information relevant to the current activity.

          <AboutHeading fIcon="more_vert" fText="The Full Menu"/>
          &nbsp;&nbsp;On <b>smaller screens</b>, the full command menu is available by pressing the 
          <AboutTextIcon fIcon="more_vert"/>icon at the far right of the MyRecipeMongo
          title bar.  The title bar also contains a few quick access icons for the most commonly used features.<br/>
          &nbsp;&nbsp;On <b>larger screens</b>, the full menu is displayed in the title bar with dropdowns
          for the commands.

          <AboutHeading fIcon="edit" fText="Saving a Recipe"/>
          &nbsp;&nbsp;To add a recipe click<AboutTextIcon fSize="S" fIcon="edit"/>on the main 
          screen (or navigate to <b>Recipes>Add a Recipe</b> on the main menu).<br/>
          &nbsp;&nbsp;Every recipe starts out with the <b>NEW</b> (Add Recipe) tab of the Recipe Access Area.  This
          is where all of the information for the recipe is entered.<br/>
          &nbsp;&nbsp;This information includes:<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<b>Title</b><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<b>Description</b><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<b>Categories</b><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<b>Ingredients</b><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<b>Instructions</b><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<b>Recipe Notes</b><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<b>Pictures</b><br/>
          &nbsp;&nbsp;Choices for <b>Categories</b>  
          are maintained by you in a separate list using the <b>Categories</b> function.  
          Categories has its own help panel.

          <AboutHeading fIcon="search" fText="Viewing Recipes"/>
          &nbsp;&nbsp;To find and view recipes, click the
          <AboutTextIcon fIcon="search" fSize="S"/>icon in the 
          main title bar (or navigate to <b>Recipes>Search My Recipes</b> on the main menu).
          This will open the Recipe Access Area with the <b>SEARCH</b> tab active.<br/>
          &nbsp;&nbsp;Fill in any search criteria and click
          <AboutTextIcon 
            fIcon="check_circle_outline" 
            fLabel="Search" 
            fSize="S" 
            fColor="app-white" 
            fLabelCSS="app-white" 
            fExtraCSS="app-bg-primary" 
            fBtn={true}
          />
          . If matching recipes are found, 
          a menu of those recipes will be displayed on the <b>RECIPES</b> tab. 
          Clicking on the menu item will display the full recipe in the <b>VIEW</b> tab.<br/><br/>
          &nbsp;&nbsp;To access a different tab of the Recipe Access Area, click its name at the top of the display.
          <br/><br/>
      </div>    
    )
  }
}

export default AboutMyRecipeMongo;
