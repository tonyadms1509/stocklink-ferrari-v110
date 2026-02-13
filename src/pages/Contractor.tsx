import React from "react";
import contractors from "../data/contractors.json";
import PaystackButton from "../components/PaystackButton";
import PayPalButton from "../components/PayPalButton";

function ContractorPage() {
  return (
    <div>
      <h1>Contractor Management</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Specialty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {contractors.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.specialty}</td>
              <td>{c.status}</td>
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

export default ContractorPage;
