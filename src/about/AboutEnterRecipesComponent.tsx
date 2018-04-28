'use strict';
import * as React from 'react';
import AboutTextIcon from './AboutTextIcon';
import AboutHeading from './AboutHeadingComponent';

// Help component for ENTER RECIPES

class AboutEnterRecipes extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;This tab of the Recipe Access Area is where information about a recipe is entered/edited.
        <br/>The fields and buttons are:

        <AboutHeading fIcon="title" fText="Title" fIconColor="app-active-input-icon-color app-mb--4"/>
        &nbsp;&nbsp;This is the title of the recipe.
        Each word of the title will be capitalized automatically. Words/phrases in the title can be searched for
        using the <b>Keywords</b> field of the <b>SEARCH</b> tab.

        <AboutHeading fIcon="description" fText="Description" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Enter a description of the dish created from this recipe. The description is displayed on
        a search results menu.

        <AboutHeading fIcon="assessment" fText="Categories" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Here you assign categories to the recipe. Categories are one of the main ways to
        organize recipes. You can create as many different categories as you like (see help when using the 
        <b>Categories</b> feature).<br/>
        &nbsp;&nbsp;Click the
        <AboutTextIcon fIcon="add_circle" fFab={true} fColor="app-primary"/>
        button to display a menu of categories. A <b>new category</b>
        can be added to the menu by entering it into the <i>new category</i> field at the top of the menu.
        <br/>&nbsp;&nbsp;Assign categories to
        the recipe by checking any you want to apply and click <b>Ok</b>.
        Selected categories will appear in the categories field as labeled chips.<br/>
        To remove a selection click the
        <AboutTextIcon fIcon="close" fSize="S" fColor="app-warn"/>
        on the chip with that category label.

        <AboutHeading fIcon="list" fText="Ingredients" fIconColor="app-active-input-icon-color app-mb--4"/>
        &nbsp;&nbsp;Enter the list of ingredients for the recipe. Type in each ingredient 
        followed by the enter key.  The program will automatically bullet each ingredient when you hit the
        enter key. Blank lines (lines that start with the enter key) will not be bulleted.
        <br/>&nbsp;&nbsp;You can enter subtitles like 'FOR THE SAUCE:' by ending the line with a semicolon. 
        The program will display subtitles in all caps. 
        
        <br/>&nbsp;Words/phrases in the ingredients can be searched for using the <b>Keywords</b> field of 
        the <b>SEARCH</b> tab.

        <AboutHeading fIcon="assignment" fText="Instructions" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Enter the list of instructions for the recipe. Type in each instruction
        followed by the enter key.  The program will automatically number each instruction when you hit the
        enter key. Blank lines (lines that start with the enter key) will not be numbered.
        <br/>&nbsp;&nbsp;You can enter subtitles like 'FOR THE SAUCE:' by ending the line with a semicolon. 
        The program will display subtitles in all caps. Step numbers start over after a subtitle.<br/>
        

        <AboutHeading fIcon="edit" fText="Recipe Notes" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Enter any special considerations regarding ingredients or 
        preparation of the recipe.

        <AboutHeading fIcon="photo" fText="Pictures" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;This field is for adding pictures to the recipe. The first picture in the pictures list will
        be the one displayed on a search results menu. You can change which picture is first by clicking the 
        <AboutTextIcon fIcon="arrow_upward" fSize="S" fColor="app-primary"/>
        icon above the picture.<br/>
        &nbsp;&nbsp;Click the
        <AboutTextIcon 
          fIcon="add_a_photo"
          fLabel="Add" 
          fSize="S" 
          fColor="app-active-input-icon-color" 
          fLabelCSS="app-link-active app-underlined"
        />
        button to browse for pictures and/or to use the camera on a mobile device.<br/>
        &nbsp;&nbsp;To remove a picture click the 
        <AboutTextIcon fIcon="close" fSize="S" fColor="app-warn"/>
        icon above the picture.<br/>


        <AboutHeading fIcon="check_circle_outline" fButton="Save"/>
        &nbsp;&nbsp;Press this button to save the recipe to the database and update the VIEW tab.

        <AboutHeading fIcon="highlight_off" fButton="Clear"/>
        &nbsp;&nbsp;Press this button to clear all recipe information for a <b>NEW</b> recipe and start over.

        <AboutHeading fIcon="highlight_off" fButton="Cancel"/>
        &nbsp;&nbsp;Press this button to cancel an <b>EDIT</b> of an existing recipe and return all the
        fields to their original values.

        <AboutHeading fIcon="warning" fText="Tips and Warnings" fIconColor="app-checkbox" fDivider={true}/>
        &nbsp;&nbsp;If you will be sharing this recipe, you might want to add your own personal category, <br/>
        like 'Jane A. Smith', to the recipe before sharing it. This will make it easy for users to find 
        recipes you have contributed.
      </div>
      )
  }

}

export default AboutEnterRecipes;