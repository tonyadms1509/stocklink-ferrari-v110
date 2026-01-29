
import { createClient } from '@supabase/supabase-js';

// Cross-environment variable resolver
const getEnv = (key: string) => {
  // Try Vite-style first
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // Fallback to define-bridged process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Verify configuration before initializing to prevent total app failure
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder-node');

// Initialize with a placeholder if keys are missing to allow the app to boot into "Demo Mode"
export const supabase = createClient(
    isSupabaseConfigured ? supabaseUrl : 'https://placeholder-node.supabase.co', 
    isSupabaseConfigured ? supabaseKey : 'placeholder-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
);

if (!isSupabaseConfigured) {
    console.warn("%cStockLink Ferrari: Redline Safety Mode. Grid isolated. Running on synthetic local data.", "color: #ff4d4d; font-weight: bold; background: #000; padding: 5px;");
}
