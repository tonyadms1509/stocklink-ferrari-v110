# StockLink Ferrari | Cloudflare Pages Protocol (v110.0)

Cloudflare Pages offers superior edge performance and high availability for the South African construction grid. Follow this protocol to establish your production node.

## 1. Cloudflare Pages Setup
1.  Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com).
2.  Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3.  Select your GitHub repository.

## 2. Build Configuration
Configure the following settings in the deployment dashboard:
- **Framework preset:** `Vite` (or `None`)
- **Build command:** `npm run build`
- **Build output directory:** `dist`

## 3. Environment Variables
In the **Settings** > **Environment Variables** section, add the following to match your Supabase and AI config:

| Variable | Value Source |
|----------|--------------|
| `API_KEY` | Google AI Studio (Gemini) |
| `VITE_SUPABASE_URL` | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Settings > API |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack Dashboard |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Developer Portal |

*Note: Ensure both "Production" and "Preview" environments have these variables.*

## 4. SPA Routing
The included `_redirects` file ensures that refreshing a sub-page (like Site Registry or Ledger) does not result in a 404. It instructs the Cloudflare Edge to serve `index.html` for all requested paths.

## 5. Domain Handshake
1. Go to **Custom Domains** in your Pages project.
2. Add `stocklinksa.co.za`.
3. Cloudflare will provide CNAME records to update at your registrar (e.g., Domains.co.za).

**Grid Status: CLOUDFLARE BRIDGE INITIALIZED.**