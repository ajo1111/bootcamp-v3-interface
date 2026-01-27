import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: 0 }

export const user = createSlice({
  name: 'user',
  initialState: {
    account: null,
    balance: 0,
  },
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload
    },
    setBalance: (state, action) => {
      state.balance = action.payload
    },
  },
})

export const { setAccount, setBalance } = user.actions
export default user.reducer