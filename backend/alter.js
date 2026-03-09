import 'dotenv/config';
import { supabase } from './src/config/supabase.js';

async function alterDB() {
  const { data, error } = await supabase.rpc('query_executor', { query: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;' });
  // Wait, Supabase doesn't have a raw query runner via RPC unless we made one.
}
alterDB();
