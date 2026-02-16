import { createSlice } from "@reduxjs/toolkit"

import config from "@/app/config.json"

export const exchange = createSlice({
  name: "exchange",
  initialState: {
    market: null,
    allOrders: [],
    cancelledOrders: [],
    filledOrders: []
  },
  reducers: {
    setMarket: (state, action) => {
      state.market = action.payload
    },
    setAllOrders: (state, action) => {
      state.allOrders = action.payload
    },
    setCancelledOrders: (state, action) => {
      state.cancelledOrders = action.payload
    },
    setFilledOrders: (state, action) => {
      state.filledOrders = action.payload
    },
    addOrder: (state, action) => {
      /*
        Since the ID for an order is unique, we add new orders
        by their ID. While we could just do .push(), this
        could result in duplicate orders should an event
        listener be emitted multiple times.
      */

      state.allOrders[action.payload.id - 1] = action.payload
    },
  },
})

export const {
  setMarket,
  setAllOrders,
  setCancelledOrders,
  setFilledOrders,
  addOrder,
} = exchange.actions

export default exchange.reducer
