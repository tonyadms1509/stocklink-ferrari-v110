import React from "react";

function PaystackButton() {
  const paystackKey = import.meta.env.VITE_PAYSTACK_KEY;

  const handlePaystack = () => {
    const handler = (window as any).PaystackPop.setup({
      key: paystackKey,
      email: "customer@example.com",
      amount: 2000 * 100, // amount in kobo (2000 NGN)
      currency: "NGN",
      callback: (response: any) => {
        alert("Payment successful! Ref: " + response.reference);
      },
      onClose: () => {
        alert("Payment window closed.");
      },
    });
    handler.openIframe();
  };

  return <button onClick={handlePaystack}>Pay with Paystack</button>;
}

export default PaystackButton;
