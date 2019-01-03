'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { UtilSvc } from '../utilities/UtilSvc';
import { CurrentRecipe } from '../recipe/CurrentRecipeSvc';
import { StringMsgList } from '../formTools/StringMsgList';
import { CatListObj } from '../formTools/CatListObj'
import { User, SHARED_USER_ID } from '../user/UserModel';
import { Recipe } from '../recipe/Recipe'
import { RecipeSvc, RecipeFilterData } from '../recipe/RecipeSvc'
import IconInput from '../formTools/IconInputComponent';
import { StatusMessages, StatusMessage } from '../formTools/StatusMessagesComponent';
import FabControl from '../formTools/FabControlComponent';
import { FormStatusMessages } from '../formTools/FormStatusMessagesComponent';
import UpdateActions  from '../formTools/UpdateActionsComponent';
import RadioGroup from '../formTools/RadioGroupComponent';
import CheckboxMenu from '../formTools/CheckboxMenuComponent';

@inject('user', 'utilSvc', 'recipeSvc', 'currentRecipe')
@observer
export class RecipeSearch extends React.Component <{
  searchTabOpen ?: boolean, 
  viewShared    ?: boolean,     // indicates user is viewing shared recipes
  dataSet       ?: string,         // indicates relevent recipe dataset (Personal or Shared)
  user          ?: User, 
  utilSvc       ?: UtilSvc, 
  recipeSvc     ?: RecipeSvc,
  currentRecipe ?: CurrentRecipe
  }, {} > {

  user              = this.props.user;
  utilSvc           = this.props.utilSvc;
  recipeSvc         = this.props.recipeSvc;
  currentRecipe     = this.props.currentRecipe;
  @observable dataSet  = this.props.dataSet || 'Personal';


  @observable checkAll    : boolean   = false; // true if form fields to be checked for errors (touched or not)
  @observable catList     = new CatListObj();
  @observable keywords    : string = '';
              sortOrder   : string = 'D';
  @observable requestStatus    = new StringMsgList();
  @observable selectedItems    : boolean[] = [];
  @observable recipeViewOpen   : boolean = false;
  @observable statusMsgs       : StatusMessage[] = [];         

  componentDidMount() {
    this.setMessageResponders();
    if (!this.user.authData) { return; }
  }

  componentWillUnmount() {
    this.deleteMessageResponders();
  }

  // set all the message responders needed in this module
  setMessageResponders() : void {
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
  }

  // emit a custom event with the given name and detail data
  emit = (name: string, data? : any) => {
    this.utilSvc.emitEvent(name, data);
  }

  submitRequest(form : any) : void {
    var request = {} as RecipeFilterData;
    this.checkAll = true;
    this.clearRequestStatus();
    if (this.checkForProblems(form)) { return; }
    this.utilSvc.displayWorkingMessage(true, 'Searching');

    request.collectionOwnerId = this.props.viewShared ? SHARED_USER_ID : this.user.authData.uid;
    if (this.catList.haveCats()) { request.categories = this.catList.cats; }
    if (this.keywords) {  // clean up any wierd leading/trailing commas or comma-space combos
      this.keywords = this.keywords.replace(/( , | ,|, )/g, ',').replace(/(^,|,$)/, '');
      request.keywords = this.keywords
    }
    if (this.props.viewShared && (this.user.authData.uid !== SHARED_USER_ID)) {
      request.checkEmail = this.user.authData.uid + ':' + this.user.userEmail;
    }
    request.projection = {extraImages: 0};
    
    this.currentRecipe.recipeList = undefined;
    this.currentRecipe.recipe = undefined;
    this.utilSvc.emitEvent('noRecipeSelection')

    this.utilSvc.emitEvent('searchUpdate');
    this.recipeViewOpen = false;
    this.checkAll = false;
    this.recipeSvc.getRecipes(request)
    .then((list : any) => {
      this.currentRecipe.recipeList = [];
      // convert all returned recipes to internal format (ascii images)
      for (let i = 0; i < list.length; i++) {
        this.currentRecipe.recipeList.push(Recipe.build(list[i]));
      }
      this.utilSvc.emitEvent('searchUpdate');
      if (!this.currentRecipe.recipeList.length) {
        this.utilSvc.setUserMessage('noRecipesFound'); // let user know they need to try again
      }
      this.utilSvc.displayWorkingMessage(false);
    })
    .catch((error) => {
      this.currentRecipe.recipeList = [];
      this.utilSvc.emitEvent('searchUpdate');
      this.utilSvc.setUserMessage('errorReadingRecipesTable'); // let user know they need to try again
      this.utilSvc.displayWorkingMessage(false);
    });
    this.utilSvc.scrollToTop();
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus.clearMsgs(); 
  }

  // add an item to the status messages object
  setStatusMessage(item : string) : void {
    this.requestStatus.addMsg(item); 
  }

  // indicate whether there are any status messages
  haveStatusMessages = () : boolean => {
    return !this.requestStatus.empty();
  }

  // respond to change of dataSet if necessary (Personal/Shared)
  dataSetChange = (value: string) : void => {
    this.dataSet = value;
    if ((this.dataSet === 'Shared') !== this.props.viewShared) {
      this.catList.clear();   // categories list will change
      this.emit('setViewShared', this.dataSet === 'Shared');
      this.emit('resetSharedFilter');
    }
  }

  // return the list of category items from the CurrentRecipe service 
  categoryListItems = () => {
    return this.currentRecipe.categoryListItems();
  }

  // return the Category name for the given id
  getCategoryName = (id : number) : string => {
    return this.currentRecipe.categoryListName(id);
  }

  // open the category selection list
  openCatList = () => {
    this.clearRequestStatus();
    this.utilSvc.scrollToTop();
    this.emit('openSearchCategoriesMenu');
  }

  // format a label for the categories field
  catFieldLabel = () => {
    switch (this.catList.numCats()) {
      case 0:
        return 'Disregard categories.'
      case 1:
        return 'Recipe has this category:'
      default:
        return 'Recipe has these categories:'
    }
  }

  // check the filter form responses for problems
  checkForProblems(form? : any) : boolean {
    if (form && !form.checkValidity()) {
        this.setStatusMessage('formHasErrors');
    }
    return this.haveStatusMessages();
  }

  // return a boolean to denote the presence of the selected item
  dataPresent = (item: string) : boolean => {
    switch (item) {
      case 'Categories':
        return this.catList.haveCats();
      case 'Keywords':
        return (this.keywords !== '');
      default:
        return false;
    }
  }

  // clear the keywords field
  clearKeywords = () => {
    this.updateKeywords('');
  }
  
  // update the keywords field
  updateKeywords = (value: string) => {
    this.keywords = value;
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

  removeCat = (cat: number, e: any) => {
    this.catList.removeCat(cat);
  }

  handleSubmit = evt => {
    evt.preventDefault();
    let form = document.getElementById('searchForm');
    this.submitRequest(form);
  }

  render() {

    return(
      // <div>
        <div 
          className={'app-tab-container px-0 pt-2 app-bg-white' + 
                        (this.props.searchTabOpen ? ' app-open' : '')}
        >

          {/* define a component to add recipe categoreis */}
          <CheckboxMenu 
            fTitle       = "Recipe Categories"
            fMessage     = "Select any that apply:"
            fOpenMsg     = "openSearchCategoriesMenu"
            fItems       = {this.categoryListItems()}
            fCatList     = {this.catList}
          />
        
          {/* Instructional messages */}
          <div 
            className="d-flex flex-row justify-content-start app-flex-1 
                      app-black-text-low app-bold align-items-center ml-2 my-2 app-small-font"
          >
            Use the fields below to narrow your search.
          </div>

          <div className="app-frame d-flex flex-column align-items-stretch pt-0">
            <div className="app-bg-white d-flex flex-column app-width-100">

              {/* Radio group to select data set (Personal/Shared) */}
              <div className="d-flex flex-row px-2">
                <RadioGroup
                  fTitle      = "Search In:"
                  fIcon       = {this.dataSet === 'Personal' ? 'folder' : 'folder_shared'}
                  fIconColor  = "app-active-input-icon-color"
                  fOnChange   = {this.dataSetChange}
                  fOnFocus    = {this.clearRequestStatus}
                  fDividerAfter = {false}
                  fDefault     = {this.dataSet} 
                  fExtraCSS   = "app-smaller-font pb-2"
                  fValues     = "Personal|Shared" 
                  fLabels     = "My Recipes|Shared Recipes" 
                  fName       = "sDatabase"
                />
              </div>

              {/* Form for search filtering options */}

              <form 
                className="app-width-98 d-flex flex-column justify-content-between"
                id="searchForm" 
                name="searchForm" 
                role="form" 
                noValidate={true}
                onSubmit={this.handleSubmit}
              >
                <div className="d-flex flex-column px-2">

                  {/* categories Field */}
                  <div 
                    className="d-flex flex-row justify-content-end align-items-center 
                              app-list-item-field-container pr-1 pt-3"
                  >
                    <label className="app-icon-input-field-label-sm app-recipe-pics-field-label app-width-100">
                        {this.catFieldLabel()}
                      </label>
                  </div> 
                  <div className="app-icon-input-field-container pt-3">
                    <div className="d-flex flex-row align-items-center">
                      <i className="material-icons app-input-icon app-active-input-icon-color">assessment</i>
                      <div className="d-flex flex-row flex-wrap">
                        {/* display a button for each currently selected category */}
                        {this.catList.cats.map((c) =>   
                          <div 
                            key={c} 
                            className="btn d-flex flex-row justify-content-center align-items-center 
                                      app-recipe-category-button app-category-button-theme mb-1"
                          >
                            {this.getCategoryName(c)}
                            <i 
                              className="material-icons app-category-delete-icon app-warn ml-1" 
                              onClick={this.removeCat.bind(this, c)}
                            >
                              close
                            </i>
                          </div> )
                        }
                        {/* display a button at the end of the list to activate the selection menu */}
                        <FabControl
                          fType       = "button"
                          fFab        = {true}
                          fTip        = "Select Categories for Search"
                          fOpen       = {true}
                          fButtonCSS  = "ml-2 d-flex app-fab-button-sm app-bg-white app-accent1 app-fab-raised"
                          fDelay      = {200}
                          fAria       = "select"
                          fIcon       = "add_circle"
                          fIconCSS    = "app-fab-icon-btn-sm"
                          fOnClick    = {this.openCatList}
                          fIconColor  = "app-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* <Keywords Field */}
                  <IconInput
                    fName         = "rKeywords" 
                    fType         = "text" 
                    fLabel        = "Disregard recipe text"
                    fFocusedLabel = "Title or Ingredients contain:"  
                    fIcon         = "vpn_key"
                    fColor        = "app-active-input-icon-color" 
                    fPattern      = "^[ /\\-'%$#.,()!?\\w]*$"
                    fMaxlength    = {200}
                    fErrors       = "patternMismatch"
                    fErrorMsgs    = "Invalid keyword character or list format."
                    fValue        = {this.keywords} 
                    fBlurFn       = {this.updateKeywords}
                    fOnInput      = {this.updateKeywords}
                    fClearFn      = {this.clearKeywords}
                    fFocusFn      = {this.clearRequestStatus}
                  />

                  {/* Messages Area */}
                  <FormStatusMessages fMessageOpen = {this.haveStatusMessages()}>
                    <StatusMessages eList={this.requestStatus} sMsgs={this.statusMsgs} mMax={2}/>
                    <StatusMessage sMsgs={this.statusMsgs} name="formHasErrors" class="app-error">
                      Please correct the fields with errors.
                    </StatusMessage>
                  </FormStatusMessages>  

                </div>

                {/* Actions Area */}
                <UpdateActions
                  fType         ="submit"
                  fLabels       ={true}
                  fSLabel       ="Search"
                  fBgColor      ="white"
                  fButtonCSS    ="app-oval-button"
                />
              </form>
            </div>
          </div>
        </div>
      // </div>
    )

  }

    
}