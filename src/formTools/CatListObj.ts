'use strict'
import { observable, action } from 'mobx';
import { StringMsgList } from './StringMsgList'


// Class used with CheckboxMenuComponent

export class CatListObj {
  @observable cats: number[] = []; 
  @observable errors = new StringMsgList();
  touched: boolean = false;
  invalid: boolean = false;

  // return how manu categories are in the list
  numCats = () : number => {
    return this.cats.length;
  }
  
  // return whether any categories have been assigned to this recipe
  haveCats = () : boolean => {
    return this.cats.length !== 0;
  }

  // clear the categories list
  @action
  clear = () => {
    this.cats = [];
    this.check();
  }

  // add the given category from the categories list
  @action
  addCat = (cat: number) => {
    this.cats.push(cat);
    this.touched = true;
    this.check();
}

  // remove the given category from the categories list
  @action
  removeCat = (cat: number) => {
    var i;

    if (cat !== undefined) {
      i = this.cats.indexOf(cat);
      if (i !== -1) {
        this.cats.splice(i, 1);      // id found
        this.touched = true;
        this.check();
      }
    }
  }
  
  // validation check for categories object
  @action
  check = () => {
    if (!this.haveCats()) {
      this.errors.addMsg('valueMissing');
      this.invalid = true;
    } else {
      if (this.cats.length > 10) {
        this.errors.addMsg('maxExceeded');
        this.invalid = true;
      } else {
        this.errors.clearMsgs();
        this.invalid = false;
      }
    }
  }

}

