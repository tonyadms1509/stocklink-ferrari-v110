import React from "react";
 import EnvTest from "./components/EnvTest";  // ✅ points to components folder

function App() {
  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1>StockLink Environment Test</h1>
      <EnvTest />
    </div>
  );
}

export default App;
