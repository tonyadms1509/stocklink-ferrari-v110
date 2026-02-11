import React from "react";
import logistics from "../data/logistics.json";  // ✅ imports logistics data

function Logistics() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Logistics Dashboard</h1>
      <p>Track deliveries and fleet status below:</p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Delivery ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Destination</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {logistics.map((l, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{l.deliveryId}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{l.destination}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Logistics;
















