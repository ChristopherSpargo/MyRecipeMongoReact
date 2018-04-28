'use strict'
import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react'

@observer
class FabControl extends React.Component<{   
  fType        ?: string ,      // Type for button
  fFab         ?: boolean,      // true if Fab type button
  fTip         ?: string,       // text for tooltip if any
  fLabel       ?: string,       // creates a small fab with a label
  fLabelCSS    ?: string,       // CSS to apply to label
  fAlignment   ?: string,       // alignment of label with icon (when present)
  fLink        ?: string,       // creates a link with a label
  fReverse     ?: boolean,      // reverse side for label
  fButtonCSS   ?: string,       // css classes to assign to the button
  fOpen        ?: boolean,      // true if assign app-open class to button
  fAria        ?: string,       // aria label text
  fIcon        ?: string,       // Icon to put on the button
  fIconColor   ?: string,       // color for Icon 
  fIconCSS     ?: string,       // css classes to assign to the icon
  fOnClick     ?: Function,     // Function to call on click of fType = 'button'
  fDelay       ?: number,       // delay before calling OnClick function
  fParam       ?: any,          // param to pass to OnClick function
  fDisabled    ?: boolean,      // true if button is disabled
  fVertical    ?: boolean,      // true if label is above or below icon
  fExtraCSS    ?: string,       // extra CSS for the main div of the fab
  fId          ?: string        // optional id for the button
}, {} > {

  fOnClick     = this.props.fOnClick;
  fDelay       = this.props.fDelay      || 300;
  fParam       = this.props.fParam      || null;

  @observable clicked         = false;
  processingClick = false;  // debounce flag

  fabClicked = event => {
    if (!this.processingClick) {
      this.processingClick = true;
      this.clicked = true;
      setTimeout( () => {
        this.clicked = false;
      }, 300);
      if (this.fOnClick) { 
        setTimeout( () => {
          this.processingClick = false;
          this.fOnClick(this.fParam);
        }, this.fDelay);
      } else {
        this.processingClick = false;
      }
    }
  }

  render() {
    // set some defaults
    const fType        = this.props.fType       || 'submit';       
    const fFab         = this.props.fFab        || false;
    const fTip         = this.props.fTip        || '';
    const fLabel       = this.props.fLabel      || '';
    const fLabelCSS    = this.props.fLabelCSS   || '';               
    const fAlignment   = this.props.fAlignment  || 'align-items-center';
    const fLink        = this.props.fLink       || '';
    const fReverse     = this.props.fReverse    || false;
    const fButtonCSS   = this.props.fButtonCSS  || '';
    const fOpen        = this.props.fOpen       || false ;
    const fAria        = this.props.fAria       || '';
    const fIcon        = this.props.fIcon       || 'check_circle_outline';
    const fIconColor   = this.props.fIconColor  || 'app-primary'; 
    const fIconCSS     = this.props.fIconCSS    || '';
    const fDisabled    = this.props.fDisabled   || false;
    const fVertical    = this.props.fVertical   || false;
    const fExtraCSS    = this.props.fExtraCSS   || '';
    const fId          = this.props.fId         || undefined;

    return (
      <div>
        {/* fab or button without label */}
        {(fFab || (fLabel === '' && fLink === '')) && 
        <div 
          className={'d-flex justify-content-center ' + fExtraCSS +
                          (!fVertical ? ' flex-row' : ' flex-column')}
        >
          <button 
            id={fId}
            type={fType}  
            className={'btn app-fab-button ' + fButtonCSS + (this.clicked ? ' app-fab-click' : '') +
                              (fOpen ? ' app-open' : '')}
            aria-label={fAria}
            disabled={fDisabled}
            data-toggle={fTip ? 'tooltip' : ''} 
            data-placement="top" 
            title={fTip} 
            data-delay="200"
            onClick={this.fabClicked}
          >
            <div className="d-flex flex-row justify-content-center align-items-center">
              <i className={'material-icons app-fab-icon ' + fIconCSS + ' ' + fIconColor}>
                  {fIcon}</i> 
            </div>       
          </button>
          {(fLabel !== '') && <div className={fLabelCSS}>{fLabel}</div>}
        </div>}

        {/* button with label */}
        {(!fFab && (fLabel !== '' && fLink === '')) && 
        <button 
          type={fType}  
          id={fId}
          className={'btn btn-sm app-link-btn app-action-btn app-link-active ' +
                            fButtonCSS + (this.clicked ? ' app-fab-click' : '') +
                            (fOpen ? ' app-open' : '')} 
          aria-label={fAria}
          disabled={fDisabled}
          onClick={this.fabClicked}
        >
          <div 
            className={'d-flex justify-content-center ' + fAlignment + ' ' + fExtraCSS +
                          (!fVertical ? ' flex-row' : ' flex-column')}
          >
            {fReverse && <div className={'mx-1 ' +  fLabelCSS}>{fLabel}</div>}
            <i className={'material-icons app-fab-icon-sm ' + fIconCSS + ' ' + fIconColor}>
                {fIcon}</i> 
            {!fReverse && <div className={'mx-1 ' + fLabelCSS}>{fLabel}</div>}
          </div>       
        </button>}

        {/* link */}
        {(fLink !== '') && 
        <button 
          type={fType}  
          id={fId}
          className={'btn btn-sm app-link-btn app-action-btn ' +
                            fButtonCSS + (this.clicked ? ' app-fab-click' : '') +
                            (fOpen ? ' app-open' : '')} 
          aria-label={fAria}
          disabled={fDisabled}
          onClick={this.fabClicked}
        >
          <div className={fLabelCSS}>{fLink}</div>
        </button>}
      </div>
    )
  }
}

export default FabControl;
