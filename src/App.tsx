import React from "react";

function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #ccc", marginBottom: "20px" }}>
        <h1>StockLink Dashboard</h1>
        <p>Welcome to your contractor supply app</p>
      </header>

      {/* Navigation */}
      <nav style={{ marginBottom: "20px" }}>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", gap: "15px" }}>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/supplier">Supplier</a></li>
          <li><a href="/orders">Orders</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main>
        <h2>Dashboard Overview</h2>
        <p>Here you’ll see your latest supplier updates, order status, and app activity.</p>
      </main>

      {/* Footer */}
      <footer style={{ marginTop: "40px", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
        <small>© 2026 StockLink. All rights reserved.</small>
      </footer>
    </div>
  );
}

export default App;
