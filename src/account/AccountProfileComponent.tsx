'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';

import { UtilSvc } from '../utilities/UtilSvc';
import { StringMsgList } from '../formTools/StringMsgList';
import { User } from '../user/UserModel';
import { UserSvc } from '../user/UserSvc'
import ListItemField from '../formTools/ListItemFieldComponent';
import { StatusMessages, StatusMessage } from '../formTools/StatusMessagesComponent';
import FabControl from '../formTools/FabControlComponent';
import { FormStatusMessages } from '../formTools/FormStatusMessagesComponent';


  // COMPONENT for PROFILE UPDATE feature

@inject('user', 'utilSvc', 'userSvc')
@observer
class ProfileUpdate extends React.Component <{
  user          ?: User, 
  userSvc       ?: UserSvc,
  utilSvc       ?: UtilSvc 
  }, {} > {

  @observable requestStatus  = new StringMsgList();
  @observable statusMsgs     : StatusMessage[] = [];   
  @observable checkAll           : boolean   = false; // true if form fields to be checked for errors (touched or not)
  @observable itemName           : string    = '';
  @observable itemList           : string[]  = [];
  @observable selectedItem       : string    = '';
  @observable newItemName        : string    = '';
  @observable deleteItem         : boolean   = false;

  componentDidMount() {
    if (!this.props.user.isSignedIn) { return; }
    // set initial values for form fields
    this.itemList =
      this.props.user.profile.defaultSharedUsers ? this.props.user.profile.defaultSharedUsers : [];

    // update the current help context and open the Profile Update form
    this.props.utilSvc.setCurrentHelpContext('ProfileUpdate'); // note current state
  }

  // clear the list of items
  clearItemList = () => {
    this.clearRequestStatus();
    if (this.itemList.length) {
      this.itemList = [];
      this.requestStatus.addMsg('itemListCleared');
    }
  }

  // return true if itemList is not empty
  itemsInList = () : boolean => {
    return this.itemList.length !== 0;
  }
  
  // send profile update request to Data service
  submitUpdate = (form : any) : void => {
    this.checkAll = true;
    this.clearRequestStatus();
    if (form.invalid) {
      this.requestStatus.addMsg('formHasErrors');
      return;
    }
    this.props.user.profile.defaultSharedUsers = this.itemList;
    this.props.utilSvc.displayWorkingMessage(true);
    this.props.userSvc.updateUserProfile(this.props.user)
    .then((success) => {
      this.props.utilSvc.setUserMessage('profileUpdated');
      this.props.utilSvc.displayWorkingMessage(false);
    })
    .catch((failure) => {
      this.props.utilSvc.setUserMessage('profileUpdateFail');
      this.props.utilSvc.displayWorkingMessage(false);
    })
  }

  // delete the item that has been selected
  deleteSelectedItem = () => {
    this.deleteItem = true;
    this.userListAction(this.getForm())
  }


  // process a user list action
  userListAction = (form : any) : void => {
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
        this.itemList[index] = this.itemName;      // update entry
      break;
      case 'Remove':
        this.itemList.splice(index, 1);    // remove entry
      break;
      case 'Add':
      default:
        this.itemList.push(this.itemName);         // Add entry          
      break;
    }
    this.requestStatus.addMsg(msgId);
    this.resetForm();
  }

  // user has selected a list entry, copy it to the edit field
  copyItemName = () => {
    setTimeout( () => {
      if (this.selectedItem !== '999') {
        this.newItemName = this.itemList[this.selectedItem];
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
  canDeleteItem = () => {
    return ((this.selectedItem !== '') && (this.selectedItem !== '999'));
  } 

  // return the list index position for the item with the given name
  getListItemIndexByName = (n : string) : number => {
    for (let i = 0; i < this.itemList.length; i++) {
      if (this.itemList[i].toLowerCase() === n.toLowerCase() ) { return i; }
    }
    return -1;    // not found
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
    return this.newItemName === '';
  }

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus.clearMsgs();
  }

  // indicate whether there are any status messages
  haveStatusMessages = () : boolean => {
    return !this.requestStatus.empty();
  }

  handleSubmit = () => {
    this.submitUpdate(this.getForm());
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
  
  // return a reference to the form object from the DOM
  getForm = () => {
    return document.getElementById('profileForm');
  }

  render() {
    return(
      <div>
        <div className="app-scroll-frame-center px-0 pt-3">
          <form 
            id="profileForm" 
            name="profileForm" 
            role="form" 
            noValidate={true}
            onSubmit={this.handleUserListAction}
          >
            <div className="d-flex flex-column px-2">

              <div 
                className="d-flex flex-row justify-content-start app-flex-1 align-items-center 
                          app-black-text-low app-bold  mt-3 app-smaller-font"
              >
                People with access to my Shared Recipes:
              </div>

              {/* Default Shared Recipe Users field */}
              <ListItemField  
                fCheckAll       = {this.checkAll}
                fName           = "profileItemName"
                fValue          = {this.selectedItem}
                fLabel          = "Authorized Users" 
                fIcon           = "mail_outline" 
                fColor          = "app-accent1"
                fRequired       = {false}
                fOnFocus        = {this.clearRequestStatus}
                fOnChange       = {this.updateSelectedItem}
                fOnDelete       = {this.deleteSelectedItem}
                fList           = {this.itemList}
                fClearListFn    = {this.clearItemList}
                fEmptyListLabel = "everyone"
                fListValue      = "index"
                fEqual          = {false}
                fNewTest        = ""
                fNewName        = "profileNewIName"
                fNewLabel       = "Authorized User's Email" 
                fNewBlurFn      = {this.updateNewItemName}
                fNewValue       = {this.newItemName}
              />

                {/* Messages Area */}
                <FormStatusMessages fMessageOpen = {this.haveStatusMessages()}>
                  <StatusMessages eList={this.requestStatus} sMsgs={this.statusMsgs} mMax={2}/>
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
                    <StatusMessage sMsgs={this.statusMsgs} name="formHasErrors" class="app-error">
                        Please correct the fields with errors.
                    </StatusMessage>
                </FormStatusMessages>                    
                                        

            </div>
                                
            {/* Actions Area */}
            <div 
              className="d-flex flex-row justify-content-center align-items-center 
                        app-pos-relative pb-2"
            > 
                    <FabControl 
                      fType       = "button"
                      fLabel      = "Update"
                      fDisabled   = {this.selectedItem !== ''}
                      fOpen       = {true}
                      fButtonCSS  = "app-fab-sm-sq app-oval-button mt-1"
                      fDelay      = {200}
                      fOnClick    = {this.handleSubmit}
                      fAria       = "update"
                      fIcon       = "check_circle_outline"
                      fIconColor  = "white"
                      fIconCSS    = "app-fab-icon-sm app-mt--2"
                    />
            </div>                
          </form>
        </div>
      </div>
    )
  }
}

export default ProfileUpdate;