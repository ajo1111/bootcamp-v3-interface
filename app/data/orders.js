export const openOrders = {
  "sellOrders": [
    {
      "amountGet": "10000000000000000000",
      "price": 1,
      "amountGive": "10000000000000000000"
    },
    {
      "amountGet": "20000000000000000000",
      "price": 2,
      "amountGive": "10000000000000000000"
    },
    {
      "amountGet": "10000000000000000000",
      "price": 0.5,
      "amountGive": "20000000000000000000"
    }
  ],
  "buyOrders": [
    {
      "amountGet": "10000000000000000000",
      "price": 1,
      "amountGive": "10000000000000000000"
    },
    {
      "amountGet": "20000000000000000000",
      "price": 2,
      "amountGive": "10000000000000000000"
    },
    {
      "amountGet": "10000000000000000000",
      "price": 0.5,
      "amountGive": "20000000000000000000"
    }
  ]
}

export const myOpenOrders = [
  {
    "date": "4 Jan 25 3:05 PM",
    "type": "buy",
    "price": 1,
    "amountGet": "10000000000000000000",
    "amountGive": "10000000000000000000"
  },
  {
    "date": "4 Jan 25 3:03 AM",
    "type": "buy",
    "price": 2,
    "amountGet": "20000000000000000000",
    "amountGive": "10000000000000000000"
  },
  {
    "date": "4 Jan 25 3:01 PM",
    "type": "sell",
    "price": 0.5,
    "amountGet": "10000000000000000000",
    "amountGive": "20000000000000000000"
  }
]

export const filledOrders = [
  {
    "date": "6 Jan 25 1:02 PM",
    "type": "sell",
    "price": 0.5,
    "amountGet": "10000000000000000000",
    "amountGive": "20000000000000000000"
  },
  {
    "date": "6 Jan 25 9:32 AM",
    "type": "buy",
    "price": 0.5,
    "amountGet": "20000000000000000000",
    "amountGive": "10000000000000000000"
  },
  {
    "date": "5 Jan 25 8:12 PM",
    "type": "sell",
    "price": 0.5,
    "amountGet": "10000000000000000000",
    "amountGive": "20000000000000000000"
  }
]

export const myFilledOrders = filledOrders
