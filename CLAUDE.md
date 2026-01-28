# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a decentralized exchange (DApp) interface built with Next.js 15 that integrates with Ethereum smart contracts. Users can connect their MetaMask wallet, deposit/withdraw ERC-20 tokens, and interact with an exchange contract.

## Commands

- **Development**: `npm run dev` - Starts Next.js dev server on http://localhost:3000
- **Build**: `npm build` - Creates production build
- **Production**: `npm start` - Runs production server
- **Lint**: `npm run lint` - Runs Next.js linter

## Architecture

### State Management (Redux Toolkit)

The app uses Redux Toolkit with three main slices located in `lib/features/`:

- **user** (`lib/features/user.js`): Manages user account and ETH balance
- **tokens** (`lib/features/tokens/token.js`): Manages ERC-20 token contracts and balances (wallet + exchange)
- **exchange** (`lib/features/exchange/exchange.js`): Manages exchange contract and transaction states (isTransferring, isSuccessful, transactionType)

Store configuration is in `lib/store.js` with serialization checks disabled to support ethers.js Contract objects.

### Selectors (Reselect)

All Redux selectors are in `lib/selectors.js`. Key selectors:
- `selectWalletBalances` / `selectExchangeBalances`: Memoized selectors that combine token contracts with balances
- Uses lodash `get()` for safe property access with defaults

### Smart Contract Interactions

**Location**: `app/interactions.js`

Key functions:
- `depositToken()`: Approves exchange contract then deposits tokens (two-step process)
- `withdrawToken()`: Withdraws tokens from exchange back to wallet
- `subscribeToEvents()`: Sets up event listeners for TokensDeposited/TokensWithdrawn events

All functions use ethers.js v6 and dispatch Redux actions for transaction state management.

### Contract Configuration

**Location**: `app/config.json`

Contains network-specific contract addresses for Exchange, DAPP token, and mETH token. ABIs are stored in `app/abis/`.

### Component Structure

- **Layout** (`app/layout.js`): Wraps app with StoreProvider (Redux) and MetaMaskProvider, includes SideNav + TopNav
- **Providers**:
  - `app/components/providers/StoreProvider.jsx`: Redux store provider
  - `app/components/providers/MetaMaskProvider.jsx`: MetaMask SDK provider
- **Balances** (`app/components/Balances.jsx`): Reusable table component that displays token symbols and balances
- **DepositWithdraw** (`app/components/DepositWithdraw.jsx`): Component for deposit/withdraw functionality

### Routing

Next.js App Router structure:
- `/` - Home page
- `/wallet` - Wallet/balances page
- `/swap` - Token swap (in progress)
- `/loans` - Lending feature (in progress)

## Key Dependencies

- **ethers.js v6**: Blockchain interactions (note: v6 uses `.target` for contract addresses, not `.address`)
- **@metamask/sdk-react**: MetaMask wallet connection
- **@reduxjs/toolkit + react-redux**: State management
- **reselect**: Memoized selectors
- **react-apexcharts**: Charting
- **moment**: Date formatting

## Important Notes

- Redux middleware disables serializableCheck to allow storing ethers.js Contract objects
- Token amounts are always handled in Wei (18 decimals) - use `ethers.parseUnits()` / `ethers.formatUnits()`
- All deposit operations require two transactions: approve() then depositToken()
- Font used: Lexend (Google Fonts)

## Current Session Focus: Deposit/Withdraw UI

### Goal
Build the user interface allowing users to deposit and withdraw cryptocurrency (ETH and tokens) between their MetaMask wallet and the Exchange smart contract.

### Implementation Checklist

1. **UI Component Structure** (`app/components/DepositWithdraw.jsx`)
   - Tabbed interface with Deposit and Withdrawal sections
   - Table/list displaying ETH and DApp tokens
   - Input fields for transfer amounts

2. **State Management**
   - Local component state (useState) to capture user input
   - Input validation (positive numbers only)
   - Redux actions for transaction status (transferRequest, transferSuccess, transferFail)

3. **Ether Deposits** (requires implementation in `app/interactions.js`)
   - `depositEther()` function to transfer ETH to exchange
   - Dispatches Redux loading state during transaction
   - Updates UI after transaction confirmation

4. **Token Deposits** (already implemented in `app/interactions.js`)
   - Two-step process: approve() then depositToken()
   - First transaction: approve Exchange to spend tokens
   - Second transaction: deposit tokens to Exchange
   - Redux state tracks transfer progress

5. **Withdrawals** (partially implemented)
   - `withdrawToken()` already exists for ERC-20 tokens
   - `withdrawEther()` needs implementation for ETH
   - No approval required for withdrawals

6. **Event Handling**
   - `subscribeToEvents()` listens for Deposit/Withdraw events
   - Automatically updates balances in Redux store
   - UI reflects balance changes (wallet ↔ exchange)

7. **Error Handling**
   - Try/catch blocks for rejected transactions
   - Success/error notifications via alert system
   - User-friendly messages for MetaMask rejections

### Transaction Flow Pattern

**Deposit Token:**
1. User enters amount in UI
2. Dispatch `transferRequest('Deposit')`
3. Call token.approve(exchangeAddress, amount)
4. Wait for approval transaction
5. Call exchange.depositToken(tokenAddress, amount)
6. Wait for deposit transaction
7. Dispatch `transferSuccess()`
8. Event listener updates balances

**Withdraw Token:**
1. User enters amount in UI
2. Dispatch `transferRequest('Withdraw')`
3. Call exchange.withdrawToken(tokenAddress, amount)
4. Wait for transaction
5. Dispatch `transferSuccess()`
6. Event listener updates balances
