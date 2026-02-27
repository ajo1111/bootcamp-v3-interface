"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

// Dummy data & config
import { options, series, getSeriesForMarket } from "@/app/data/prices"

import up from "@/app/assets/arrows/price-up.svg"
import down from "@/app/assets/arrows/price-down.svg"

function PriceChart({ market, data }) {
  const [ApexChart, setApexChart] = useState(null)
  const dummySeries = getSeriesForMarket(market) || series
  const dummyData = dummySeries?.[0]?.data || []
  const liveData = data?.series?.[0]?.data || []
  const chartData = liveData.length > 0 ? liveData : dummyData

  useEffect(() => {
    let mounted = true

    import("react-apexcharts")
      .then((module) => {
        if (mounted) setApexChart(() => module.default)
      })
      .catch((error) => {
        console.error("Failed to load chart library", error)
      })

    return () => {
      mounted = false
    }
  }, [])

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

      {ApexChart ? (
        <ApexChart
          options={options}
          series={[{ data: chartData }]}
          type="candlestick"
          width="100%"
          height={320}
        />
      ) : (
        <p className="chart-loading">Loading chart...</p>
      )}

    </div>
  );
}

export default PriceChart;
