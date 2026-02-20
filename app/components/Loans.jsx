import { ethers } from "ethers"

function Loans({ loans }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Token</th>
            <th>Time</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{loan.token.slice(0, 6) + "..." + loan.token.slice(38, 42)}</td>
              <td>{loan.date}</td>
              <td>{ethers.formatUnits(loan.amount, 18)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Loans;