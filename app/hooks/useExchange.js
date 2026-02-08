// The following hook is for interacting
// with the main exchange contract.

import { useState, useEffect } from "react"
import { ethers } from "ethers"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"

// ABIs & config
import EXCHANGE from '@/app/abis/Exchange.json'
import config from "@/app/config.json"

export function useExchange() {
  const { provider, chainId } = useProvider()

  const [exchange, setExchange] = useState(null)

  useEffect(() => {
    if (!provider || !chainId) return
    if (!config[Number(chainId)]) return

    const exchange = new ethers.Contract(config[Number(chainId)].exchange, EXCHANGE, provider)
    setExchange(exchange)
  }, [provider, chainId])

  return { exchange }
}
