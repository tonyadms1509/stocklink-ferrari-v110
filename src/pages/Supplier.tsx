import React from "react";
import suppliers from "../data/suppliers.json";

function Supplier() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Supplier Management</h1>
      <p>View and manage your suppliers below:</p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Category</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{s.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{s.category}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Supplier;
