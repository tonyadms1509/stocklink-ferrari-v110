import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";          // your main app (Dashboard/Home)
import EnvTest from "./EnvTest";  // your environment test component
import Supplier from "./pages/Supplier"; // ✅ new supplier page

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/envtest" element={<EnvTest />} />
        <Route path="/supplier" element={<Supplier />} /> {/* ✅ new route */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
