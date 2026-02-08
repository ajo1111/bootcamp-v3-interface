import { useState } from "react"
import { ethers } from "ethers"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setBalance } from "@/lib/features/tokens/tokens"
import { selectTokenAndBalance } from "@/lib/selectors"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"
import { useTokens } from "@/app/hooks/useTokens"
import { useExchange } from "@/app/hooks/useExchange"

function Transfer({ type, tokens }) {
  // Local state
  const [address, setAddress] = useState(null)

  // Redux State
  const dispatch = useAppDispatch()
  const { token, balances } = useAppSelector(state => selectTokenAndBalance(state, address))

  // Hooks
  const { provider } = useProvider()
  const { exchange } = useExchange()
  const { tokens: tokenContracts } = useTokens()

  // Handlers
  function tokenHandler(e) {
    setAddress(e.target.value)
  }

  async function transferHandler(form) {
    try {
      // Get form inputs
      const address = form.get("token")
      const amount = form.get("amount")

      // Validate inputs
      if (!address) throw new Error("Token not selected")
      if (!amount) throw new Error("Amount not set")

      const signer = await provider.getSigner()
      const amountWei = ethers.parseUnits(amount.toString(), 18)

      if(type === "deposit") {
        await approve(signer, address, amountWei)
        await deposit(signer, address, amountWei)
      }

      if (type === "withdraw") {
        await withdraw(signer, address, amountWei)
      }

      // Get new balances
      await getBalance(signer, address)
    } catch (error) {
      console.log(error)
      return
    }
  }

  // Exclusive function for calling approve()
  async function approve(signer, address, amountWei) {
    const transaction = await tokenContracts[address].connect(signer).approve(
      await exchange.getAddress(),
      amountWei
    )

    await transaction.wait()
  }

  // Exclusive function for calling deposit()
  async function deposit(signer, address, amountWei) {
    const transaction = await exchange.connect(signer).depositToken(address, amountWei)
    await transaction.wait()
  }

  // Exclusive function for calling withdraw()
  async function withdraw(signer, address, amountWei) {
    const transaction = await exchange.connect(signer).withdrawToken(address, amountWei)
    await transaction.wait()
  }

  // Exclusive function for updating new balances
  async function getBalance(signer, address) {
    // Get new balances
    const walletBalance = await tokenContracts[address].balanceOf(signer.address)
    const exchangeBalance = await exchange.totalBalanceOf(address, signer.address) 
    
    // Update redux
    dispatch(setBalance({
      address: address,
      wallet: ethers.formatUnits(walletBalance, 18),
      exchange: ethers.formatUnits(exchangeBalance, 18)
    }))    
  }

  return (
    <form action={transferHandler}>

      {/* SELECT TOKEN */}

      <div className="token">
        <label htmlFor={`${type}-token`}>
          Select Token
        </label>

        <div className="select">
          <select
            name="token"
            id={`${type}-token`}
            defaultValue={0}
            disabled={tokens.length === 0}
            onChange={tokenHandler}
          >
            <option value={0} disabled>Select Token</option>

            {/* Loop through each token */}

            {tokens.map((token, index) => (
              <option value={token.address} key={index}>{token.symbol}</option>
            ))}

          </select>
        </div>
      </div>
      
      {/* SET AMOUNT */}

      <div className="amount">
        <label htmlFor={`${type}-amount`}>Amount</label>
        <input type="number" name="amount" id={`${type}-amount`} placeholder="0.000"/>
      </div>

      {/* DISPLAY STATS */}

      <div className="info">
        <div>
          <p>Token</p>
          <p>{token ? token.symbol : "N/A"}</p>
        </div>
        <div>
          <p>Wallet</p>
          <p>{balances ? balances.wallet : 0}</p>
        </div>
        <div>
          <p>Exchange</p>
          <p>{balances ? balances.exchange : 0}</p>
        </div>
      </div>

      {/* SUBMIT */}

      <input type="submit" value={type}/>

    </form>
  );
}

export default Transfer;
