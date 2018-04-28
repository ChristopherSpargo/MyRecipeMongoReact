'use strict'
import * as React from 'react';
import { observer, inject } from 'mobx-react'
import { ModalModel } from '../modal/ModalModel'
import FabControl from '../formTools/FabControlComponent'

// dialog used for basic NOTICES and CONFIRMATIONS

@inject('modalSvc')
@observer
class ConfirmationModal extends React.Component<{   
  modalSvc         ?: ModalModel
}, {} > {

  // call the resolve method
  close = () => {
    this.props.modalSvc.closeSimpleModal(400)
    .then((success) => {
      this.props.modalSvc.smData.resolve('OK');      
    })
    .catch((err) => {})
    this.forceUpdate();
  }

  // call the reject method
  dismiss = () => {
    this.props.modalSvc.closeSimpleModal(400)
    .then((success) => {
      this.props.modalSvc.smData.reject('CANCEL');      
    })
    .catch((err) => {})
    this.forceUpdate();
  }
  
  render() {
    return (
      <div>
        <div 
          className={'app-modal-backdrop app-fade-in' + 
                (this.props.modalSvc.simpleIsOpen ? ' app-open' : '' ) +
                (this.props.modalSvc.simpleIsClosing ? ' app-closing' : '')}
          onClick={this.dismiss}
        />
        <div 
          className={'app-fade-in app-confirm-dialog' + 
                (this.props.modalSvc.simpleIsOpen ? ' app-open' : '' ) +
                (this.props.modalSvc.simpleIsClosing ? ' app-closing' : '')}
        >
          <div className="app-dialog-header">
            <div className="d-flex flex-row justify-content-start align-items-center px-2 py-0">
              <button 
                type="button" 
                className="btn app-form-image-button app-cursor-default ml-0 mr-2 app-mb--2"
                aria-label="delete"
              > 
                <i className="material-icons app-fab-icon-smm app-white">{this.props.modalSvc.smData.headingIcon}</i>
              </button>
              <div className="app-form-title">{this.props.modalSvc.smData.heading}</div>
            </div>
          </div>
          <div 
            className={`d-flex flex-column justify-content-center app-confirm-dialog-content 
                      app-form-theme app-all-paddings-8px` +
                    (this.props.modalSvc.smData.dType === 'RecipeDelete' ? ' app-recipe-action-title' : '')}
          >
                {this.props.modalSvc.smData.content}
          </div>
          <div 
            className="d-flex flex-row justify-content-around align-items-center 
                          app-dialog-footer py-0 px-2"
          >
            {!this.props.modalSvc.smData.notifyOnly && 
            <FabControl 
              fType       = "button"
              fLink       = {this.props.modalSvc.smData.cancelText}
              fOnClick    = {this.dismiss}
              fButtonCSS  = "app-white"
              fLabelCSS   = "app-bigger-font"
              fAria       = "cancel"
            />}
            <FabControl 
              fType       = "button"
              fLink       = {this.props.modalSvc.smData.okText}
              fOnClick    = {this.close}
              fButtonCSS  = "app-white"
              fLabelCSS   = "app-bigger-font"
              fAria       = "Ok"
            />
          </div>
        </div>
      </div>
    )
  }
}

export default ConfirmationModal;
