import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SupplierPage from "./pages/Supplier";
import ContractorPage from "./pages/Contractor";
import LogisticsPage from "./pages/Logistics";
import AdminPage from "./pages/Admin";

function App() {
  return (
    <Router>
      <div>
        <h1>StockLink Redline</h1>
        <Routes>
          <Route path="/supplier" element={<SupplierPage />} />
          <Route path="/contractor" element={<ContractorPage />} />
          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
