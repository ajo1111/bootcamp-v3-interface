import { useEffect } from "react"

// Redux
import { useAppDispatch } from "@/lib/hooks"
import { setMarket } from "@/lib/features/exchange/exchange"

import config from "@/app/config.json"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"
import { useTokens } from "@/app/hooks/useTokens"

function Market() {
  // Redux
  const dispatch = useAppDispatch()

  // Hooks
  const { chainId } = useProvider()
  const { tokens } = useTokens()

  // Handlers
  async function marketHandler(addresses) {

    const promises = await addresses.map(async (address) => {
      const symbol = await tokens[address].symbol()
      return { address, symbol}
    })

    const market = await Promise.all(promises)

    dispatch(setMarket(market))
  }

  useEffect(() => {
    if (config[Number(chainId)] && tokens) {
      marketHandler(config[Number(chainId)].markets[0].tokens)
    }
  }, [config, tokens])

  return (
    <div className="select">
      {config[Number(chainId)] && (
        <select
        name="market"
        id="market"
        defaultValue={
          config[Number(chainId)].markets.length > 0 ?
            `${config[Number(chainId)].markets[0].tokens[0]},${config[Number(chainId)].markets[0].tokens[1]}` :
            0
        }
        onChange={(e) => marketHandler(e.target.value.split(","))}
      >
        <option value="0" disabled>
          {config[Number(chainId)].markets.length > 0 ? "Select Market" : "No Markets Available"}
        </option>

        {config[Number(chainId)].markets.map((market, index) => (
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
