'use strict'
import { observable } from 'mobx';

export class MainMenuModel {
  @observable recipesMenuOpen   = false;
  @observable accountMenuOpen   = false;
  @observable aboutMenuOpen     = false;
  @observable mainMenuOpen      = false;

  // cause the slide menu to open/close
  toggle() {
    this.mainMenuOpen = !this.mainMenuOpen;
  }
  
  // make sure the slide menu is open
  open() : void {
    this.mainMenuOpen = true;
  }

  // make sure the slide menu is closed
  close() : void {
    this.mainMenuOpen = false;
  }
  
  // change the open status of the selected submenu of the slide menu
  toggleSub (menu: string) : void {
    switch (menu) {
      case 'Recipe':
        this.aboutMenuOpen = false;
        this.accountMenuOpen = false;
        setTimeout( () => {
          // @ts-ignore
          this.toggleRecipes();
        }, 100);
        break;
      case 'Account':
        this.aboutMenuOpen = false;
        this.recipesMenuOpen = false;
        setTimeout( () => {
          // @ts-ignore
          this.toggleAccount();
        }, 100);
        break;
      case 'About':
        this.accountMenuOpen = false;
        this.recipesMenuOpen = false;
        setTimeout( () => {
          // @ts-ignore
          this.toggleAbout(); // haven't figured out how to use Flow for setTimeout yet.????
        }, 100);
        break;
      case 'None':
        this.aboutMenuOpen = false;
        this.accountMenuOpen = false;
        this.recipesMenuOpen = false;
        break;
      default:
    }
  }
    
  // cause the Recipes submenu to open/close
  toggleRecipes() : void {
    this.recipesMenuOpen = !this.recipesMenuOpen;
  }

  // cause the Recipes submenu to open/close
  toggleAccount() {
    this.accountMenuOpen = !this.accountMenuOpen;
  }
  
  // cause the Recipes submenu to open/close
  toggleAbout() {
    this.aboutMenuOpen = !this.aboutMenuOpen;
  }

  // return open status of the slideMenu
  get isOpen() : boolean {
    return this.mainMenuOpen;
  }

  // return the open status of the selected submenu
  isOpenSub (name: string) : boolean {
    switch (name) {
      case 'Recipe':
        return this.recipesMenuOpen;
      case 'Account':
        return this.accountMenuOpen;
      case 'About':
        return this.aboutMenuOpen;
      default:
        return false;
    }
  }

}

