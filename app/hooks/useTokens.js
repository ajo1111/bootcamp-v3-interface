import { useState, useEffect } from "react"
import { ethers } from "ethers"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"

// ABIs & config
import TOKEN from '@/app/abis/Token.json'
import config from "@/app/config.json"

export function useTokens() {
  const { provider, chainId } = useProvider()

  const [tokens, setTokens] = useState(null)

  useEffect(() => {
    if (!provider || !chainId) return
    if (!config[Number(chainId)]) return

    let contracts = {}

    config[Number(chainId)].tokens.forEach((token) => {
      const contract = new ethers.Contract(token.address, TOKEN, provider)
      contracts[token.address] = contract
    })

    setTokens(contracts)
  }, [provider, chainId])

  return { tokens }
}
