import { createSlice } from '@reduxjs/toolkit'

export const tokens = createSlice({
  name: 'tokens',
  initialState: {
    contracts: {},
    balances: {},
  },
  reducers: {
    setToken: (state, action) => {
      state.contracts[action.payload.address] = action.payload;
    },
    setBalance: (state, action) => {
      state.balances[action.payload.address] = {
        wallet: action.payload.wallet,
        exchange: action.payload.exchange,
      };
    },
  },
})

export const { setToken, setBalance } = tokens.actions
export default tokens.reducer
