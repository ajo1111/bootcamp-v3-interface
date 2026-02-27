export const DEMO_TUTORIAL_STEPS = [
  {
    id: "market_selected",
    title: "Pick a Market",
    description: "Use Select Market to choose a trading pair.",
    route: "/",
  },
  {
    id: "order_created",
    title: "Create an Order",
    description: "Place a buy or sell order from the New Order form.",
    route: "/",
  },
  {
    id: "order_cancelled",
    title: "Cancel an Order",
    description: "Open My Orders and cancel one of your active orders.",
    route: "/",
  },
  {
    id: "order_filled",
    title: "Fill an Order",
    description: "Click an orderbook row, then fill it on the Swap page.",
    route: "/swap",
  },
  {
    id: "deposit_completed",
    title: "Deposit Funds",
    description: "Go to Wallet and make a demo deposit.",
    route: "/wallet",
  },
  {
    id: "withdraw_completed",
    title: "Withdraw Funds",
    description: "Complete a demo withdrawal from Wallet.",
    route: "/wallet",
  },
]

export const DEMO_TUTORIAL_TOTAL_STEPS = DEMO_TUTORIAL_STEPS.length

export function getTutorialStep(stepIndex) {
  return DEMO_TUTORIAL_STEPS[stepIndex] || null
}

