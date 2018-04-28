'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { CatListObj } from './CatListObj'
import { FieldErrorMsgs, FieldErrorMsg } from './FieldErrorsComponent';
import { StringMsgList } from './StringMsgList'
import FabControl from './FabControlComponent';

@inject()
@observer
class CheckboxMenu extends React.Component<{

  fTitle       ?: string,     // title for the menu
  fMessage     ?: string,     // message to display with menu
  fOnChange    ?: Function,   // function to execute when any checkbox changes
  fOnSave      ?: Function,   // function to execute on SAVE button
  fItems       ?: any[],      // list of all items {id: number, name: string}
  fCatList     ?: CatListObj, // CatListObj to use for this menu
  fOpenMsg     ?: string,     // message to listen for to open the menu
  fAllowNew    ?: boolean,    // true if user can add item to menu
  fUpdateFn    ?: Function    // function to call to update the cat list (add new cat)
}, {} > {

  newCatCheckedRef: any;      // reference to checkbox field for new category
  newCatValueRef: any;        // reference to value field for new category

  fMsgs: FieldErrorMsg[] = [];
  @observable errorStatus = new StringMsgList();

  @observable selectedItems : boolean[] = [];
  selectList    : any[]     = [];
  @observable menuOpen      : boolean   = false;
  @observable menuHidden    : boolean   = true;
  @observable newCat        : string    = '';
  newCatNew     : boolean   = false;
  @observable newCatSelected: boolean   = false;
  @observable selectionsAdded: boolean  = false;


  componentDidUpdate() : void {
    document.addEventListener(this.props.fOpenMsg, this.openMenu);  // listen for the given message
  }

  componentWillUnmount() : void {
    document.removeEventListener(this.props.fOpenMsg, this.openMenu); // destroy this listener
  }

  // open the category selection list
  openMenu = () => {
    this.filterCategoryList();    // creates selectList from fItems - fCatList.cats
    this.selectedItems.length = this.selectList.length; // allow a flag for each category
    this.selectedItems.fill(false); // set 'selected' flags to false
    observable(this.selectedItems);

    // turn off scrolling on the body while the menu is open so the menu can scroll but not the body
    document.body.style.overflowY = 'hidden';
    this.menuOpen = true;
    this.menuHidden = false;
  }

  // close the category selection list
  closeMenu = () => {
    document.body.style.overflowY = '';  // enable body scrolling
    if (this.props.fAllowNew) {
      this.newCat = '';
      this.newCatValueRef.value = '';
      this.newCatSelected = false;
      this.newCatCheckedRef.checked = false;     
    }
    this.clearItemInListError();
    this.menuOpen = false;
    setTimeout(() => { // wait for fade-out before changing z-index
      this.selectionsAdded = false;
      this.menuHidden = true;
    }, 700);
  }

  // add the selected items to the category selections
  addSelections = () => {
    this.selectionsAdded = true;
    if (this.newCatOk()) {
      this.props.fUpdateFn(this.newCat) // update categories list and return id for new category
      .then((id) => {
        if (this.newCatSelected) {
          this.props.fCatList.addCat(id);       // add new category selection to list
          this.finishAdd(true);
        } else {
          this.finishAdd(false);
        }       
      })
      .catch((error) => {
        this.finishAdd(false);
      });
    } else {
      this.finishAdd(false);
    }
  }

  // finish adding items to category selections
  finishAdd = (added : boolean) => {
    for (let i=0; i < this.selectedItems.length; i++) {
      if (this.selectedItems[i]) {
        this.props.fCatList.addCat(this.selectList[i].id);     // add selection to list
        added = true;                                   // note something was added
      }
    }
    // if(added){ this.props.fCatListChange.emit(this.props.fCatList); }  // send update message if necessary
    this.closeMenu();
    if (this.props.fOnSave) { this.props.fOnSave(added); }
  }

  // strip out the categories already present and sort the list
  filterCategoryList = () : void => {
      this.selectList = this.props.fItems.filter(this.categoryFilter).sort(this.categorySort);
  }

  // use this filter to create a menu of categories that doesn't include the ones already selected
  categoryFilter = (value) : boolean => {
    return (this.props.fCatList.cats.indexOf(value.id) === -1);
  }

  // use this as the categoryList sort compare function to sort ascending by name
  categorySort = (a, b) : number => { return a.name < b.name ? -1 : 1; }

  checkNewCat = () => {

    // report an error if new category is already in the categories list
    if (this.catInList(this.newCat)) {
      this.props.fCatList.errors.addMsg('itemInList');
      this.props.fCatList.touched = true;
      this.props.fCatList.invalid = true;
      this.newCatNew = false;
    } else {
      this.clearItemInListError();
      this.newCatNew = true;
    }
  }

  clearItemInListError = () => {
    if (this.props.fCatList.errors && this.props.fCatList.errors.hasMsg('itemInList')) {
      this.props.fCatList.errors.removeMsg('itemInList');   // remove this message
    }
    this.props.fCatList.touched = true;
    this.props.fCatList.invalid = !this.props.fCatList.errors.empty();
  }

  catInList = (cat: string) : boolean => {
    for (let i=0; i < this.props.fItems.length; i++) {
      if (this.props.fItems[i].name === cat) { return true; }
    }
    return false;    // not found
  }

  newCatOk = () => {
    return this.newCat !== '' && this.newCatNew;
  }

  closeClicked = evt => {
    this.closeMenu();
  }

  newCatBlur = evt => {
    this.newCat = evt.currentTarget.value;
    this.newCat = this.newCat.toLowerCase();
    this.newCat = this.newCat.replace(/\b[a-z]/g,
                     (x : string) : string => { return x.charAt(0).toUpperCase() + x.substr(1); })
    evt.currentTarget.value = this.newCat;
    this.checkNewCat();
  }

  newCatClicked = evt => {
    this.newCatSelected = evt.currentTarget.checked;
  }

  toggleItem = (i: number, evt: any) => {
    this.selectedItems[i] = !this.selectedItems[i];
  }

  render() {
    return(
      <div>
        {/* define a backdrop container for click-outside-to-close functionality for the menu */}
        {this.menuOpen && 
        <div className="app-click-to-close-about" onClick={this.closeClicked}/>}
              
        {/* container for menu */}
        <div 
          className={`d-flex flex-column app-catList-container app-fade-in
                    app-whiteframe-2dp app-card-corners mb-1` + 
                    (this.menuOpen ? ' app-open' : '') +
                    (this.menuHidden ? ' app-z--5' : '')}
        >
      
        {/* menu header area */}
          <div className="app-card-top-corners">
            <div className="app-catlist-header-theme app-card-top-corners">
                <div className="d-flex flex-row justify-content-around align-items-center">
                  {this.props.fTitle}
                </div>
            </div>
          </div> 
      
          {/* list of menu items */}
          <div className="app-catlist-body-theme app-scroll-frame-left">
            {this.props.fItems &&
            <div className="d-flex flex-column">
              <div className="app-catlist-label mb-1">{this.props.fMessage}</div>
              {this.props.fAllowNew && 
              <div>         
                <div className="d-flex flex-row justify-content-start align-items-center app-cursor-pointer mb-1">
                  <input 
                    type="checkbox" 
                    disabled={!this.newCatOk() ? true : undefined} 
                    ref={input => this.newCatCheckedRef = input}
                    className={'app-mb--2 mr-1' + (this.newCatOk() ? 'app-cursor-pointer' : 'app-cursor-default')} 
                    onChange={this.newCatClicked}
                  />
                  <input 
                    type="text" 
                    name="newCat" 
                    id="newCatID"
                    className="app-form-input app-catlist-menu-item"
                    ref={input => this.newCatValueRef = input}
                    placeholder="new category"
                    maxLength={200}
                    onBlur={this.newCatBlur}
                  />
                </div>
                <div 
                  className={'app-catlist-menu-item-message' +
                      (this.props.fCatList.touched ? ' app-visible' : ' app-invisible')}
                >
                  <FieldErrorMsgs fMsgs={this.fMsgs} eList={this.props.fCatList.errors}/>
                    <FieldErrorMsg key="itemInList" fMsgs={this.fMsgs} name="itemInList">
                          Category already in list.
                    </FieldErrorMsg>
                </div>
              </div>}
              {this.selectList.map((item, i) => // items in selectList are: {id: number, name: string}
                <div key={i} className="d-flex flex-row align-items-center">
                  <label className="app-flex-1 app-cursor-pointer mb-1">
                    <input type="checkbox" checked={this.selectedItems[i]} onClick={this.toggleItem.bind(this, i)}/>
                    {item.name}
                  </label>          
                </div>)}
            </div>}
          </div>
      
          {/* footer with action buttons */}
          <div 
            className={`d-flex flex-row app-flex-1 justify-content-around align-items-center 
                      app-catlist-footer-theme app-card-bottom-corners`}
          >
            <FabControl 
              fType       = "button"
              fLink       = "Cancel"
              fOnClick    = {this.closeMenu}
              fButtonCSS  = "app-white"
              fLabelCSS   = "app-bigger-font"
              fAria       = "cancel"
            />
            <FabControl 
              fType       = "button"
              fLink       = "Ok"
              fDisabled   = {this.selectionsAdded}
              fOnClick    = {this.addSelections}
              fButtonCSS  = "app-white"
              fLabelCSS   = "app-bigger-font"
              fAria       = "Save"
            />
          </div>
        </div>  
      </div>
    )
  }
}

export default CheckboxMenu;