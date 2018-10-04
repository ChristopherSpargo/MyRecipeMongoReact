  'use strict'
  import * as firebase from 'firebase/app';
  import 'firebase/database';
  import 'firebase/auth';

  // SERVICE to provide access to the Firebase database used for authentiction and storage of user profiles
  import { Profile } from '../profile/Profile'
  import { FB_API_KEY, FB_AUTH_DOMAIN, FB_DATABASE_URL } from './FireBaseConsts';
  
  export class FireBaseSvc {
  
  fbUsersRef : firebase.database.Reference;
  
    constructor() {

      var config = {
        apiKey: FB_API_KEY,
        authDomain: FB_AUTH_DOMAIN,
        databaseURL: FB_DATABASE_URL
      };
      
      firebase.initializeApp(config);
      
      this.fbUsersRef = firebase.database().ref('Organizer/Users');

      // this.fbRef = new Firebase('https://luminous-torch-895.firebaseio.com/');
      // this.fbUsersRef = new Firebase('https://luminous-torch-895.firebaseio.com/Organizer/Users');
    }
  
    // create a new user account using the given email and password
    // return a promise
    createAccount(userEmail: string, password: string) : Promise<any> {
      return new Promise((resolve, reject) => {
        firebase.auth().createUserWithEmailAndPassword(userEmail, password)
        .then(() => { resolve(firebase.auth().currentUser);
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
    // delete the account assosiated with the given email and password
    // return a promise
    deleteAccount() : Promise<any> {
      return new Promise((resolve, reject) => {
        let user = firebase.auth().currentUser;

        user.delete()
        .then(() => { resolve(user);
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
    // submit the given email and password for authentication
    // return a promise
    authWithPassword(userEmail: string, password: string) : Promise<any> {
      return new Promise((resolve, reject) => {
        firebase.auth().signInWithEmailAndPassword(userEmail, password)
        .then(() => { resolve(firebase.auth().currentUser);
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
    // request an email containing a reset code be sent to the given email address
    // return a promise
    resetPassword(userEmail: string) : Promise<any> {
      return new Promise((resolve, reject) => {
        firebase.auth().sendPasswordResetEmail(userEmail)
        .then(() => { resolve('Sent');
        })
        .catch((error) => { reject(error.code);
        })
      });
    }

    confirmPasswordReset(code: string, newPassword: string) : Promise<any> {
      return new Promise((resolve, reject) => {
        firebase.auth().confirmPasswordReset(code, newPassword)
        .then(() => { resolve('Ok');
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
    // change the password associated with the currentUser the given newPassword
    // return a promise
    changePassword(newPassword: string) : Promise<any> {
      return new Promise((resolve, reject) => {
        let user = firebase.auth().currentUser;
        user.updatePassword(newPassword)
        .then(() => { resolve('Changed');
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
    // change the email associated with the given email and password to the given newEmail
    // return a promise
    changeEmail(newEmail: string) : Promise<any> {
      return new Promise((resolve, reject) => {
        let user = firebase.auth().currentUser;
        user.updateEmail(newEmail)
        .then(() => { resolve('Changed');
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
    // read the profile for the user whose user id is contained in the given authData object
    // return a promise
    readUserProfile(authData : firebase.UserInfo) : Promise<any> {
      return new Promise((resolve, reject) => {
        this.fbUsersRef.child(authData.uid).child('Profile').once('value') 
        .then((snapshot : any) => {
          if (snapshot.exists()) {
            resolve(Profile.build(snapshot.val())); // resolve with Profile object containing the stored data
          } else {
            reject(null);
          }
        })
        .catch((err : any) => {
          reject(err);
        });
      });
    }
  
    // create a profile for the user whose id is contained in the given authData object 
    // using the given profile object
    // reurn a promise
    createUserProfile(authData : firebase.UserInfo, profile : Profile) : Promise<any> {
      return new Promise((resolve, reject) => {
        this.fbUsersRef.child(authData.uid).child('Profile').set(profile.getProfileProperties())
        .then(() => { resolve(profile);
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
    // update the profile for the given user using the given profile object
    // reurn a promise
    updateUserProfile(authData : firebase.UserInfo, profile: Profile) : Promise<any> {
      return new Promise((resolve, reject) => {
        this.fbUsersRef.child(authData.uid).child('Profile').update(profile.getProfileProperties())
        .then(() => { resolve(profile);
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
    // remove all data for the given user
    // return a promise
    removeUserProfile(authData : firebase.UserInfo) : Promise<any> {
      return new Promise((resolve, reject) => {
        this.fbUsersRef.child(authData.uid).remove()
        .then(() => { resolve('Ok');
        })
        .catch((error) => { reject(error.code);
        })
      });
    }
  
  }
  