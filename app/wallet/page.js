"use client";

import { useEffect } from "react";
import { ethers } from "ethers";

// Components
import Balances from "@/app/components/Balances";
import DepositWithdraw from "@/app/components/DepositWithdraw";

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setToken, setBalance } from "@/lib/features/tokens/token";
import {
   selectAccount,
   selectTokens,
   selectWalletBalances,
   selectExchangeBalances,
   selectIsTransferring,
 } from "@/lib/selectors";

// Custom Hooks
import { useTokens } from "@/app/hooks/useTokens";
import { useExchange } from "@/app/hooks/useExchange";
import { useProvider } from "@/app/hooks/useProvider";

// Interactions
import {
  depositToken,
  withdrawToken,
  subscribeToEvents
} from "@/app/interactions";


export default function Home() {
  // Redux
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectAccount);
  const tokens = useAppSelector(selectTokens);
  const walletBalances = useAppSelector(selectWalletBalances);
  const exchangeBalances = useAppSelector(selectExchangeBalances);
  const isTransferring = useAppSelector(selectIsTransferring);

  // Hooks
  const { tokens: tokenContracts } = useTokens();
  const { exchange } = useExchange();
  const { provider, chainId } = useProvider();

  console.log('tokenContracts:', tokenContracts);
  console.log('exchange:', exchange);
  console.log('tokenContracts keys:', Object.keys(tokenContracts));

  async function getBalances() {
    console.log('getBalances called!');
    console.log('account:', account);
    console.log('exchange:', exchange);
    console.log('exchange.contract:', exchange?.contract);
    console.log('chainId:', chainId);

    // Here we'll loop through each token available on the exchange
    for (const [index, address] of Object.keys(tokenContracts).entries()) {
      try {
        // Fetch data
        const symbol = await tokenContracts[address].symbol();
        console.log('Token symbol:', symbol, 'address:', address);

        // Dispatch each token
        dispatch(setToken({
          index: index,
          address: address,
          symbol: symbol,
        }));

        // Get wallet & exchange balances (only if account is connected)
        if (account && exchange?.contract) {
          try {
            const walletBalance = await tokenContracts[address].balanceOf(account);
            const exchangeBalance = await exchange.contract.totalBalanceOf(address, account);

            console.log('Wallet Balance:', symbol, ethers.formatUnits(walletBalance, 18));
            console.log('Exchange Balance:', symbol, ethers.formatUnits(exchangeBalance, 18));

            dispatch(setBalance({
              address: address,
              wallet: ethers.formatUnits(walletBalance, 18),
              exchange: ethers.formatUnits(exchangeBalance, 18),
            }));
          } catch (error) {
            console.error('Error fetching balance for', symbol, error);
          }
        } else {
          console.log('Skipping balance fetch - account:', !!account, 'exchange.contract:', !!exchange?.contract);
        }
      } catch (error) {
        console.error('Error fetching token symbol for address:', address, error);
        console.error('Make sure your local blockchain is running and contracts are deployed');
      }
    }
  }

  // Handler for deposits
  const handleDeposit = async (token, amount) => {
    if (!provider || !exchange?.contract) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // Deposit Token (requires approve)
      const tokenContract = tokenContracts[token.address];
      await depositToken(provider, exchange.contract, tokenContract, token.address, amount, dispatch);

      // Refresh balances after successful deposit
      await getBalances();
      alert('Deposit successful!');
    } catch (error) {
      console.error('Deposit error:', error);
      // Error already handled in interactions.js
    }
  };

  // Handler for withdrawals
  const handleWithdraw = async (token, amount) => {
    if (!provider || !exchange?.contract) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // Withdraw Token
      await withdrawToken(provider, exchange.contract, token.address, amount, dispatch);

      // Refresh balances after successful withdrawal
      await getBalances();
      alert('Withdrawal successful!');
    } catch (error) {
      console.error('Withdraw error:', error);
      // Error already handled in interactions.js
    }
  };

  useEffect(() => {
    console.log('useEffect triggered, keys length:', Object.keys(tokenContracts).length);
    console.log('account:', account);
    console.log('exchange loaded:', !!exchange?.contract);

    // Only fetch balances when tokens are loaded AND exchange is loaded
    if(Object.keys(tokenContracts).length > 0 && exchange?.contract) {
      getBalances();
    }

  }, [tokenContracts, account, exchange]);

  // Set up event listeners
  useEffect(() => {
    if (exchange?.contract) {
      subscribeToEvents(exchange.contract);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchange]);

  console.log('walletBalances:', walletBalances);
  console.log('exchangeBalances:', exchangeBalances);

  return (
    <div className="page wallet">
      <h1 className="title">wallet</h1>

      <section>
        <h2>Wallet Funds</h2>
        {walletBalances.length > 0 ? <Balances balances={walletBalances} /> : <p>No wallet balances available.</p>}
      </section>

      <section>
        <h2>Exchange Funds</h2>
        {exchangeBalances.length > 0 ? <Balances balances={exchangeBalances} /> : <p>No exchange balances available.</p>}
      </section>

      <section>
        <h2>Deposit & Withdraw</h2>
        {Object.keys(tokens).length > 0 ? (
          <DepositWithdraw
            tokens={Object.values(tokens)}
            walletBalances={walletBalances}
            exchangeBalances={exchangeBalances}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            isTransferring={isTransferring}
          />
        ) : (
          <p>Loading tokens...</p>
        )}
      </section>

    </div>
  )
}