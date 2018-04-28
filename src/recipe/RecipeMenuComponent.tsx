'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { UtilSvc } from '../utilities/UtilSvc';
import { CurrentRecipe } from './CurrentRecipeSvc';
import { User } from '../user/UserModel';
import { Recipe, RecipeData } from './Recipe'
import { RecipeSvc } from './RecipeSvc';
import RadioGroup from '../formTools/RadioGroupComponent';
import RecipeMenuItem from './RecipeMenuItemComponent';

@inject('user', 'utilSvc', 'recipeSvc', 'currentRecipe')
@observer
export class RecipeMenu extends React.Component <{

  menuOpen              ?: boolean,    // indicates this panel should open
  viewShared            ?: boolean,    // indicates user is viewing shared recipes
  constructMenuMessage  ?: Function,   // function to format menuMessage
  menuColumns               ?: number,     // indicates number of columns in the menu display
  user                  ?: User,
  utilSvc               ?: UtilSvc,
  recipeSvc             ?: RecipeSvc,
  currentRecipe         ?: CurrentRecipe
}, {} > {

  userInfo          = this.props.user;
  utilSvc           = this.props.utilSvc;
  recipeSvc         = this.props.recipeSvc;
  currentRecipe     = this.props.currentRecipe;

  @observable sharedFilter : string = 'Either' // select for which recipes are shown in search results
  recipeSelectFlags   : boolean[] = [];

  componentDidMount() {
    document.addEventListener('reverseRecipeMenu', this.toggleSortOrder);
    document.addEventListener('resetSharedFilter', this.resetSharedFilter);
  }
  componentWillUnmount() {
    document.removeEventListener('resetSharedFilter', this.resetSharedFilter);
    document.removeEventListener('reverseRecipeMenu', this.toggleSortOrder);
  }

  // emit a custom event with the given name and detail data
  emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  menuRecipeList = () : Recipe[] => {
    return this.currentRecipe.recipeList || [];
  }
  
  // indicate if the shared status choices should be shown
  allowStatusChoice = () => {
    return !this.props.viewShared;
  }
  
  // delete the selected recipe
  deleteMenuItem = (index : number) => {
    var r : RecipeData = this.menuRecipeList()[index].data;

    this.utilSvc.getConfirmation('RecipeDelete', 'Delete Recipe', 'delete_forever', r.title, 'Delete')
    .then((deleteIt) => {
      this.utilSvc.displayWorkingMessage(true, 'Deleting Recipe');
      this.recipeSvc.deleteRecipe(r._id)
      .then((success) => {
        this.menuRecipeList().splice(index, 1);    // remove item from Recipe array
        this.emit('updateMenuTabLabel');
        if (this.menuRecipeList().length === 0) {
          this.emit('selectSearchTab'); // menu now empty
        } else {
          this.forceUpdate();   // may not need this
        }
        this.utilSvc.setUserMessage('recipeDeleted');
        this.utilSvc.displayWorkingMessage(false);
      })
      .catch((failure) => {
        this.utilSvc.setUserMessage('errorDeletingRecipe');
        this.utilSvc.displayWorkingMessage(false);
      });
    })
    .catch((dontDelete) => {}
    );
  }

  // return if the menu has more than one choice
  multipleChoices() : boolean {
    return (this.currentRecipe.recipeList && this.currentRecipe.recipeList.length > 1);
  }

  // reverse the sort order of the recipe list array
  toggleSortOrder = () => {
    this.currentRecipe.recipeList.reverse();
  }

  setSelectedRecipe = (index : number) => {
    this.currentRecipe.selectedIndex = index;
    this.currentRecipe.recipe = this.menuRecipeList()[index];
    this.recipeSvc.readExtraImages(this.currentRecipe.recipe.data)
    .then((data : RecipeData) => {
      if (data) {     // images actually read?
        this.currentRecipe.recipe.data.extraImages = data.extraImages.map(Recipe.imageToAscii);
        this.emit('extraImagesReady');
      }
    })
    .catch((errorReadingExtraImages) => {
      this.utilSvc.displayThisUserMessage('errorReadingExtraImages');
    })
    this.viewSelectedRecipe();
  }

  viewSelectedRecipe = () => {
    setTimeout( () => {  // wait for currentRecipe.recipe to be valid
      this.emit('newRecipeSelection');
      setTimeout( () => { // wait for first message to take effect
          this.emit('selectViewTab');
      }, 100)
    }, 100)
  }

  // return the number of currenetly selected recipes
  selectedRecipeCount = () => {
    var count = 0;
    if (this.recipeSelectFlags) {
      this.recipeSelectFlags.forEach( (item) => { count += item ? 1 : 0; } );
    }
    return count;
  }

  // return if multiple selections have been made
  multipleSelections() : boolean {
    return this.selectedRecipeCount() > 1;
  }

  // return if recipe is selected or not
  recipeSelected(index : number) : boolean {
    return this.recipeSelectFlags[index];
  }

  // make the selected recipe shared
  makeRecipeShared = (recipe : Recipe, menuItem: RecipeMenuItem) => {
    var rd = recipe.getRecipeData();  // this step converts images back to binary 
    var oldHelpContext : string;
    var restrictedTo : string[] = this.userInfo.profile.defaultSharedUsers;

    oldHelpContext = this.utilSvc.getCurrentHelpContext();
    this.utilSvc.setCurrentHelpContext('MakeRecipeShared');
    this.utilSvc.openSharedRecipeSettings('SharedCreate', 'Add Shared Recipe', restrictedTo, 
            rd.title, 'Share')
    .then((shareThisRecipe) => {
      this.utilSvc.displayWorkingMessage(true, 'Creating Shared Recipe');
      this.utilSvc.setCurrentHelpContext(oldHelpContext);
      if (shareThisRecipe.create === true) {  // are we creating the shared copy?
        this.recipeSvc.addSharedRecipe(rd)
        .then((sharedVersion) => {
          if (shareThisRecipe.list !== undefined) {
            this.utilSvc.displayWorkingMessage(true, 'Setting User Restrictions');
            this.setEmailRestrictions(sharedVersion._id, shareThisRecipe.list)
            .then((success) => {})
            .catch((failure) => {})
          }
          recipe.data.sharedItem_id = sharedVersion._id;    // save database record id of shared copy 
          // update version
          this.recipeSvc.updateRecipe(rd._id, {'sharedItem_id': sharedVersion._id})
          .then((privateRecipeUpdated) => {
            this.utilSvc.setUserMessage('recipeShared');   
            this.utilSvc.displayWorkingMessage(false);
            menuItem.forceUpdate();
          })
          .catch((failToUpdatePrivateRecipe) => {
            recipe.data.sharedItem_id = undefined;  
            this.utilSvc.setUserMessage('errorUpdatingPersonalRecipe');
            this.utilSvc.displayWorkingMessage(false);
          })   
        })
        .catch((failToAddSharedRecipe) => {
          this.utilSvc.setUserMessage(failToAddSharedRecipe);
          this.utilSvc.setUserMessage('errorSharingRecipe');
          this.utilSvc.displayWorkingMessage(false);
        })
      }
    })
    .catch((userHitCancel) => {
      this.utilSvc.setCurrentHelpContext(oldHelpContext);
    })
  }

  // remove the copy of the selected recipe or set authorized users
  sharedRecipeSettings = (r: Recipe, menuItem: RecipeMenuItem) => {
    var srId = r.data.sharedItem_id;
    var oldHelpContext : string;

    this.recipeSvc.getRecipe(srId)
    .then((sharedRecipe : RecipeData) => {
      oldHelpContext = this.utilSvc.getCurrentHelpContext();
      this.utilSvc.setCurrentHelpContext('ManageSharedSettings');
      this.utilSvc.openSharedRecipeSettings('SharedEdit', 'Shared Recipe Settings', sharedRecipe.restrictedTo, 
                      r.data.title, 'Save')
      .then((result) => {
        this.utilSvc.setCurrentHelpContext(oldHelpContext);
        if (result.delete === true) {  // are we deleting the copy?
          this.utilSvc.displayWorkingMessage(true, 'Removing Shared Recipe');
          this.recipeSvc.deleteRecipe(srId)
          .then((deleted) => {
            r.data.sharedItem_id = undefined;
            this.recipeSvc.updateRecipe(r.data._id, {'sharedItem_id': null})
            .then((updated) => {
              this.utilSvc.setUserMessage('recipeMadePrivate');
              this.utilSvc.displayWorkingMessage(false);
              menuItem.forceUpdate();
            })
            .catch((notUpedated) => {
              this.utilSvc.setUserMessage('errorUpdatingPrivateRecipe');
              this.utilSvc.displayWorkingMessage(false);
            })
          })
          .catch((notDeleted) => {
            this.utilSvc.setUserMessage('errorDeletingSharedCopy');
            this.utilSvc.displayWorkingMessage(false);
          })
        } else { // if not deleting, update the authorized users list
          this.utilSvc.displayWorkingMessage(true, 'Updating User Restrictions');
          this.setEmailRestrictions(srId, result.list)
          .then((success) => {
            this.utilSvc.displayWorkingMessage(false);            
          })
          .catch((failure) => {
            this.utilSvc.displayWorkingMessage(false);            
          })
        }
      })
      .catch((userHitCancel) => {
        this.utilSvc.setCurrentHelpContext(oldHelpContext);
      })
    })
    .catch((failToReadSharedRecipe) => {
      this.utilSvc.displayThisUserMessage('errorReadingSharedCopy');
    })
  }

  // set the email restriction list for the given recipe
  setEmailRestrictions = (srId: string, list: string[]) => {

    return new Promise((resolve, reject) => {
      this.recipeSvc.updateRecipe(srId, {'restrictedTo': list ? list : null})
      .then((success : number) => {
        this.utilSvc.displayThisUserMessage('recipeRestrictionsUpdated');
        resolve(success);
      })
      .catch((failToSaveSharedRecipe) => {
        this.utilSvc.displayThisUserMessage('errorUpdatingRecipeRestrictions');
        reject(failToSaveSharedRecipe)
      })
    })
  }

  // test to see if the given recipe is already public
  recipeIsShared = (index : number) => {
    return this.menuRecipeList()[index].data.sharedItem_id;
  }

  // return whether the recipe at the given index matches the publicFilter
  applySharedFilter = (index : number) => {
    var is= this.recipeIsShared(index);
    return ((is && 'Either Shared'.includes( this.sharedFilter)) ||
            (!is && 'Either Private'.includes( this.sharedFilter)))
  }

  // update the value of the sharedFilter property then update the recipe count label
  setSharedFilter = (value: string) => {
    this.sharedFilter = value;
    this.updateRecipeCountLabel();
  }

  // turn off filtering of menu list based on shared status
  resetSharedFilter = () => {
    this.sharedFilter = 'Either';
  }

  // update the label on the menu tab
  updateRecipeCountLabel = () => {
    var i, count = 0;
    for ( i = this.menuRecipeList().length - 1; i >= 0; i-- ) {
      count += this.applySharedFilter(i) ? 1 : 0;
    } 
    this.props.constructMenuMessage(count);
  }

  // move to the next tab in the tab set
  nextTab = () => {
    this.utilSvc.emitEvent('nextTab');
  }

  // move to the next tab in the tab set
  prevTab = () => {
    this.utilSvc.emitEvent('prevTab');
  }

  // close the View Logs display
  closeView = () => {
    this.utilSvc.emitEvent('closeView');
  }

  render() {
    return (
      <div>
        <div className={'app-tab-container px-0 pt-1 app-bg-gwhite' + (this.props.menuOpen ? ' app-open' : '')}>

            {/* Menu for list of recipes for Search Recipes */}

          <div className="app-theme-inherit d-flex flex-column justify-content-start align-items-start app-frame pt-0">
            <div className="app-width-98 mx-auto">
              {this.allowStatusChoice() &&
              <RadioGroup 
                fTitle      = "List Recipes that I have:"
                fIcon       = "share"
                fIconColor  = "app-accent1 app-icon-xsm mr-3"
                fOnChange   = {this.setSharedFilter}
                fDividerAfter = {false}
                fExtraCSS   = "app-smaller-font pb-2"
                fValues     = "Shared|Private|Either" 
                fLabels     = "Shared|Not Shared|Either" 
                fDefault    = "Either"
                fName       = "sFilter"
              />}
            </div>
              <div className="app-frame pt-0">
                <div className="app-recipes-menu d-flex flex-wrap flex-row">
                  <div className="d-flex flex-column app-recipe-list-item px-1">
                    {this.currentRecipe.recipeList && this.currentRecipe.recipeList.map((r, i) =>
                      ((i % this.props.menuColumns === 0) && this.applySharedFilter(i)) &&
                        <RecipeMenuItem 
                          key={r.data._id}
                          item={r} 
                          index={i} 
                          viewShared={this.props.viewShared}
                          isSharedUser={this.userInfo.isSharedUser} 
                          selectFn={this.setSelectedRecipe}
                          deleteFn={this.deleteMenuItem} 
                          makeSharedFn={this.makeRecipeShared}
                          sharedSettingsFn={this.sharedRecipeSettings}
                        />
                      )
                    }
                  </div>

                  {this.props.menuColumns > 1 &&
                  <div className="d-flex flex-column app-recipe-list-item px-1">
                    {this.currentRecipe.recipeList && this.currentRecipe.recipeList.map((r, i) =>
                      ((i % this.props.menuColumns === 1) && this.applySharedFilter(i)) &&
                        <RecipeMenuItem 
                          key={r.data._id}
                          item={r} 
                          index={i} 
                          viewShared={this.props.viewShared}
                          isSharedUser={this.userInfo.isSharedUser} 
                          selectFn={this.setSelectedRecipe}
                          deleteFn={this.deleteMenuItem} 
                          makeSharedFn={this.makeRecipeShared}
                          sharedSettingsFn={this.sharedRecipeSettings}
                        />
                      )
                    }
                  </div>}

                  {this.props.menuColumns > 2 &&
                  <div className="d-flex flex-column app-recipe-list-item px-1">
                    {this.currentRecipe.recipeList && this.currentRecipe.recipeList.map((r, i) =>
                      ((i % this.props.menuColumns === 2) && this.applySharedFilter(i)) &&
                        <RecipeMenuItem 
                          key={r.data._id}
                          item={r} 
                          index={i} 
                          viewShared={this.props.viewShared}
                          isSharedUser={this.userInfo.isSharedUser} 
                          selectFn={this.setSelectedRecipe}
                          deleteFn={this.deleteMenuItem} 
                          makeSharedFn={this.makeRecipeShared}
                          sharedSettingsFn={this.sharedRecipeSettings}
                        />
                      )
                    }
                  </div>}                    
                </div>
              </div>
          </div> 
        </div>
        
      </div>
    )
  }
}