'use strict'
import { UIRouterReact, servicesPlugin, hashLocationPlugin } from '@uirouter/react';

// Import states

import { homeState } from './home/HomeComponent';
import { signInState } from './account/SignInComponent';
import { signOutState } from './account/SignInComponent';
import { accountAccessState } from './account/AccountAccessComponent';
import { categoriesState } from './categories/CategoriesComponent';
import { searchMyRecipesState, searcySharedRecipesState, recipeEntryState } from './recipe/RecipeAccessComponent'

// Create router instance + setup
export const router = new UIRouterReact();
router.plugin(servicesPlugin);
// router.plugin(pushStateLocationPlugin);
router.plugin(hashLocationPlugin);

// Register each state
const states = [
    homeState, signInState, signOutState, accountAccessState, categoriesState, searchMyRecipesState,
    searcySharedRecipesState, recipeEntryState
];
states.forEach(state => router.stateRegistry.register(state));
