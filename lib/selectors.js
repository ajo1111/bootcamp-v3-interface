import { createSelector } from "reselect";  
import get from 'lodash/get';

// ---------------------------------------
// USER

// ACCOUNT
export const selectAccount = state => get(state, 'user.account', null);
export const selectETHBalance = state => get(state, "user.balance", 0);

// TOKENS
export const selectTokens = state => get(state, 'tokens.contracts', {});

// TOKEN BALANCES
export const selectTokenBalances = state => get(state, 'tokens.balances', {});

export const selectWalletBalances = createSelector(
    selectTokens,
    selectTokenBalances,
    (tokens, balances) => {
        return Object.values(tokens).map(token => {
            const walletBalance = balances[token.address] ? balances[token.address].wallet : '0';

            return {
              symbol: token.symbol,
              balance: walletBalance,
            };
        });
    }
);  
        
export const selectExchangeBalances = createSelector(
    selectTokens,
    selectTokenBalances,
    (tokens, balances) => {
        return Object.values(tokens).map(token => {
            const exchangeBalance = balances[token.address] ? balances[token.address].exchange : '0';

            return {
              symbol: token.symbol,
              balance: exchangeBalance,
            };
        });
    }
);



