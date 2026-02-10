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
  setFilledOrders
} from "@/lib/features/exchange/exchange"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"
import { useExchange } from "@/app/hooks/useExchange"

// Config
import config from "@/app/config.json"

import {
  selectMarket,
  selectOpenOrders,
  selectMyOpenOrders,
  selectFilledOrders,
  selectMyFilledOrders,
} from "@/lib/selectors"
import { exchange } from "@/lib/features/exchange/exchange"

export default function Home() {
  // Local state
  const [showMyTransactions, setShowMyTransactions] = useState(false)

  // Redux
  const dispatch = useAppDispatch()
  const market = useAppSelector(selectMarket)
  const openOrders = useAppSelector(selectOpenOrders)
  const myOpenOrders = useAppSelector(selectMyOpenOrders)
  const filledOrders = useAppSelector(selectFilledOrders)
  const myFilledOrders = useAppSelector(selectMyFilledOrders)

  // Order & Transaction tab references (Trades or Orders)
  const tradeRef = useRef(null)
  const orderRef = useRef(null)

  // Hooks
  const { provider, chainId } = useProvider()
  const { exchange } = useExchange()

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

  useEffect(() => {
    if(provider && exchange && market) {
      // Fetch all orders
      getAllOrders()
    }

  }, [provider, exchange, market])

  return (
    <div className="page trading">
      <h1 className="title">Trading</h1>

      <section className="insights">
        <Chart />
      </section>

      <section className="market">
        <h2>Select Market</h2>

        <Market />
      </section>

      <section className="order">
        <h2>New Order</h2>

        <Tabs/>

        <form>

        </form>

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
        <h2>My Trades</h2>

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
