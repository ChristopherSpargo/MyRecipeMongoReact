'use strict'
import { observable, action } from 'mobx';

// the ModalData object is used to pass configuration parameters to the modals' Open functions
export interface ModalData {      
  dType              ?: string,   // dialog type: SignOut      = user is signing out
                                  //              RecipeDelete = user deleting a recipe
                                  //              UpdateCopy   = user edited a shared recipe
                                  //              ForgotPwd    = user forgot their password
                                  //              SharedCreate = sharing a new recipe
                                  //              SharedEdit   = changing settings on a shared recipe
  heading            ?: string,   // heading for modal
  headingIcon        ?: string,   // Icon to use with the heading
  recipeTitle        ?: string,   // title from Recipe
  itemList           ?: string[], // list of email restricitons
  content            ?: string,   // modal content
  cancelText         ?: string,   // text for CANCEL button
  okText             ?: string,   // text for OK button
  deleteText         ?: string,   // text for DELETE button
  notifyOnly         ?: boolean   // true if no CANCEL button
  resolve            ?: Function, // function to call to resolve the Promise
  reject             ?: Function  // function to call to reject the Promise
}


// The ModalModel class provides an asynchronous modal feature.
// Two modal types are available: 
//     Simple - used for general notices and confirmations
//     SharedSettings - used specificly for the application's Recipe sharing feature
// Both 'open' functions return a Promise

export class ModalModel {
  @observable simpleIsOpen            = false;    // when true, SimpleModal component will be open
  @observable simpleIsClosing         = false;    // when true, SimpleModal component is about to close
  @observable sharedSettingsIsOpen    = false;    // when true, SharedSettingsModal component will be open
  @observable sharedSettingsIsClosing = false;    // when true, SharedSettingsModal component is about to close

  @observable smData  : ModalData = {};         // data object for SimpleModal
  @observable ssmData : ModalData = {};         // data object for SharedSettingsModal

  @action
  simpleOpen = (mData: ModalData) => {
    this.smData.dType        = mData.dType || 'SignOut';
    this.smData.heading      = mData.heading || '';
    this.smData.headingIcon  = mData.headingIcon || 'person';
    this.smData.content      = mData.content || '';
    this.smData.cancelText   = mData.cancelText || 'Cancel';
    this.smData.okText       = mData.okText || 'Ok';
    this.smData.notifyOnly   = mData.notifyOnly || !mData.cancelText;
    document.body.style.overflowY = 'hidden';  // this disables vertical scrolling behind the modal
    this.simpleIsOpen = true;
    return new Promise((resolve, reject) => {
      this.smData.resolve = resolve;
      this.smData.reject = reject;
    });
  }

  @action
  closeSimpleModal = (delay?: number) : Promise<string> => {
    this.simpleIsClosing = true;
    this.simpleIsOpen = false;      
    return new Promise((resolve, reject) => {       // now, allow time for the modal fade-out animation
      setTimeout(() => {
        document.body.style.overflowY = '';         // enable scrolling
        this.simpleIsClosing = false;
        resolve('Ok');
      }, delay || 400);
    })
  }

  @action
  sharedSettingsOpen = (mData: ModalData) => {
    this.ssmData.dType        = mData.dType || 'SharedCreate';
    this.ssmData.heading      = mData.heading || '';
    this.ssmData.headingIcon  = mData.headingIcon || 'settings';
    this.ssmData.recipeTitle  = mData.recipeTitle;
    this.ssmData.itemList     = mData.itemList || [];
    this.ssmData.content      = mData.content || '';
    this.ssmData.cancelText   = mData.cancelText || 'Cancel';
    this.ssmData.okText       = mData.okText || 'Save';
    this.ssmData.deleteText   = mData.deleteText || 'Stop Sharing';
    this.ssmData.notifyOnly   = mData.notifyOnly || !mData.cancelText;
    document.body.style.overflowY = 'hidden';  // this disables vertical scrolling behind the modal
    this.sharedSettingsIsOpen = true;
    return new Promise((resolve, reject) => {
      this.ssmData.resolve = resolve;
      this.ssmData.reject = reject;
    });
  }

  @action
  closeSharedSettingsModal = (delay?: number) : Promise<string> => {
    this.sharedSettingsIsClosing = true;
    this.sharedSettingsIsOpen = false;
    return new Promise((resolve, reject) => {       // now, allow time for the modal fade-out animation
      setTimeout(() => {
        document.body.style.overflowY = '';         // enable scrolling
        this.sharedSettingsIsClosing = false;
        resolve('Ok');
      }, delay || 400);
    })
  }

}


