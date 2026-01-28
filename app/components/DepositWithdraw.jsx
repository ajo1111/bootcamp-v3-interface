"use client";

import { useState } from "react";
import Image from "next/image";

// Import assets
import dapp from "@/app/assets/tokens/dapp.svg";
import eth from "@/app/assets/tokens/eth.svg";

export default function DepositWithdraw({
  tokens,
  walletBalances,
  exchangeBalances,
  onDeposit,
  onWithdraw,
  isTransferring
}) {
  const [depositAmounts, setDepositAmounts] = useState({});
  const [withdrawAmounts, setWithdrawAmounts] = useState({});
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' or 'withdraw'

  const handleDepositChange = (symbol, value) => {
    setDepositAmounts({ ...depositAmounts, [symbol]: value });
  };

  const handleWithdrawChange = (symbol, value) => {
    setWithdrawAmounts({ ...withdrawAmounts, [symbol]: value });
  };

  const handleDepositSubmit = async (token) => {
    const amount = depositAmounts[token.symbol];
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await onDeposit(token, amount);
      // Clear input after successful deposit
      setDepositAmounts({ ...depositAmounts, [token.symbol]: '' });
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed. Please try again.');
    }
  };

  const handleWithdrawSubmit = async (token) => {
    const amount = withdrawAmounts[token.symbol];
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await onWithdraw(token, amount);
      // Clear input after successful withdrawal
      setWithdrawAmounts({ ...withdrawAmounts, [token.symbol]: '' });
    } catch (error) {
      console.error('Withdraw failed:', error);
      alert('Withdrawal failed. Please try again.');
    }
  };

  const getTokenIcon = (symbol) => {
    // You can customize icons per token if needed
    return dapp;
  };

  const getWalletBalance = (symbol) => {
    const balance = walletBalances.find(b => b.symbol === symbol);
    return balance ? parseFloat(balance.balance).toFixed(4) : '0.0000';
  };

  const getExchangeBalance = (symbol) => {
    const balance = exchangeBalances.find(b => b.symbol === symbol);
    return balance ? parseFloat(balance.balance).toFixed(4) : '0.0000';
  };

  return (
    <div className="deposit-withdraw-container">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button
          className={`tab ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
      </div>

      {/* Deposit Tab */}
      {activeTab === 'deposit' && (
        <div className="tab-content">
          <h3>Deposit Funds to Exchange</h3>
          <table className="transfer-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Wallet Balance</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr key={index}>
                  <td className="flex">
                    <Image
                      src={getTokenIcon(token.symbol)}
                      alt={token.symbol}
                      width={25}
                      height={25}
                    />
                    {token.symbol}
                  </td>
                  <td>{getWalletBalance(token.symbol)}</td>
                  <td>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.0000"
                      value={depositAmounts[token.symbol] || ''}
                      onChange={(e) => handleDepositChange(token.symbol, e.target.value)}
                      disabled={isTransferring}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => handleDepositSubmit(token)}
                      disabled={isTransferring}
                    >
                      {isTransferring ? 'Processing...' : 'Deposit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <div className="tab-content">
          <h3>Withdraw Funds from Exchange</h3>
          <table className="transfer-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Exchange Balance</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr key={index}>
                  <td className="flex">
                    <Image
                      src={getTokenIcon(token.symbol)}
                      alt={token.symbol}
                      width={25}
                      height={25}
                    />
                    {token.symbol}
                  </td>
                  <td>{getExchangeBalance(token.symbol)}</td>
                  <td>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="0.0000"
                      value={withdrawAmounts[token.symbol] || ''}
                      onChange={(e) => handleWithdrawChange(token.symbol, e.target.value)}
                      disabled={isTransferring}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => handleWithdrawSubmit(token)}
                      disabled={isTransferring}
                    >
                      {isTransferring ? 'Processing...' : 'Withdraw'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
