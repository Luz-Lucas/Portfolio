import 'server-only';
import { createServerClient as createSsrClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAnonKey, supabaseUrl } from './env';

/** Cliente com a sessão do usuário (cookies) — usado no /admin. */
export async function createServerClient() {
  const store = await cookies();
  return createSsrClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o middleware renova a sessão.
        }
      },
    },
  });
}
