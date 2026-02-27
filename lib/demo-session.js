import { ethers } from "ethers"

import config from "@/app/config.json"
import { buildMarketFromConfig, getDefaultChainKey } from "@/lib/network"
import { setAccount, setBalance as setEthBalance, setMode } from "@/lib/features/user/user"
import { resetTokens, setToken, setBalance as setTokenBalance } from "@/lib/features/tokens/tokens"
import {
  resetExchange,
  setMarket,
  setAllOrders,
  setCancelledOrders,
  setFilledOrders,
  setOrderToFill,
} from "@/lib/features/exchange/exchange"
import { resetTutorial, startTutorial } from "@/lib/features/demo/demo"

export const DEMO_ACCOUNT = ethers.getAddress("0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae")
export const DEMO_CHAIN_KEY = getDefaultChainKey()

const DEMO_TRADER_A = ethers.getAddress("0x8ba1f109551bd432803012645ac136ddd64dba72")
const DEMO_TRADER_B = ethers.getAddress("0xab5801a7d398351b8be11c439e05c5b3259aec9b")

function toWei(value) {
  return ethers.parseUnits(Number(value).toFixed(6), 18).toString()
}

function buildDemoOrders(marketTokens) {
  if (!Array.isArray(marketTokens) || marketTokens.length < 2) {
    return {
      allOrders: [],
      filledOrders: [],
    }
  }

  const [baseTokenAddress, quoteTokenAddress] = marketTokens
  const now = Math.floor(Date.now() / 1000)

  function createOrder({ id, user, type, amount, price, minutesAgo, creator }) {
    const isBuy = type === "buy"

    const tokenGet = isBuy ? baseTokenAddress : quoteTokenAddress
    const tokenGive = isBuy ? quoteTokenAddress : baseTokenAddress
    const amountGet = isBuy ? amount : amount
    const amountGive = amount * price

    return {
      id,
      user,
      tokenGet,
      amountGet: toWei(amountGet),
      tokenGive,
      amountGive: toWei(amountGive),
      timestamp: String(now - (minutesAgo * 60)),
      creator: creator || user,
    }
  }

  const openOrders = [
    createOrder({ id: 1, user: DEMO_ACCOUNT, type: "buy", amount: 120, price: 1.02, minutesAgo: 65 }),
    createOrder({ id: 2, user: DEMO_TRADER_A, type: "sell", amount: 95, price: 0.99, minutesAgo: 58 }),
    createOrder({ id: 3, user: DEMO_ACCOUNT, type: "sell", amount: 60, price: 1.04, minutesAgo: 46 }),
    createOrder({ id: 4, user: DEMO_TRADER_B, type: "buy", amount: 150, price: 1.01, minutesAgo: 38 }),
    createOrder({ id: 5, user: DEMO_TRADER_A, type: "sell", amount: 80, price: 1.03, minutesAgo: 29 }),
    createOrder({ id: 6, user: DEMO_ACCOUNT, type: "buy", amount: 45, price: 0.98, minutesAgo: 22 }),
  ]

  const filledOrders = [
    createOrder({ id: 7, user: DEMO_ACCOUNT, type: "buy", amount: 70, price: 1.0, minutesAgo: 18, creator: DEMO_TRADER_B }),
    createOrder({ id: 8, user: DEMO_TRADER_A, type: "sell", amount: 55, price: 0.97, minutesAgo: 13, creator: DEMO_ACCOUNT }),
    createOrder({ id: 9, user: DEMO_ACCOUNT, type: "sell", amount: 48, price: 1.05, minutesAgo: 10, creator: DEMO_TRADER_A }),
    createOrder({ id: 10, user: DEMO_TRADER_B, type: "buy", amount: 90, price: 1.01, minutesAgo: 6, creator: DEMO_ACCOUNT }),
  ]

  const allOrders = [...openOrders, ...filledOrders].reduce((accumulator, order) => {
    accumulator[order.id - 1] = order
    return accumulator
  }, [])

  const serializedFilledOrders = filledOrders.reduce((accumulator, order) => {
    accumulator[order.id - 1] = order
    return accumulator
  }, [])

  return {
    allOrders,
    filledOrders: serializedFilledOrders,
  }
}

function getDemoBootstrapData() {
  if (!DEMO_CHAIN_KEY || !config[DEMO_CHAIN_KEY]) return null

  const chainConfig = config[DEMO_CHAIN_KEY]
  const marketTokens = chainConfig?.markets?.[0]?.tokens || []
  const market = buildMarketFromConfig(chainConfig, marketTokens)

  const tokenRows = chainConfig.tokens.map((token, index) => ({
    index,
    address: token.address,
    symbol: token.name,
    wallet: String([1200, 6500, 420][index] ?? 1000),
    exchange: String([240, 950, 180][index] ?? 250),
  }))

  const { allOrders, filledOrders } = buildDemoOrders(marketTokens)

  return {
    market,
    tokenRows,
    allOrders,
    filledOrders,
  }
}

export function activateDemoSession(dispatch) {
  const data = getDemoBootstrapData()
  if (!data) return false

  dispatch(setMode("demo"))
  dispatch(startTutorial())
  dispatch(setAccount(DEMO_ACCOUNT))
  dispatch(setEthBalance("125.00"))

  dispatch(resetTokens())
  data.tokenRows.forEach(({ index, address, symbol, wallet, exchange }) => {
    dispatch(setToken({ index, address, symbol }))
    dispatch(setTokenBalance({ address, wallet, exchange }))
  })

  dispatch(resetExchange())
  dispatch(setMarket(data.market))
  dispatch(setAllOrders(data.allOrders))
  dispatch(setCancelledOrders([]))
  dispatch(setFilledOrders(data.filledOrders))
  dispatch(setOrderToFill(null))

  return true
}

export function clearDemoSession(dispatch) {
  dispatch(setMode("none"))
  dispatch(resetTutorial())
  dispatch(setAccount(null))
  dispatch(setEthBalance(0))

  dispatch(resetTokens())
  dispatch(resetExchange())
}
