import { createSlice } from "@reduxjs/toolkit"

export const user = createSlice({
  name: "user",
  initialState: {
    account: null,
    balance: 0,
    mode: "none",
  },
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload
    },
    setBalance: (state, action) => {
      state.balance = action.payload
    },
    setMode: (state, action) => {
      state.mode = action.payload
    },
  },
})

export const { setAccount, setBalance, setMode } = user.actions
export default user.reducer
