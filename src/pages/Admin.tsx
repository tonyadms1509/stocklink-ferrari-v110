import React from "react";
import transactions from "../data/transactions.json";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function AdminPage() {
  // Count payment methods
  const methodCounts: Record<string, number> = {};
  transactions.forEach((t) => {
    methodCounts[t.method] = (methodCounts[t.method] || 0) + 1;
  });

  const chartData = {
    labels: Object.keys(methodCounts),
    datasets: [
      {
        data: Object.values(methodCounts),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: "flex", gap: "40px" }}>
        {/* Transaction Table */}
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

        {/* Pie Chart */}
        <div style={{ width: "300px" }}>
          <Pie data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
