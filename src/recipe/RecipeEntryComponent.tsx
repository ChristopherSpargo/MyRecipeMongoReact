'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { UtilSvc } from '../utilities/UtilSvc';
import { CurrentRecipe } from '../recipe/CurrentRecipeSvc';
import { StringMsgList } from '../formTools/StringMsgList';
import { CatListObj } from '../formTools/CatListObj'
import { User } from '../user/UserModel';
import { Recipe, RecipeData, RecipePic } from '../recipe/Recipe'
import { RecipeSvc, RecipeFilterData, CATEGORY_TABLE_NAME } from '../recipe/RecipeSvc'
import IconInput from '../formTools/IconInputComponent';
import { StatusMessages, StatusMessage } from '../formTools/StatusMessagesComponent';
import FabControl from '../formTools/FabControlComponent';
import { FormStatusMessages } from '../formTools/FormStatusMessagesComponent';
import { FieldErrorMsg, FieldErrorMsgs } from '../formTools/FieldErrorsComponent'
import CheckboxMenu from '../formTools/CheckboxMenuComponent';
import IconTextarea from '../formTools/IconTextareaComponent';
import FormSection from '../formTools/FormSectionComponent';

import { APP_DATA_VERSION } from '../app.constants';
import ImageCompressor from '@xkeshi/image-compressor/dist/image-compressor.esm.js'

export interface PicObj {
  file: File;           // File object for new pictures
  picURL: string;       // URL to use for the picture display
  picSize: number;
  noteText: string;     // picture annotation
  contentType: string;  // MIME type for image
}

// COMPONENT for RECIPE ENTRY function
// The template for this component is the Recipe Data Entry form and is presented on the EDIT tab
// of the Recipe Access Tabset.
// This component shares data with other Recipe Access Tabset components via the CurrentRecipe service.
// This component listens for the following messages:
//  noRecipeSelection:      This indicates that no existing recipe is selected and the form should
//                          be initialized for NEW recipe input.
//  newRecipeSelection:     This indicates that there is data for an existing recipe in the CurrentRecipe
//                          service and the form should be populated with it's data in preparation for EDIT.
//  extraImagesReady:       This indicates that any extra images associated with the current recipe selection
//                          have been read and can be populated into the form. To save time and data transfer,
//                          a recipe's extra images are only read when the user first selects the recipe
//                          from the RECIPES menu.
// This component emits the following messages:
//  updateMenuTabLabel:     This requests that the MENU tab label which displays the number of items on the
//                          RECIPES menu be updated based on information in the CurrentRecipe service.
//  newViewReady:           This requests that the information displayed on the VIEW tab be refreshed using
//                          the data in the CurrentRecipe service.
// The 3rd party module 'ImageCompressor' is used to compress recipe images

@inject('user', 'utilSvc', 'recipeSvc', 'currentRecipe')
@observer
export class RecipeEntry extends React.Component <{
  editTabOpen   ?: boolean, 
  user          ?: User, 
  utilSvc       ?: UtilSvc, 
  recipeSvc     ?: RecipeSvc,
  currentRecipe ?: CurrentRecipe
  }, {} > {
    
   
  @observable checkAll            : boolean   = false; // true if form fields to be checked for errors (touched or not)
  @observable newItemName         : string    = '';
  @observable deleteItem          : boolean   = false;
  todaysDate          : string    = this.props.utilSvc.formatDate();
  thisYear            : string    = this.props.utilSvc.formatDateJustYear();
    _rId        : string;
    @observable rTitle      : string = '';
    @observable rDescription: string = '';
    @observable rCategories = new CatListObj();
    @observable rIngredients : string = '';
    @observable rInstructions: string = '';
    @observable rNotes       : string = '';
    @observable rPictures    : PicObj[] = [];
    @observable rRestrictedTo: string[] = [];
    rSharedItemId: string = '';
    rLastShareUpdate: number = undefined;
    rSubmittedBy : string = '';
    rCreatedOn   : string = this.todaysDate;

  @observable selectedPics        : File[] = [];       // list of files obtained from the file input element
  @observable requestStatus       = new StringMsgList; // object for messages displayed at bottom of the form
  @observable formOpen            : boolean   = false;
  @observable titleAndTagsOpen    : boolean   = false;  // show-hide toggle for Title and Categories section
  @observable specificsOpen       : boolean   = false;  // show-hide toggle for Ingredients and Instructions section
  @observable picturesOpen        : boolean   = false;  // show-hide toggle for Pictures form section
  @observable createNew           : boolean   = true;   // true if adding a recipe, false if editing an exitsing one
  @observable formTitle           : string    = 'Add a Recipe';  // title to display at top of template
  @observable fMsgs               : FieldErrorMsg[] = [];
  @observable errorStatus = new StringMsgList();
  @observable statusMsgs       : StatusMessage[] = [];         

  componentDidMount() {
    this.setMessageResponders();
    // make sure the user is logged in to enter recipes
    if (!this.props.user.authData) { return; }
    this.setItemFields();
    setTimeout( () => {
      this.formOpen = true;
    }, 300);
  }

  componentWillUnmount() {
    this.deleteMessageResponders();
  }

  // set listeners for interesting messages
  setMessageResponders() : void {
    document.addEventListener('extraImagesReady', this.setExtraImages);
    document.addEventListener('newRecipeSelection', this.newRecipeSelection);
    document.addEventListener('noRecipeSelection', this.noRecipeSelection);
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
    document.removeEventListener('extraImagesReady', this.setExtraImages);
    document.removeEventListener('newRecipeSelection', this.newRecipeSelection);
    document.removeEventListener('noRecipeSelection', this.noRecipeSelection);
  }

  // emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.props.utilSvc.emitEvent(name, data);
  }

  // handle the 'newRecipeSelection' message
  newRecipeSelection = () => {
    this.createNew = false;
    this.setItemFields(this.props.currentRecipe.recipe.data);
  }

  // handle the 'noRecipeSelection' message
  noRecipeSelection = () => {
    this.createNew = true;      // we'll be creating a new recipe if we come to this tab
    this.resetForm();       // initialize entry form for new
    this.props.currentRecipe.editScrollPosition = 0;  // set display to top
  }

  // prepare and send request to database service
  submitRequest(form : any) : void {
    var rData : RecipeData = {}; // RecipeData object to send to recipeSvc
    this.checkAll = true;                 // indicate form has been 'submitted'
    this.clearRequestStatus();
    if (this.checkForProblems(form)) {   // can't do anything yet, form still has errors
      this.requestStatus.addMsg('formHasErrors');
      return;
    }
    this.props.utilSvc.displayWorkingMessage(true, 'Saving Recipe'); // show 'working' indicator on screen
    // now fill in the object for the database
    if (this._rId) { rData._id = this._rId; }
    rData.userId = this.props.user.profile.id;
    rData.createdOn = this.rCreatedOn;
    rData.lastUpdate = new Date().getTime();
    rData.title = this.rTitle;
    if (this.rDescription !== '') { rData.description = this.rDescription; } // don't store empty strings
    rData.categories = this.rCategories.cats;
    if (this.rIngredients !== '') { rData.ingredients = this.rIngredients; }
    if (this.rInstructions !== '') { rData.instructions = this.rInstructions; }
    if (this.rNotes !== '') { rData.recipeNotes = this.rNotes; }
    rData.dataVersion = APP_DATA_VERSION;
    if (this.rSharedItemId !== '') { rData.sharedItem_id = this.rSharedItemId; }
    if (this.rSubmittedBy !== '') { rData.submittedBy = this.rSubmittedBy; }
    if (this.rRestrictedTo.length) {
      rData.restrictedTo = this.rRestrictedTo.slice();
    }
    if (this.rPictures.length) {    // convert images for storage
      rData.mainImage = this.convertToRecipePic(this.rPictures[0]);
      rData.numExtras = this.rPictures.length - 1;
      if (rData.numExtras) {
        rData.extraImages = [];
        for (let i = 0; i < rData.numExtras; i++) {
          rData.extraImages.push(this.convertToRecipePic(this.rPictures[i + 1]));
        }
      }
    }

    // send recipe to database
    this.props.recipeSvc.saveRecipe(rData)
    .then((storedData : RecipeData) => {
      // replace in-memory copy of this recipe
      this.props.currentRecipe.recipe = Recipe.build(storedData); 
      if (!this.createNew) {
        this.props.currentRecipe.recipeList[this.props.currentRecipe.selectedIndex] = this.props.currentRecipe.recipe;
      } else {
        this.props.currentRecipe.recipeList = [this.props.currentRecipe.recipe];
        this.props.currentRecipe.selectedIndex = 0;
      }
      this.props.utilSvc.setUserMessage('recipeSaved');
      this.props.utilSvc.displayWorkingMessage(false);
      this.resetForm(form);
      this.emit('updateMenuTabLabel');
      this.emit('newViewReady')     // let the view tab know
      this.props.utilSvc.scrollToTop();
      // check for need to update shared copy
      this.updateSharedCopy(storedData)
      .then(() => {})
      .catch(() => {})
    })
    .catch((error) => {
      this.resetForm(form);
      this.props.utilSvc.setUserMessage('errorSavingRecipe');
      this.props.utilSvc.displayWorkingMessage(false);
      this.props.utilSvc.scrollToTop();
    });            
  }

  // see if there is a shared copy of the recipe to update
  updateSharedCopy = (rData: RecipeData) : Promise<any> => {
    return new Promise((resolve, reject) => {
      if (rData.sharedItem_id) {
        this.props.utilSvc.getConfirmation('UpdateCopy', 'Update Shared Copy', 'settings',
        'A shared copy of this recipe exists. Would you like it updated now?', 'Update It', 'Not Now')
        .then((updateIt) => {
          this.props.utilSvc.displayWorkingMessage(true, 'Updating Shared Copy')
          // first, read 'restrictedTo' list from shared copy
          let query = {} as RecipeFilterData;
          query.recordId = rData.sharedItem_id;
          query.projection = {'restrictedTo': 1};
          this.props.recipeSvc.getRecipes(query)
          .then((results : RecipeData[]) => {
            // then transfer the 'restrictedTo' list to the updated version
            this.props.recipeSvc.addSharedRecipe(rData, results[0].restrictedTo)
            .then((success) => {
              this.props.utilSvc.setUserMessage('sharedCopyUpdated');
              this.props.utilSvc.displayWorkingMessage(false);
              resolve('updated');              
            })
            .catch((problem) => {
              this.props.utilSvc.setUserMessage(problem);
              this.props.utilSvc.setUserMessage('errorUpdatingSharedCopy');
              this.props.utilSvc.displayWorkingMessage(false);
              resolve(problem);
            })            
          })
        })
        .catch((notNow) => {
          resolve('notNow')
        })
      } else {
        resolve('notShared');
      }
    })
  }

  // check for data input problems before submitting
  checkForProblems = (form: any) : boolean => {
    this.rCategories.check();
    return form.invalid || this.rCategories.invalid;
  }

  // open the category selection list
  openCatList = () => {
    this.clearRequestStatus();
    // now scroll the screen to the top so the position of the category menu will be on screen, then
    // emit the message to cause the checkbox.menu.component to open the menu
    this.props.utilSvc.scrollToTop();
      this.emit('openEntryCategoriesMenu');
  }

  // return the list of category items from the CurrentRecipe service 
  categoryListItems = () => {
    return this.props.currentRecipe.categoryListItems();
  }

  // return the Category name for the given id
  getCategoryName = (id : number) : string => {
    return this.props.currentRecipe.categoryListName(id);
  }

  // update the categories list by adding the given category
  // return the id of the resulting new entry
  updateCategoriesList = (cat: string) : Promise<number> => {
    let newId = this.props.currentRecipe.categoryList.nextId;
    let msg = 'Category \'' + cat + '\'';

    return new Promise<number>((resolve, reject) => {
      this.props.utilSvc.displayWorkingMessage(true, 'Updating Categories List');
      this.props.recipeSvc.updateList(CATEGORY_TABLE_NAME, {id: 999, name: cat}, 
                                      'Add', this.props.user.authData.uid)   // send the update
      .then((list) => {
        this.props.currentRecipe.categoryList = list;
        this.props.currentRecipe.categoryList.items = 
                list.items.sort((a, b) : number => { return a.name < b.name ? -1 : 1; });
        this.props.utilSvc.setUserMessage('listItemAdded', msg);
        this.props.utilSvc.displayWorkingMessage(false);
        resolve(newId);
      })
      .catch((error) => {
        this.props.utilSvc.setUserMessage('errorUpdatingList', 'Categories');
        this.props.utilSvc.displayWorkingMessage(false);
        reject(0);
      });
    })
  }

  // generate a 'click' event on the picture File Select field
  clickField = () => {
    document.getElementById('rPicsID').click();
  }

  // process click event from the File Selection field and create URLs for the preview images
  fileSelected = (fId : string) => {
    let fRef : any = document.getElementById(fId);
    this.selectedPics = fRef.files;  // get the list of files from the form input element
    if (this.selectedPics.length) {
      if (this.selectedPics.length > 1) {
        this.props.utilSvc.displayWorkingMessage(true, 'Processing Images');
      } else {
        this.props.utilSvc.displayWorkingMessage(true, 'Processing Image');
      }
      // now read and compress (if applicable) all selected pictures
      for (let i = 0; i < this.selectedPics.length; i++) {
        let reader = new FileReader();
        let pic : PicObj = {} as PicObj;
        pic.file = this.selectedPics[i];
        pic.contentType = pic.file.type;
        pic.picSize = pic.file.size;
        pic.noteText = '';
        reader.onload = (event : any) => {
          pic.picURL = event.target.result;
          this.compressPic(pic)              // attempt compression and update URL if successful
          .then((cPic) => {
            this.rPictures.push(cPic);
            if (i === this.selectedPics.length - 1) {
              this.props.utilSvc.displayWorkingMessage(false); // cancel working message after last picture
            }
          })
          .catch((error) => {               // error compressing picture?
            this.props.utilSvc.displayThisUserMessage('errorCompressingPicture', pic.file.name);          
            if (i === this.selectedPics.length - 1) {
              this.props.utilSvc.displayWorkingMessage(false);
            }
          })
        }
        reader.readAsDataURL(pic.file);
      }
    }
  }

  // compress the file referenced in the given PicObj
  compressPic = (pic : PicObj) : Promise<PicObj> => {
    let ic = new ImageCompressor();
    let reader = new FileReader();
    let opts = {                              // options for file compression
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.3                            // 0.3 will compress quite a bit
    }
    return new Promise<PicObj>((resolve, reject) => {
      // only compress larger images
      if (pic.picSize > (50 * 1024)) {
        ic.compress(pic.file, opts)             // compress file
        .then((compressed) => {
          if (compressed.size < pic.picSize) {  // was compression effective?
            pic.picSize = compressed.size;
            reader.onloadend = (evt : any) => {
              pic.picURL = evt.target.result;   // replace DataURL with compressed one
              resolve(pic);
            }
            reader.readAsDataURL(compressed);   // convert compressed image to DataUrl           
          } else {
            resolve(pic);                       // compression was not effective
          }
        })
        .catch((error) => {                         // some error compressing?
          reject(error);
        })
      } else {
        resolve(pic);                           // image was too small to compress
      }
    })
  }

  // convert internal picture (PicObj) to format that is stored in database (RecipePic)
  convertToRecipePic = (p : PicObj) : RecipePic => {
    let newP = {} as RecipePic;
    newP.note = p.noteText;
    newP.contentType = p.contentType;
    let n = p.picURL.indexOf(',');    // find start of base64 encoded data string
    let dataString = p.picURL.substr(n + 1);
    newP.pic = atob(dataString);    // convert image back to binary
    newP.picSize = newP.pic.length;
    return newP;
}

  // convert a RecipePic to a PicObj
  convertToPicObj = (p : RecipePic) : PicObj => {
    let newP = {} as PicObj;
    newP.noteText = p.note;
    newP.contentType = p.contentType;
    newP.picSize = p.picSize;
      // images are stored as binary strings, a base64 DataURL (picURL) is created when Recipe is built
    newP.picURL = p.picURL; 
    return newP;
}

// add the images in the given array to the rPictures array
addExtraPictures = (images : RecipePic[]) => {
  if (images.length) {
    for (let i = 0; i < images.length; i++) {
      this.rPictures.push(this.convertToPicObj(images[i]));
    }
  }
}

// add the newly acquired extraImages for this recipe to the rPictures array
setExtraImages = () => {
  this.addExtraPictures(this.props.currentRecipe.recipe.data.extraImages);
}

// switch the image at index i with the main image (index 0)
makeMainImage = (i: number) => {
  let temp : PicObj;

  temp = this.rPictures[0];
  this.rPictures[0] = this.rPictures[i];
  this.rPictures[i] = temp;
}

// remove the given picture from the pictures for this recipe
  removePicture = (i: number) => {

    if (i !== undefined && i < this.rPictures.length) {
        this.rPictures.splice(i, 1);      // remove picture
    }
  }

  // get the form ready for another operation
  resetForm = (form ?: any) => {
    this.clearRequestStatus();
    this.checkAll = false;
    this.setItemFields(this.props.currentRecipe.recipe ? this.props.currentRecipe.recipe.data : undefined);
    this.titleAndTagsOpen = this.specificsOpen = this.picturesOpen = false;
    this.props.utilSvc.scrollToTop();
  }

  // set the form fields to reflect the selected recipe or empty
  setItemFields = (item? : RecipeData)  => {
    if (item) {
      this._rId                 = item._id;   // this is the database's ObjectID
      this.rTitle               = item.title;
      this.rDescription         = item.description;
      this.rCategories.cats     = [];
      item.categories.forEach((c) => {
        this.rCategories.cats.push(c); });
      this.rCategories.touched  = false;
      this.rCategories.errors.clearMsgs();
      this.rCategories.invalid  = false;
      this.rIngredients         = item.ingredients;
      this.rInstructions        = item.instructions;
      this.rNotes               = item.recipeNotes;
      this.rPictures            = [];
      if (item.mainImage) {
        this.rPictures.push(this.convertToPicObj(item.mainImage));
        this.addExtraPictures(item.extraImages);
      }
      this.rRestrictedTo        = [];
      if (item.restrictedTo) { 
        this.rRestrictedTo = item.restrictedTo.slice(); // copy restrictions
      }
      this.rSharedItemId        = item.sharedItem_id || '';
      this.rSubmittedBy         = item.submittedBy || '';
      this.rCreatedOn           = item.createdOn;
    } else {
      this._rId                 = undefined;
      this.rTitle               = '';
      this.rDescription         = '';
      this.rCategories.cats     = [];
      this.rCategories.touched  = false;
      this.rCategories.errors.clearMsgs();
      this.rCategories.invalid  = false;
      this.rIngredients         = '';
      this.rInstructions        = '';
      this.rNotes               = '';
      this.rPictures            = [];
      this.rRestrictedTo        = [];
      this.rSharedItemId        = '';
      this.rSubmittedBy         = '';
      this.rCreatedOn           = this.todaysDate;      
    }
  }

  // return a boolean to denote the presence of the selected item
  dataPresent = (item: string) : boolean => {
    switch (item) {
      case 'Categories':
        return this.rCategories.haveCats();
      case 'Ingredients':
        return (this.rIngredients !== undefined && this.rIngredients.length !== 0);
      case 'Instructions':
        return (this.rInstructions !== undefined && this.rInstructions.length !== 0);
      case 'RecipeNotes':
        return (this.rNotes !== undefined && this.rNotes.length !== 0);
      case 'AnyPics':
        return (this.rPictures.length > 0);
      case 'MorePics':
        return (this.rPictures.length > 1);
      default:
        return false;
    }
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus.clearMsgs();
  }

  // indicate whether there are any status messages
  haveStatusMessages = () : boolean => {
    return !this.requestStatus.empty();
  }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.props.utilSvc.returnToHomeState(400);
  }

  // update the title field
  updateTitle = (value: string) => {
    this.rTitle = value;
  }
  
  // update the description field
  updateDescription = (value: string) => {
    this.rDescription = value;
  }
  
  // update the ingredients field
  updateIngredients = (value: string) => {
    this.rIngredients = value;
  }
  
  // update the instructions field
  updateInstructions = (value: string) => {
    this.rInstructions = value;
  }
  
  // update the notes field
  updateNotes = (value: string) => {
    this.rNotes = value;
  }
  
  // update the note field of the selected picture
  updatePicNote = (index: number, evt: any) => {
    this.rPictures[index].noteText = evt.currentTarget.value;
  }
  
  // remove the given category from the catList
  removeCat = (c: number) => {
    this.rCategories.removeCat(c);
  }

  handleSubmit = evt => {
    evt.preventDefault();
    let form = document.getElementById('recipeEntryForm');
    this.submitRequest(form);
  }

  toggleSectionOpen = (name: string) => {
    switch (name) {
      case 'title':
        this.titleAndTagsOpen = !this.titleAndTagsOpen;
        break;
      case 'specifics':
        this.specificsOpen = !this.specificsOpen;
        break;
      case 'pictures':
        this.picturesOpen = !this.picturesOpen;
        break;
      default:
    }
  }

  render() {
    return(
            // Form used to provide the RECIPE ENTRY feature
        <div 
          className={'app-tab-container px-0 pt-2 app-bg-white' +
                    (this.props.editTabOpen ? ' app-open' : '')}
        >

            {/* define a component to add recipe categories */}
            <CheckboxMenu
              fTitle       = "Recipe Categories"
              fMessage     = "Select all that apply:"
              fOpenMsg     = "openEntryCategoriesMenu"
              fItems       = {this.categoryListItems()}
              fCatList     = {this.rCategories}
              fAllowNew    = {true}
              fUpdateFn    = {this.updateCategoriesList}
            />
        
            {/* Instructional messages */}
            {this.createNew &&
              <div className="app-page-label pl-1">
                Create Recipe
              </div>
            }
            {!this.createNew &&
              <div className="app-page-label pl-1">
                Edit Recipe
              </div>
            }

            {/* Start of Form */}
            <div className="app-frame px-0">
              <form 
                className="app-width-98 app-ht-100 mx-auto d-flex flex-column justify-content-between"
                id="recipeEntryForm" 
                role="form" 
                name="recipeEntryForm" 
                noValidate={true}
                onSubmit={this.handleSubmit}
              >
                <div className="d-flex flex-column app-width-98 mx-auto">

                  <FormSection 
                    fLabel="Title and Categories" 
                    fOpenFlag={this.titleAndTagsOpen}
                    fName="title" 
                    fSize="M" 
                    fToggleFn={this.toggleSectionOpen} 
                    fExtraCSS="px-1"
                  >
                    {/* Recipe Title field */}
                    <IconInput
                      fCheckAll     = {this.checkAll}
                      fName         = "rTitle" 
                      fType         = "text" 
                      fLabel        = "What do you call this recipe?"
                      fFocusedLabel = "Title:"
                      fIcon         = "title"
                      fRequired     = {true}
                      fColor        = "app-active-input-icon-color" 
                      fValue        = {this.rTitle} 
                      fCapitalize   = {true}
                      fPattern      = "^[ /\\-'%$#.,()!?\\w]*$"
                      fMaxlength    = {200}
                      fErrors       = "valueMissing|patternMismatch"
                      fErrorMsgs    = "A Title is required.|Invalid character in Title."
                      fBlurFn       = {this.updateTitle}
                      fOnInput      = {this.updateTitle}
                      fFocusFn      = {this.clearRequestStatus}
                    />
                    {/* Dish Description field */}
                    <IconTextarea
                      fCheckAll     = {this.checkAll}
                      fName         = "rDesc" 
                      fLabel        = "How would you describe it?"
                      fFocusedLabel = "Description:"
                      fValue        = {this.rDescription} 
                      fIcon         = "description"
                      fColor        = "app-active-input-icon-color" 
                      fMaxlength    = {10000}
                      fRows         = {15}
                      fBlurFn       = {this.updateDescription}
                      fFocusFn      = {this.clearRequestStatus}
                    />

                      {/* Category selection field */}
                    <div className="d-flex flex-row justify-content-end align-items-center pr-1 pt-4">
                      <label 
                        className={`app-icon-input-field-label-sm app-recipe-pics-field-label 
                                        app-width-100 pl-1` +
                                        (!this.dataPresent('Categories') ? ' app-show-required' : '')}
                      >
                        {!this.dataPresent('Categories') ? 'Assign one or more categories.' : 'Categories:'}
                      </label>
                    </div> 
                    <div className="app-icon-input-field-container pt-3">
                      <div className="d-flex flex-row align-items-center">
                        <i className="material-icons app-input-icon app-active-input-icon-color">assessment</i>
                        <div className="d-flex flex-row flex-wrap">
                          {this.rCategories.cats.map((c) =>
                            <div 
                              key={c}
                              className={`d-flex flex-row justify-content-center align-items-center 
                                          app-recipe-category-button app-category-button-theme mb-1`}
                            >
                              {this.getCategoryName(c)}
                              <i 
                                className="material-icons app-category-delete-icon app-warn ml-1" 
                                onClick={this.removeCat.bind(this, c)}
                              >
                                close
                              </i>
                            </div>)
                          } 
                          {/* display a button at the end of the list to activate the selection menu */}
                          <FabControl
                            fType       = "button"
                            fTip        = "Add Categories to Recipe"
                            fOpen       = {true}
                            fButtonCSS  = "ml-2 d-flex app-fab-button-sm app-bg-white app-accent1 app-fab-raised"
                            fDelay      = {200}
                            fAria       = "add"
                            fIcon       = "add_circle"
                            fIconCSS    = "app-fab-icon-btn-sm"
                            fOnClick    = {this.openCatList}
                            fIconColor  = "app-primary"
                          />
                        </div>
                      </div>

                      <div 
                        className={'app-field-messages' +
                              ((this.rCategories.touched || this.checkAll) ? ' app-visible' : ' app-invisible')}
                      > 
                        <FieldErrorMsgs fMsgs={this.fMsgs} eList={this.rCategories.errors}/>
                          <FieldErrorMsg key="valueMissing" fMsgs={this.fMsgs} name="valueMissing">
                            At least 1 category is required.
                          </FieldErrorMsg>
                          <FieldErrorMsg key="maxExceeded" fMsgs={this.fMsgs} name="maxExceeded">
                            10 category maximum exceeded.
                          </FieldErrorMsg>
                      </div> 
                    </div>
                  </FormSection>

                  <FormSection 
                    fLabel="Ingredients and Instructions" 
                    fOpenFlag={this.specificsOpen} 
                    fName="specifics" 
                    fToggleFn={this.toggleSectionOpen} 
                    fExtraCSS="px-1"
                  >
                    {/* Ingredients field */}
                    <IconTextarea
                      fCheckAll     = {this.checkAll}
                      fName         = "rIngr" 
                      fList         = "bullets"
                      fLabel        = "What's in it?"  
                      fFocusedLabel = "Ingredients:"
                      fIcon         = "list"
                      fColor        = "app-active-input-icon-color" 
                      fValue        = {this.rIngredients}
                      fMaxlength    = {10000}
                      fRows         = {15}
                      fTextSize     = "app-recipe-edit-text"
                      fBlurFn       = {this.updateIngredients}
                      fFocusFn      = {this.clearRequestStatus}
                    />
          
                    {/* Instructions field */}
                    <IconTextarea 
                      fCheckAll     = {this.checkAll}
                      fName         = "rInst" 
                      fLabel        = "How do you make it?"  
                      fFocusedLabel = "Directions:"
                      fList         = "numbers"
                      fIcon         = "assignment"
                      fColor        = "app-active-input-icon-color" 
                      fValue        = {this.rInstructions}
                      fMaxlength    = {10000}
                      fRows         = {15}
                      fExtraCSS     = "mt-2"
                      fTextSize     = "app-recipe-edit-text"
                      fBlurFn       = {this.updateInstructions}
                      fFocusFn      = {this.clearRequestStatus}
                    />

                    {/* Recipe Notes field */}
                    <IconTextarea 
                      fCheckAll     = {this.checkAll}
                      fName         = "rNotes" 
                      fLabel        = "Anything else?"  
                      fFocusedLabel = "Notes:"
                      fIcon         = "edit"
                      fColor        = "app-active-input-icon-color" 
                      fValue        = {this.rNotes}
                      fMaxlength    = {10000}
                      fRows         = {15}
                      fExtraCSS     = "mt-2 mb-3"
                      fTextSize     = "app-recipe-edit-text"
                      fBlurFn       = {this.updateNotes}
                      fFocusFn      = {this.clearRequestStatus}
                    />
                  </FormSection>

                  <FormSection 
                    fLabel="Pictures" 
                    fOpenFlag={this.picturesOpen} 
                    fName="pictures"
                    fToggleFn={this.toggleSectionOpen} 
                    fExtraCSS="px-0"
                  >

                    {/* Picture Files Field */}
                    <input 
                      type="file" 
                      name="rPics" 
                      multiple={true}
                      id="rPicsID"
                      className="app-no-display" 
                      // accept="image/*"
                      onChange={this.fileSelected.bind(this, 'rPicsID')}
                    />
                    <div className="d-flex flex-row justify-content-between align-items-center pr-1 mt-1">
                      <i className="material-icons app-input-icon app-active-input-icon-color">photo</i>
                      <label className="app-icon-input-field-label-sm app-recipe-pics-field-label">
                        {!this.dataPresent('AnyPics') ? 'Got any pictures?' : 'Pictures:'}
                      </label>
                      <div 
                        className="app-smaller-font"
                        data-toggle="tooltip" 
                        data-placement="top" 
                        title="Add Pictures" 
                        data-delay="200"
                      >
                        <FabControl 
                          fType       = "button"
                          fLabel      = "Add"
                          fAlignment  = "align-items-end"
                          fLabelCSS   = "app-underlined app-link-active"
                          fIcon       = "add_a_photo"
                          fIconColor  = "app-active-input-icon-color"
                          fIconCSS    = "app-icon-xsm"
                          fOnClick    = {this.clickField}
                          fAria       = "add pictures"
                        />
                      </div>
                    </div> 
                    <div className="app-icon-input-field-container app-recipe-image-container pt-3">
                      <div className="d-flex flex-column">
                        {this.rPictures.map((p, i) =>
                          <div key={i} className="app-whiteframe-2dp mb-2"> 
                            <div 
                              className={`d-flex flex-row justify-content-between align-items-center 
                                        app-recipe-image-controls app-bg-gwhite px-1`}
                            >
                              {(i === 0) && 
                              <i 
                                className={`material-icons app-category-delete-icon
                                                      app-black-text-medium app-cursor-default`} 
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="This is the Main Picture" 
                                data-delay="200"
                              >
                                check
                              </i>}
                              {(i !== 0) && 
                              <i 
                                className="material-icons app-category-delete-icon app-primary" 
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="Make this the Main Picture" 
                                data-delay="200"
                                onClick={this.makeMainImage.bind(this, i)}
                              >
                                arrow_upward
                              </i>}
                              <i 
                                className="material-icons app-category-delete-icon app-warn" 
                                data-toggle="tooltip" 
                                data-placement="top" 
                                title="Delete this Picture" 
                                data-delay="200"
                                onClick={this.removePicture.bind(this, i)}
                              >
                                close
                              </i>
                            </div>
                            <img src={p.picURL} className="app-recipe-image"/>
                            <div className="app-picture-note mb-1 px-1">
                              <input 
                                type="text" 
                                name={'picNote' + i} 
                                id={'picNoteID' + i}
                                className="app-form-input  app-cursor-pointer app-picture-note-input"
                                placeholder={'Add caption here (' + p.picSize + ')'}
                                maxLength={200}
                                value={p.noteText}
                                onInput={this.updatePicNote.bind(this, i)}
                              />
                            </div>
                          </div>)
                        }
                      </div>
                    </div> 

                  </FormSection>
                                    
                  {/* Messages Area */}
                  <FormStatusMessages fMessageOpen = {this.haveStatusMessages()}>
                      <StatusMessages eList={this.requestStatus} sMsgs={this.statusMsgs} mMax={2}/>
                      <StatusMessage sMsgs={this.statusMsgs} name="formHasErrors" class="app-error">
                        Please correct the fields with errors.
                      </StatusMessage>
                    </FormStatusMessages>  
                                    
                </div>

                {/* Actions Area */}
                <div 
                  className="d-flex flex-row justify-content-center align-items-center app-bg-white 
                            app-pos-relative pb-2"
                >
                  <FabControl
                    fType       = "submit"
                    fLink       = "Save"
                    fOpen       = {true}
                    fButtonCSS  = "app-fab-sm-sq app-oval-button mr-4"
                    fDelay      = {200}
                    fAria       = "add"
                  />
                  <FabControl 
                    fType       = "button"
                    fLink      = {this.createNew ? 'Clear' : 'Cancel'}
                    fOpen       = {true}
                    fButtonCSS  = "app-fab-sm-sq app-oval-button"
                    fDelay      = {200}
                    fOnClick    = {this.resetForm}
                    fAria       = "cancel"
                  />
                </div>
              </form>
            </div> 
        </div>
      // </div>
    )
  }
}
    