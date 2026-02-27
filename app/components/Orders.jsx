import { ethers } from "ethers"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addCancelledOrder } from "@/lib/features/exchange/exchange"
import { advanceTutorial } from "@/lib/features/demo/demo"
import { selectAccount, selectConnectionMode } from "@/lib/selectors"

// Custom hooks
import { useProvider } from "@/app/hooks/useProvider"
import { useExchange } from "@/app/hooks/useExchange"

function Orders({ market, orders, type }) {
  const dispatch = useAppDispatch()
  const account = useAppSelector(selectAccount)
  const connectionMode = useAppSelector(selectConnectionMode)
  const isDemoMode = connectionMode === "demo"

  // Hooks
  const { provider } = useProvider()
  const { exchange } = useExchange()

  async function cancelHandler(order) {
    if (isDemoMode && order?.id) {
      dispatch(addCancelledOrder({
        id: Number(order.id),
        user: account || order.user,
        tokenGet: order.tokenGet,
        amountGet: order.amountGet?.toString?.() || String(order.amountGet),
        tokenGive: order.tokenGive,
        amountGive: order.amountGive?.toString?.() || String(order.amountGive),
        timestamp: String(Math.floor(Date.now() / 1000))
      }))
      dispatch(advanceTutorial("order_cancelled"))
      return
    }

    if (!(provider && exchange && order?.id)) return

    try {
      // Get signer
      const signer = await provider.getSigner()

      // Submit transaction
      const transaction = await exchange.connect(signer).cancelOrder(order.id)
      await transaction.wait()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="table-wrapper">
      {market && orders.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>{market[0].symbol}</th>
              <th>{market[0].symbol}/{market[1].symbol}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                onClick={type === "open" ? () => cancelHandler(order) : undefined}
                onKeyDown={type === "open" ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    cancelHandler(order)
                  }
                } : undefined}
                role={type === "open" ? "link" : undefined}
                tabIndex={type === "open" ? 0 : -1}
                aria-label={type === "open" ? "Cancel order" : undefined}
                className={type === "open" ? "hover-red" : undefined}              
              >
                <td>{order.date}</td>
                <td className={order.type === "buy" ? "green" : "red"}>
                  {order.type === "buy" ? (
                    `+${ethers.formatUnits(order.amountGet, 18)}`
                  ) : (
                    `-${ethers.formatUnits(order.amountGive, 18)}`
                  )}
                </td>
                <td className={order.type === "buy" ? "green" : "red"}>{order.price}</td>
              </tr>
            ))}  
          </tbody>
        </table>
      ): (
        <p className="center">No Orders</p>
      )}
    </div>
  );
}

export default Orders;
