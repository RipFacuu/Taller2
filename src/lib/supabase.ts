import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials to ensure Vercel works without manual env configuration
const supabaseUrl = 'https://snoihrywlqhtlpbufrph.supabase.co';
const supabaseAnonKey = 'sb_publishable_7hI7EKPeWTUBKVbaDRiLyw__2SnfO3D';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
