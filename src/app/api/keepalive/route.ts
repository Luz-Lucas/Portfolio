import { createPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

/**
 * Chamado pelo Vercel Cron diariamente para o Supabase free não pausar por inatividade.
 * Com CRON_SECRET configurado, exige o segredo (a Vercel manda no Authorization); sem ele, aceita o
 * agendador da Vercel pelo user-agent — a rota só lê 1 linha de conteúdo público.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.get('authorization') === `Bearer ${secret}`;
  return (req.headers.get('user-agent') ?? '').startsWith('vercel-cron/');
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { error } = await createPublicClient().from('content').select('key').limit(1);
  if (error) return Response.json({ error: error.message }, { status: 502 });
  return Response.json({ ok: true });
}
