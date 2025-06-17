import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// These would normally be in .env.local
console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log("Supabase URL>>>>>>>>>>", supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabase;