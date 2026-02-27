"use client"

import { useEffect, useRef } from "react"

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setAccount, setBalance as setEthBalance, setMode } from "@/lib/features/user/user"
import { resetTokens, setToken, setBalance as setTokenBalance } from "@/lib/features/tokens/tokens"
import {
  resetExchange,
  setAllOrders,
  setCancelledOrders,
  setFilledOrders,
  setMarket,
  setOrderToFill,
} from "@/lib/features/exchange/exchange"
import { hydrateTutorial } from "@/lib/features/demo/demo"

const STORAGE_KEY = "dapp-exchange-demo-session-v1"

function DemoSessionSync() {
  const dispatch = useAppDispatch()
  const didHydrateRef = useRef(false)
  const previousModeRef = useRef("none")

  const mode = useAppSelector((state) => state.user.mode)
  const account = useAppSelector((state) => state.user.account)
  const ethBalance = useAppSelector((state) => state.user.balance)
  const tokens = useAppSelector((state) => state.tokens.tokens)
  const balances = useAppSelector((state) => state.tokens.balances)
  const exchange = useAppSelector((state) => state.exchange)
  const tutorial = useAppSelector((state) => state.demo)

  useEffect(() => {
    if (didHydrateRef.current) return
    didHydrateRef.current = true

    if (typeof window === "undefined") return

    const rawValue = window.localStorage.getItem(STORAGE_KEY)
    if (!rawValue) return

    try {
      const parsed = JSON.parse(rawValue)
      if (parsed?.mode !== "demo") return

      dispatch(setMode("demo"))
      dispatch(setAccount(parsed?.user?.account ?? null))
      dispatch(setEthBalance(parsed?.user?.balance ?? 0))

      dispatch(resetTokens())
      ;(parsed?.tokens?.tokens ?? []).forEach((token, index) => {
        if (!token) return
        dispatch(setToken({
          index,
          address: token.address,
          symbol: token.symbol,
        }))
      })

      Object.entries(parsed?.tokens?.balances ?? {}).forEach(([address, tokenBalance]) => {
        dispatch(setTokenBalance({
          address,
          wallet: tokenBalance.wallet,
          exchange: tokenBalance.exchange,
        }))
      })

      dispatch(resetExchange())
      dispatch(setMarket(parsed?.exchange?.market ?? null))
      dispatch(setAllOrders(parsed?.exchange?.allOrders ?? []))
      dispatch(setCancelledOrders(parsed?.exchange?.cancelledOrders ?? []))
      dispatch(setFilledOrders(parsed?.exchange?.filledOrders ?? []))
      dispatch(setOrderToFill(parsed?.exchange?.orderToFill ?? null))

      dispatch(hydrateTutorial(parsed?.tutorial ?? null))
    } catch (error) {
      console.error("Failed to restore demo session", error)
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [dispatch])

  useEffect(() => {
    if (!didHydrateRef.current || typeof window === "undefined") return

    if (mode !== "demo") {
      if (previousModeRef.current === "demo") {
        window.localStorage.removeItem(STORAGE_KEY)
      }
      previousModeRef.current = mode
      return
    }

    const snapshot = {
      mode,
      user: {
        account,
        balance: ethBalance,
      },
      tokens: {
        tokens,
        balances,
      },
      exchange: {
        market: exchange.market,
        allOrders: exchange.allOrders,
        cancelledOrders: exchange.cancelledOrders,
        filledOrders: exchange.filledOrders,
        orderToFill: exchange.orderToFill,
      },
      tutorial: {
        status: tutorial.status,
        currentStep: tutorial.currentStep,
      },
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    previousModeRef.current = mode
  }, [
    mode,
    account,
    ethBalance,
    tokens,
    balances,
    exchange.market,
    exchange.allOrders,
    exchange.cancelledOrders,
    exchange.filledOrders,
    exchange.orderToFill,
    tutorial.status,
    tutorial.currentStep,
  ])

  return null
}

export default DemoSessionSync
