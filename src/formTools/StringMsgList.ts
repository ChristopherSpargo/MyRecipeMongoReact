'use strict'
import { observable, action, get, set, remove, has, keys } from 'mobx';

// Class used with FormMessagesComponent and ToastComponent

export class StringMsgList {
  @observable msgs : {[key: string]: any} = Object.create(null);

  // indicate whether the message list is empty
  empty = () : boolean => {
    return !this.msgs ? true : keys(this.msgs).length === 0;
  }

  // indicate whether there is a specific status message in the list
  hasMsg = (key : string) : boolean => {
    return has(this.msgs, key);
  }

  // return a specific status message in the list
  getMsg = (key : string) : string => {
    return get(this.msgs, key);
  }

  // return the message keys as an array
  keysAsArray = () : any => {
    return keys(this.msgs);
  }

  // add a message to the list
  @action
  addMsg = (key: string, value : string | boolean = true) => {
    set(this.msgs, key, value);
  }

  // remove a message from the list
  @action
  removeMsg = (key: string) => {
    if (this.msgs[key] !== undefined) {
      remove(this.msgs, key);
    }
  }

  // clear the list
  @action
  clearMsgs = () => {
    if (!this.empty()) { 
      keys(this.msgs).forEach((k) => {
        remove(this.msgs, k);
      })
    }
  }
}
