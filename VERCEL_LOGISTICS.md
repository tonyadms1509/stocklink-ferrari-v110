# StockLink Ferrari | Vercel Deployment Protocol

Follow these instructions to establish the production node on the Vercel Edge Network.

## Phase 1: Environment Variables
Ensure the following keys are added to the Vercel Dashboard under **Project Settings > Environment Variables**:

| Key | Value Source |
|-----|--------------|
| `VITE_SUPABASE_URL` | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Settings > API |
| `API_KEY` | Google AI Studio (Gemini) |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack > Settings > API Keys |
| `VITE_PAYPAL_CLIENT_ID` | PayPal Developer Portal |

## Phase 2: Deployment Configuration
The `vercel.json` file is already optimized for this build. It handles:
- **SPA Rewrites**: Redirects all traffic to `index.html` to prevent 404s on refresh.
- **Security Headers**: Includes XSS Protection and Frame Options.
- **Clean URLs**: Ensures the grid feels like a native app.

## Phase 3: Custom Domain (stocklinksa.co.za)
1. Add the domain in Vercel **Settings > Domains**.
2. Update your Registrar's (e.g., Domains.co.za) Nameservers to:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
3. SSL will be auto-provisioned within 60 minutes of DNS propagation.

## Phase 4: PWA Optimization
Vercel serves assets via CDN. The `sw.js` (Service Worker) will cache the Ferrari Redline HUD for offline use on South African job sites with unstable connectivity.

**Status: READY FOR UPLINK.**