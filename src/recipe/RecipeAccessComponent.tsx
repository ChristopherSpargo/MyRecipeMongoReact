'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { RecipeSearch } from './RecipeSearchComponent'
import { RecipeMenu } from './RecipeMenuComponent'
import RecipeView from './RecipeViewComponent'
import { RecipeEntry }  from './RecipeEntryComponent'
import FormHeader from '../formTools/FormHeaderComponent'
import { UtilSvc } from '../utilities/UtilSvc';
import { CurrentRecipe } from './CurrentRecipeSvc';
import { RecipeSvc, CATEGORY_TABLE_NAME, ListTableItem } from './RecipeSvc';
import { Recipe } from './Recipe'
import { User, SHARED_USER_ID } from '../user/UserModel';
import { UserSvc } from '../user/UserSvc';

export const SEARCH_TAB     : number = 0;
export const SEARCH_TAB_ID  : string = 'searchTab';
export const MENU_TAB       : number = 1;
export const MENU_TAB_ID    : string = 'menuTab';
export const VIEW_TAB       : number = 2;
export const VIEW_TAB_ID    : string = 'viewTab';
export const EDIT_TAB       : number = 3;
export const EDIT_TAB_ID    : string = 'editTab';
 
// COMPONENT for Recipe Access

@inject('user', 'recipeSvc', 'stateService', 'utilSvc', 'currentRecipe', 'urlService', 'userSvc')
@observer
class RecipeAccess extends React.Component <{
  user?: User, recipeSvc?: RecipeSvc, stateService?: any, utilSvc?: UtilSvc, currentRecipe?: CurrentRecipe,
  urlService?: any, userSvc?: UserSvc
}, {} > {

  @observable activeTab : string = MENU_TAB_ID;

  @observable viewOpen         : boolean = false;
  @observable searchTabOpen    : boolean = false;
  @observable menuTabOpen      : boolean = false;
  @observable viewTabOpen      : boolean = false;
  @observable editTabOpen      : boolean = false;
  @observable recipesReady     : boolean = false;
  @observable working          : boolean = false;
  @observable viewShared       : boolean = false;
  @observable menuMessage      : string = '';
  @observable headerTitle      : string;
  @observable headerIcon       : string = 'search';
  @observable printMsg         : string = '';  // indicates to header component that print button should be present
  @observable currTabId        : string = '';
  tabNames         : string[] = [SEARCH_TAB_ID, MENU_TAB_ID, VIEW_TAB_ID, EDIT_TAB_ID];
  @observable printingRecipe   : boolean = false; // true if PRINT view of recipe is being displayed (for printing)
  @observable dataSet          : string = 'Personal'; // selection passed to SEARCH module to provide for
                                          // 'Search Shared Recipes' menu item
  @observable menuColumns      : number = 2;      // value passed to MENU module to control # of colums of menu items
  navPath          : string[] = [];   // stack of tabIds for processing the BACK button during recipe access
  adjNavPath       : boolean = false; // flag to keep from processing the calls to history.back() below
  backButtonHit    : boolean = false; // flag to keep from adding to navPath on BACK button use
  @observable pageIsScrolled   : boolean = false; // true if page has been scrolled vertically
 
  stateService  = this.props.stateService;
  urlService    = this.props.urlService;
  userInfo      = this.props.user;
  currentRecipe = this.props.currentRecipe;
  recipeSvc     = this.props.recipeSvc;
  utilSvc       = this.props.utilSvc;


  componentWillMount() {
    let authMsg   = 'signInToAccessRecipes';
    let helpContext = 'RecipeSearch';

    // now check how we got here
    switch (this.stateService.current.name) {        
      case 'searchMyRecipes':
        this.currTabId                = SEARCH_TAB_ID;
        this.headerTitle              = 'Search Personal Recipes';
        this.headerIcon               = 'search';
        this.currentRecipe.mode       = 'Review';
        this.dataSet                  = 'Personal';
        this.viewShared               = false;
        break;
      case 'searchSharedRecipes':
        this.currTabId                = SEARCH_TAB_ID;
        this.headerTitle              = 'Search Shared Recipes';
        this.headerIcon               = 'search';
        this.currentRecipe.mode       = 'Review';
        this.dataSet                  = 'Shared';
        this.viewShared               = true;
        break;
      case 'recipeEntry':
        this.currTabId                = EDIT_TAB_ID;
        this.currentRecipe.mode       = 'Create';       
        authMsg                       = 'signInToEnterRecipes' 
        helpContext                   = 'EnterRecipes'
        break;
      default:
    }
    // make sure the user is signed in
    if (!this.userInfo.authData) {
      this.utilSvc.returnToHomeMsg(authMsg);
    }
    this.utilSvc.setCurrentHelpContext(helpContext); // note current context
  }

  componentDidMount() {
    this.setMessageResponders();
    // initialize mode flags and the currentRecipe object
    this.currentRecipe.recipe       = undefined;
    this.currentRecipe.searchScrollPosition = 0;
    this.currentRecipe.menuScrollPosition = 0;
    this.currentRecipe.viewScrollPosition = 0;
    this.currentRecipe.editScrollPosition = 0;

    this.constructMenuMessage(0);          
    this.utilSvc.displayUserMessages();
    this.readListTables()
    .then(() => {
      // the next line will call open<id>Tab from the (tabChange) handler of the TABS element
      // this.searchTabOpen = this.currTabId === SEARCH_TAB_ID;
      this.selectTab(this.currTabId);
      this.viewOpen = true;
    })
    .catch(() => {
    })
  }

  componentWillUnmount() {
    this.deleteMessageResponders();
  }

  // set up the message responders for this module
  setMessageResponders() : void {
    document.addEventListener('setViewShared', this.setViewShared);
    document.addEventListener('selectViewTab', this.selectViewTab);
    document.addEventListener('selectMenuTab', this.selectMenuTab);
    document.addEventListener('selectEditTab', this.selectEditTab);
    document.addEventListener('selectSearchTab', this.selectSearchTab);
    document.addEventListener('searchUpdate', this.updateRecipeList);
    document.addEventListener('updateMenuTabLabel', this.updateMenuTabLabel);
    document.addEventListener('nextTab', this.nextTab);
    document.addEventListener('prevTab', this.prevTab);
    document.addEventListener('closeView', this.closeView);
    document.addEventListener('printBegin', this.printStart);
    document.addEventListener('printDone', this.printEnd);
    window.addEventListener('resize', this.checkScreenSize);
    window.addEventListener('popstate', this.handlePopState)
    window.addEventListener('scroll', this.handleScroll)
  }

  // remove all the message responders set in this module
  deleteMessageResponders() : void {
    document.removeEventListener('setViewShared', this.setViewShared);
    document.removeEventListener('selectViewTab', this.selectViewTab);
    document.removeEventListener('selectMenuTab', this.selectMenuTab);
    document.removeEventListener('selectEditTab', this.selectEditTab);
    document.removeEventListener('selectSearchTab', this.selectSearchTab);
    document.removeEventListener('searchUpdate', this.updateRecipeList);
    document.removeEventListener('updateMenuTabLabel', this.updateMenuTabLabel);
    document.removeEventListener('nextTab', this.nextTab);
    document.removeEventListener('prevTab', this.prevTab);
    document.removeEventListener('closeView', this.closeView);
    document.removeEventListener('printBegin', this.printStart);
    document.removeEventListener('printDone', this.printEnd);
    window.removeEventListener('resize', this.checkScreenSize);
    window.removeEventListener('popstate', this.handlePopState)
    window.removeEventListener('scroll', this.handleScroll)
  }

  // emit a custom event with the given name and detail data
  emit = (name: string, data? : any)  => {
    this.utilSvc.emitEvent(name, data);
  }

  // return whether page has been scrolled vertically
  handleScroll = () => {
    this.pageIsScrolled = this.utilSvc.pageYOffset() !== 0;
  }

  // primarily here to handle the BACK button.
  handlePopState = (evt: any) => {
    if (!this.adjNavPath && this.navPath.length) {
      this.backButtonHit = true;
      this.selectTab(this.navPath.pop());
    }
  }

  // simulate back button being hit or close if no history
  fakeBackButtonHit = () => {
    if (!this.adjNavPath && this.navPath.length) {
      window.history.back();
    } else {
      this.closeView();
    }
  }

  // check the size of the screen and set the number of columns for the recipes menu
  checkScreenSize = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      this.menuColumns = 3;
    } else {
      this.menuColumns = 2;
    }
  }

  printStart = () => {
    this.printingRecipe = true;
  }

  printEnd = () => {
    this.printingRecipe = false;
  }

  readListTables = () : Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      this.recipeSvc.getList(CATEGORY_TABLE_NAME, 
        this.viewShared ? SHARED_USER_ID : this.userInfo.authData.uid ) // read categories list
      .then((cList) => {
        this.currentRecipe.categoryList = cList;
        this.currentRecipe.categoryList.items = 
              cList.items.sort((a, b) : number => { return a.name < b.name ? -1 : 1; });
        if (!this.userInfo.profile.categoriesCreated) {
          this.userInfo.profile.categoriesCreated = true;  // update categoriesCreated flag if necessary
          this.props.userSvc.updateUserProfile(this.props.user)
          .then(() => { resolve('ok'); })
          .catch((error) => { resolve('ok'); }) 
        } else {
          resolve('ok');
        }
      })
      .catch((error) => {
        this.utilSvc.returnToHomeMsg('errorReadingList', 400, 'Categories');
        reject(error)
      })
    })
  }

  // update the viewShared property
  setViewShared = (evt: CustomEvent) => {
    if (this.viewShared !== evt.detail) {
      this.viewShared = evt.detail;
      this.headerTitle = this.viewShared ? 'Search Shared Recipes' : 'Search Personal Recipes';
      this.headerIcon = 'search';
      this.currentRecipe.recipe = undefined;
      this.currentRecipe.recipeList = undefined;
      this.updateMenuTabLabel();
      this.readListTables();
    }
  }

  // update the label on the MENU tab
  updateMenuTabLabel = () => {
    if (this.currentRecipe.recipeList !== undefined && this.currentRecipe.recipeList.length) {
      this.constructMenuMessage(this.currentRecipe.recipeList.length);
      this.recipesReady = true;
    } else {
      this.constructMenuMessage(0);
      this.recipesReady = false;
    }
  }

  // update recipeList information from currentRecipe service
  updateRecipeList = () => {
    this.updateMenuTabLabel();
    if (this.currentRecipe.recipeList === undefined) {
      this.working = true;
    } else {
      this.working = false;
      if (this.recipesReady) {
        this.checkScreenSize();
        this.currentRecipe.menuScrollPosition = 0;
        setTimeout( () => {
          this.selectMenuTab();
        }, 50);
      }
    }
  }

  constructMenuMessage = (recipes : number, msg? : string) => {
    if (msg !== undefined) {
      this.menuMessage = msg;
    } else {
      if (!recipes) {
        this.menuMessage = '0 RECIPES';
      }
      if (recipes === 1) {
        this.menuMessage = '1 RECIPE';
      }
      if (recipes > 1) {
        this.menuMessage =  recipes + ' RECIPES';
      }      
    }
  }

  // return the current recipe
  selectedRecipe() : Recipe {
    return (this.recipeSelected() ? this.currentRecipe.recipe : undefined);
  }

  // return whether there is a current recipe selection
  recipeSelected() : boolean {
    return (this.currentRecipe.recipe !== undefined);
  }

  // set view closed flag, wait for animation to complete before changing states to 'home'
  closeView  = () => {
    this.viewOpen = false;
    this.utilSvc.returnToHomeState(400);
  }

  toggleSortOrder = () => {
    if (this.menuTabOpen) {
      this.emit('reverseRecipeMenu');
    }
  }

  openSearchTab = () => {
      this.closeViewTab();
      this.closeMenuTab();
      this.closeEditTab();
      this.utilSvc.setCurrentHelpContext('RecipeSearch');
      this.printMsg = '';
      this.headerTitle = this.viewShared ? 'Search Shared Recipes' : 'Search Personal Recipes';
      this.headerIcon = 'search';
  }

  openEditTab = () => {
      this.closeViewTab();
      this.closeMenuTab();
      this.closeSearchTab();
      this.utilSvc.setCurrentHelpContext('EnterRecipes');
      this.printMsg = '';
      this.headerTitle = this.currentRecipe.recipe ? 'Update Recipe' : 'Add Recipe';
      this.headerIcon = 'edit';
  }

  openMenuTab = () => {
    if (this.recipesReady) {       // something to show?
      this.closeViewTab();
      this.closeSearchTab();
      this.closeEditTab();
      this.printMsg = '';
      this.headerTitle = this.viewShared ? 'Shared Recipes' : 'Personal Recipes';
      this.headerIcon = 'restaurant';
      this.utilSvc.setCurrentHelpContext('RecipesMenu');
    }
  }

  openViewTab = () => {
    if (this.selectedRecipe()) {   // something to show
      this.closeSearchTab();
      this.closeMenuTab();
      this.closeEditTab();
      this.printMsg = 'printRecipe';
      this.headerTitle = this.viewShared ? 'View Shared Recipe' : 'View Personal Recipe';
      this.utilSvc.setCurrentHelpContext('ViewRecipe');
      this.headerIcon = 'local_library';
    }
  }

  closeViewTab() : void {
    this.viewTabOpen = false;
  } 

  closeMenuTab() : void {
    this.menuTabOpen = false;
  } 

  closeSearchTab() : void {
    this.searchTabOpen = false;
  } 

  closeEditTab() : void {
    this.editTabOpen = false;
  } 

  // switch the selected tab id to VIEW_TAB_ID, this causes a call to openViewTab
  selectEditTab = () => {
    this.selectTab(EDIT_TAB_ID);
  }

  // switch the selected tab id to VIEW_TAB_ID, this causes a call to openViewTab
  selectViewTab = () => {
    this.selectTab(VIEW_TAB_ID);
  }

  // switch the selected tab id to MENU_TAB_ID , this causes a call to openMenuTab
  selectMenuTab = () => {
    this.selectTab(MENU_TAB_ID);
  }

  // switch the selected tab id to SEARCH_TAB_ID , this causes a call to openSearchTab
  selectSearchTab = () => {
    this.selectTab(SEARCH_TAB_ID);
  }

  // return the name data of the selected list's item with the given id
  listItemName = (list : ListTableItem[], id : number) : string => {
    var i;

    for (i = 0; i < list.length; i++) {
      if ( list[i].id === id) {
        return list[i].name ;      // id found at position i
      }
    }
    return 'Unknown';
  }

  tabChange = (activeId: string, nextId: string) => {
    let paths = {SEARCH_TAB_ID: '/recipes/search',
               MENU_TAB_ID:   '/recipes/menu',
               VIEW_TAB_ID:   '/recipes/view',
               EDIT_TAB_ID:   '/recipes/entry'
              };

    switch (activeId) {
      case SEARCH_TAB_ID:
        this.currentRecipe.searchScrollPosition = this.utilSvc.pageYOffset();
        break;
      case MENU_TAB_ID:
        this.currentRecipe.menuScrollPosition = this.utilSvc.pageYOffset();
        break;
      case VIEW_TAB_ID:
        this.currentRecipe.viewScrollPosition = this.utilSvc.pageYOffset();
        break;
      case EDIT_TAB_ID:
        this.currentRecipe.editScrollPosition = this.utilSvc.pageYOffset();
        break;
      default:
    }

    // now some code to manage the BACK button path (navPath)
    if (!this.backButtonHit && // skip all this if we're processing a BACK button use
        // only start a navPath from SEARCH or EDIT tabs
       (this.navPath.length || activeId === SEARCH_TAB_ID || activeId === EDIT_TAB_ID)) {
      
      // first, check if the target tab is in the BACK button path. That would mean the user used
      // the tab navigation bar to change tabs so we'll simulate enough BACK button presses to fix it.
      if (this.navPath.indexOf(nextId) !== -1) {
        this.adjNavPath = true;
        while (this.navPath.indexOf(nextId) !== -1) {
          this.navPath.pop();
          window.history.back();
        }
      } else {
        // user has navigated to a tab that needs to go in the BACK button path
        this.navPath.push(activeId);
        window.history.pushState({tab: activeId}, '', paths[nextId])
      }
    } else {
      document.getElementById(activeId).blur(); // remove :focus/:hover so underline goes away (CSS)
      this.backButtonHit = false;
    }

    switch (nextId) {
      case MENU_TAB_ID:
        this.currentRecipe.selectedTab = MENU_TAB;
        this.openMenuTab();
        this.waitAndScroll(MENU_TAB);
      break;
      case VIEW_TAB_ID:
        this.currentRecipe.selectedTab = VIEW_TAB;
        this.openViewTab();
        this.waitAndScroll(VIEW_TAB);
      break;
      case SEARCH_TAB_ID:
        this.currentRecipe.selectedTab = SEARCH_TAB;
        this.openSearchTab();
        this.waitAndScroll(SEARCH_TAB);
      break;
      case EDIT_TAB_ID:
        this.currentRecipe.selectedTab = EDIT_TAB;
        this.openEditTab();
        this.waitAndScroll(EDIT_TAB);
      break;
      default:
    }
  }

  // wait for the tab content to change and then scroll the new content to it's last position
  // wait for the tab change before scrolling the conent. 
  // Wait for the scroll to finish before making the content visible 
  waitAndScroll = (tabNum: number) => {
    setTimeout(() => {
      switch (tabNum) {
        case MENU_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.menuScrollPosition);
          setTimeout(() => {
            this.menuTabOpen = true;
          }, 100); // make sure the scroll is done
          break;
        case VIEW_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.viewScrollPosition);
          setTimeout(() => {
            this.viewTabOpen = true;
          }, 100); // make sure the scroll is done
          break;
        case SEARCH_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.searchScrollPosition);
          setTimeout(() => {
            this.searchTabOpen = true;
          }, 100); // make sure the scroll is done
          break;
        case EDIT_TAB:
          this.utilSvc.scrollToYPos(this.currentRecipe.editScrollPosition);
          setTimeout(() => {
            this.editTabOpen = true;
          }, 100); // make sure the scroll is done
          break;
        default:
      }
      this.adjNavPath = false;
    }, 50);    // make sure the tab switch is done       
  }

  // move to the next tab in the tab set
  nextTab = () => {
    if (this.currentRecipe.selectedTab < EDIT_TAB) {
      this.selectTab(this.tabNames[this.currentRecipe.selectedTab + 1]); // this causes call to tabChange()
    }
  }

  // move to the previous tab in the tab set
  prevTab = () => {
    if (this.currentRecipe.selectedTab > SEARCH_TAB) {
      this.selectTab(this.tabNames[this.currentRecipe.selectedTab - 1]); // this causes call to tabChange()
    }
  }

  // switch to the tab with the given id, causes a call to open[id]Tab
  selectTab = (nextTab : string) => {
    this.tabChange(this.activeTab, nextTab)
    this.activeTab = nextTab;
  }

  TabSetTab = (props) => {
    return(
      <li 
        className={'app-nav-item' + (props.disabled ? ' app-cursor-default' : ' app-cursor-pointer')} 
        id={props.id} 
        onClick={!props.disabled ? this.selectTab.bind(this, props.id) : undefined}
      >
        <div 
          className={'d-flex flex-row justify-content-center align-items-center app-nav-link' +
                (props.active ? ' active' : '') + (props.disabled ? ' app-disabled-text' : '')}
        >
          <div className="app-tab-title ml-1">{props.title}</div>
        </div>
      </li>
    )
  }

  render() {
    return(
      <div 
        className={'d-flex flex-column app-full-frame app-bg-white app-fade-in' +
                (this.viewOpen ? ' app-open' : '') +
                (this.printingRecipe ? ' app-no-display' : '')}
      >
      <div className="app-ht-100 app-position-relative">
        {/* Form Header */}

        <FormHeader       
          headerType      = "center" 
          headerIcon      = {this.headerIcon}
          headerTitle     = {this.headerTitle}
          headerTheme     = "app-recipes-header-theme"
          printMsg        = {this.printMsg}
          headerClose     = {this.fakeBackButtonHit}
        />
                          
        <div className="app-tabset-background"/>
        <div 
          className={'app-form-theme-transparent app-flex-1' +
                        (this.pageIsScrolled ? ' app-tabset-padding' : '') +
                        (this.viewTabOpen ? ' app-view-open' : '')}
        > 
          <div className="app-tabset app-tabset-theme">
            <ul className="d-flex flex-row justify-content-around align-items-center app-nav app-nav-tabs">
              <this.TabSetTab 
                id="searchTab" 
                title="SEARCH" 
                active={this.activeTab === SEARCH_TAB_ID}
              />
              <this.TabSetTab 
                id={MENU_TAB_ID} 
                title={this.menuMessage} 
                active={this.activeTab === MENU_TAB_ID}
                disabled={!this.recipesReady}
              />
              <this.TabSetTab 
                id={VIEW_TAB_ID} 
                title="VIEW" 
                active={this.activeTab === VIEW_TAB_ID}
                disabled={!this.recipeSelected()}
              />
              {!this.viewShared &&
              <this.TabSetTab 
                id={EDIT_TAB_ID} 
                title={this.recipeSelected() ? 'EDIT' : 'NEW'} 
                active={this.activeTab === EDIT_TAB_ID}
              />}
            </ul>
          </div>
          <div className="app-tab-content">
            <div className={'app-tab-pane' + (this.activeTab !== SEARCH_TAB_ID ? ' app-no-display' : '')}>
              <RecipeSearch 
                searchTabOpen={this.searchTabOpen} 
                viewShared={this.viewShared}
                dataSet={this.dataSet}
              />
            </div>
            <div className={'app-tab-pane' + (this.activeTab !== MENU_TAB_ID ? ' app-no-display' : '')}>
              <RecipeMenu 
                menuOpen={this.menuTabOpen} 
                viewShared={this.viewShared} 
                menuColumns={this.menuColumns} 
                constructMenuMessage={this.constructMenuMessage}
              />
            </div>
            <div className={'app-tab-pane' + (this.activeTab !== VIEW_TAB_ID ? ' app-no-display' : '')}>
              <RecipeView 
                viewTabOpen={this.viewTabOpen}
              />
            </div>
            <div className={'app-tab-pane' + (this.activeTab !== EDIT_TAB_ID ? ' app-no-display' : '')}>
              <RecipeEntry 
                editTabOpen={this.editTabOpen}
              />
            </div>
          </div>
        </div>
      </div>  
      </div>
    )
  }
}

export const searchMyRecipesState     = { name: 'searchMyRecipes', url: '/recipes',  
                                          component: RecipeAccess };
export const searcySharedRecipesState = { name: 'searchSharedRecipes', url: '/recipes',
                                          component: RecipeAccess };
export const recipeEntryState         = { name: 'recipeEntry', url: '/recipes',  
                                          component: RecipeAccess };

export default RecipeAccess;