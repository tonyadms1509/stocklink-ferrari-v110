# StockLink Ferrari | Vercel Deployment Protocol (v80.5.4)

If you are still seeing "Error 127", follow this **Nuclear Reset** protocol.

## 1. The "Other" Preset Fix
Vercel's "Vite" preset can sometimes be too restrictive.
Go to **Settings > General**:
1. **Framework Preset**: Change this from "Vite" to **Other**.
2. **Build Command**: `npx vite build`
3. **Install Command**: `npm install`
4. **Output Directory**: `dist`
5. Click **Save**.

## 2. Environment Variables
Verify these are added in **Settings > Environment Variables**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `API_KEY`

## 3. Redeploy with "Clean Cache"
1. Go to the **Deployments** tab.
2. Click the three dots `...` on the latest deployment.
3. Select **Redeploy**.
4. **IMPORTANT**: Toggle **"Redeploy with existing Build Cache"** to **OFF**.

## 4. Why 127 happens
Error 127 means "Command not found". Even if `vite` is in your `package.json`, the shell can't find it in the path. Using `npx` tells the shell: "Look in the local node_modules folder and run the vite file found there."

**Status: FORCING UPLINK.**