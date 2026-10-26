type MaybeUser = { user_metadata?: { user_name?: string } } | null | undefined;

/** O admin é exclusivamente o login GitHub em ADMIN_GITHUB_LOGIN. */
export function isAdminLogin(user: MaybeUser): boolean {
  const admin = process.env.ADMIN_GITHUB_LOGIN?.trim().toLowerCase();
  const login = user?.user_metadata?.user_name?.trim().toLowerCase();
  return Boolean(admin && login && admin === login);
}
