import React from "react";
import suppliers from "../data/suppliers.json";
import PaystackButton from "../components/PaystackButton";
import PayPalButton from "../components/PayPalButton";

function SupplierPage() {
  return (
    <div>
      <h1>Supplier Management</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.category}</td>
              <td>{s.status}</td>
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

export default SupplierPage;
