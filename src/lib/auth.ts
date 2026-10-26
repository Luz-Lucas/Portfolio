import 'server-only';
import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { isAdminUser } from './admin-login';
import { isSupabaseConfigured } from './supabase/env';
import { createServerClient } from './supabase/server';

/** Garante que a requisição vem do dono. Use na primeira linha de páginas e server actions do admin. */
export async function requireAdmin(): Promise<User> {
  if (!isSupabaseConfigured()) redirect('/admin/login?erro=config');
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  if (!isAdminUser(user)) {
    await supabase.auth.signOut();
    redirect('/admin/login?erro=restrito');
  }
  return user;
}
