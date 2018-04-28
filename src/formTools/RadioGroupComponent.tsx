'use strict'
import * as React from 'react';
import { observer } from 'mobx-react';

@observer
class RadioGroup extends React.Component<{

  fTitle       ?: string,   // title for the group
  fDisabled    ?: boolean,  // true if field is disabled
  fVertical    ?: boolean,  // true if stack items vertically
  fIcon        ?: string,   // name of icon for group
  fIconSpace   ?: boolean,  // true if show empty icon space when fIcon not given
  fIconColor   ?: string,   // CSS to include for icon (color)
  fExtraCSS    ?: string,   // CSS to include for radio group div
  fOnFocus     ?: Function, // function to execute on input focus
  fName        ?: string,   // value to  use for the input elements' name attribute
  fDefault     ?: string,   // incoming selected value
  fOnChange    ?: Function, // function to execute on input change
  fValues      ?: string,   // list of values for each choice separated by |
  fLabels      ?: string,   // list of labels for each choice separated by |
  fDividerAfter?: boolean   // true if field divider displayed after
},  {} > {

  aValues: string[];
  aLabels: string[];

  componentWillMount() {
    if (this.props.fValues) {
      this.aValues = this.props.fValues.split('|');
    }
    if (this.props.fLabels) {
      this.aLabels = this.props.fLabels.split('|');
    }

  }

  valueChange = evt => {
    if (this.props.fOnChange) { this.props.fOnChange(evt.currentTarget.value); };
  }

  onFocus = evt => {
    if (this.props.fOnFocus) { this.props.fOnFocus(); };
  }

  render() {
   
    const fDisabled     = this.props.fDisabled     !== undefined ? this.props.fDisabled     : false;
    const fVertical     = this.props.fVertical     !== undefined ? this.props.fVertical     : false;
    const fIcon         = this.props.fIcon         !== undefined ? this.props.fIcon         : '';
    const fIconSpace    = this.props.fIconSpace    !== undefined ? this.props.fIconSpace    : false;
    const fExtraCSS     = this.props.fExtraCSS     !== undefined ? this.props.fExtraCSS     : '';
    const fDividerAfter = this.props.fDividerAfter !== undefined ? this.props.fDividerAfter : true;

    return(
      <div>
        <div className="d-flex flex-column">
          {this.props.fTitle &&
          <label 
            className={'app-form-icon-input-label-sm' +
                  (!fIcon && !fIconSpace ? ' ml-0' : '')}
          >
            {this.props.fTitle}
          </label>}
          <div className={'d-flex flex-row justify-content-start align-items-center ' + fExtraCSS}>
            {(fIcon || fIconSpace) &&
            <i className={'material-icons app-input-icon ' +  this.props.fIconColor}>{fIcon}</i>}
            <div 
              className={'d-flex app-form-theme-text' + 
                      (fVertical ? ' flex-column align-items-start' : ' flex-row align-items-center')}
            >
              {this.aValues.map((v, i, a) =>
                <div key={v} className="d-inline-flex flex-row align-items-center">
                  <label 
                    className={'app-cursor-pointer mb-0' + (i < a.length - 1 ? ' mr-4' : '') +
                        (fDisabled ? ' app-disabled-text' : '')}
                  >
                    <input 
                      type="radio" 
                      id={this.props.fName + i} 
                      value={v} 
                      name={this.props.fName}
                      className={'app-radio-group-input' + (!fDisabled ? ' app-cursor-pointer' : '')}
                      disabled={fDisabled} 
                      defaultChecked={this.props.fDefault === v}
                      onChange={this.valueChange} 
                      onFocus={this.onFocus}
                    />
                    {this.aLabels[i]}
                  </label>
                </div>)
              }
            </div>
          </div>
        </div>
        {fDividerAfter && 
        <div className=" app-form-input-divider-tall app-icon-offset-width "/>}
      </div>
    )
  }
} 

export default RadioGroup
