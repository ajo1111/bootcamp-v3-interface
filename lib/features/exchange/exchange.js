import { createSlice } from '@reduxjs/toolkit'

export const exchange = createSlice({
  name: 'exchange',
  initialState: {
    contract: null,
    address: null,
  },
  reducers: {
    setExchange: (state, action) => {
      state.address = action.payload.address;
      state.contract = action.payload.contract;
    },
  },
})

export const { setExchange } = exchange.actions
export default exchange.reducer
