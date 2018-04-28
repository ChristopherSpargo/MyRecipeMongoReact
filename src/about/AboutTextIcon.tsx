'use strict';
import * as React from 'react';

class AboutTextIcon extends React.Component<{ 
    fIcon?: string,       // name of the icon
    fColor?: string,      // CSS class to use for icon color 
    fSize?: string,       // icon size: S, L, XL
    fBtn?: boolean,       // 'true' if display icon on a button
    fFab?: boolean,       // 'true' if display icon as a fab 
    fLabel?: string,      // label to go with icon
    fLabelCSS?: string,   // CSS to be applied to the label only
    fReverse?: boolean,   // true if label goes before icon
    fExtraCSS?: string    // CSS applied to main div
  }, {} > {


  render() {
      // set some defaults 
      const fIcon      = this.props.fIcon;
      const fColor     = this.props.fColor      || 'app-about-icon-color';
      const fSize      = this.props.fSize       || 'S';
      const fBtn       = this.props.fBtn        || false;
      const fFab       = this.props.fFab        || false;
      const fLabel     = this.props.fLabel      || '';
      const fLabelCSS  = this.props.fLabelCSS   || '';
      const fReverse   = this.props.fReverse    || false;
      const fExtraCSS  = this.props.fExtraCSS   || 'app-about-text-icon-label';
     
    return (
      <div className="d-inline-flex flex-row mx-1">
        {!fFab &&
        <div 
          className={'d-inline-flex flex-row justify-content-center align-items-center ' + 
                        fExtraCSS + (fBtn ? ' app-about-text-icon-btn' : '')}
        >
          {(fLabel && fReverse) && <div className={'mr-1 ' + fLabelCSS}>{fLabel}</div>}
          {fIcon && 
          <i 
            className={'material-icons ' + fColor +
                (fSize === 'XL' ? ' app-fab-icon-smm' : '') +
                (fSize === 'L'  ? ' app-about-text-icon-lg' : '') +
                (fSize === 'S'  ? ' app-about-text-icon' : '')}
          >
                          {fIcon}
          </i>}
          {(fLabel && !fReverse) && <div className={'ml-1 ' + fLabelCSS}>{fLabel}</div>}
        </div>}
        {fFab && <div className="app-about-fab-container">
          <button 
            type="button" 
            className={`btn app-fab-button app-bg-white d-inline-flex app-fab-button-sm 
                      app-accent1 app-fab-raised ` + fColor}
          >
            <div className="d-flex flex-row justify-content-center align-items-center">
              <i className={'material-icons app-fab-icon app-fab-icon-btn-sm ' + fColor}>{fIcon}</i> 
            </div>       
          </button>
        </div>}
      </div>
    )
  }
}

export default AboutTextIcon
