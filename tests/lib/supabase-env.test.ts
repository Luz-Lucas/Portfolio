import { afterEach, describe, expect, it } from 'vitest';
import { supabaseAnonKey, supabaseServiceRoleKey, supabaseUrl } from '@/lib/supabase/env';

describe('supabase env', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  it('strips line breaks and spaces pasted into keys (they are invalid in HTTP headers)', () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_abc\n123 \r\n';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ' sb_publishable_x\ny ';
    process.env.NEXT_PUBLIC_SUPABASE_URL = ' https://ref.supabase.co\n';
    expect(supabaseServiceRoleKey()).toBe('sb_secret_abc123');
    expect(supabaseAnonKey()).toBe('sb_publishable_xy');
    expect(supabaseUrl()).toBe('https://ref.supabase.co');
  });

  it('returns empty strings when unset', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(supabaseServiceRoleKey()).toBe('');
  });
});
