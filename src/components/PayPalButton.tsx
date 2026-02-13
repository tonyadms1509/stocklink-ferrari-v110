import React, { useEffect } from "react";

function PayPalButton() {
  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId) {
      console.error("PayPal Client ID not found. Check your .env or Netlify variables.");
      return;
    }

    // Dynamically load the PayPal SDK script
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = () => {
      if ((window as any).paypal) {
        (window as any).paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{ amount: { value: "10.00" } }],
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
              alert(`Transaction completed by ${details.payer.name.given_name}`);
            });
          },
        }).render("#paypal-button-container");
      }
    };
    document.body.appendChild(script);
  }, []);

  return <div id="paypal-button-container"></div>;
}

export default PayPalButton;
