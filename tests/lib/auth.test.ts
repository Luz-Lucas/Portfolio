import { afterEach, describe, expect, it } from 'vitest';
import { isAdminUser } from '@/lib/admin-login';

const user = (githubId: string | null, user_name = 'Luz-Lucas') => ({
  user_metadata: { user_name },
  identities: githubId ? [{ provider: 'github', id: githubId }] : [],
});

describe('isAdminUser', () => {
  afterEach(() => {
    delete process.env.ADMIN_GITHUB_ID;
  });

  it('accepts the GitHub identity whose numeric id matches ADMIN_GITHUB_ID', () => {
    process.env.ADMIN_GITHUB_ID = '185098481';
    expect(isAdminUser(user('185098481'))).toBe(true);
  });

  it('rejects a user who edited user_metadata.user_name to the owner login', () => {
    process.env.ADMIN_GITHUB_ID = '185098481';
    expect(isAdminUser(user('999', 'Luz-Lucas'))).toBe(false);
  });

  it('ignores non-GitHub identities with the same id', () => {
    process.env.ADMIN_GITHUB_ID = '185098481';
    expect(isAdminUser({ identities: [{ provider: 'google', id: '185098481' }] })).toBe(false);
  });

  it('rejects everyone when ADMIN_GITHUB_ID is empty, and null users', () => {
    process.env.ADMIN_GITHUB_ID = '';
    expect(isAdminUser(user(''))).toBe(false);
    process.env.ADMIN_GITHUB_ID = '185098481';
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(user(null))).toBe(false);
  });
});
