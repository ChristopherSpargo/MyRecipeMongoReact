'use strict'
import * as React from 'react';
import { observer } from 'mobx-react';

import { StringMsgList } from './StringMsgList';

export class StatusMessage extends React.Component<{
  sMsgs: StatusMessage[];       // array of these objects
  name: string,      // name to activate this message
  class?: string     // CSS clas to apply to the message
}, {} > {

  show: boolean = false;         // true if template should be displayed

  constructor(props : any) {
    super(props);
    this.props.sMsgs.push(this); // add this SMC to the sMsgs list
  }

  // see if this component's name is in the given string array
  nameInList(keyList: string[]): boolean {  
    return keyList.some(key => key === this.props.name);
  }

  render() {
    return(
      <div>
        {this.show && <div className={this.props.class}>{this.props.children}</div>}
      </div>
    )
  }
}


// container component for StatusMessageComponent items
@observer
export class StatusMessages extends React.Component <{
  sMsgs  : StatusMessage[],          // array of StatusMessageObjects
  eList  : StringMsgList,            // list of message keys and message texts
  mMax  ?: number                    // maximum number of messages to show at one time
}, {} > {

  render() {
    const mKeys = this.props.eList.keysAsArray();  // get the keys of messages to show
    let showMore = this.props.mMax;                    // only show mMax messages

    this.props.sMsgs.forEach(component => {
      if ( !component.nameInList(mKeys) || !showMore ) {
        component.show = false;             // name of this component not in given key list or mMax shown
      } else {
        component.show = true;              // name in list, display the components content (message)
        showMore--;
      }
    })

    return(null)
  }
      
}

