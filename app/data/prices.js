export const options = {
  chart: {
    animations: { enabled: true },
    toolbar: { show: false },
  },
  grid: {
    show: true,
    borderColor: "#686868",
    strokeDashArray: 2,
  },
  plotOptions: {
    candlestick: {
      colors: {
        upward: "#2FD070",
        downward: "#D02F2F"
      },
    }
  },
  xaxis: {
    type: "datetime",
    labels: {
      show: true,
      style: {
        colors: "#686868",
        fontSize: "12px",
        fontFamily: "Lexend",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    crosshairs: {
      show: true,
      stroke: {
        color: '#686868',
        width: 1,
        dashArray: 0,
      },
    },
    tooltip: {
      enabled: false,
    }
  },
  yaxis: {
    labels: {
      show: true,
      style: {
        colors: "#686868",
        fontSize: "14px",
        fontFamily: "Lexend",
      },
    },
    crosshairs: {
      show: true,
      stroke: {
        color: '#686868',
        width: 1,
        dashArray: 0,
      },
    },
  },
  tooltip: {
    enabled: true,
    theme: false,
    style: {
      fontSize: "12px",
      fontFamily: "Lexend"
    },
  },
}

// Dummy data for price chart
const baseData = [
  { x: new Date(2025, 0, 1), y: [1.00, 1.05, 0.98, 1.02] },
  { x: new Date(2025, 0, 2), y: [1.02, 1.07, 1.00, 1.01] },
  { x: new Date(2025, 0, 3), y: [1.01, 1.09, 1.00, 1.08] },
  { x: new Date(2025, 0, 4), y: [1.08, 1.10, 1.03, 1.04] },
  { x: new Date(2025, 0, 5), y: [1.04, 1.05, 1.00, 1.01] },
  { x: new Date(2025, 0, 6), y: [1.01, 1.06, 0.99, 1.00] },
  { x: new Date(2025, 0, 7), y: [1.00, 1.07, 0.98, 1.03] },
  { x: new Date(2025, 0, 8), y: [1.03, 1.09, 1.02, 1.07] },
  { x: new Date(2025, 0, 9), y: [1.07, 1.10, 1.05, 1.09] },
  { x: new Date(2025, 0, 10), y: [1.09, 1.12, 1.08, 1.11] },
  { x: new Date(2025, 0, 11), y: [1.11, 1.13, 1.07, 1.08] },
  { x: new Date(2025, 0, 12), y: [1.08, 1.11, 1.04, 1.06] },
  { x: new Date(2025, 0, 13), y: [1.06, 1.10, 1.03, 1.09] },
]

const scaleSeries = (data, scale) => data.map((point) => ({
  x: point.x,
  y: point.y.map((value) => Math.round(value * scale * 10000) / 10000)
}))

const scaleByPair = {
  "IPT/mUSDC": 0.25,
  "IPT/mLINK": 0.02,
  "DAPP/mUSDC": 0.5,
  "DAPP/mLINK": 0.04,
}

export const series = [
  {
    data: scaleSeries(baseData, 1)
  }
]

export const getSeriesForMarket = (market) => {
  if (!market || market.length < 2) return series
  const pair = `${market[0].symbol}/${market[1].symbol}`
  const scale = scaleByPair[pair] || 1
  return [{ data: scaleSeries(baseData, scale) }]
}
