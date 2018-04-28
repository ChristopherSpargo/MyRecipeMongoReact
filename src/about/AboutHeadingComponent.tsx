'use strict';
import * as React from 'react';

class AboutHeading extends React.Component<{ 
  fText        ?: string,  // text for the heading
  fColor       ?: string,  // CSS class for the text color
  fImage       ?: string,  // source for an image to display before the text
  fIcon        ?: string,  // icon to display before the text
  fIconColor   ?: string,  // CSS class for color of icon to display before the text
  fButton      ?: string,  // text to display on a button
  fButtonCSS   ?: string,  // CSS class for button color
  fSwapColors  ?: boolean, // true if swap text and background colors on button type heading
  fDivider     ?: boolean  // 'true' for full divider line above title
  }, {} > {

  render() {
      // set some defaults 
      const textColor   = this.props.fSwapColors ? ' app-primary ' : ' app-white ';
      const bgColor     = this.props.fSwapColors ? ' app-bg-white px-0 mt-1 mb-0' : ' app-bg-primary mb-1 mt-2';
      const fColor      = this.props.fColor      || 'app-darkslategray';
      const fIconColor  = this.props.fIconColor  || 'app-about-icon-color';
      const fDivider    = this.props.fDivider    || false;
      const fButtonCSS  = this.props.fButtonCSS  || '';
     
    return (
      <div className="mt-3">
        {fDivider && <div className="app-about-text-divider"/>}
        {this.props.fButton &&
        <button className={'btn btn-sm app-about-heading-btn py-0' + bgColor + fButtonCSS} >
          <div className="d-flex flex-row justify-content-center align-items-center app-bigger-font">
            <i className={'material-icons app-fab-icon-sm' + textColor}>{this.props.fIcon}</i> 
            <div className={'mx-1' + textColor}>{this.props.fButton}</div>
          </div>       
        </button>}
        {!this.props.fButton &&
        <div className={'d-flex flex-row align-items-center app-about-heading-text mt-4 ' + fColor}>
          {this.props.fIcon &&
          <i className={'material-icons app-about-icon ' + fIconColor}>{this.props.fIcon}</i>}
          {this.props.fImage &&
          <img className="app-about-icon" src={this.props.fImage}/>}
          <div className="app-underlined">{this.props.fText}</div>
        </div>}
      </div>

    )
  }
}

export default AboutHeading