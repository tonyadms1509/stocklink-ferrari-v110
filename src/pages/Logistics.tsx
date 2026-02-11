import React from "react";

function Logistics() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Logistics Dashboard</h1>
      <p>Track deliveries, fleet status, and supply chain updates here.</p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><strong>Delivery A</strong> – Pending</li>
        <li><strong>Delivery B</strong> – In Transit</li>
        <li><strong>Delivery C</strong> – Completed</li>
      </ul>
    </div>
  );
}

export default Logistics;
