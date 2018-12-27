'use strict'
import * as React from 'react';
import { observer, inject  } from 'mobx-react';
import { AboutModel } from '../about/AboutModel';
import FabControl from './FabControlComponent'

@inject('aboutModel')
@observer
class HelpButton extends React.Component<{   

  fPosition ?: string, // 'absolute | relative' 
                      // if 'absolute', host container must be positioned relative
  fBCSS ?: string,     // extra CSS for button
  aboutModel?: AboutModel
}, {} > {

  toggleAbout = () => {
    this.props.aboutModel.toggle();
  }

  render() {
    const fPosition = this.props.fPosition || 'absolute';
    const bCSS = this.props.fBCSS || '';

    return(
        <FabControl 
          fType       = "button"
          fLabel      = "Help"
          fLabelCSS   = "app-help-btn-label"
          fIcon       = "help_outline"
          fIconColor  = "app-help-btn-icon"
          fOnClick    = {this.toggleAbout}
          fButtonCSS  = {'py-0 ' + bCSS + (fPosition === 'absolute' ? ' app-help-btn-absolute' : ' app-help-btn')}
          fVertical   = {true}
          fExtraCSS   = "app-help-btn-container"
          fAria       = "help"
        />
    )
  }
}

export default HelpButton;