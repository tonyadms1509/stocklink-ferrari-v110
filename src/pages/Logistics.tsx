import React from "react";
import logistics from "../data/logistics.json";
import PaystackButton from "../components/PaystackButton";
import PayPalButton from "../components/PayPalButton";

function LogisticsPage() {
  return (
    <div>
      <h1>Logistics Management</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Service</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logistics.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.name}</td>
              <td>{l.service}</td>
              <td>{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "30px" }}>
        <h2>Payment Options</h2>
        <p>Select your preferred payment method:</p>
        <PaystackButton />
        <PayPalButton />
      </div>
    </div>
  );
}

export default LogisticsPage;
