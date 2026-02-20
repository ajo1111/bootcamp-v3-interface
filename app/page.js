"use client"

import { useEffect, useRef, useState } from "react"
import { ethers } from "ethers"

// Import components
import Market from "@/app/components/Market"
import Book from "@/app/components/Book"
import Orders from "@/app/components/Orders"
import Tabs from "@/app/components/Tabs"
import Chart from "@/app/components/Chart"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  setAllOrders,
  setCancelledOrders,
  setFilledOrders,
  addOrder,
  addCancelledOrder,
  addFilledOrder
} from "@/lib/features/exchange/exchange"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"
import { useExchange } from "@/app/hooks/useExchange"

import {
  selectAccount,
  selectMarket,
  selectOpenOrders,
  selectMyOpenOrders,
  selectFilledOrders,
  selectMyFilledOrders,
  selectPriceData,
} from "@/lib/selectors"

export default function Home() {
  // Local state
  const [showBuy, setShowBuy] = useState(true)
  const [showMyTransactions, setShowMyTransactions] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [orderNotice, setOrderNotice] = useState(null)

  // Redux
  const dispatch = useAppDispatch()
  const account = useAppSelector(selectAccount)
  const market = useAppSelector(selectMarket)
  const openOrders = useAppSelector(selectOpenOrders)
  const myOpenOrders = useAppSelector(selectMyOpenOrders)
  const filledOrders = useAppSelector(selectFilledOrders)
  const myFilledOrders = useAppSelector(selectMyFilledOrders)
  const priceData = useAppSelector(selectPriceData)

  // Order form tab references (Buy or Sell)
  const buyRef = useRef(null)
  const sellRef = useRef(null)
  const noticeTimerRef = useRef(null)

  // Order & Transaction tab references (Trades or Orders)
  const tradeRef = useRef(null)
  const orderRef = useRef(null)

  // Hooks
  const { provider } = useProvider()
  const { exchange } = useExchange()

  function showOrderNotice(type, message, txHash = "") {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)

    setOrderNotice({ type, message, txHash })
    noticeTimerRef.current = setTimeout(() => {
      setOrderNotice(null)
      noticeTimerRef.current = null
    }, 5000)
  }

  function parseOrderErrorMessage(error) {
    const reason = error?.reason || ""
    const message = error?.shortMessage || error?.message || ""
    const combined = `${reason} ${message}`.toLowerCase()

    if (combined.includes("user rejected") || combined.includes("rejected")) {
      return "Transaction rejected in wallet."
    }

    return "Order creation failed. Please try again."
  }

  // Data fetching
  async function getAllOrders() {
    const block = await provider.getBlockNumber()

    // Fetch all orders via events filter
    const orderStream = await exchange.queryFilter('OrderCreated', 0, block)
    const allOrders = orderStream.map(event => event.args)

    // Set orders in Redux
    dispatch(setAllOrders(serializeOrders(allOrders)))

    // Fetch canceled orders
    const cancelStream = await exchange.queryFilter('OrderCancelled', 0, block)
    const cancelledOrders = cancelStream.map(event => event.args)

    // Set orders in Redux
    dispatch(setCancelledOrders(serializeOrders(cancelledOrders)))

    // Fetch filled orders
    const tradeStream = await exchange.queryFilter('OrderFilled', 0, block)
    const filledOrders = tradeStream.map(event => event.args)

    // Set orders in Redux
    dispatch(setFilledOrders(serializeOrders(filledOrders)))
  }

  function serializeOrders(orders) {
    // Redux can't naturally serialize BigInts
    // (uint256s from Solidity). So we re-format
    // them into strings

    let serializedOrders = []

    orders.forEach((o) => {
      serializedOrders[Number(o.id) - 1] = {
        id: o.id.toString(),
        user: o.user,
        tokenGet: o.tokenGet,
        amountGet: o.amountGet.toString(),
        tokenGive: o.tokenGive,
        amountGive: o.amountGive.toString(),
        timestamp: o.timestamp.toString()
      }
    })

    return serializedOrders
  }

  // Handlers
  async function orderHandler(form) {
    if (isSubmittingOrder) return

    try {
      setOrderNotice(null)
      setIsSubmittingOrder(true)

      // Get form inputs
      const amount = Number(form.get("amount"))
      const price = Number(form.get("price"))

      // Validate inputs
      if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(price) || price <= 0) {
        showOrderNotice("error", "Please enter a valid amount and price.")
        return
      }

      // Get signer and format amount
      const signer = await provider.getSigner()
      const amountGetWei = ethers.parseUnits(String(amount), 18)
      const amountGiveWei = ethers.parseUnits(String(amount * price), 18)

      // Submit to blockchain
      if (showBuy) {
        await makeOrder(signer, market[0].address, amountGetWei, market[1].address, amountGiveWei)
      } else {
        await makeOrder(signer, market[1].address, amountGetWei, market[0].address, amountGiveWei)
      }

    } catch (error) {
      console.log(error)
      showOrderNotice("error", parseOrderErrorMessage(error))
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  async function makeOrder(signer, tokenGet, amountGetWei, tokenGive, amountGiveWei) {
    const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGetWei, tokenGive, amountGiveWei)
    await transaction.wait()
    showOrderNotice(
      "success",
      `${showBuy ? "Buy" : "Sell"} order confirmed. Updating orderbook...`,
      transaction.hash
    )

    // Ensure the UI updates even if a websocket/event callback is delayed or missed.
    await getAllOrders()
  }

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!(provider && exchange && market)) return

    // Fetch all orders
    getAllOrders()

    const onOrderCreated = (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp) => {
      const order = {
        id: Number(id),
        user: user,
        tokenGet: tokenGet,
        amountGet: amountGet.toString(),
        tokenGive: tokenGive,
        amountGive: amountGive.toString(),
        timestamp: timestamp.toString()
      }

      dispatch(addOrder(order))
    }

    const onOrderCancelled = (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp) => {
      const order = {
        id: Number(id),
        user: user,
        tokenGet: tokenGet,
        amountGet: amountGet.toString(),
        tokenGive: tokenGive,
        amountGive: amountGive.toString(),
        timestamp: timestamp.toString()
      }

      dispatch(addCancelledOrder(order))
    }

    const onOrderFilled = (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp) => {
      const order = {
        id: Number(id),
        user: user,
        tokenGet: tokenGet,
        amountGet: amountGet.toString(),
        tokenGive: tokenGive,
        amountGive: amountGive.toString(),
        creator: creator,
        timestamp: timestamp.toString()
      }

      dispatch(addFilledOrder(order))
    }

    exchange.on("OrderCreated", onOrderCreated)
    exchange.on("OrderCancelled", onOrderCancelled)
    exchange.on("OrderFilled", onOrderFilled)

    return () => {
      exchange.off("OrderCreated", onOrderCreated)
      exchange.off("OrderCancelled", onOrderCancelled)
      exchange.off("OrderFilled", onOrderFilled)
    }
  }, [provider, exchange, market, dispatch])

  return (
    <div className="page trading">
      <h1 className="title">Trading</h1>

      {orderNotice && (
        <div
          className={`trade-toast trade-toast--${orderNotice.type}`}
          role={orderNotice.type === "error" ? "alert" : "status"}
          aria-live={orderNotice.type === "error" ? "assertive" : "polite"}
        >
          <div className="trade-toast__content">
            <p>{orderNotice.message}</p>
            {orderNotice.txHash && (
              <code className="trade-toast__hash">Tx: {orderNotice.txHash}</code>
            )}
          </div>
          <button
            type="button"
            className="trade-toast__close"
            onClick={() => setOrderNotice(null)}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      )}

      <section className="insights">
        {market ? (
          <Chart market={market} data={priceData} />
        ) : (
          <p className="center">Please Select Market</p>
        )}
        
      </section>

      <section className="market">
        <h2>Select Market</h2>

        <Market />
      </section>

      <section className="order">
        <h2>New Order</h2>

        <Tabs
          tabs={[
            { name: "Buy", ref: buyRef, default: true },
            { name: "Sell", ref: sellRef }
          ]}
          setCondition={setShowBuy}
        />

        {!account ? (
          <p className="center">Please Connect Wallet</p>          
        ) : !exchange ? (
          <p className="center">Exchange Not Deployed</p>          
        ) : (
          <form action={orderHandler}>
            <label htmlFor="amount">
              {showBuy ? "Buy" : "Sell"} Amount
            </label>
            <input type="number" name="amount" id="amount" placeholder="0.0000" step="0.0001" />

            <label htmlFor="price">
              {showBuy ? "Buy" : "Sell"} Price
            </label>
            <input type="number" name="price" id="price" placeholder="0.0000" step="0.0001" />

            <input
              type="submit"
              value={isSubmittingOrder ? `Submitting ${showBuy ? "Buy" : "Sell"}...` : `Create ${showBuy ? "Buy" : "Sell"} Order`}
              disabled={isSubmittingOrder}
            />
          </form>
        )}
      </section>

      <section className="orderbook">
        <h2>Orderbook</h2>
        {market ? (
          <>
            {/* SELLING */}
            <Book caption={"Selling"} market={market} orders={openOrders.sellOrders}/>

            {/* BUYING */}
            <Book caption={"Buying"} market={market} orders={openOrders.buyOrders}/>
          </>
        ) : (
          <p className="center">Please Select Market</p>
        )}
      </section>

      <section className="orders">
        <h2>{showMyTransactions ? "My Trades" : "My Orders"}</h2>

        <Tabs
          tabs={[
            { name: "Trades" , ref: tradeRef },
            { name: "Orders", ref: orderRef, default: true }
          ]}
          setCondition={setShowMyTransactions}
        />

        <Orders
          market={market}
          orders={showMyTransactions ? myFilledOrders : myOpenOrders}
          type={showMyTransactions ? "filled" : "open"}
        />
      </section>

      <section className="transactions">
        <h2>Trades</h2>

        <Orders
          market={market}
          orders={filledOrders}
        />
      </section>

    </div>
  );
}
