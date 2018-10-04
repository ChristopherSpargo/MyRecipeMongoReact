'use strict'
// SERVICE to provide various functions needed for data storage/retreival
import { UtilSvc } from '../utilities/UtilSvc'
import { FireBaseSvc } from './FireBaseSvc'
import { RESTRICTION_WRITE } from '../profile/Profile';
import { User } from '../user/UserModel';


// ******************************************************************************
//  UserSvc provides functions associated with user accounts and profiles

export class UserSvc {

    constructor(private user: User, private fireBaseSvc: FireBaseSvc,
       private utilSvc: UtilSvc) {
    }

      // update the given user profile, return a promise
      // returns: promise
      updateUserProfile(user : User) {
        if (user.profile.hasRestriction(RESTRICTION_WRITE)) {
          this.utilSvc.setUserMessage('noWriteAccess');          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('NO_ACCESS: WRITE');
            }, 100);
          });
        }
        return this.fireBaseSvc.updateUserProfile(user.authData, user.profile);
      }

      // read the given user profile properties, return a profile
      // returns: promise
      readUserProfile(user : User) {
        return this.fireBaseSvc.readUserProfile(user.authData);
      }

      // read the given user profile properties, return a profile
      // returns: promise
      createUserProfile(user : User) {
        if (user.profile.hasRestriction(RESTRICTION_WRITE)) {
          this.utilSvc.setUserMessage('noWriteAccess');          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('NO_ACCESS: WRITE');
            }, 100);
          });
        }
        return this.fireBaseSvc.createUserProfile(user.authData, user.profile);
      }

      // delete the profile associated with the given user
      // returns: promise
      removeUserProfile(user : User)  {
        if (user.profile.hasRestriction(RESTRICTION_WRITE)) {
          this.utilSvc.setUserMessage('noWriteAccess');          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('NO_ACCESS: WRITE');
            }, 100);
          });
        }
        return this.fireBaseSvc.removeUserProfile(user.authData);
      }

      // delete the account associated with the given email and password
      // returns: promise
      deleteAccount() {
        if (this.user.profile.hasRestriction(RESTRICTION_WRITE)) {
          this.utilSvc.setUserMessage('noWriteAccess');          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('NO_ACCESS: WRITE');
            }, 100);
          });
        }
        return this.fireBaseSvc.deleteAccount();
      }

      // change the email associated with the given email and password
      // returns: promise
      changeEmail(currEmail : string, password : string, newEmail : string) {
        if (this.user.profile.hasRestriction(RESTRICTION_WRITE)) {
          this.utilSvc.setUserMessage('noWriteAccess');          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('NO_ACCESS: WRITE');
            }, 100);
          });
        }
        return this.fireBaseSvc.changeEmail(newEmail)
      }

      // create an account for the given email and password
      // returns: promise
      createAccount(email : string, password : string) {
        return this.fireBaseSvc.createAccount(email, password);
      }

      // verify there is an account for the given email and password
      // return a promise with credentials if successfull
      // returns: promise
      authWithPassword(email : string, password : string) {
        return this.fireBaseSvc.authWithPassword(email, password);
      }

      // have FireBase send a message with a temporary password to the given email
      // returns: promise
      resetPassword(email : string) {
        if (this.user.profile.hasRestriction(RESTRICTION_WRITE)) {
          this.utilSvc.setUserMessage('noWriteAccess');          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('NO_ACCESS: WRITE');
            }, 100);
          });
        }
        return this.fireBaseSvc.resetPassword(email);       
      }

      // change the password associated with the given email
      // returns: promise
      changePassword(newPassword : string) : Promise<any> {
        if (this.user.profile.hasRestriction(RESTRICTION_WRITE)) {
          this.utilSvc.setUserMessage('noWriteAccess');          
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject('NO_ACCESS: WRITE');
            }, 100);
          });
        }
        return this.fireBaseSvc.changePassword(newPassword);
      }

}