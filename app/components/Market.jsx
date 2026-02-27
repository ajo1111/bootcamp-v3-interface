import { useEffect } from "react"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setMarket } from "@/lib/features/exchange/exchange"
import { advanceTutorial } from "@/lib/features/demo/demo"

import config from "@/app/config.json"
import { buildMarketFromConfig, getActiveChainKey } from "@/lib/network"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"
import { useTokens } from "@/app/hooks/useTokens"
import { selectConnectionMode } from "@/lib/selectors"

function Market() {
  // Redux
  const dispatch = useAppDispatch()

  // Hooks
  const { chainId } = useProvider()
  const { tokens } = useTokens()
  const connectionMode = useAppSelector(selectConnectionMode)
  const isDemoMode = connectionMode === "demo"
  const activeChainKey = getActiveChainKey(chainId)
  const chainConfig = activeChainKey ? config[activeChainKey] : null

  // Handlers
  async function marketHandler(addresses, isUserAction = false) {
    if (!chainConfig || !Array.isArray(addresses) || addresses.length < 2) return

    const defaultMarket = buildMarketFromConfig(chainConfig, addresses)

    const promises = defaultMarket.map(async (marketToken) => {
      const tokenContract = tokens?.[marketToken.address]
      if (!tokenContract) return marketToken

      try {
        const symbol = await tokenContract.symbol()
        return { ...marketToken, symbol }
      } catch {
        return marketToken
      }
    })

    const market = await Promise.all(promises)

    dispatch(setMarket(market))
    if (isDemoMode && isUserAction) {
      dispatch(advanceTutorial("market_selected"))
    }
  }

  useEffect(() => {
    if (chainConfig?.markets?.length > 0) {
      marketHandler(chainConfig.markets[0].tokens)
    }
  }, [dispatch, activeChainKey, tokens])

  return (
    <div className="select">
      {chainConfig && (
        <select
        name="market"
        id="market"
        defaultValue={
          chainConfig.markets.length > 0 ?
            `${chainConfig.markets[0].tokens[0]},${chainConfig.markets[0].tokens[1]}` :
            0
        }
        onChange={(e) => marketHandler(e.target.value.split(","), true)}
      >
        <option value="0" disabled>
          {chainConfig.markets.length > 0 ? "Select Market" : "No Markets Available"}
        </option>

        {chainConfig.markets.map((market, index) => (
          <option
            key={index}
            value={`${market.tokens[0]},${market.tokens[1]}`}
          >
            {market.name}
          </option>
        ))}
      </select>
      )}
    </div>
  );
}

export default Market;
