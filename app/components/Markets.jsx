'use client';

import { useSelector, useDispatch } from 'react-redux';

export default function Markets() {
  const dispatch = useDispatch();
  const markets = useSelector((state) => state.exchange.markets);
  const currentMarket = useSelector((state) => state.exchange.currentMarket);

  const handleMarketChange = (e) => {
    const marketIndex = parseInt(e.target.value);
    dispatch({ type: 'exchange/setCurrentMarket', payload: marketIndex });
  };

  if (!markets || markets.length === 0) {
    return null;
  }

  return (
    <div className="markets-container">
      <label htmlFor="market-select" className="markets-label">
        Market
      </label>
      <select
        id="market-select"
        className="markets-select"
        value={currentMarket || 0}
        onChange={handleMarketChange}
      >
        {markets.map((market, index) => (
          <option key={index} value={index}>
            {market.name}
          </option>
        ))}
      </select>
    </div>
  );
}
