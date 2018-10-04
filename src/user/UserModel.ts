'use strict'
import { Profile } from '../profile/Profile';
import { observable, action } from 'mobx';
import { StringMsgList } from '../formTools/StringMsgList'

export const SHARED_USER_ID       = 'b6d96237-7b30-4d2a-838d-7e85d4bb8092';


 export class User {
    @observable userEmail       = '';
    @observable password        = '';
    @observable profile         : Profile = new Profile();
    @observable authData        : any;
    @observable messages        = new StringMsgList();
    @observable openToastTimer  = 0

    // set the userEmail property
    @action
    setUserEmail(value: string) {
      this.userEmail = value;
    }

    // set the password property
    @action
    setPassword(value : string) {
      this.password = value;
    }
    
    // set the authData property
    @action
    setAuthData(value: any) {
      this.authData = value;
    }
  
    // set the openToastTimer property
    @action
    setOpenToastTimer(value: number) {
      this.openToastTimer = value;
    }
       
    // return whether the current user is signed in
    get isSignedIn() {
      return !!this.authData;
    }

    // return whether the current user is using the shared user account
    get isSharedUser() : boolean {
      return (this.authData === SHARED_USER_ID);
    }
  }

