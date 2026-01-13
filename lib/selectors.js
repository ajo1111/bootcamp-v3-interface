import { createSelector } from "reselect";  
import get from 'lodash/get';

// ---------------------------------------
// USER

// ACCOUNT
export const selectAccount = state => get(state, 'user.account', null);
export const selectETHBalance = state => get(state, "user.balance", null);

