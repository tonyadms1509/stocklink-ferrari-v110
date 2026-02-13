import React from "react";
import transactions from "../data/transactions.json";

function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Method</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.user}</td>
              <td>{t.method}</td>
              <td>{t.amount}</td>
              <td>{t.status}</td>
              <td>{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;
