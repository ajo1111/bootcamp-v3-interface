"use client"

import { useEffect } from "react"

// Import components
import Loans from "@/app/components/Loans"

// Import dummy data
import { loans as dummyLoans } from "@/app/data/loans"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setLoans, addLoan } from "@/lib/features/exchange/exchange"
import { selectFlashLoans } from "@/lib/selectors"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"
import { useExchange } from "@/app/hooks/useExchange"

export default function Home() {
  // Redux
  const dispatch = useAppDispatch()
  const flashLoans = useAppSelector(selectFlashLoans)
  const loans = flashLoans.length > 0 ? flashLoans : dummyLoans

  // Hooks
  const { provider } = useProvider()
  const { exchange } = useExchange()

  async function getFlashLoans() {
    const block = await provider.getBlockNumber()

    // Fetch all orders via events filter
    const loanStream = await exchange.queryFilter('FlashLoan', 0, block)
    const allLoans = loanStream.map(event => event.args)
    
    // Set orders in redux
    dispatch(setLoans(serializeLoans(allLoans)))
  }

  function serializeLoans(loans) {
    return loans.map((loan) => {
      return {
        token: loan.token,
        amount: loan.amount.toString(),
        timestamp: loan.timestamp.toString(),
      }
    })
  }

  useEffect(() => {
    if (provider && exchange) {
      getFlashLoans()

      // Create event listener to listen for flash loans
      exchange.on("FlashLoan", (token, amount, timestamp) => {
        const loan = {
          token: token,
          amount: amount.toString(),
          timestamp: timestamp.toString(),
        }

        dispatch(addLoan(loan))
      })

      // This allows us to remove any duplicate event
      // listeners that may be added from navigating
      // back and forth to this page
      return () => {
        exchange.off("FlashLoan")
      }      
      
    }
  }, [provider, exchange])

  return (
    <div className="page loans">
      <h1 className="title">Loans</h1>

      <section className="data">
        {loans.length > 0 ? (
          <Loans loans={loans} />
        ) : (
          <p className="center">No Transactions</p>
        )}
      </section>
      
    </div>
  );
}
