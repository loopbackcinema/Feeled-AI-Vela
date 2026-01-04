import { createClient } from '@supabase/supabase-js';

// Helper to safely get env vars in both Vite (browser) and Node (server) environments
const getEnv = (key: string, viteKey: string) => {
    // Check Vite import.meta.env
    // Cast to any to avoid TypeScript error: Property 'env' does not exist on type 'ImportMeta'.
    const meta = import.meta as any;
    if (typeof meta !== 'undefined' && meta.env && meta.env[viteKey]) {
        return meta.env[viteKey];
    }
    // Check process.env safely (avoiding ReferenceError in browser)
    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
    } catch (e) {
        // Ignore errors if process is not defined
    }
    return '';
};

const supabaseUrl = getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

// Only create the client if keys are present to prevent app-wide crash on load
export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;