'use strict';
import * as React from 'react';
import AboutHeading from './AboutHeadingComponent';


// Help component for UPDATE CATEGORIES

class AboutCategories extends React.Component {

  render() {
    return (
      <div>
        &nbsp;&nbsp;The categories list contains the names of categories you can assign to recipes.
        <br/>The <b>Manage Categories</b> form allows you to add/remove/change entries in your categories list.<br/>
        The fields and buttons are:
        
        <AboutHeading fIcon="assessment" fText="Category Name" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;This is the name for the category.
        From the drop-down list, select a category to change/remove it or select <b>New Category Name</b> to add
        a new category name to the list.

        <AboutHeading fIcon="edit" fText="Existing Category Name" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;This icon will display next to the input field if you choose an exitsig category from the 
        list in the Category Name field. Edit or delete this category name.

        <AboutHeading fIcon="add_circle_outline" fText="New Category Name" fIconColor="app-active-input-icon-color"/>
        &nbsp;&nbsp;This icon will display next to the input field if you choose New Category Name from 
        the list in the Category Name field. Enter a name for the new category here.<br/>
        &nbsp;&nbsp;You can create as many category names as you like and it is usually best to create names
        that allow you to have a family structure to your categories. Broad categories like Appetizer, Entre, Dessert,
        etc. are a good starting point. Categories like Meat could be a category you always include with more
        specific categories like Chicken, Beef, Pork and Lamb. Remember, when you specify categories in a Search, 
        ALL categories specified must be present on the recipe for it to be a 'match'.  The more thought you put
        into the organization of your categories the easier it will be to quickly find just the recipes you want.<br/>
        &nbsp;&nbsp;Also, as an option, you can create a category that represents you like, 
        'Julie R. Jacobson', that you can 
        attach to recipes you share.  This way, other users can easily find recipes
        you have contributed by searching for 
        recipes that have that category.<br/>
        &nbsp;&nbsp;Finally, family names like 'Mom', 'Dad', 'Grandma', etc. are obviously poor choices for 
        recipes that will be shared.  Better to use their full name or just refrence them in a Recipe Note.

        <AboutHeading fIcon="check_circle_outline" fButton="Save"/>
        &nbsp;&nbsp;Press this button to submit your list update request.  If successful, you will
        receive a brief notification.

        <AboutHeading fIcon="remove_circle_outline" fButton="Remove"/>
        &nbsp;&nbsp;Press this button to remove the selected category from the list.

        <AboutHeading fIcon="highlight_off" fButton="Cancel"/>
        &nbsp;&nbsp;Press this button to return to name selection without changing the current selection.
      </div>
    )
  }

}

export default AboutCategories;