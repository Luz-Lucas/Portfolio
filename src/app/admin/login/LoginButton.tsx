'use client';

import { createBrowserSupabase } from '@/lib/supabase/browser';

export function LoginButton() {
  async function login() {
    await createBrowserSupabase().auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/admin/auth/callback` },
    });
  }
  return (
    <button type="button" className="admin-primary" onClick={login}>
      Entrar com GitHub
    </button>
  );
}
