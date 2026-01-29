# StockLink Ferrari | Production Ignition Checklist (v80.5)

Follow these steps to move the grid from "Demo" to "Live" on **stocklinksa.co.za**.

## 1. The Engine (Supabase Setup)
* [ ] Create a free account at [Supabase.com](https://supabase.com).
* [ ] Start a new project: `StockLink-Ferrari`.
* [ ] Go to the **SQL Editor** in Supabase.
* [ ] Copy the contents of `SUPABASE_MIGRATION.md` (found in this project) and click **Run**.
* [ ] Go to **Project Settings > API** and copy your `URL` and `anon public key`.

## 2. The Factory (GitHub)
* [ ] Initialize a private repository on GitHub.
* [ ] Push all current project files to the `main` branch.

## 3. The Body (Vercel Deployment)
* [ ] Log in to [Vercel.com](https://vercel.com) using your GitHub account.
* [ ] Click **Add New > Project** and import your StockLink repo.
* [ ] **CRITICAL:** Under "Environment Variables", add:
    * `VITE_SUPABASE_URL` = (Your Supabase URL)
    * `VITE_SUPABASE_ANON_KEY` = (Your Supabase Key)
    * `API_KEY` = (Your Google Gemini API Key)
    * `VITE_PAYSTACK_PUBLIC_KEY` = (From your Paystack Dashboard)
    * `VITE_PAYPAL_CLIENT_ID` = (From your PayPal Developer Dashboard)
* [ ] Click **Deploy**.

## 4. The Registration (Domains.co.za)
* [ ] In Vercel, go to **Settings > Domains**.
* [ ] Add `stocklinksa.co.za`.
* [ ] Vercel will give you two **Nameservers** (e.g., `ns1.vercel-dns.com`).
* [ ] Log in to **Domains.co.za**, go to your domain management, and replace the current Nameservers with the ones Vercel provided.
* [ ] Wait 1-2 hours for "Propagation."

## 5. Settlement (Payments)
* [ ] **Paystack:** In your Paystack dashboard, add `https://stocklinksa.co.za` to your Whitelisted Domains.
* [ ] **PayPal:** Ensure your Client ID is set to "Live" mode when you are ready to take real money.

**Grid Signal: READY FOR IGNITION.**