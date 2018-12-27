'use strict'
import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { AboutModel } from '../about/AboutModel'
import { UtilSvc } from '../utilities/UtilSvc'
import HelpButton from './HelpButtonComponent'
import FabControl from './FabControlComponent'

@inject('utilSvc', 'aboutModel')
@observer
class FormHeader extends React.Component<{   
  headerIcon         ?: string,   // icon for header
  headerTitle        ?: string,   // title string for header
  headerTheme        ?: string,   // CSS style for header
  headerTextColor    ?: string,   // CSS style for header text color
  closeButtonTheme   ?: string,   // CSS style for close button
  appBarItems        ?: any[],    // array of menu button objects for title bar
  headerType         ?: string,   // differentiates different header configurations
  closeLabel         ?: string,   // text to use for the close button
  headerClose        ?: Function, // link to closeForm function of form's controller
  printMsg           ?: string,   // message to emit if print icon present and clicked
  btnPositioning     ?: string,   // CSS selector for positioning of help and exit buttons
  showHelp           ?: boolean,  // flag to switch title icon to help icon
  utilSvc            ?: UtilSvc,
  aboutModel         ?: AboutModel
}, {} > {


  // emit a custom event with the given name and detail data
  public emit = (name: string, data? : any)  => {
    this.props.utilSvc.emitEvent(name, data);
  }

  printFunc = (msg: string) => {
    this.emit(msg);
  }

  toggleAbout = () => {
    this.props.aboutModel.toggle();
  }

  appBarItemSelected = event => {
    this.emit(event.currentTarget.id);
  }

  // close the About panel
  closeForm = event => {
    this.props.headerClose();
  }


  render() {

  // set some defaults
    const printMsg           = this.props.printMsg;
    const headerTitle        = this.props.headerTitle;
    const headerTheme        = this.props.headerTheme;
    const headerTextColor    = this.props.headerTextColor  || 'app-white';
    const appBarItems        = this.props.appBarItems;
    const headerType         = this.props.headerType;
    const headerClose        = this.props.headerClose;
    const btnPos             = this.props.btnPositioning   || '';
  

    return(
      <div className="app-noscroll-frame-center"> 
        <div className={headerTheme}>
          <div className=" d-flex flex-row app-form-header-padding ">
            <div className="d-flex flex-row justify-content-start align-items-center">
              <div 
                className={`d-flex flex-row justify-content-start align-items-center 
                              app-scroll-form-header-icon ` + btnPos}
              >
                <button 
                  type="button" 
                  className={'btn d-flex flex-row align-items-center app-form-image-button app-visible'} 
                  aria-label="help"
                  data-toggle="tooltip" 
                  data-placement="top" 
                  title="Help" 
                  data-delay="200"
                > 
                  <i 
                    className={'material-icons app-fab-icon-smm app-header-title-icon ' + 
                            headerTextColor +  ' app-visible'} 
                    onClick={this.closeForm}
                  >arrow_back
                  </i>
                </button>
              </div>
              <div 
                className="d-flex flex-row justify-content-start align-items-center 
                            app-flex-1 app-scroll-form-header-title"
              >
                <div className="d-flex app-form-title">{headerTitle}</div>
                {appBarItems && 
                <div> 
                  {appBarItems.map((item) =>
                    <button 
                      key={item.action} 
                      type="button" 
                      className="btn app-bar-feature-button" 
                      id={item.action}
                      data-toggle="tooltip" 
                      data-placement="top" 
                      title={item.tip} 
                      data-delay="200"
                      onClick={this.appBarItemSelected}
                    >
                      <i className={'material-icons app-bar-feature-icon ' + headerTextColor}>{item.icon}</i>
                    </button> )}
                </div>}
              </div>
            </div>
            {(headerClose && (headerType !== 'simple')) && 
            <div className="d-flex flex-row justify-content-end align-items-end app-flex-1 mr-1">
              <div 
                className={`d-flex flex-row justify-content-center 
                              align-items-center app-scroll-form-header-end-ctrls app-help-top`}
              >
                {printMsg && 
                <FabControl
                  fType       = "button"
                  fFab        = {true}
                  fTip        = "Print this Recipe"
                  fOpen       = {true}
                  fButtonCSS  = "d-flex app-print-fab app-bg-transparent app-link-btn"
                  fDelay      = {0}
                  fAria       = "print"
                  fIcon       = "print"
                  fIconCSS    = "app-print-fab-icon"
                  fOnClick    = {this.printFunc}
                  fParam      = {printMsg}
                  fIconColor  = "app-white"
                />}
                  <HelpButton 
                    fPosition="relative" 
                  />
              </div>
            </div>}
          </div>
        </div>
      </div>
    );
  }
}

export default FormHeader