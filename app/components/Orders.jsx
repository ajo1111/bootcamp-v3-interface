import { ethers } from "ethers"

function Orders({ market, orders, type }) {

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
                role={type === "open" ? "link" : undefined}
                tabIndex={type === "open" ? 0 : -1}
                aria-label={type === "open" ? "Fill order" : undefined}
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
