import React from "react";
import { Link } from "react-router-dom";

function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <header style={{ borderBottom: "1px solid #ccc", marginBottom: "20px" }}>
        <h1>StockLink Dashboard</h1>
        <p>Welcome to your contractor supply app</p>
      </header>

      <nav style={{ marginBottom: "20px" }}>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", gap: "15px" }}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/supplier">Supplier</Link></li>
          <li><Link to="/contractor">Contractor</Link></li>
          <li><Link to="/logistics">Logistics</Link></li>
          <li><Link to="/admin">Admin</Link></li>
        </ul>
      </nav>

      <main>
        <h2>Dashboard Overview</h2>
        <p>Here you’ll see your latest supplier updates, order status, and app activity.</p>
      </main>

      <footer style={{ marginTop: "40px", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
        <small>© 2026 StockLink. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default App;
