import { createClient } from '@supabase/supabase-js';

// En Vercel, estas variables deben configurarse en el panel de Environment Variables
// VITE_SUPABASE_URL: https://snoihrywlqhtlpbufrph.supabase.co
// VITE_SUPABASE_ANON_KEY: sb_publishable_7hI7EKPeWTUBKVbaDRiLyw__2SnfO3D

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://snoihrywlqhtlpbufrph.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7hI7EKPeWTUBKVbaDRiLyw__2SnfO3D';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
