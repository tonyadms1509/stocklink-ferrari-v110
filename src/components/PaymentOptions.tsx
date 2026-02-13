import React from "react";
import suppliers from "../data/suppliers.json";
import PaymentOptions from "../components/PaymentOptions";

function Supplier() {
  return (
    <div>
      <h1>Supplier Management</h1>
      <table>
        {/* Supplier table rows */}
      </table>

      <PaymentOptions />   {/* Shared component */}
    </div>
  );
}

export default Supplier;
