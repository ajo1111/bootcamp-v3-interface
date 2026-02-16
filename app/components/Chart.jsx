import dynamic from "next/dynamic"
import Image from "next/image"

// We need to make sure the chart is loaded only in the client
const Chart = dynamic(() => import("react-apexcharts", { ssr: false }))

// Dummy data & config
import { options, series, getSeriesForMarket } from "@/app/data/prices"

import up from "@/app/assets/arrows/price-up.svg"
import down from "@/app/assets/arrows/price-down.svg"

function PriceChart({ market, data }) {
  const dummySeries = getSeriesForMarket(market) || series
  const dummyData = dummySeries?.[0]?.data || []
  const liveData = data?.series?.[0]?.data || []
  const chartData = liveData.length > 0 ? liveData : dummyData

  const lastCandle = chartData[chartData.length - 1]
  const prevCandle = chartData[chartData.length - 2]

  const lastPrice =
    data?.lastPrice ??
    (lastCandle?.y ? lastCandle.y[3] : 0)

  const lastPriceChange =
    data?.lastPriceChange ??
    (lastCandle?.y && prevCandle?.y && lastCandle.y[3] >= prevCandle.y[3] ? "+" : "-")

  return (
    <div className="chart">
      <div className="flex-between">
        <div className="stats">
          <p className="price">
            <small>{market[0].symbol}/{market[1].symbol}</small>
            &nbsp;
            {lastPriceChange === "+" ? (
              <Image
                src={up}
                alt="Up"
                width={30}
                height={30}
              />
            ) : (
              <Image
                src={down}
                alt="Down"
                width={30}
                height={30}
              />
            )}

            &nbsp;
            {lastPrice}
          </p>
        </div>

        <div className="select">
          <select name="time" id="time">
            <option value="0">Last Week</option>
            <option value="1">Last Month</option>
            <option value="2">Last Year</option>
          </select>
        </div>
      </div>

      <Chart
        options={options}
        series={[{ data: chartData }]}
        type="candlestick"
        width="100%"
        height="100%"
      />

    </div>
  );
}

export default PriceChart;
