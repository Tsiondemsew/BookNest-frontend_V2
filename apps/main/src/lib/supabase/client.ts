import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars not found. Realtime chat will be disabled.');
}

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Singleton instance
let clientInstance: ReturnType<typeof createBrowserClient> | null | undefined;

export const getSupabaseClient = () => {
  if (clientInstance === undefined) {
    clientInstance = createClient();
  }
  return clientInstance;
};