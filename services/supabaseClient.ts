
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, viteKey: string) => {
  // Try Vite-style first
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
      // @ts-ignore
      const val = import.meta.env[viteKey];
      if (val && val !== 'undefined' && val !== 'null') return val;
    }
  } catch (e) {}

  // Fallback to process.env
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      const val = process.env[key];
      if (val && val !== 'undefined' && val !== 'null') return val;
    }
  } catch (e) {}
  
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder-node');

export const supabase = createClient(
    isSupabaseConfigured ? supabaseUrl : 'https://placeholder-node.supabase.co', 
    isSupabaseConfigured ? supabaseKey : 'placeholder-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
);

if (!isSupabaseConfigured) {
    console.warn("%cStockLink Ferrari: Redline Safety Mode. Database offline or in staging.", "color: #ff4d4d; font-weight: bold; background: #000; padding: 5px;");
}
