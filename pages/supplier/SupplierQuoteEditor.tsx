import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function SupplierQuoteEditor() {
  const [supplierName, setSupplierName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from("quotes") // replace with your actual table name
      .insert([{ supplier_name: supplierName, amount, description }]);

    if (error) {
      console.error("Error saving quote:", error);
    } else {
      console.log("Quote saved:", data);
      setSupplierName("");
      setAmount("");
      setDescription("");
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Supplier Name"
        value={supplierName}
        onChange={(e) => setSupplierName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={handleSubmit}>Save Quote</button>
    </div>
  );
}
