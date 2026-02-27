"use client"

import { useState } from "react"
import { useEffect } from "react"
import Image from "next/image"
import { useSDK } from "@metamask/sdk-react"
import Jazzicon from "react-jazzicon"
import { ethers } from "ethers"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setAccount, setBalance, setMode } from "@/lib/features/user/user"
import {
  selectAccount,
  selectConnectionMode,
  selectETHBalance,
} from "@/lib/selectors"

// Import hooks
import { useProvider } from "@/app/hooks/useProvider"

// Import assets
import network from "@/app/assets/other/network.svg"

import { getSupportedChainKey } from "@/lib/network"
import { activateDemoSession, clearDemoSession, DEMO_CHAIN_KEY } from "@/lib/demo-session"

const HARDHAT_CHAIN_KEY = "31337"
const HARDHAT_RPC_URL = process.env.NEXT_PUBLIC_HARDHAT_RPC_URL
const HARDHAT_CHAIN_ID_HEX = toChainIdHex(
  process.env.NEXT_PUBLIC_HARDHAT_CHAIN_ID || HARDHAT_CHAIN_KEY
) || "0x7a69"
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
    key: HARDHAT_CHAIN_KEY,
    label: "Hardhat",
    chainIdHex: HARDHAT_CHAIN_ID_HEX,
    addEthereumChainParams: HARDHAT_RPC_URL
      ? {
          chainId: HARDHAT_CHAIN_ID_HEX,
          chainName: "Hardhat",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [HARDHAT_RPC_URL],
        }
      : null,
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

function TopNav() {

  const { sdk, provider: metamask, chainId } = useSDK()
  const { provider } = useProvider()

  const dispatch = useAppDispatch()
  const account = useAppSelector(selectAccount)
  const connectionMode = useAppSelector(selectConnectionMode)
  const balance = useAppSelector(selectETHBalance)
  const [networkError, setNetworkError] = useState("")
  const isDemoMode = connectionMode === "demo"
  const chainKey = getSupportedChainKey(chainId)
  const selectedNetwork = isDemoMode ? (DEMO_CHAIN_KEY || "0") : (chainKey || "0")

  async function connectHandler() {
    try {
      await sdk.connectAndSign({ msg: "Sign in to DAPP Exchange" })
      await getAccountInfo()
      dispatch(setMode("metamask"))
    } catch (error) {
      console.log(error)
    }
  }

  function demoHandler() {
    setNetworkError("")
    const didActivate = activateDemoSession(dispatch)
    if (!didActivate) {
      setNetworkError("Demo mode is unavailable. Check app/config.json.")
    }
  }

  function exitDemoHandler() {
    setNetworkError("")
    clearDemoSession(dispatch)
  }

  async function networkHandler(e) {
    setNetworkError("")
    if (isDemoMode) {
      setNetworkError("Network switching is disabled in demo mode.")
      return
    }

    const walletProvider = metamask || sdk?.getProvider?.()

    if (!walletProvider) {
      setNetworkError("Connect wallet first to switch network.")
      return
    }

    const nextNetworkKey = e.target.value
    if (nextNetworkKey === "0") return

    const nextNetwork = NETWORK_OPTIONS.find(({ key }) => key === nextNetworkKey)
    if (!nextNetwork) return

    try {
      await walletProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: nextNetwork.chainIdHex }],
      })
    } catch (error) {
      const missingNetworkErrorCode = 4902
      const userRejectedRequestErrorCode = 4001
      const rpcErrorCode = getRpcErrorCode(error)

      if (rpcErrorCode === missingNetworkErrorCode && nextNetwork.addEthereumChainParams) {
        try {
          await walletProvider.request({
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
      } else if (rpcErrorCode === missingNetworkErrorCode && nextNetwork.key === HARDHAT_CHAIN_KEY) {
        setNetworkError("Hardhat network not found. Set NEXT_PUBLIC_HARDHAT_RPC_URL so wallet can add it.")
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
          dispatch(setAccount(null))
          dispatch(setBalance(0))
          dispatch(setMode("none"))
        } else {
          await getAccountInfo()
          dispatch(setMode("metamask"))
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
  }, [sdk, metamask, dispatch])

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
          isDemoMode ? (
            <div className="account-actions">
              <div className="link">
                {account.slice(0,6) + "..." + account.slice(38, 42)}
                <span className="demo-badge">Demo</span>
              </div>
              <button onClick={exitDemoHandler} className="button button--secondary">
                Exit
              </button>
            </div>
          ) : (
            <a
              href={`https://etherscan.io/address/${account}`}
              target="_blank"
              rel="noreferrer"
              className="link"  
            >
              {account.slice(0,6) + "..." + account.slice(38, 42)}
              <Jazzicon diameter={44} seed={account} />
            </a>
          )
        ) : (
          <div className="account-actions">
            <button onClick={connectHandler} className="button">
              Connect
            </button>
            <button onClick={demoHandler} className="button button--secondary">
              Demo
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
