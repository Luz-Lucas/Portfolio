import { afterEach, describe, expect, it } from 'vitest';
import { isAdminLogin } from '@/lib/admin-login';

const user = (user_name?: string) => ({ user_metadata: user_name ? { user_name } : {} });

describe('isAdminLogin', () => {
  afterEach(() => {
    delete process.env.ADMIN_GITHUB_LOGIN;
  });

  it('accepts the configured login, case-insensitively', () => {
    process.env.ADMIN_GITHUB_LOGIN = 'LucasLuz';
    expect(isAdminLogin(user('lucasluz'))).toBe(true);
  });

  it('rejects other logins, null users and missing metadata', () => {
    process.env.ADMIN_GITHUB_LOGIN = 'lucasluz';
    expect(isAdminLogin(user('outro'))).toBe(false);
    expect(isAdminLogin(null)).toBe(false);
    expect(isAdminLogin({})).toBe(false);
  });

  it('rejects everyone when ADMIN_GITHUB_LOGIN is empty', () => {
    process.env.ADMIN_GITHUB_LOGIN = '';
    expect(isAdminLogin(user(''))).toBe(false);
    expect(isAdminLogin(user('qualquer'))).toBe(false);
  });
});
