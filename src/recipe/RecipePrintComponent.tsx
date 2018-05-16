'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { UtilSvc } from '../utilities/UtilSvc';
import { User } from '../user/UserModel';
import { CurrentRecipe } from './CurrentRecipeSvc';
import { RecipePic, RecipeData } from './Recipe'
import { RecipeSvc } from './RecipeSvc';
import FormHeader from '../formTools/FormHeaderComponent';


    // COMPONENT for RECIPE VIEW feature
interface PicItem {
  URL: string;  // URL to use for the picture display
  note: string; // picture annotation
}


@inject('user', 'utilSvc', 'recipeSvc', 'currentRecipe', 'cardsImage')
@observer
class RecipePrint extends React.Component <{
  viewTabOpen           ?: boolean,    // indicates this panel should open
  user                  ?: User,
  utilSvc               ?: UtilSvc,
  recipeSvc             ?: RecipeSvc,
  currentRecipe         ?: CurrentRecipe,
  cardsImage            ?: any        // default image if no pictures
}, {} > {

  userInfo          = this.props.user;
  utilSvc           = this.props.utilSvc;
  recipeSvc         = this.props.recipeSvc;
  currentRecipe     = this.props.currentRecipe;

    _rId         : string;
    rTitle       : string = '';
    rDescription : string = '';
    rCategories  : number[] = []; 
    rIngredients : string[];
    rInstructions: string[];
    rNotes       : string[];
    rMainPic     : PicItem;
    rMorePics    : PicItem[] = [];
    rCreatedOn   : string;

  @observable requestStatus  : { [key: string]: any } = {};
  @observable headerTitle    : string  = this.rTitle;
  @observable recipeReady    : boolean = false;
  @observable showPics       : boolean = false; // true if show full-size versions of all images at end of print
  @observable printActive    : boolean = false;
  @observable printerMediaQuery : any;

  componentWillMount() {
    this.setMessageResponders();
  }

  componentWillUnmount() {
    this.deleteMessageResponders();
  }

  setMessageResponders() : void {
    if (window.matchMedia) {
      this.printerMediaQuery = window.matchMedia('print');
      this.printerMediaQuery.addListener(this.mediaPrintListener);
    }
    document.addEventListener('extraImagesReady', this.setExtraImages);
    document.addEventListener('newViewReady', this.newViewReady);
    document.addEventListener('newRecipeSelection', this.newViewReady);
    document.addEventListener('noRecipeSelection', this.noRecipeSelection);
    document.addEventListener('printRecipe', this.printRecipe);
    window.addEventListener('afterprint', this.printDone);
    window.addEventListener('beforeprint', this.showPrintView);
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
    if (window.matchMedia) {
      this.printerMediaQuery.removeListener(this.mediaPrintListener);
    }
    document.removeEventListener('extraImagesReady', this.setExtraImages);
    document.removeEventListener('newViewReady', this.newViewReady);
    document.removeEventListener('newRecipeSelection', this.newViewReady);
    document.removeEventListener('noRecipeSelection', this.noRecipeSelection);
    document.removeEventListener('printRecipe', this.printRecipe);
    window.removeEventListener('afterprint', this.printDone);
    window.removeEventListener('beforeprint', this.showPrintView);
  }

  // emit a custom event with the given name and detail data
  emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  mediaPrintListener = (val) => {
    if (val.matches) {
        this.showPrintView();
    } else {
        this.printDone();
    }
  }

  // print the current recipe
  printRecipe = () => {
    this.showPrintView();
    setTimeout(() => {      // wait for display to change to print view
      // @ts-ignore
      window.print();
      setTimeout(() => {  // this if for a weird problem in IOS 11
        this.printDone();
      }, 5000);
    }, 500)
  }

  // turn on display of this module's template and turn off VIEW module's template
  showPrintView = () => {
    this.printActive = true;
    this.emit('printBegin')
  }

  // turn off display of this module's template and turn on VIEW module's template
  printDone = () => {
    this.printActive = false;
    this.emit('printDone')
 }

  // event listener for 'newRecipeSelection' event
  // populate the view with data from the current recipe
  newViewReady = () => {
    this.currentRecipe.viewScrollPosition = 0;
    this.setItemFields(this.currentRecipe.recipe.data);
    this.headerTitle = this.rTitle;
    this.recipeReady = true;
  }

  // eventt listener for 'noRecipeSelection' event
  noRecipeSelection = () => {
    this.recipeReady = false;
    this.currentRecipe.viewScrollPosition = 0;
  }


  // set the form fields to reflect the selected recipe or empty
  setItemFields = (item : RecipeData)  => {
    this._rId            = item._id;
    this.rTitle          = item.title;
    this.rDescription    = item.description;
    this.rCategories     = [];
    item.categories.forEach((c) => {
      this.rCategories.push(c); });
    this.rIngredients    = item.ingredients ? item.ingredients.split('\n') : undefined;
    this.rInstructions   = item.instructions ? item.instructions.split('\n') : undefined;
    this.rNotes          = item.recipeNotes ? item.recipeNotes.split('\n') : undefined;
    this.rMainPic        = undefined;
    this.rMorePics = [];
    if (item.mainImage) {
      this.rMainPic      = {'URL': item.mainImage.picURL, 'note': item.mainImage.note};
      if (item.extraImages.length) {
        this.setMorePics(item.extraImages);
      }
    }
    this.rCreatedOn           = item.createdOn;
  }

  // use newly acquired extraImages to set the rMorePics array
  setExtraImages = () => {
    this.setMorePics(this.currentRecipe.recipe.data.extraImages);
  }

  // set the rMorePics array for this view
  setMorePics = (exImages : RecipePic[]) => {
    this.rMorePics = [];
    for (let i = 0; i < exImages.length; i++) {
      this.rMorePics.push({'URL': exImages[i].picURL, 'note': exImages[i].note});
    }
  }

  // return a boolean to denote the presence of the selected item
  dataPresent = (item: string) : boolean => {
    switch (item) {
      case 'Ingredients':
        return (this.rIngredients !== undefined && this.rIngredients.length !== 0);
      case 'Instructions':
        return (this.rInstructions !== undefined && this.rInstructions.length !== 0);
      case 'RecipeNotes':
        return (this.rNotes !== undefined && this.rNotes.length !== 0);
      case 'AnyPics':
        return (this.rMainPic !== undefined);
      case 'MorePics':
        return (this.rMorePics !== undefined && this.rMorePics.length !== 0);
      default:
        return false;
    }
  }

  // get an image to display for the menu item
  getRecipeImage = () : string => {
    if (this.rMainPic) { return this.rMainPic.URL; }
    return this.props.cardsImage;
  }

  // get a note to display for the main image
  getRecipeNote = () : string => {
    if (this.rMainPic) { return this.rMainPic.note; }
    return 'Main Image';
  }

  // return the list of category items from the CurrentRecipe service 
  categoryListItems = () => {
    return this.currentRecipe.categoryListItems();
  }

  // return the Category name for the given id
  getCategoryName = (id : number) : string => {
    return this.currentRecipe.categoryListName(id);
  }

  render() {
    return(
      <div>
        {this.printActive &&
        <div 
          className={'d-flex flex-column  app-print-container app-fade-in' +
                (this.printActive ? ' app-open' : '')}
        >
          <FormHeader  
            headerType        = "simple" 
            headerIcon        = "local_dining"
            headerTitle       = {this.headerTitle} 
            headerTheme       = "app-recipes-header-theme"
          />
          <div 
            className={'app-tab-container px-0 pt-1 app-bg-gwhite' + 
                          (this.printActive ? ' app-open' : '')}
          >
            <div className="app-frame d-flex flex-column align-items-center pt-0">
              <div className="app-recipes-print-card mb-2">
                <div className="d-flex flex-row">
                  <div className="d-flex flex-column flex-wrap align-items-start">
                    {/* Description */}
                    {this.recipeReady &&
                    <div className="app-recipe-view-text px-1 py-1">
                      <img src={this.getRecipeImage()} className="app-recipe-view-main-image"/>
                      {this.rDescription}
                    </div>}
                  </div>
                </div> 
                <div className="app-recipe-menu-item-title px-1 pt-2">
                  {this.recipeReady ? this.rTitle : 'No Recipe to Display'}
                </div>
                {this.recipeReady && 
                <div className="px-1 py-1">
                  {/* Categories */}
                  <div className="d-flex flex-column align-items-start pt-1">
                    <div className="app-recipe-view-text app-recipe-view-categories pr-2">Categories:</div>
                    <div className="d-flex flex-row flex-wrap">
                      {this.rCategories.map((c) =>
                        <div 
                          key={c} 
                          className="btn d-flex flex-row justify-content-center align-items-center 
                                      app-recipe-category-button app-category-button-theme mb-1"
                        >
                          {this.getCategoryName(c)}
                        </div>)
                      }
                    </div>
                  </div>
                  {/* Ingredients */}
                  {this.dataPresent('Ingredients') &&
                  <div>
                    <div className="app-firebrick app-divider-50"/>
                    <div className="app-recipe-view-text app-recipe-view-ingredients-header">
                      Ingredients:
                    </div>
                    {this.rIngredients.map((n, i) =>
                      <div key={i} className="app-recipe-view-text app-recipe-view-ingredients pl-3">
                        {n}
                        {(n === '') && <br/>}
                      </div>)
                    }
                  </div>}
                  {/* Instructions */}
                  {this.dataPresent('Instructions') &&
                  <div>
                    <div className="app-firebrick app-divider-50"/>
                    <div className="app-recipe-view-text app-recipe-view-ingredients-header">
                      Instructions:
                    </div>
                    {this.rInstructions.map((n, i) =>
                      <div key={i} className="app-recipe-view-text app-recipe-view-ingredients pl-3">
                        {n}
                        {(n === '') && <br/>}
                      </div>)
                    }
                  </div>}
                    {/* Recipe Notes */}
                  {this.dataPresent('RecipeNotes') &&
                  <div>
                    <div className="app-recipe-view-text app-recipe-view-notes-header">
                      Notes:
                    </div>
                    {this.rNotes.map((n, i) =>
                      <div key={i} className="app-recipe-view-text app-recipe-view-recipe-notes pl-3">
                        {n}
                        {(n === '') && <br/>}
                      </div>)
                    }
                  </div>}
                </div>}
                {/* Additional Pictures */}
                {(this.showPics && this.dataPresent('AnyPics')) &&
                <div>
                  <div className="app-firebrick app-divider-50"/>
                  <div className="app-recipe-view-text app-recipe-view-pics-header pl-1">
                    Recipe Images:
                  </div>
                  <div className="d-flex flex-column app-bg-gwhite">
                    <div className="mt-3 app-whiteframe-2dp">
                      <img src={this.getRecipeImage()} className="app-recipe-view-extra-image"/>
                      <div className="app-recipe-view-text app-recipe-view-picture-note pb-1 px-1">
                        {this.getRecipeNote()}
                      </div>
                    </div> 
                    {this.dataPresent('MorePics') &&
                    <div>
                      {this.rMorePics.map((p, i) =>
                        <div key={i} className="mt-3 app-whiteframe-2dp">
                          <img src={p.URL} className="app-recipe-view-extra-image"/>
                          <div className="app-recipe-view-text app-recipe-view-picture-note pb-1 px-1">
                            {p.note}
                          </div>
                        </div>)}
                    </div>}
                  </div>
                </div>}
              </div>
            </div>
          </div>
        </div>}
      </div>
    )
  }
}

export default RecipePrint;