# StockLink Ferrari | Cloudflare Pages Deployment Protocol

Follow these steps to establish your production node on the Cloudflare Global Edge.

## 1. Cloudflare Pages Setup
1.  Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com).
2.  Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3.  Select your GitHub repository and click **Begin setup**.

## 2. Build Configuration
Configure the following settings in the deployment dashboard:
- **Project Name**: `stocklink-ferrari`
- **Framework preset**: `Vite` (or `None`)
- **Build command**: `npm run build`
- **Build output directory**: `dist`

## 3. Environment Variables
In the **Settings** > **Environment Variables** section, add the following to match your Supabase and AI configuration:

| Variable | Value Source |
|----------|--------------|
| `API_KEY` | Google AI Studio (Gemini) |
| `VITE_SUPABASE_URL` | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Settings > API |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack Dashboard |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Developer Portal |

*Note: Ensure these variables are added to both the "Production" and "Preview" environments.*

## 4. SPA Routing Fix
Cloudflare Pages requires a `_redirects` file to handle internal routing for Single Page Applications (SPAs). This project now includes `public/_redirects` which will be automatically copied to your build folder. This prevents 404 errors when you refresh the page on routes like `/dashboard` or `/projects`.

## 5. Domain Handshake
1.  Go to the **Custom Domains** tab in your Pages project.
2.  Add `stocklinksa.co.za`.
3.  Cloudflare will provide CNAME records; update these at your registrar (e.g., Domains.co.za).

**Grid Status: READY FOR UPLINK.**