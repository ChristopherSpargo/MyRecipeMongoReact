'use strict'
import * as React from 'react';
import { observer, inject } from 'mobx-react';


// Component to render a single item on the search results menu

@inject('user', 'utilSvc', 'currentRecipe')
@observer
class FormSection extends React.Component <{
  fLabel        ?: string,      // label for the container activation button
  fIcon         ?: string,      // icon to place before the text of the label
  fName         ?: string,      // unique name (within parent) for this section
  fToggleFn     ?: Function,    // function to call to toggle open/text flags
  fOpenFlag     ?: boolean,     // true if container is open
  fSize         ?: string,      // max-height control S,M,L
  fExtraCSS     ?: string       // extra css for  the component container
  }, {} > {

    // COMPONENT to provide section containers to other components
    // Example: 
    // <FormSection fLabel="Serving" fOpenFlag={this.serveStatsOpen}>...</FormSection>



  toggleOpenFlag = evt => {
    this.props.fToggleFn(this.props.fName);
  }

  render() {
    const size = this.props.fSize || 'L';
    const extraCSS = this.props.fExtraCSS || '';

    return(
      <div>
        <div 
          className={'d-flex flex-column app-category-label' +
                  (this.props.fOpenFlag ? ' app-open' : '')}
        >
          <div className="d-flex flex-row align-items-center">
            <button 
              className={`btn d-flex flex-row align-items-center 
                          justify-content-start app-recipe-section-button app-cursor-pointer` +
                        (this.props.fOpenFlag ? ' app-open' : '')} 
              type="button"
              onClick={this.toggleOpenFlag}
            >
              {this.props.fIcon &&
                <i 
                  className={'material-icons app-recipe-section-control mr-2' + 
                            (this.props.fOpenFlag ? ' app-open' : '')}
                >
                  {this.props.fIcon}
                </i>}
              {this.props.fLabel}
                <i 
                  className={'material-icons app-recipe-section-control ml-auto' + 
                              (this.props.fOpenFlag ? ' app-open' : '')}
                >
                  {this.props.fOpenFlag ? 'remove' : 'add'}
                </i>
            </button>
          </div >
          <div 
            className={'d-flex flex-column ' +
                      (size === 'L' ? 'app-category-container ' : '') +
                      (size === 'M' ? 'app-category-container-med ' : '') +
                      (size === 'S' ? 'app-category-container-sm ' : '')  +
                      (this.props.fOpenFlag ? 'app-open ' : '') + extraCSS}
          >
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

export default FormSection;
