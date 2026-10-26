import { isSupabaseConfigured } from '@/lib/supabase/env';
import { LoginButton } from './LoginButton';
import '../admin.css';

const MESSAGES: Record<string, string> = {
  restrito: 'Acesso restrito.',
  config: 'Supabase não configurado: preencha as variáveis de ambiente.',
  callback: 'Não foi possível concluir o login. Tente de novo.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const message = erro ? MESSAGES[erro] : !isSupabaseConfigured() ? MESSAGES.config : null;
  return (
    <main className="admin admin-login">
      <h1>Admin do portfólio</h1>
      {message && <p className="admin-error">{message}</p>}
      {isSupabaseConfigured() && <LoginButton />}
    </main>
  );
}
