'use strict'
import * as React from 'react';
import { observer } from 'mobx-react';

@observer
export class FormStatusMessages extends React.Component<{
  fHaveMessage?: boolean,      // true if there are any messages
  fMessageOpen?: boolean       // true if message display should be open
}, {} > {

  render() {
    const haveMsg = this.props.fHaveMessage !== undefined ? this.props.fHaveMessage : true;

    return(
      <div 
        className={'app-form-message-area app-no-overflow mt-1' + 
                      (haveMsg ? ' app-open' : '')}
      >
        <div className={'app-form-message-area' + (this.props.fMessageOpen ? ' app-open' : '')}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
