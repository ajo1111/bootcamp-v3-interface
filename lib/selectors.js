import { createSelector } from "reselect"
import { get, reject, groupBy } from "lodash"
import moment from "moment"

// ------------------------------------------------------------------------------
// USER

// Account
export const selectAccount = state => get(state, "user.account", null)
export const selectETHBalance = state => get(state, "user.balance", 0)

// Tokens
export const selectTokens = state => get(state, "tokens.tokens", [])

// Balances
export const selectTokenBalances = state => get(state, "tokens.balances", {})

export const selectWalletBalances = createSelector(
  selectTokens,
  selectTokenBalances,
  (tokens, balances) => {
    return tokens.map((token) => {
      const walletBalance = balances[token.address] ? balances[token.address].wallet : 0

      return {
        symbol: token.symbol,
        balance: walletBalance
      }
    })
  }
)

export const selectExchangeBalances = createSelector(
  selectTokens,
  selectTokenBalances,
  (tokens, balances) => {
    return tokens.map((token) => {
      const exchangeBalance = balances[token.address] ? balances[token.address].exchange : 0

      return {
        symbol: token.symbol,
        balance: exchangeBalance
      }
    })
  }
)

export const selectTokenAndBalance = createSelector(
  selectTokens,
  selectTokenBalances,
  (state, address) => address,
  (tokens, balances, address) => {
    if (address === null) return { token: null, balances: { wallet: 0, exchange: 0 } }

    const token = tokens.find(token => token.address === address)
    const wallet = balances[address] ? balances[address].wallet : 0 
    const exchange = balances[address] ? balances[address].exchange : 0

    return { token, balances: { wallet, exchange } }
  }
)

// ------------------------------------------------------------------------------
// ORDERS
export const selectAllOrders = state => get(state, "exchange.allOrders", [])
export const selectAllCancelledOrders = state => get(state, "exchange.cancelledOrders", [])
export const selectAllFilledOrders = state => get(state, "exchange.filledOrders", [])
export const selectMarket = state => get(state, "exchange.market", [])

const selectAllOpenOrders = createSelector(
  selectAllOrders,
  selectAllCancelledOrders,
  selectAllFilledOrders,
  (allOrders, cancelledOrders, filledOrders) => {
    return reject(allOrders, (order) => {
      const orderFilled = filledOrders.some((o) => o.id.toString() === order.id.toString())
      const orderCancelled = cancelledOrders.some((o) => o.id.toString() === order.id.toString())
      return(orderFilled || orderCancelled)
    })
  }
)

// Helper functions

const decorateOrders = (orders, market) => {
  // Here we'll add some properties to orders like
  // the price and the type of order (buy or sell)

  return orders.map((order) => {
    // Calculate token price to 5 decimal places
    const precision = 100000
    const price = Math.round((order.amountGive / order.amountGet) * precision) / precision
    const type = order.tokenGet === market[0].address ? "buy" : "sell"
    const date = moment.unix(order.timestamp).format("D MMM YY h:mm A")

    return  {
      ...order,
      price,
      type,
      date
    }
  })
}

// This custom selector is to select orders that
// are not filled or cancelled. These orders
// will be displayed in the orderbook.

export const selectOpenOrders = createSelector(
  selectAllOpenOrders,
  selectMarket,
  (orders, market) => {
    // Validate market
    if (!market) {
      return {
        orders: [],
        buyOrders: [],
        sellOrders: []
      }
    }
    
    // Filter orders by selected market
    orders = orders.filter((o) => o.tokenGet === market[0].address || o.tokenGet === market[1].address)
    orders = orders.filter((o) => o.tokenGive === market[0].address || o.tokenGive === market[1].address)
    
    // Decorate orders with some custom properties
    orders = decorateOrders(orders, market)

    // Group orders by "type" (buy / sell)
    orders = groupBy(orders, "type")

    // Get buy orders
    const buyOrders = get(orders, "buy", [])

    // Get sell orders
    const sellOrders = get(orders, "sell", [])

    return {
      orders,
      buyOrders,
      sellOrders
    }
  }
)
