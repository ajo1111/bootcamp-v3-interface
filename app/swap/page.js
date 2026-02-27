"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ethers } from "ethers"

// Import components
import Chart from "@/app/components/Chart"

// Import assets
import arrow from "@/app/assets/arrows/arrow-down.svg"
import mask from "@/app/assets/mask.svg"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addFilledOrder, setOrderToFill } from "@/lib/features/exchange/exchange"
import { advanceTutorial } from "@/lib/features/demo/demo"
import { selectAccount, selectConnectionMode, selectMarket, selectOrderToFill, selectPriceData } from "@/lib/selectors"

// Custom hooks
import { useProvider } from "../hooks/useProvider"
import { useExchange } from "../hooks/useExchange"

export default function Home() {
  // Local state
  const [gasFee, setGasFee] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [txHash, setTxHash] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redux
  const dispatch = useAppDispatch()
  const market = useAppSelector(selectMarket)
  const order = useAppSelector(selectOrderToFill)
  const priceData = useAppSelector(selectPriceData)
  const account = useAppSelector(selectAccount)
  const connectionMode = useAppSelector(selectConnectionMode)
  const isDemoMode = connectionMode === "demo"

  // Hooks
  const router = useRouter()
  const { provider } = useProvider()
  const { exchange } = useExchange()

  function parseErrorMessage(error) {
    const reason = error?.reason || ""
    const message = error?.shortMessage || error?.message || ""
    const combined = `${reason} ${message}`.toLowerCase()

    if (combined.includes("exchange: insufficient balance")) {
      // Suppress this specific notice in the UI
      return ""
    }

    if (combined.includes("user rejected") || combined.includes("rejected")) {
      return "Transaction was rejected in wallet."
    }

    return "Swap failed. Please check balances/allowances and try again."
  }

  // Handlers
  async function fillHandler() {
    if (isSubmitting) return

    try {
      setErrorMessage("")
      setSuccessMessage("")
      setTxHash("")
      setIsSubmitting(true)

      if (isDemoMode) {
        const demoHash = `0xdemo${Date.now().toString(16)}`

        dispatch(addFilledOrder({
          id: Number(order.id),
          user: account,
          tokenGet: order.tokenGet,
          amountGet: order.amountGet?.toString?.() || String(order.amountGet),
          tokenGive: order.tokenGive,
          amountGive: order.amountGive?.toString?.() || String(order.amountGive),
          creator: order.user || account,
          timestamp: String(Math.floor(Date.now() / 1000))
        }))
        dispatch(advanceTutorial("order_filled"))

        dispatch(setOrderToFill(null))
        setTxHash(demoHash)
        setSuccessMessage("Demo swap filled successfully. Redirecting to wallet...")

        setTimeout(() => {
          router.push("/wallet")
        }, 800)
        return
      }

      // Get signer
      const signer = await provider.getSigner()

      // Submit transaction
      const transaction = await exchange.connect(signer).fillOrder(order.id)
      await transaction.wait()

      // Clear order to fill
      dispatch(setOrderToFill(null))
      setTxHash(transaction.hash)
      setSuccessMessage("Swap filled successfully. Redirecting to wallet...")

      // Navigate back to the /wallet page
      setTimeout(() => {
        router.push("/wallet")
      }, 1000)
    } catch (error) {
      const parsed = parseErrorMessage(error)
      setErrorMessage(parsed)
      setIsSubmitting(false)
    }
  }

  async function estimateFees() {
    if (isDemoMode) {
      setGasFee(ethers.parseUnits("0.00042", 18))
      return
    }

    try {
      setErrorMessage("")

      const { maxFeePerGas } = await provider.getFeeData()
      const gasUsage = await exchange.fillOrder.estimateGas(order.id)
      setGasFee(gasUsage * maxFeePerGas)
    } catch (error) {
      setGasFee(0)
      const parsed = parseErrorMessage(error)
      setErrorMessage(parsed)
    }
  }

  useEffect(() => {
    if (order && (isDemoMode || (provider && exchange))) {
      estimateFees()
    }
  }, [provider, exchange, order, isDemoMode])

  return (
    <div className="page swapping">
      <h1 className="title">Swap</h1>

      {order && market && (
        <section className="swap">
          <form action={fillHandler}>
            <div className="inputs">

              <div className="input">
                <label htmlFor="">Sell</label>
                <input type="number" value={ethers.formatUnits(order.amountGet, 18)} disabled />

                <div className="select">
                  <select name="sell" id="sell" disabled>
                    <option value="0">
                      {order.type === "buy" ? market[0].symbol : market[1].symbol}
                    </option>
                  </select>
                </div>
              </div>

              <div className="arrow">
                <Image src={arrow} alt="Arrow down" />
              </div>

              <div className="input">
                <label htmlFor="">Buy</label>
                <input type="number" value={ethers.formatUnits(order.amountGive, 18)} disabled />

                <div className="select">
                  <select name="buy" id="buy" disabled>
                    <option value="0">
                      {order.type === "buy" ? market[1].symbol : market[0].symbol}
                    </option>
                  </select>
                </div>
              </div>

            </div>

            <input
              type="submit"
              value={isSubmitting ? "Submitting..." : "Fill Order"}
              disabled={isSubmitting}
            />

            {successMessage && !errorMessage && (
              <p className="swap-message swap-message-success" aria-live="polite">
                {successMessage}
              </p>
            )}

            {txHash && !errorMessage && (
              <p className="swap-message swap-message-hash">
                Tx: <code>{txHash}</code>
              </p>
            )}

            {errorMessage && (
              <p className="swap-message swap-message-error" role="alert" aria-live="assertive">
                {errorMessage}
              </p>
            )}

            <div className="fees">
              <div className="fee">
                <p>Gas Fee</p>
                <p>{Number(ethers.formatUnits(gasFee, 18)).toFixed(5)} ETH</p>
              </div>
              <div className="fee">
                <p>Swap Fee</p>
                <p>0.00125 ETH</p>
              </div>
              <div className="fee">
                <p>Amount Received</p>
                <p>
                  {/* 
                    Remember that the user who made the order
                    is giving the user X token. Thus this is
                    what is being received.
                  */}

                  {ethers.formatUnits(order.amountGive, 18)}
                  &nbsp;
                  {order.type === "buy" ? market[1].symbol : market[0].symbol}
                </p>
              </div>
            </div>

            <Link href="/" className="cancel">Cancel swap</Link>
          </form>
        </section>
      )}

      {order && market && (
        <section className="insights">
          <Chart market={market} data={priceData} />
        </section>
      )}

      {!order && (
        <section className="placeholder">
          <Image src={mask} alt="Swap logo" />

          <h2>Please select an order to fill</h2>

          <Link href="/" className="button">Select Now</Link>
        </section>
      )}
    </div>
  );
}
