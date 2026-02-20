import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SupplierPage from "./pages/Supplier";
import ContractorPage from "./pages/Contractor";
import LogisticsPage from "./pages/Logistics";
import AdminPage from "./pages/Admin";

function App() {
  return (
    <Router>
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/supplier" style={{ marginRight: "10px" }}>Supplier</Link>
        <Link to="/contractor" style={{ marginRight: "10px" }}>Contractor</Link>
        <Link to="/logistics" style={{ marginRight: "10px" }}>Logistics</Link>
        <Link to="/admin">Admin</Link>
      </nav>

      <Routes>
        <Route path="/supplier" element={<SupplierPage />} />
        <Route path="/contractor" element={<ContractorPage />} />
        <Route path="/logistics" element={<LogisticsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<h1>Welcome to StockLink ✅</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
