import config from "@/app/config.json"

function toChainKey(chainIdValue) {
  if (!chainIdValue && chainIdValue !== 0) return null

  const parsedChainId = Number(chainIdValue)
  if (!Number.isFinite(parsedChainId) || parsedChainId < 0) return null

  return String(parsedChainId)
}

export function getSupportedChainKey(chainIdValue) {
  const chainKey = toChainKey(chainIdValue)
  if (!chainKey) return null

  return config[chainKey] ? chainKey : null
}

export function getDefaultChainKey() {
  const preferredChainKey = process.env.NEXT_PUBLIC_DEMO_CHAIN_ID
  if (preferredChainKey && config[preferredChainKey]) return preferredChainKey

  const firstChainKey = Object.keys(config)[0]
  return firstChainKey || null
}

export function getActiveChainKey(chainIdValue) {
  return getSupportedChainKey(chainIdValue) || getDefaultChainKey()
}

export function buildMarketFromConfig(chainConfig, addresses) {
  if (!chainConfig || !Array.isArray(addresses)) return []

  const tokensByAddress = chainConfig.tokens.reduce((accumulator, token) => {
    accumulator[token.address.toLowerCase()] = token.name
    return accumulator
  }, {})

  return addresses.map((address) => ({
    address,
    symbol: tokensByAddress[address.toLowerCase()] || "TOKEN",
  }))
}

