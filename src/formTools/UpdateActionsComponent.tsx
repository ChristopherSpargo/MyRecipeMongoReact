'use strict'
import * as React from 'react';
import { observer } from 'mobx-react';
import FabControl from './FabControlComponent';
import HelpButton from './HelpButtonComponent';

// Provide SAVE, ADD and DELETE buttons (usually at the end of a form)

@observer
class UpdateActions extends React.Component<{

  fIcon        ?: string,    // explicit icon to use for submit button
  fOnSave      ?: Function,  // called by the add/save fab
  fType        ?: string,    // button/submit
  fDeleteCheck ?: boolean,   // true if delete button should be shown
  fOnDelete    ?: Function,  // called by a delete fab when fDeleteCheck is true
  fAddCheck    ?: boolean,   // true if add button should be shown
  fDisabled    ?: boolean,   // true if button disabled
  fLabels      ?: boolean,   // true if create small fabs with labels
  fALabel      ?: string,    // text to put in the label of an Add button if labels in use
  fSLabel      ?: string,    // text to put in the label of a Save button if labels in use
  fRLabel      ?: string,    // text to put in the label of a Remove button if labels in use
  fBgColor     ?: string,    // color for background
  fButtonCSS   ?: string,    // CSS for Buttons
  fIconColor   ?: string,    // color for button icons
  fLabelCSS    ?: string,    // CSS for label on buttons
  fHelpBtn     ?: boolean,   // true if show a help button at left of area
  fColorSwap   ?: boolean    // true if swap default color scheme
},  {} > {

  render() {
    const defBgColor = this.props.fColorSwap ? 'app-bg-white' : 'app-bg-primary';
    const defTextColor = this.props.fColorSwap ? 'app-primary' : 'app-white';
    const defaultIcon = this.props.fAddCheck ? 'add_circle_outline' : 'check_circle_outline';
    const bType     = this.props.fType    || 'submit';
    const aLabel    = this.props.fALabel  || 'Add';
    const sLabel    = this.props.fSLabel  || 'Save';
    const rLabel    = this.props.fRLabel  || 'Remove';
    const helpBtn   = this.props.fHelpBtn || true;
    const bgColor   = this.props.fBgColor || defBgColor;
    const btnCSS    = this.props.fButtonCSS + ' app-fab-sm-sq';
    const iconColor = this.props.fIconColor || defTextColor;
    const labelCSS  = this.props.fLabelCSS || defTextColor;


    return (
      <div 
        id="actions" 
        className={`d-flex flex-row justify-content-center align-items-center 
                app-pos-relative pb-2 ` + bgColor}
      >
        {helpBtn && <HelpButton/>}
        {(!this.props.fDeleteCheck || (this.props.fOnDelete !== undefined)) &&
        <FabControl 
          fAria       ={(this.props.fAddCheck ? aLabel : sLabel)} 
          fType       ={bType}
          fDisabled   ={this.props.fDisabled} 
          fOnClick    ={this.props.fOnSave}
          fLabel      ={this.props.fLabels ? (this.props.fAddCheck ? aLabel : sLabel) : ''} 
          fButtonCSS  ={btnCSS + (this.props.fDeleteCheck ? ' mr-4' : '')}
          fIconColor  ={iconColor} 
          fLabelCSS   ={labelCSS}
          fIcon       ={this.props.fIcon || defaultIcon}
        />}
        {this.props.fDeleteCheck &&
        <FabControl 
          fAria       ="remove" 
          fDisabled   ={this.props.fDisabled} 
          fType       ="button"
          fButtonCSS  ={btnCSS} 
          fLabelCSS   ={labelCSS}
          fLabel      ={this.props.fLabels ? rLabel : ''} 
          fOnClick    ={this.props.fOnDelete}
          fIcon       ={this.props.fIcon || 'remove_circle_outline'} 
          fIconColor  ={iconColor}
        />}
      </div>
    )
  }
}

export default UpdateActions;