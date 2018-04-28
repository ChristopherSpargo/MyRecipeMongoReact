'use strict'
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { ToastModel } from './ToastModel'

@inject('toaster')
@observer
class ToastComponent extends React.Component<{ toaster?: ToastModel}, {} > {
     icon = '';
     color = '';

  render() {

    const toaster = this.props.toaster!;
     
    switch (toaster.type) {
      case 'info':
        this.color = 'bg-info';
        this.icon = 'info_outline';
        break;
      case 'success':
        this.color = 'bg-success';
        this.icon = 'check';
        break;
      case 'warning':
        this.color = 'bg-warning';
         this.icon = 'warning';
        break;
      case 'error':
        this.color = 'bg-danger';
        this.icon = 'error_outline';
        break;
      default:
    }

    return (
      <div 
        className={(toaster.open ? 'app-open ' : '') + this.color + 
                      ' app-toast-container d-flex flex-row align-items-center pl-3 app-toast-msg'}
      >
        <i className="material-icons app-white app-menu-item-icon">{this.icon}</i>
        {toaster.message}
      </div>
    )
  }
}
export default ToastComponent;
