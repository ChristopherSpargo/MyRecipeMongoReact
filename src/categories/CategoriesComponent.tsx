'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { UtilSvc } from '../utilities/UtilSvc';
import { StringMsgList } from '../formTools/StringMsgList';
import { RecipeSvc, CATEGORY_TABLE_NAME,
         ListTableItem, ListTable, RecipeFilterData } from '../recipe/RecipeSvc'
import { RecipeData } from '../recipe/Recipe';
import { User } from '../user/UserModel';
import FormHeader from '../formTools/FormHeaderComponent'
import { StatusMessages, StatusMessage } from '../formTools/StatusMessagesComponent';
import FabControl from '../formTools/FabControlComponent';
import { FormStatusMessages } from '../formTools/FormStatusMessagesComponent';
import ListItemField from '../formTools/ListItemFieldComponent'
import { UserSvc } from '../user/UserSvc';

    // COMPONENT for MANAGE CATEGORIES feature

@inject('user', 'utilSvc', 'recipeSvc', 'userSvc')
@observer
class CategoriesComponent extends React.Component <{ user?: User, userSvc?: UserSvc,
  stateService?: any, utilSvc?: UtilSvc, recipeSvc?: RecipeSvc},  {} > {


  @observable listObj        : ListTable;
  @observable itemList       : ListTableItem[] = [];
              listItem       = {} as ListTableItem;
              action         : string = '';
  @observable checkAll       : boolean   = false; // true if form fields to be checked for errors (touched or not)
  @observable selectedItem   : string    = '';
  @observable newItemName    : string    = '';
              deleteItem     : boolean   = false;
  @observable requestStatus  = new StringMsgList();
              listName       : string = 'Category';
              listIcon       : string = 'assessment';
              itemReference  : string = 'a';
              tableName      : string = CATEGORY_TABLE_NAME;
              formTitle      : string = 'Recipe Categories';
              helpContext    : string = 'ManageCategories';
  @observable formOpen       : boolean   = false;
  @observable statusMsgs     : StatusMessage[] = [];         

  componentDidMount() {
  // make the user log in to manage lists
    if (!this.props.user.isSignedIn) {
      this.props.utilSvc.returnToHomeMsg('signInToAccessCategories'); // let user know they need to log in
    } else {
      // update the current help context and open the List Management form
      this.props.utilSvc.setCurrentHelpContext(this.helpContext); // note current state
      this.props.utilSvc.displayUserMessages();
      this.props.recipeSvc.getList(this.tableName, this.props.user.authData.uid)
      .then( (list) => {
          this.listObj      = list;
          this.itemList     = list.items.sort((a, b) : number => { return a.name < b.name ? -1 : 1; });
          this.formOpen     = true;
          if (!this.props.user.profile.categoriesCreated) {
            this.props.user.profile.categoriesCreated = true;  // update categoriesCreated flag if necessary
            this.props.userSvc.updateUserProfile(this.props.user)
            .then(() => {})
            .catch((error) => {}) 
          }  
        })
      .catch((noCats) => {   // no category table
          if (!this.props.user.profile.categoriesCreated) {
            this.props.recipeSvc.initializeTable(this.tableName, this.props.user.authData.uid)
            .then((list) => {
              this.props.utilSvc.displayThisUserMessage('initializingList', this.tableName);
              this.listObj      = list;
              this.itemList     = this.listObj.items;
              this.formOpen     = true;
            })
            .catch((initError) => {   // can't continue, database error
              this.props.utilSvc.returnToHomeMsg('errorInitializingList', 400, this.tableName); 
            })
          } else {        // categories list exists but can't be read
            this.props.utilSvc.returnToHomeMsg('errorReadingList', 400, this.tableName);
          }
      });
    }
  }

  // delete the item that has been selected
  deleteSelectedItem = () => {
    this.deleteItem = true;
    this.submitRequest(this.getForm())
  }

  // prepare and send request to database service
  submitRequest(form : any) : void {
    var msg   : string, 
        msgId : string;
    var action: string;

    this.checkAll = true;
    this.clearRequestStatus();
    if (this.checkForProblems(form)) {   // can't do anything yet, form still has errors
      return;
    }
    this.listItem.id = parseInt(this.selectedItem, 10);
    this.listItem.name = this.newItemName;
    msg = this.listName + ' \'' + this.listItem.name + '\'';
    // now set the action to perform and the status message for the user
    if (this.selectedItem === '999') {  // user specify new item name?
      msgId = 'listItemAdded';
      action = 'Add';
    } else {
      if (!this.deleteItem) {
        msgId = 'listItemUpdated';
        action = 'Update';
      } else {
        msgId = 'listItemRemoved';
        action = 'Remove';
      }
    }
    this.props.utilSvc.displayWorkingMessage(true);
    this.props.recipeSvc.updateList(this.tableName, this.listItem, action, 
                                    this.props.user.authData.uid)   // send the update
    .then((list: ListTable) => {
      this.itemList = list.items.sort((a, b) : number => { return a.name < b.name ? -1 : 1; });
      this.checkForRecipeAdjustments(this.listItem.id, action)
      .then((success) => {
        this.resetForm(form);
        this.props.utilSvc.setUserMessage(msgId, msg);
        this.props.utilSvc.displayWorkingMessage(false);
      })
      .catch((failMsg) => {
        this.props.utilSvc.setUserMessage(failMsg);
        this.resetForm(form);
        this.props.utilSvc.displayWorkingMessage(false);
      })
    })
    .catch((error) => {
        this.props.utilSvc.setUserMessage('errorUpdatingList', this.listName);
        this.resetForm(form);
        this.props.utilSvc.displayWorkingMessage(false);
      });
  }

  // if the action was 'remove' then see if any recipes contain the listItem and adjust
  // the recipe accordingly
  checkForRecipeAdjustments = (id: number, action: string) : Promise<string> => {
    let promises = [];
    let query = {} as RecipeFilterData;
    query.collectionOwnerId = this.props.user.authData.uid;

    return new Promise<string>((resolve, reject) => {
      if (action !== 'Remove') {
         resolve('Ok');
      } else {
        // read the necessary data from the affected recipes
        query.categories = [id];
        query.projection = {'_id': 1, 'categories': 1}; // read categories list if Removed category
        this.props.recipeSvc.getRecipes(query)
        .then((data : RecipeData[]) => {
          data.forEach((r) => {
            let updateObj;
            // remove category from the recipe's categories list
            let i = r.categories.indexOf(id);
            r.categories.splice(i, 1);
            updateObj = {'categories': r.categories};
            // update each recipe and save a promise for each update request
            promises.push(this.props.recipeSvc.updateRecipe(r._id, updateObj));
          });
          Promise.all(promises)       // wait till all are done (or 1 fails)
          .then((updateSuccess) => {  // .finally would be nice because either way we're done
            resolve('Ok'); })
          .catch((errorUpdating) => {
            reject('errorUpdatingRecipes'); })
        })
        .catch((errorReading) => {
          reject('errorReadingRecipesForUpdate');
        })
      }
   });
  }

  // user has selected a list entry, copy it to the edit field
  copyItemName = () => {
    if (this.selectedItem !== '999' && this.selectedItem !== '') {
      // need to get the item list index of selectedItem (id)
      this.newItemName = this.itemList[this.getListItemIndexById(parseInt(this.selectedItem, 10))].name;
    } else {
      this.newItemName = '';
    }
  }

  // return the list index position for the item with the given id
  getListItemIndexById = (id: number) : number => {
    for (let i = 0; i < this.itemList.length; i++) {
      if (this.itemList[i].id === id) { return i; }
    }
    return -1;    // not found
  }

  // return the list index position for the item with the given name
  getListItemIndexByName = (n : string) : number => {
    for (let i=0; i < this.itemList.length; i++) {
      if (this.itemList[i].name.toLowerCase() === n.toLowerCase() ) { return i; }
    }
    return -1;    // not found
  }

  // get the form ready for another operation
  resetForm(form : any) : void {
    this.checkAll     = false;
    this.selectedItem = '';
    this.deleteItem   = false;
    this.newItemName  = '';
    this.listItem     = {} as ListTableItem;
  }

  // return whether the selecteditem value is a valid id number
  canDeleteItem = () => {
    return ((this.selectedItem !== '') && (this.selectedItem !== '999'));
  } 

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus.clearMsgs();
  }

  // indicate whether there are any status messages
  haveStatusMessages = () => {
    return !this.requestStatus.empty();
  }

  // return true if there is something wrong with the form input
  checkForProblems(form: any) : boolean {
    if (!form.checkValidity()) {
      this.requestStatus.addMsg('formHasErrors');
      return true;
    }
    if (this.selectedItem === '999') {  // user specify new item name?
      if (this.getListItemIndexByName(this.newItemName) !== -1) {
        this.requestStatus.addMsg('itemAlreadyInList');
        return true;
      }
    }
    return this.selectedItem === '';
 }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.props.utilSvc.returnToHomeState(400);
  }

  handleSubmit = evt => {
    evt.preventDefault();
    this.submitRequest(evt.target);
  }

  updateSelectedItem = (val: string) => {
    this.selectedItem = val;
    this.copyItemName();
  }

  updateNewItemName = (val: string) => {
    this.newItemName = val;
  }

  // return a reference to the form object from the DOM
  getForm = () => {
    return document.getElementById('categoryForm');
  }

  
  render() {
    return(
      <div 
        className={'app-full-frame app-bg-white app-fade-in' + (this.formOpen ? ' app-open' : '')}
      >

        {/* Form Header */}

        <FormHeader  
          headerType        = "center" 
          headerIcon        = {this.listIcon}
          headerTitle       = {this.formTitle} 
          headerTheme       = "app-lists-header-theme"
          headerClose       = {this.closeForm}
        />

        {/* Start of Form */}

        <div className="app-scroll-frame-center">
          <div className="app-form-theme px-0 pt-3">
            <form 
              id="categoryForm" 
              name="categoryForm" 
              role="form" 
              noValidate={true}
              onSubmit={this.handleSubmit}
            >
              <div className="d-flex flex-column px-2">

              {/* Instructional messages */}
              {(this.selectedItem === '' ) && 
              <div 
                className="d-flex flex-row justify-content-start app-flex-1 align-items-center
                                                      app-black-text-low app-bold mb-2 app-smaller-font"
              >
                Select from the list to edit/create {this.itemReference} {this.listName}
              </div>}
              {(this.selectedItem !== '' ) && 
              <div 
                className="d-flex flex-row justify-content-start app-flex-1 align-items-center 
                                                      app-black-text-low app-bold mb-2 app-smaller-font"
              >
                Now edit and save or remove this {this.listName}
              </div>}

                {/* Item Name Field */}
                <ListItemField 
                    fCheckAll       = {this.checkAll}
                    fName           = "catItemName"
                    fValue          = {this.selectedItem}
                    fLabel          = {this.listName + ' Names'} 
                    fIcon           = {this.listIcon} 
                    fColor          = "app-active-input-icon-color"
                    fOnDelete       = {this.deleteSelectedItem}
                    fRequired       = {false}
                    fOnFocus        = {this.clearRequestStatus}
                    fCapitalize     = {true}
                    fOnChange       = {this.updateSelectedItem}
                    fList           = {this.itemList}
                    fListValue      = "idName"
                    fEqual          = {false}
                    fNewTest        = ""
                    fNewName        = "catNewIName"
                    fNewLabel       = {this.listName + ' Name'} 
                    fNewValue       = {this.newItemName}
                    fNewBlurFn      = {this.updateNewItemName}
                />

                {/* Messages Area */}
                <FormStatusMessages fMessageOpen = {this.haveStatusMessages()}>
                  <StatusMessages eList={this.requestStatus} sMsgs={this.statusMsgs} mMax={2}/>
                    <StatusMessage sMsgs={this.statusMsgs} name="formHasErrors" class="app-error">
                      Please correct the fields with errors.
                    </StatusMessage>
                    <StatusMessage sMsgs={this.statusMsgs} name="itemAlreadyInList" class="app-error">
                        Item already in list.
                    </StatusMessage>
                </FormStatusMessages>                    

              </div>
               {/* Actions Area */}
              <div 
                className="d-flex flex-row justify-content-center align-items-center 
                  app-pos-relative pb-2" 
                id="actions"
              >
                <FabControl
                  fType       = "button"
                  fLink       = "Done"
                  fOnClick    = {this.closeForm}
                  fButtonCSS  = "app-fab-sm-sq app-oval-button"
                  fAria       = "done"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export const categoriesState = { name: 'manageCategories', url: '/categories',  component: CategoriesComponent };

export default CategoriesComponent;