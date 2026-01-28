import { ethers } from 'ethers';

// ------------------------------------------------------------------------------
// DEPOSIT TOKEN (Requires Approval First)
// ------------------------------------------------------------------------------

export const depositToken = async (provider, exchange, token, tokenAddress, amount, dispatch) => {
  try {
    // Start transfer
    dispatch({ type: 'exchange/transferRequest', payload: 'Deposit' });

    const signer = await provider.getSigner();
    const tokenWithSigner = token.connect(signer);
    const exchangeWithSigner = exchange.connect(signer);

    // Convert amount to Wei
    const amountInWei = ethers.parseUnits(amount.toString(), 18);

    // Step 1: Approve Exchange to spend tokens
    let transaction = await tokenWithSigner.approve(exchange.target, amountInWei);
    await transaction.wait();

    // Step 2: Deposit tokens to exchange
    transaction = await exchangeWithSigner.depositToken(tokenAddress, amountInWei);
    await transaction.wait();

    // Transfer success
    dispatch({ type: 'exchange/transferSuccess' });

  } catch (error) {
    console.error('Deposit Token Error:', error);
    dispatch({ type: 'exchange/transferFail' });
    throw error;
  }
}

// ------------------------------------------------------------------------------
// WITHDRAW TOKEN
// ------------------------------------------------------------------------------

export const withdrawToken = async (provider, exchange, tokenAddress, amount, dispatch) => {
  try {
    // Start transfer
    dispatch({ type: 'exchange/transferRequest', payload: 'Withdraw' });

    const signer = await provider.getSigner();
    const exchangeWithSigner = exchange.connect(signer);

    // Withdraw tokens
    const transaction = await exchangeWithSigner.withdrawToken(
      tokenAddress,
      ethers.parseUnits(amount.toString(), 18)
    );

    await transaction.wait();

    // Transfer success
    dispatch({ type: 'exchange/transferSuccess' });

  } catch (error) {
    console.error('Withdraw Token Error:', error);
    dispatch({ type: 'exchange/transferFail' });
    throw error;
  }
}

// ------------------------------------------------------------------------------
// SUBSCRIBE TO EXCHANGE EVENTS
// ------------------------------------------------------------------------------

export const subscribeToEvents = (exchange) => {
  // Listen for TokensDeposited event
  exchange.on('TokensDeposited', (token, user, amount, balance) => {
    console.log('TokensDeposited event:', { token, user, amount: amount.toString(), balance: balance.toString() });
    // Note: Balance refresh is handled manually in wallet page after transactions
  });

  // Listen for TokensWithdrawn event
  exchange.on('TokensWithdrawn', (token, user, amount, balance) => {
    console.log('TokensWithdrawn event:', { token, user, amount: amount.toString(), balance: balance.toString() });
    // Note: Balance refresh is handled manually in wallet page after transactions
  });
}
