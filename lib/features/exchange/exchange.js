import { createSlice } from '@reduxjs/toolkit'

export const exchange = createSlice({
  name: 'exchange',
  initialState: {
    contract: null,
    address: null,
    transaction: {
      isTransferring: false,
      isSuccessful: false,
      transactionType: null,
    },
    events: [],
    markets: [],
    currentMarket: 0,
  },
  reducers: {
    setExchange: (state, action) => {
      state.address = action.payload.address;
      state.contract = action.payload.contract;
    },
    transferRequest: (state, action) => {
      state.transaction.isTransferring = true;
      state.transaction.isSuccessful = false;
      state.transaction.transactionType = action.payload;
    },
    transferSuccess: (state) => {
      state.transaction.isTransferring = false;
      state.transaction.isSuccessful = true;
    },
    transferFail: (state) => {
      state.transaction.isTransferring = false;
      state.transaction.isSuccessful = false;
    },
    setMarkets: (state, action) => {
      state.markets = action.payload;
    },
    setCurrentMarket: (state, action) => {
      state.currentMarket = action.payload;
    },
  },
})

export const { setExchange, transferRequest, transferSuccess, transferFail, setMarkets, setCurrentMarket } = exchange.actions
export default exchange.reducer
