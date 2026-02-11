import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";          
import Supplier from "./pages/Supplier";
import Contractor from "./pages/Contractor";
import Logistics from "./pages/Logistics";
import Admin from "./pages/Admin";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/supplier" element={<Supplier />} />
        <Route path="/contractor" element={<Contractor />} />
        <Route path="/logistics" element={<Logistics />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
