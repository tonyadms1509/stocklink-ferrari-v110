import React from "react";
import PaystackPop from "@paystack/inline-js";

function PaystackButton() {
  const payWithPaystack = () => {
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: import.meta.env.VITE_PAYSTACK_SECRET, // must be pk_test or pk_live
      email: "testbuyer@example.com",
      amount: 1000 * 100, // amount in kobo (1000 NGN)
      onSuccess: (transaction) => {
        alert(`Payment complete! Reference: ${transaction.reference}`);
      },
      onCancel: () => {
        alert("Payment cancelled.");
      },
    });
  };

  return (
    <button onClick={payWithPaystack}>
      Pay with Paystack
    </button>
  );
}

export default PaystackButton;
s