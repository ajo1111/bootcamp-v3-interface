"use client"

import { useState } from "react"
import { useEffect } from "react"
import Image from "next/image"
import { useSDK } from "@metamask/sdk-react"
import Jazzicon from "react-jazzicon"
import { ethers } from "ethers"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setAccount, setBalance } from "@/lib/features/user/user"
import {
  selectAccount,
  selectETHBalance,
} from "@/lib/selectors"

// Import hooks
import { useProvider } from "@/app/hooks/useProvider"

// Import assets
import network from "@/app/assets/other/network.svg"

// Import config
import config from "@/app/config.json"

const TENDERLY_RPC_URL = process.env.NEXT_PUBLIC_TENDERLY_RPC_URL
const TENDERLY_CHAIN_ID = process.env.NEXT_PUBLIC_TENDERLY_CHAIN_ID || "4"

function toChainIdHex(chainIdValue) {
  if (!chainIdValue) return null
  if (String(chainIdValue).startsWith("0x")) return String(chainIdValue).toLowerCase()

  const parsedChainId = Number(chainIdValue)
  if (!Number.isFinite(parsedChainId) || parsedChainId < 0) return null

  return `0x${parsedChainId.toString(16)}`
}

function getRpcErrorCode(error) {
  return (
    error?.code ??
    error?.data?.code ??
    error?.data?.originalError?.code ??
    null
  )
}

const TENDERLY_CHAIN_ID_HEX = toChainIdHex(TENDERLY_CHAIN_ID) || "0x4"

const NETWORK_OPTIONS = [
  {
    key: "31337",
    label: "Hardhat",
    chainIdHex: "0x7a69",
  },
  {
    key: TENDERLY_CHAIN_ID,
    label: "Tenderly",
    chainIdHex: TENDERLY_CHAIN_ID_HEX,
    addEthereumChainParams: TENDERLY_RPC_URL
      ? {
          chainId: TENDERLY_CHAIN_ID_HEX,
          chainName: "Tenderly",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [TENDERLY_RPC_URL],
          blockExplorerUrls: ["https://dashboard.tenderly.co/"],
        }
      : null,
  },
]

function getChainKey(chainId) {
  if (!chainId) return null

  const parsedChainId = Number(chainId)
  if (!Number.isFinite(parsedChainId)) return null

  return String(parsedChainId)
}

function TopNav() {

  const { sdk, provider: metamask, chainId } = useSDK()
  const { provider } = useProvider()

  const dispatch = useAppDispatch()
  const account = useAppSelector(selectAccount)
  const balance = useAppSelector(selectETHBalance)
  const [networkError, setNetworkError] = useState("")
  const chainKey = getChainKey(chainId)
  const selectedNetwork = chainKey && config[chainKey] ? chainKey : "0"

  async function connectHandler() {
    try {
      await sdk.connectAndSign({ msg: "Sign in to DAPP Exchange" })
      await getAccountInfo()
    } catch (error) {
      console.log(error)
    }
  }

  async function networkHandler(e) {
    setNetworkError("")
    if (!metamask) {
      setNetworkError("Wallet provider is not ready.")
      return
    }

    const nextNetworkKey = e.target.value
    if (nextNetworkKey === "0") return

    const nextNetwork = NETWORK_OPTIONS.find(({ key }) => key === nextNetworkKey)
    if (!nextNetwork) return

    try {
      await metamask.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: nextNetwork.chainIdHex }],
      })
    } catch (error) {
      const missingNetworkErrorCode = 4902
      const userRejectedRequestErrorCode = 4001
      const rpcErrorCode = getRpcErrorCode(error)

      if (rpcErrorCode === missingNetworkErrorCode && nextNetwork.addEthereumChainParams) {
        try {
          await metamask.request({
            method: "wallet_addEthereumChain",
            params: [nextNetwork.addEthereumChainParams],
          })
          return
        } catch (addChainError) {
          console.error(addChainError)
          setNetworkError("Wallet could not add this network. Check RPC URL/chain ID.")
          return
        }
      }

      if (nextNetwork.chainIdHex === "0x4") {
        setNetworkError("Chain ID 4 is a MetaMask default chain. Use a custom Tenderly chain ID.")
      } else if (rpcErrorCode === userRejectedRequestErrorCode) {
        setNetworkError("Network switch request was rejected in wallet.")
      } else if (rpcErrorCode === missingNetworkErrorCode) {
        setNetworkError("Network not found in wallet. Set NEXT_PUBLIC_TENDERLY_RPC_URL.")
      } else {
        setNetworkError("Failed to switch network. See browser console.")
      }

      console.error(error)
    }
  }

  async function getAccountInfo() {
    // Get the currently connected account & balance
    const account = await provider.getSigner()
    const balance = await provider.getBalance(account)

    // Store the values in the state
    dispatch(setAccount(account.address))
    dispatch(setBalance(ethers.formatUnits(balance, 18)))
  }

  useEffect(() =>  {
  
    if(sdk && metamask) {
      // Create event listener
      metamask.on("accountsChanged", async (accounts) => {
        if (accounts.length === 0) {
          // No accounts are connected
          setAccount(null)
          setBalance(0)
        } else {
          await getAccountInfo()
        }
      })

      metamask.on("chainChanged", () => window.location.reload())

      // This allows us to remove any duplicate event
      // listeners that may be added from navigating
      // back and forth to this page
      return () => {
        metamask.removeAllListeners()
      }
    }
  }, [sdk, metamask])

  return(
    <nav className="topnav">
      <div className="network">
        <label className="icon" htmlFor="network">
          <Image src={network} alt="Select network" />
        </label>
        <div className="select">
          <select
            name="network"
            id="network"
            value={selectedNetwork}
            onChange={networkHandler}
          >
            <option value="0">Select</option>
            {NETWORK_OPTIONS.map((networkOption) => (
              <option key={networkOption.key} value={networkOption.key}>
                {networkOption.label}
              </option>
            ))}
          </select>
          {networkError && (
            <p style={{ color: "var(--clr-orange)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
              {networkError}
            </p>
          )}
        </div>
      </div>

      <div className="account">
        {account && (
          <div className="balance">
            <p>My Balance <span>{Number(balance).toFixed(2)} ETH</span></p>
          </div>
        )}
        
        {account ? (
          <a
            href={`https://etherscan.io/address/${account}`}
            target="_blank"
            rel="noreferrer"
            className="link"  
          >
            {account.slice(0,6) + "..." + account.slice(38, 42)}
            <Jazzicon diameter={44} seed={account} />
          </a>
        ) : (
          <button onClick={connectHandler}  className="button">
            Connect
          </button>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
