'use strict'
import { observable, action } from 'mobx';

export interface ToastData {
  message    : string,
  type       : string,
  duration   : number
}

export class ToastModel {
  @observable open       = false;
  @observable message    : string = '';
  @observable type       : string;
  duration   : number;
  toastTimer : number = 0;

  @action
  closeToast = () => {
    clearTimeout(this.toastTimer);
    this.toastTimer = 0;
    this.open = false;
  }

  @action
  openToast = (toast: ToastData) => {
    this.message = toast.message;
    this.type = toast.type || 'info';
    this.duration = toast.duration || 2500;
    this.toastTimer = window.setTimeout( () => {
      this.closeToast();
    }, this.duration);
    this.open = true;
  }

}


