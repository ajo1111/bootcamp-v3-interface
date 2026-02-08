"use client"

import { useEffect } from "react"
import { ethers } from "ethers"

// Components
import Balances from "@/app/components/Balances"
import Transfer from "@/app/components/Transfer"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setToken, setBalance } from "@/lib/features/tokens/tokens"
import {
  selectAccount,
  selectTokens,
  selectWalletBalances,
  selectExchangeBalances,
} from "@/lib/selectors"

// Custom hooks
import { useTokens } from "@/app/hooks/useTokens"
import { useExchange } from "@/app/hooks/useExchange"

export default function Home() {
  // Redux
  const dispatch = useAppDispatch()
  const account = useAppSelector(selectAccount)
  const tokens = useAppSelector(selectTokens)
  const walletBalances = useAppSelector(selectWalletBalances)
  const exchangeBalances = useAppSelector(selectExchangeBalances)

  // Hooks
  const { tokens: tokenContracts } = useTokens()
  const { exchange } = useExchange()

  async function getBalances() {
    // Here we'll loop through each token available on the exchange
    Object.keys(tokenContracts).forEach(async (address, index) => {
      // Fetch data
      const symbol = await tokenContracts[address].symbol()
      
      // Dispatch each token
      dispatch(setToken({
        index: index,
        address: address,
        symbol: symbol,
      }))

      // Get wallet & exchange balances
      const walletBalance = await tokenContracts[address].balanceOf(account)
      const exchangeBalance = await exchange.totalBalanceOf(address, account)
      
      // Set the initial balances of the connected user
      dispatch(setBalance({
        address: address,
        wallet: ethers.formatUnits(walletBalance, 18),
        exchange: ethers.formatUnits(exchangeBalance, 18)
      }))
    })
  }

  useEffect(() => {
    if(account && tokenContracts && exchange) {
      getBalances()
    }
  }, [account, tokenContracts, exchange])

  return (
    <div className="page wallet">

      <h1 className="title">Wallet</h1>

      <section>
        <h2>Wallet Funds</h2>

        {walletBalances.length > 0 ? <Balances balances={walletBalances} /> : <>No Balances Available</>}

      </section>

      <section>
        <h2>Exchange Funds</h2>

        {exchangeBalances.length > 0 ? <Balances balances={exchangeBalances} /> : <>No Balances Available</>}

      </section>

      <section className="deposit">
        <h2>Deposit</h2>
        
        <Transfer type="deposit" tokens={tokens} />
      </section>

      <section className="withdraw">
        <h2>Withdraw</h2>
        
        <Transfer type="withdraw" tokens={tokens} />
      </section>
    </div>
  );
}
