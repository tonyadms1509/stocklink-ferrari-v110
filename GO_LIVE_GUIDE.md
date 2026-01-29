# StockLink Ferrari | Go-Live Protocol (v80.5)

This guide outlines the path to launching StockLink on a professional, high-performance cloud stack for **R0.00 initial cost**.

## 1. The "Zero-Rand" Stack
*   **Frontend Hosting:** [Vercel](https://vercel.com) (Hobby Tier - Free)
*   **Database & Auth:** [Supabase](https://supabase.com) (Free Tier - 500MB DB)
*   **AI Engine:** [Google Gemini API](https://aistudio.google.com/) (Free Tier)
*   **Payments:** [Paystack](https://paystack.com/za) (Only pay per transaction - 2.9% + R1.00)

## 2. Technical Handshake (Setup)

### Step A: Database Initiation
1.  Create a free account on **Supabase**.
2.  Launch a new project named `StockLink-Ferrari`.
3.  Go to the **SQL Editor** in Supabase.
4.  Paste the contents of `SUPABASE_MIGRATION.md` and click **Run**.
    *This creates your Users, Orders, Products, and AI logs tables.*

### Step B: Deployment
1.  Push this code to a **GitHub** repository.
2.  Connect the repo to **Vercel**.
3.  Add the following **Environment Variables** in the Vercel Dashboard:
    *   `VITE_SUPABASE_URL`: (Found in Supabase Settings > API)
    *   `VITE_SUPABASE_ANON_KEY`: (Found in Supabase Settings > API)
    *   `API_KEY`: (Your Google Gemini API Key)
4.  Click **Deploy**.

## 3. Market Entry Strategy (The Pilot)

### Phase 1: The "Elite 8"
Identify 5 Contractors and 3 local independent Suppliers.
*   **Contractor Value:** "Leo (AI) handles your quotes, HIRA reports, and site logs while you work."
*   **Supplier Value:** "Direct sales leads from vetted contractors. No listing fees."

### Phase 2: Frictionless Onboarding
*   Use the **Demo Mode** to show the HUD to prospects on your tablet/phone.
*   Explain that during the "Ferrari Launch Phase," the platform is free for early adopters.

### Phase 3: The Revenue Trigger
Once you have R100k in transaction volume flowing through the Grid:
1.  Enable the **Billing Ledger** (R199/mo for Contractors).
2.  Purchase a custom `.co.za` domain (Approx R100/year).
3.  Scale the Supabase tier if DB size exceeds 500MB.

**Grid Signal: NOMINAL. Ready for Ignition.**