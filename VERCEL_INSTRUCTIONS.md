# StockLink Ferrari | Vercel Deployment Settings

To ensure the high-performance StockLink Ferrari Redline HUD functions correctly on Vercel, use the following dashboard settings.

### 1. General Settings
- **Framework Preset:** `Vite` (or `Other`)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2. Environment Variables
Add these under **Settings > Environment Variables**:

| Key | Description |
|-----|-------------|
| `API_KEY` | Your Google Gemini API Key from Google AI Studio. |
| `VITE_SUPABASE_URL` | Your Supabase Project URL. |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Public/Anon Key. |
| `VITE_PAYSTACK_PUBLIC_KEY` | Your Paystack Public Key. |
| `VITE_PAYPAL_CLIENT_ID` | Your PayPal Sandbox or Live Client ID. |

### 3. Build Troubleshooting
If you encounter **Error 127** (Command not found), try changing the Build Command to:
`npx vite build`

**Status: READY FOR DEPLOYMENT.**