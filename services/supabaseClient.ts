import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have valid URLs (must start with https://)
const isValidUrl = supabaseUrl.startsWith('https://');

let supabaseInstance: SupabaseClient | null = null;

if (isValidUrl && supabaseAnonKey) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
    }
} else {
    console.warn('Supabase not configured. Please add valid credentials to .env file.');
}

// Export a proxy that handles the null case
export const supabase = supabaseInstance as SupabaseClient;
export const isSupabaseConfigured = !!supabaseInstance;
