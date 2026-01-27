import { configureStore } from '@reduxjs/toolkit'

import user from "./features/user"
import tokens from './features/tokens/token'
import exchange from './features/exchange/exchange'

export const makeStore = () => {
  return configureStore({
    reducer: {
      user,
      tokens,
      exchange
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}
