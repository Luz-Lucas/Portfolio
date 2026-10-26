// Chaves e URL do Supabase nunca têm espaços: remove quebras de linha coladas por engano no painel
// da Vercel (um "\n" no meio da chave a torna inválida como cabeçalho HTTP).
const clean = (v: string | undefined) => (v ?? '').replace(/\s+/g, '');

export const supabaseUrl = () => clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = () => clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const supabaseServiceRoleKey = () => clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
export const isSupabaseConfigured = () => Boolean(supabaseUrl() && supabaseAnonKey());
