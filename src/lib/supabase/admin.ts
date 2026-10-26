import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from './env';

/** Cliente com service role. Só usar depois de requireAdmin(). */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  return createClient(supabaseUrl(), key, { auth: { persistSession: false } });
}
