import React from "react";

export default function EnvTest() {
  return (
    <div className="p-4 bg-gray-800 text-white">
      <h2>Environment Variables Test</h2>
      <ul>
        <li>Paystack Key: {import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}</li>
        <li>PayPal Client ID: {import.meta.env.VITE_PAYPAL_CLIENT_ID}</li>
        <li>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</li>
        <li>Supabase Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY}</li>
        <li>Gemini API Key: {import.meta.env.VITE_GEMINI_API_KEY}</li>
      </ul>
    </div>
  );
}
