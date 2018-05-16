'use strict'
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './myrecipemongo.min.css';
import { UIRouter, UIView } from '@uirouter/react';

import { router } from './router';

import './index.css';

import { User } from './user/UserModel';
import { MainMenuModel } from './home/MainMenuModel';
import { AboutModel } from './about/AboutModel';
import { ToastModel } from './toast/ToastModel';
import { ModalModel } from './modal/ModalModel';
import { UtilSvc } from './utilities/UtilSvc';
import { CookieSvc } from './utilities/CookieSvc';
import { UserSvc } from './user/UserSvc';
import { FireBaseSvc } from './user/FireBaseSvc';
import { CrossSvc } from './utilities/CrossSvc';
import { CurrentRecipe } from './recipe/CurrentRecipeSvc';
import { RecipeSvc } from './recipe/RecipeSvc';


import { Provider } from 'mobx-react';

import AboutComponent from './about/AboutComponent';
import ToastComponent from './toast/ToastComponent';
import ConfirmationModal from './modal/ConfirmationModalComponent'
import SharedSettingsModal from './modal/SharedSettingsModalComponent'
import RecipePrint from './recipe/RecipePrintComponent';
const versionLogo = require('./assets/favicon.ico');
const cardsImage = require('./assets/cards2.png');

const stateService  = router.stateService;
const urlService    = router.urlService;
const userModel     = new User();
const mainMenuModel = new MainMenuModel();
const aboutModel    = new AboutModel();
const toastModel    = new ToastModel();
const modalModel    = new ModalModel();
const fireBaseSvc   = new FireBaseSvc();
const cookieSvc     = new CookieSvc();
const crossSvc      = new CrossSvc();
const utilSvc       = new UtilSvc(userModel, aboutModel, toastModel, stateService, modalModel);
const userSvc       = new UserSvc(userModel, fireBaseSvc, utilSvc);
const currentRecipe = new CurrentRecipe()
const recipeSvc     = new RecipeSvc(utilSvc, userModel, currentRecipe);

router.stateService.go('home');
ReactDOM.render(
    <Provider 
        user={userModel} 
        mainMenu={mainMenuModel} 
        aboutModel={aboutModel} 
        toaster={toastModel} 
        cookieSvc={cookieSvc} 
        userSvc={userSvc} 
        crossSvc={crossSvc} 
        urlService={urlService}
        utilSvc={utilSvc} 
        stateService={stateService} 
        modalSvc={modalModel} 
        versionLogo={versionLogo}
        cardsImage={cardsImage}
        currentRecipe={currentRecipe} 
        recipeSvc={recipeSvc}
    >
      <div>
        <AboutComponent/>
        <ToastComponent/>
        <ConfirmationModal/>
        <SharedSettingsModal/>
        <RecipePrint/>
        <UIRouter router={router}>
          <UIView/>
        </UIRouter>
      </div>
    </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
