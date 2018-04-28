'use strict';
import * as React from 'react';
import AboutTextIcon from './AboutTextIcon';
import AboutHeading from './AboutHeadingComponent';

// Help component for RECIPE SEARCH

class AboutRecipeSearch extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The <b>Recipe Search</b> tab allows you to specify parameters to locate recipes you
        want to view or share.<br/>
        The fields and buttons are:

        <AboutHeading fIcon="folder" fText="Search In" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Here you specify which collection of recipes you want to search.<br/> <b>My Recipes</b> 
         are just the recipes you have added yourself.<br/>
        <b>Shared Recipes</b> are recipes that you have shared or others have shared that you have access to.<br/>
        &nbsp;&nbsp;These collections must be searched separately. The internal values of the Categories in
        the shared collection are different from those in any personal collection.

        <AboutHeading fIcon="assessment" fText="Categories" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Here you specify any categories that apply to recipes of interest.  
        A recipe must have <b>ALL</b> the specified categories to be selected.<br/>
        &nbsp;&nbsp;Click the
        <AboutTextIcon 
          fIcon="add_circle" 
          fFab={true} 
          fColor="app-primary"
        />
        button to display a menu of categories.  Add categories to
        the search by checking any you want to apply and click <b>Ok</b>.
        Selected categories will appear in the categories field as labeled chips.<br/>
        &nbsp;&nbsp;To remove a selection click the
        <AboutTextIcon 
          fIcon="close" 
          fSize="S" 
          fColor="app-warn"
        />
        on the chip with that category label.

        <AboutHeading fIcon="vpn_key" fText="Keywords" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;Here you can specify a list of words or phrases to search for in the Title and Ingredients
        fields of the recipes. Enter words or phrases separated by commas.<br/> 
        &nbsp;&nbsp;For example:<br/>
        <i>coco,cinnamon,baking powder,-Crisco</i><br/>
        will select recipes whose Title or Ingredients fields contain:<br/>
        &nbsp;&nbsp;at least one of the <b>words</b> <i>'coco'</i> or <i>'cinnamon'</i><br/>
        AND<br/>
        &nbsp;&nbsp;the <b>phrase</b> <i>'baking powder'</i><br/>
        AND <b>NOT</b><br/>
        &nbsp;&nbsp;the word <i>'Crisco'</i>.<br/>
        So, if a keyword list includes a phrase, only recipies with that phrase can match. And, if the list
        contains a negated (-) word, only recipes without that word can match. Also, a keyword list cannot
        contain only negated words.

        <AboutHeading fIcon="check_circle_outline" fButton="Search"/>
        &nbsp;&nbsp;Press this button to submit your search request. 
        If successful, the <b>Recipes</b> tab will be displayed.
        If no matches meeting the parameters are found, a message to that effect will be given and the 
        <b>Recipe Search</b> form will remain displayed.
        
        <AboutHeading fIcon="warning" fText="Tips and Warnings" fIconColor="app-checkbox" fDivider={true}/>
        &nbsp;&nbsp;If a search continues to find no matches, make sure the parameters you are specifying 
        are not too restrictive. <b>ALL</b> restrictions you specify must be satisfied for a recipe to be selected.
        The more information you enter into this form, the more restricted your search will become.<br/>
      
        &nbsp;&nbsp;For example,
        if you are looking for a recipe for Saffron Chicken, specifying the Category 'Chicken' and the 
        keyword 'saffron' should do the trick.
      </div>
      )
  }

}

export default AboutRecipeSearch;