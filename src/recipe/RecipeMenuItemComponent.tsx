'use strict'
import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { Recipe } from '../recipe/Recipe'


// Component to render a single item on the search results menu

@inject('user', 'utilSvc', 'currentRecipe')
@observer
class RecipeMenuItem extends React.Component <{
  item          ?: Recipe,      // Recipe data for this menu item
  index         ?: number,      // index of this recipe in currentRecipe.recipeList
  viewShared    ?: boolean,     // indicates user is viewing shared recipes
  isSharedUser  ?: boolean,     // true if current user is the SHARED_USER
  selectFn      ?: Function,    // function to call if recipe selected
  deleteFn      ?: Function,    // function to call if recipe to be deleted
  makeSharedFn  ?: Function,    // function to call to make recipe shared
  sharedSettingsFn ?: Function, // function to call to edit recipe's shared settings
  }, {} > {

  // indicate if share icon should be shown with menu item
  showShareIcon = () => {
    return (!this.props.isSharedUser && !this.props.viewShared && !this.props.item.data.sharedItem_id);
  }

  // indicate if share icon should be shown with menu item
  showSharedSettingsIcon = () => {
    return (!this.props.isSharedUser && !this.props.viewShared && this.props.item.data.sharedItem_id);
  }

  // indicate if share icon should be shown with menu item
  showDeleteIcon = () => {
    return (!this.props.viewShared);
  }

  // get an image to display for the menu item
  getMenuImage = () : string => {
    if (this.props.item.data.mainImage) { return this.props.item.data.mainImage.picURL; }
    return 'assets/images/cards2.jpg';
  }

  // return the Description text (first 200 chars) for the given Recipe
  getDescription = () : string => {
    if (this.props.item.data.description.length <= 200) {
      return this.props.item.data.description;
    }
    return (this.props.item.data.description.substr(0, 200) + '...');
  }

  // call the function to select this menu item
  selectRecipe = evt => {
    this.props.selectFn(this.props.index);
  }

  // call the function to delete this menu item
  deleteRecipe = evt => {
    this.props.deleteFn(this.props.index);
  }

  // call the function to make this recipe shared.
  // pass a reference to this component so it can be re-rendered
  // with the 'shared' status symbol
  makeShared = evt => {
    this.props.makeSharedFn(this.props.item, this);
  }

  // call the function to edit this recipe's shared settings.
  // pass a reference to this component so it can be re-rendered
  // with the 'not shared' status symbol (if necessary)
  sharedSettings = evt => {
    this.props.sharedSettingsFn(this.props.item, this);
  }

  render() {
    return(
      <div>
        <div key={this.props.item.data._id} className="d-flex flex-column app-recipes-menu-card mb-3">
          <img 
            src={this.getMenuImage()} 
            className="app-recipe-menu-image app-cursor-pointer"
            onClick={this.selectRecipe}
          />
          <div 
            className="d-flex flex-row align-items-center app-recipe-menu-item-header 
                      app-cursor-pointer pt-1 px-1" 
            onClick={this.selectRecipe}
          >
            <div className="app-recipe-menu-item-title">
              {this.props.item.data.title}
            </div>
          </div> 
          <div 
            className="d-flex flex-column flex-wrap align-items-start app-cursor-pointer"
            onClick={this.selectRecipe}
          >
            <div className="app-recipe-view-text px-1 py-1">
              {this.getDescription()}
            </div>
          </div>
          <div className="d-flex flex-row justify-content-between align-items-center px-1 py-1">
            {this.showShareIcon() &&
            <i 
              className="material-icons app-recipe-menu-item-control-icon app-accent1" 
              data-toggle="tooltip" 
              data-placement="top" 
              title="Share This Recipe" 
              data-delay="200"
              onClick={this.makeShared}
            >
              share
            </i>}
            {this.showSharedSettingsIcon()  &&
              <i 
                className="material-icons app-recipe-menu-item-control-icon app-secondary" 
                data-toggle="tooltip" 
                data-placement="top" 
                title="Edit Shared Settings" 
                data-delay="200"
                onClick={this.sharedSettings}
              >
                settings
              </i>}
            {this.showDeleteIcon() && 
            <i 
              className="material-icons app-recipe-menu-item-control-icon app-warn ml-auto" 
              data-toggle="tooltip" 
              data-placement="top" 
              title="Delete This Recipe" 
              data-delay="200"
              onClick={this.deleteRecipe}
            >
              close
            </i>}
          </div>
        </div>
        
      </div>
    )
  }
}

export default RecipeMenuItem
