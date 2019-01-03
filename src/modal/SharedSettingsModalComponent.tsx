'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { ModalModel } from '../modal/ModalModel';
import ListItemField from '../formTools/ListItemFieldComponent';
import FabControl from '../formTools/FabControlComponent';
import { StringMsgList } from '../formTools/StringMsgList';
import HelpButton from '../formTools/HelpButtonComponent';
import { StatusMessages, StatusMessage } from '../formTools/StatusMessagesComponent';
import { FormStatusMessages } from '../formTools/FormStatusMessagesComponent';

// dialog used for SHARED RECIPE SETTINGS

@inject('modalSvc')
@observer
class SharedSettingsModal extends React.Component<{   
  modalSvc         ?: ModalModel
}, {} > {



  @observable checkAll            : boolean   = false; // true if form fields to be checked for errors (touched or not)
  @observable deleteRecipe        : boolean   = false;
  @observable itemName            : string    = '';
  @observable selectedItem        : string    = '';
  @observable newItemName         : string    = '';
  @observable deleteItem          : boolean   = false;
  @observable requestStatus       = new StringMsgList();
  @observable statusMsgs       : StatusMessage[] = [];         



  // delete the item that has been selected
  deleteSelectedItem = () => {
    let form = document.getElementById('sharedUsersForm');
    this.deleteItem = true;
    this.userListAction(form)
  }

  // clear the list of items
  clearItemList = () => {
    this.clearRequestStatus();
    if (this.props.modalSvc.ssmData.itemList.length) {
      this.props.modalSvc.ssmData.itemList = [];
      this.requestStatus.addMsg('itemListCleared');
    }
  }

  // return true if itemList is not empty
  itemsInList = () : boolean => {
    return this.props.modalSvc.ssmData.itemList.length !== 0;
  }
  
  // make the current update to the users list
  userListAction(form : any) : void {
    var msgId : string,
        action: string,
        index: number;

    this.checkAll = true;
    this.clearRequestStatus();
    if (this.checkForProblems(form)) {   // can't do anything yet, form still has errors
      return;
    }
    this.itemName = this.newItemName;
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
    index = parseInt(this.selectedItem, 10);
    switch (action) {
      case 'Update':
        this.props.modalSvc.ssmData.itemList[index] = this.itemName;      // update entry
      break;
      case 'Remove':
        this.props.modalSvc.ssmData.itemList.splice(index, 1);    // remove entry
      break;
      case 'Add':
      default:
        this.props.modalSvc.ssmData.itemList.push(this.itemName);         // Add entry          
      break;
    }
    this.requestStatus.addMsg(msgId);
    this.resetForm();
  }

  // return the list index position for the item with the given name
  getListItemIndexByName = (n : string) : number => {
    for (let i=0; i < this.props.modalSvc.ssmData.itemList.length; i++) {
      if (this.props.modalSvc.ssmData.itemList[i].toLowerCase() === n.toLowerCase() ) { return i; }
    }
    return -1;    // not found
  }


  // user has selected a list entry, copy it to the edit field
  copyItemName = () => {
    setTimeout( () => {
      if (this.selectedItem !== '999') {
        this.newItemName = this.props.modalSvc.ssmData.itemList[this.selectedItem];
      } else {
        this.newItemName = '';
      }
    }, 50);
  }

  // get the form ready for another operation
  resetForm() : void {
    this.checkAll = false;
    this.selectedItem = '';
    this.deleteItem   = false;
    this.newItemName  = '';
  }

  // return whether the selecteditem value is a valid id number
  canDeleteItem = () : boolean => {
    return ((this.selectedItem !== '') && (this.selectedItem !== '999'));
  } 

  // return true if there is a restricted users list
  sharingWith = () : string => {
    let msg : string;

    switch (this.props.modalSvc.ssmData.itemList.length) {
      case 0:
        msg = 'everyone';
        break;
      case 1:
        msg = '1 other user';
        break;
      default:
        msg = this.props.modalSvc.ssmData.itemList.length + ' other users';
    }
    return msg;
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus.clearMsgs();
  }

  // indicate whether there are any status messages
  haveStatusMessages = () : boolean => {
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

  updateDeleteRecipe = evt => {
    this.deleteRecipe = evt.currentTarget.checked;
  }

  handleUserListAction = evt => {
    evt.preventDefault();
    this.userListAction(evt.target);
  }

  updateSelectedItem = (val: string) => {
    this.selectedItem = val;
    this.copyItemName();
  }

  updateNewItemName = (val: string) => {
    this.newItemName = val;
  }


  // call the resolve method
  close = () => {
    var result : any = {};
    result.delete = this.deleteRecipe;
    result.create = this.props.modalSvc.ssmData.dType === 'SharedCreate';
    result.list = this.props.modalSvc.ssmData.itemList.length ? this.props.modalSvc.ssmData.itemList : undefined;
    this.deleteRecipe = false;
    this.props.modalSvc.closeSharedSettingsModal(400)
    .then((success) => {
      // this.forceUpdate();
      this.props.modalSvc.ssmData.resolve(result);      
    })
    .catch((err) => {})
  }

  // call the reject method
  dismiss = () => {
    this.deleteRecipe = false;
    this.props.modalSvc.closeSharedSettingsModal(400)
    .then((success) => {
      // this.forceUpdate();
      this.props.modalSvc.ssmData.reject('CANCEL');      
    })
    .catch((err) => {})
  }

  render() {
    return(
      <div>
          <div 
            className={'app-modal-backdrop app-fade-in' + 
                (this.props.modalSvc.sharedSettingsIsOpen ? ' app-open' : '' ) +
                (this.props.modalSvc.sharedSettingsIsClosing ? ' app-closing' : '')}
            onClick={this.dismiss}
          />
          <div 
            className={'app-fade-in app-confirm-dialog' + 
                (this.props.modalSvc.sharedSettingsIsOpen ? ' app-open' : '' ) +
                (this.props.modalSvc.sharedSettingsIsClosing ? ' app-closing' : '')}
          >
            <div className="app-dialog-header">
              <div className="d-flex flex-row justify-content-start align-items-center app-flex-1 px-2 py-1">
                <button 
                  type="button" 
                  className={'btn d-flex flex-row align-items-center app-form-image-button mx-0 app-visible'} 
                  aria-label="cancel"
                  data-toggle="tooltip" 
                  data-placement="top" 
                  title="Cancel" 
                  data-delay="200"
                > 
                  <i 
                    className={'material-icons app-fab-icon-smm app-header-title-icon app-white'} 
                    onClick={this.dismiss}
                  >arrow_back
                  </i>
                </button>
                <div className="app-form-title">{this.props.modalSvc.ssmData.heading}</div>
                <div className="ml-auto">
                  <HelpButton 
                      fPosition="relative" 
                  />
                </div>
              </div>
            </div>
            <div className="app-form-theme app-all-paddings-8px">
              <div className="d-flex flex-row justify-content-center align-items-center app-recipe-action-title">
                {this.props.modalSvc.ssmData.recipeTitle}</div>
              <div className="app-lightslategray app-divider-90"/>
              <form 
                id="sharedUsersForm"
                name="sharedUsersForm" 
                role="form" 
                noValidate={true}
                onSubmit={this.handleUserListAction}
              >
                <div className="d-flex flex-column">

                  {/* Remove Recipe from Public Recipes field */}
                  {this.props.modalSvc.ssmData.dType === 'SharedEdit' && 
                  <div className="d-flex flex-row align-items-center mt-1">
                    <i 
                      className={'material-icons app-input-icon' +
                          (this.deleteRecipe ? ' app-active-input-icon-color' : ' app-white')}
                    >
                      remove_circle_outline
                    </i>
                    <label className="app-cursor-pointer mb-0">
                      <input 
                        type="checkbox" 
                        name="delMat" 
                        className="app-cursor-pointer mx-1"
                        defaultChecked={this.deleteRecipe} 
                        onChange={this.updateDeleteRecipe}
                      />
                      Stop sharing this recipe
                    </label>
                  </div>}

                  {(this.props.modalSvc.ssmData.dType === 'SharedCreate') &&
                  <div className="d-flex flex-row align-items-center mt-1">
                    <i className="material-icons app-input-icon app-active-input-icon-color">check_box</i>
                    <label className="mb-0">
                      Share with {this.sharingWith()}
                    </label>
                  </div>}

                  <div 
                    className="d-flex flex-row justify-content-start app-flex-1 align-items-center 
                              app-black-text-low app-bold  mt-3 app-smaller-font"
                  >
                    (Optional) Restrict users by email:
                  </div>


                  {/* User Email Field */}
                  <ListItemField 
                    fCheckAll     = {this.checkAll}
                    fName           = "ssItemName"
                    fValue          = {this.selectedItem}
                    fLabel          = "Authorized Users" 
                    fIcon           = "mail_outline" 
                    fColor          = "app-active-input-icon-color"
                    fRequired       = {false}
                    fDisabled       = {this.deleteRecipe}
                    fOnFocus        = {this.clearRequestStatus}
                    fOnChange       = {this.updateSelectedItem}
                    fOnDelete       = {this.deleteSelectedItem}
                    fList           = {this.props.modalSvc.ssmData.itemList}
                    fClearListFn    = {this.clearItemList}
                    fEmptyListLabel = "everyone"
                    fListValue      = "index"
                    fEqual          = {false} 
                    fNewTest        = ""
                    fNewName        = "ssNewIName"
                    fNewLabel       = "Authorized User's Email" 
                    fNewBlurFn      = {this.updateNewItemName}
                    fNewValue       = {this.newItemName}
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
                      <StatusMessage sMsgs={this.statusMsgs} name="listItemAdded" class="app-success">
                          List item added.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="listItemRemoved" class="app-success">
                          List item removed.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="listItemUpdated" class="app-success">
                          List item updated.
                      </StatusMessage>
                      <StatusMessage sMsgs={this.statusMsgs} name="itemListCleared" class="app-success">
                          Item list cleared.
                      </StatusMessage>
                  </FormStatusMessages>                    
                                    
                </div>
              </form>
            </div>
            <div 
              className="d-flex flex-row justify-content-around align-items-center 
                        app-dialog-footer app-pos-relative pt-1 pb-2"
            >
              <FabControl
                fType       = "button"
                fLink       = {this.props.modalSvc.ssmData.cancelText}
                fOnClick    = {this.dismiss}
                fButtonCSS  = "app-fab-sm-sq app-oval-button"
                fAria       = "cancel"
              />
              <FabControl 
                fType       = "button"
                fLink       = {!this.deleteRecipe ? this.props.modalSvc.ssmData.okText : 
                                  this.props.modalSvc.ssmData.deleteText}
                fOnClick    = {this.close}
                fButtonCSS  = "app-fab-sm-sq app-oval-button"
                fAria       = "Ok"
              />
            </div>
          </div>
      </div>
    )
  }
  
}

export default SharedSettingsModal;
