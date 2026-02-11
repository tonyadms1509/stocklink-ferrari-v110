import React from "react";
import contractors from "../data/contractors.json";  // ✅ imports contractor data

function Contractor() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Contractor Management</h1>
      <p>View and manage contractor details below:</p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Specialization</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {contractors.map((c, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{c.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{c.specialization}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Contractor;
