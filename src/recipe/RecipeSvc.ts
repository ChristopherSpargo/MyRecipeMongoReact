'use strict'
import { RecipeData, Recipe } from './Recipe';
import { UtilSvc } from '../utilities/UtilSvc';
import { CurrentRecipe } from './CurrentRecipeSvc';
import { RESTRICTION_WRITE } from '../profile/Profile';
import { User, SHARED_USER_ID } from '../user/UserModel';

export const CATEGORY_TABLE_NAME = 'categories';
export const RECIPE_TABLE_NAME   =    'recipes';

// define structure of list table items
export interface ListTableItem {
  id      : number;
  name    : string;
  disabled? : boolean;
}

// define structure for list tables
export interface ListTable {
  _id?    : string;
  userId  : string;
  nextId  : number;
  items   : ListTableItem[];
}

// define structure for recipe query params
export interface RecipeFilterData {
  recordId          ?: string;
  collectionOwnerId ?: string,
  title             ?: string,
  categories        ?: number[],
  keywords          ?: string,
  sortOrder         ?: string,
  checkEmail        ?: string,
  projection        ?: {}
}


export class RecipeSvc {
    // private apiUrl = 'http://localhost:4250/api/'
    private apiUrl = 'https://serve-mdb.appspot.com/api/'
    private recipesUrl = this.apiUrl + RECIPE_TABLE_NAME;

    constructor ( private utilSvc: UtilSvc, private userInfo: User,
            private currentRecipe: CurrentRecipe) {}

    // get('/api/recipes')
    getRecipes(filter: RecipeFilterData): Promise<void | RecipeData[]> {
      let queryStr = '';
      for (let item in filter) {
        if (filter.hasOwnProperty(item)) {
          switch (item) {
            case 'recordId':
              queryStr += queryStr.length ? '&' : '?';
              queryStr += 'id=' + filter.recordId;
              break;
            case 'collectionOwnerId':
              queryStr += queryStr.length ? '&' : '?';
              queryStr += 'u=' + filter.collectionOwnerId;
              break;
            case 'title':
            break;
            case 'categories':
              queryStr += queryStr.length ? '&' : '?';
              if (filter.categories!.length) {
                queryStr += 'c=' + filter.categories;
              }
              break;
            case 'keywords':
              queryStr += queryStr.length ? '&' : '?';
              queryStr += 'k=' + filter.keywords;
              break;
            case 'checkEmail':
              queryStr += queryStr.length ? '&' : '?';
              queryStr += 'ce=' + filter.checkEmail;
              break;
            case 'projection':
              queryStr += queryStr.length ? '&' : '?';
              queryStr += 'pr=' + JSON.stringify(filter.projection);
              break;
            case 'count':
              queryStr += queryStr.length ? '&' : '?';
              queryStr += 'ct=true';
              break;
          default:
          }
        }
      }

      return fetch(this.recipesUrl + queryStr)
      .then(response => response.json())
      .catch(error => {})
    }

    // post('/api/recipes[/:id]')
    saveRecipe(newRecipe: RecipeData): Promise<void | RecipeData> {
      let params = {
        body: JSON.stringify(newRecipe),
        mode: <RequestMode> 'cors',
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST'
      }

      return fetch(this.recipesUrl + (newRecipe._id ? ('/' + newRecipe._id) : ''), params)
      .then(response => response.json() as RecipeData)
      .catch(error => {});
    }

    // get('/api/recipes/:id') 
    getRecipe(getRecipeId: String): Promise<void | RecipeData> {
      return fetch(this.recipesUrl + '/' + getRecipeId)
      .then(response => response.json() as RecipeData)
      .catch(error => {});
    }

    // delete('/api/recipes/:id')
    updateRecipe(updateRecipeId: String, updateObj: any): Promise<void | number> {
      let params = {
        body: JSON.stringify(updateObj),
        mode: <RequestMode> 'cors',
        headers: {
          'content-type': 'application/json'
        },
        method: 'PUT'
      }

      return fetch(this.recipesUrl + '/' + updateRecipeId, params)
      .then(response => response.json())
      .catch(error => {});
    }

    // delete('/api/recipes/:id')
    deleteRecipe(delRecipeId: String): Promise<void | String> {
      let params = {
        mode: <RequestMode> 'cors',
        method: 'DELETE'
      }

      return fetch(this.recipesUrl + '/' + delRecipeId, params)
      .then(response => response.json())
      .catch(error => {});
  }

    // read the list from the given list table in the database
    // returns: promise
    // get('/api/<list>')
    readList(tableName: string, uid: string): Promise<any | ListTable[]> {
      return fetch(this.apiUrl + tableName + '?userId=' + uid)
      .then(response => response.json())
      .catch(error => {})
  }

      // write the given item to the given table in the database 
      // use /api/tableName[/:id]
      // returns: promise
    writeList(tableName: string, list: ListTable): Promise<any | string | ListTable> {
      if (this.userInfo.profile.hasRestriction(RESTRICTION_WRITE)) {
        this.utilSvc.setUserMessage('noWriteAccess');          
        return new Promise<string> ((resolve, reject) => {
          setTimeout(() => {
            reject('NO_ACCESS: WRITE');
          }, 100);
        });
      }
      let params = {
        body: JSON.stringify(list),
        mode: <RequestMode> 'cors',
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST'
      }

      return fetch(this.apiUrl + tableName + (list._id ? ('/' + list._id) : ''), params)
      .then(response => response.json())
      .catch(error => {});
  }

      // delete the selected item from the given table in the database 
      // returns: promise
    deleteList(tableName: string, listId: string) : Promise<any | string | String> {
      if (this.userInfo.profile.hasRestriction(RESTRICTION_WRITE)) {
        this.utilSvc.setUserMessage('noWriteAccess');          
        return new Promise<string> ((resolve, reject) => {
          setTimeout(() => {
            reject('NO_ACCESS: WRITE');
          }, 100);
        });
      }
      let params = {
        mode: <RequestMode> 'cors',
        method: 'DELETE'
      }

      return fetch(this.apiUrl + tableName + '/' + listId, params)
      .then(response => response.json())
      .catch(error => {});
  }

    // get the list of items from specified table
    // returns: promise
    getList(tableName : string, id : string) : Promise<ListTable | any> {
      
      return new Promise<ListTable | any>((resolve, reject) => {
        this.readList(tableName, id)
        .then((list) => {
          if (!list.length) {
            reject('INF - ' + tableName + ' not found');
          } else {
            resolve(list[0]);
          }
        })
        .catch((error) => {
          reject(error);
        })
      })
    }

    // save the specified list
    // returns: promise
    saveList(list : ListTable, tableName : string ) : Promise<ListTable | any> {
      return new Promise<ListTable | any>((resolve, reject) => {
        this.writeList(tableName, list)
        .then((newList) => {
          resolve(newList); })
        .catch((error) => {
          reject(error); })
      })
    }

    // Add or update the given list
    // return: promise
    updateList(tableName : string, item : ListTableItem, action : string, uid : string) {

      action = action || 'Add';

      if (action === 'Remove') { // check for item present in any recipes
        var filter : any = {
          id: uid,
          countOnly: true
        };
        switch (tableName) {
          case CATEGORY_TABLE_NAME:
            filter.categories = [item.id];
            break;
          default:
        }
      }
      return new Promise<any>((resolve, reject) => {
        this.getList(tableName, uid)
        .then((pList : ListTable) => {
          let tItems = pList.items;
          for (var i = 0; i < tItems.length; i++) {
            if (tItems[i].id === item.id) {
              break;
            }
          }
          if (i < tItems.length) {
            if (action === 'Update') {
              tItems[i] = item;          // Update item
            } else {
              tItems.splice(i, 1);       // Remove item
            }
          } else {
            item.id = pList.nextId++;    // assign next id value
            tItems.push(item);           // Add item
          }
          this.saveList(pList, tableName)
          .then((list) => {
            resolve(list); })
          .catch((notSaved) => {
            reject(notSaved); })
        })
        .catch((noTable) => { // no Table found
          if (/INF/.test(noTable) && action === 'Add') {
            this.saveList({userId: uid, nextId: 2, items: [item]}, tableName)
            .then((list) => {
              resolve(list); })
            .catch((notSaved) => {
              reject(notSaved); })
          } else {
            reject(noTable); }
        });
      })
    }

    // initialize the selected table
    // tableName = name of the table to initialize
    // uid       = login id of the current user
    initializeTable(tableName: string, uid: string) : Promise<any | ListTable> {
      let iList : ListTable = { 
            userId: uid,
            nextId: 23,
            items: [{id: 1, name: 'Dinner'}, {id: 2, name: 'Breakfast'},
              {id: 3, name: 'Lunch'}, {id: 4, name: 'Dessert'},
              {id: 5, name: 'Pastries'}, {id: 6, name: 'Meat'}, {id: 7, name: 'Mexican'},
              {id: 8, name: 'Appetizer'}, {id: 9, name: 'Entre'}, {id: 10, name: 'Side Dishes'},
              {id: 11, name: 'Holiday'}, {id: 12, name: 'Snack'}, {id: 13, name: 'Salads'}, 
              {id: 14, name: 'Fish'},
              {id: 15, name: 'Beef'}, {id: 16, name: 'Chicken'}, {id: 17, name: 'Pork'},
              {id: 18, name: 'Casseroles'}, {id: 19, name: 'Cookies'}, {id: 20, name: 'Bread'},
              {id: 21, name: 'Drinks'}, {id: 22, name: 'Gluten Free'}]
          };
      return this.saveList(iList, tableName);
    }

  // update the categories list by adding the given category
  // return the id of the resulting new entry
  addCategoryListItem = (cat: string) : Promise<number> => {
    let newId = this.currentRecipe.categoryList.nextId;
    let msg = 'Category \'' + cat + '\'';

    return new Promise<number>((resolve, reject) => {
      this.utilSvc.displayWorkingMessage(true, 'Updating Categories List');
      this.updateList(CATEGORY_TABLE_NAME, {id: 999, name: cat}, 'Add', this.userInfo.authData.uid)   // send the update
      .then((list) => {
        this.currentRecipe.updateCategoryList(list);
        this.currentRecipe.updateCategoryListItems( 
                list.items.sort((a, b) : number => { return a.name < b.name ? -1 : 1; }));
        this.utilSvc.setUserMessage('listItemAdded', msg);
        this.utilSvc.displayWorkingMessage(false);
        resolve(newId);
      })
      .catch((error) => {
        this.utilSvc.setUserMessage('errorUpdatingList', 'Categories');
        this.utilSvc.displayWorkingMessage(false);
        reject(0);
      });
    })
  }
  
  // remove database items associated with this user
  // return: Promise
  removeUserData(id : string) {
    var promises : any[]  = [];

    return new Promise((resolve, reject) => {

      // first, delete the categories list for this user
      this.getList(CATEGORY_TABLE_NAME, id)
      .then((cList: ListTable) => {
        this.deleteList(CATEGORY_TABLE_NAME, cList._id as string)
        .then((cListDeleted) => {
          // now read all this user's recipes but only retreive the object ids
          this.getRecipes({collectionOwnerId: id, projection: {_id: 1}})
          .then((data : RecipeData[]) => {
            data.forEach((r) => {
              // save a promise for each deleteRecipe request
              promises.push(this.deleteRecipe(r._id as string));
            });
            Promise.all(promises)       // wait till all are done (or 1 fails)
            .then((success) => {        // .finally would be nice because either way we're done
              resolve('Ok'); })
            .catch((error) => {
              reject('errorDeletingRecipes'); })
          })
          .catch((error) => {
            reject('errorReadingRecipes'); })
        })
        .catch((error) => {
          reject('errorDeletingCategories'); })
      })
      .catch((error) => {
        reject('errorReadingCategories'); })
    })
  }

  // store/update a copy of the given RecipeData to the database using the SHARED_USER_ID
  // if this is for an update, pass the restrictedTo array as well
  addSharedRecipe = (rdOrig : RecipeData, restrictedTo? : string[]) : Promise<any>  => {
    var rd : RecipeData; 

    return new Promise((resolve, reject) => {
      // make sure any extra images are included
      this.readExtraImages(rdOrig)
      .then((extraImagesRead) => {
        rd = Recipe.build(rdOrig).getRecipeData();  // copy recipe
        this.getList(CATEGORY_TABLE_NAME, SHARED_USER_ID)
        .then((cList) => {
          // replace the category ids with ones from the SHARED_USER's category list
          for (let i = 0; i < rd.categories!.length; i++) {
            rd.categories![i] = this.getSharedListItemId(<ListTable> cList, 
                                      this.currentRecipe.categoryListName(rd.categories![i]));
          }

          rd.submittedBy = rdOrig.userId;   // note who shared it (the owner)
          rd.userId = SHARED_USER_ID;       // will be accessable under SHARED_USER_ID collection

          // the next line so it works if this is an update of shared copy
          rd._id = rdOrig.sharedItem_id ? rdOrig.sharedItem_id : undefined;    

          rd.sharedItem_id = undefined;     // shared copies don't have this property
          if (restrictedTo) {
            rd.restrictedTo = restrictedTo; // set authorized users list if update
          }
          this.saveRecipe(rd)     // save shared version
          .then((sharedVersion : RecipeData) => {
            this.saveList(cList, CATEGORY_TABLE_NAME) // save updated SHARED categories list
            .then((categoryListUpdated) => {
              resolve(sharedVersion);            
            })
            .catch((failToSaveCategoryList) => {
              reject('errorUpdatingCategoryList');
            })
          })
          .catch((failToSaveSharedRecipe) => {
            reject('errorUpdatingSharedCopy');
          })
        })
        .catch((failToReadCategoryList) => {
          reject('errorReadingCategoryList');
        })
      })
      .catch((failReadingExtraImages) => {
        reject('errorReadingExtraImages')
      })
    })
  }

  // check 'list' for given name, return id if found otherwise add name to list and use nextId value
  getSharedListItemId = (list : ListTable, iName : string) => {
    var i     : number;
    var newItem = <ListTableItem> {};

    for (i = 0; i < list.items.length; i++) {   // see if name already in list
      if (iName === list.items[i].name) {
        return list.items[i].id;
      }
    }
    // name not found, add a new entry to SHARED items list
    newItem.id = list.nextId++;   // use nextId number (multi-user <bug>)
    newItem.name = iName;
    list.items.push(newItem);     

    return newItem.id;
  }

  // read extra images for given recipeData (if necessary)
  // resolve(updated recipeData) if images read successfully
  // resolve(null) if no need to read anything
  // reject(null) if error read error  
  readExtraImages = (r: RecipeData) => {
    let filter = <RecipeFilterData> {};

    return new Promise((resolve, reject) => {
      if (r.numExtras && !r.extraImages!.length) {
        filter.recordId = r._id;
        filter.projection = {extraImages: 1};
        this.getRecipes(filter)
        .then((data : RecipeData[]) => {
          r.extraImages = data[0].extraImages!.slice();
          resolve(r)
        })
        .catch((errorReadingExtraImages) => {
          reject(errorReadingExtraImages);
        })
      } else {
        resolve(undefined);    // no extra images or already read
      }
    })
  }

}