type MaybeUser = { identities?: { provider: string; id: string }[] | null } | null | undefined;

/**
 * O admin é exclusivamente a identidade GitHub cujo id numérico está em ADMIN_GITHUB_ID.
 * Nunca usar user_metadata: o próprio usuário pode alterá-lo via supabase.auth.updateUser().
 */
export function isAdminUser(user: MaybeUser): boolean {
  const adminId = process.env.ADMIN_GITHUB_ID?.trim();
  if (!adminId) return false;
  return Boolean(user?.identities?.some((i) => i.provider === 'github' && String(i.id) === adminId));
}
