'use strict'
import * as React from 'react';
import { observer } from 'mobx-react';

import { StringMsgList } from './StringMsgList';

export class FieldErrorMsg extends React.Component<{
  fMsgs: FieldErrorMsg[];       // array of these objects
  name: string      // name to activate this message
}, {} > {

  show: boolean = false;         // true if template should be displayed

  constructor(props: any) {
    super(props);
    this.props.fMsgs.push(this); // add this SMC to the sMsgs list
  }

  // see if this component's name is in the given string array
  nameInList(keyList: string[]): boolean {  
    return keyList.some(key => key === this.props.name);
  }

  render() {
    return(
      <div>
        {this.show && <div>{this.props.children}</div>}
      </div>
    )
  }
}


// container component for StatusMessageComponent items
@observer
export class FieldErrorMsgs extends React.Component <{
  vMultiple ?: boolean,
  fMsgs  : FieldErrorMsg[],          // array errors we're interested in
  eList  : StringMsgList             // list of errors that are currently present
}, {} > {

  render() {
    const mKeys = this.props.eList.keysAsArray();  // get the keys of current errors
    let showMore = this.props.vMultiple ? 2 : 1;   // only show mMax messages

    this.props.fMsgs.forEach(component => {
      if ( !component.nameInList(mKeys) || !showMore ) {
        component.show = false;             // name of this component not a current error or mMax shown
      } else {
        component.show = true;              // matches a current error, display the components message
        showMore--;
      }
    })

    return(null)
  }
      
}

