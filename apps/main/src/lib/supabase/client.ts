import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Singleton instance
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
};