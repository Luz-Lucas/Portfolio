import { createAdminClient } from '@/lib/supabase/admin';
import { supabaseServiceRoleKey } from '@/lib/supabase/env';
import { createPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

/** Agendadores aceitos quando CRON_SECRET não está configurado: Vercel Cron e o workflow do GitHub. */
const SCHEDULERS = ['vercel-cron/', 'portfolio-keepalive/'];

/**
 * Mantém o Supabase gratuito ativo (ele pausa o projeto após dias sem atividade).
 * Chamado diariamente pelo Vercel Cron e, 12h depois, pelo GitHub Actions (.github/workflows/keepalive.yml).
 *
 * Com CRON_SECRET configurado, exige `Authorization: Bearer <segredo>`; sem ele, aceita os agendadores
 * pelo user-agent. A rota é idempotente: lê conteúdo público, toca o Storage e atualiza uma única linha
 * de heartbeat — uma escrita real, que conta como atividade no banco.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers.get('authorization') === `Bearer ${secret}`;
  const ua = req.headers.get('user-agent') ?? '';
  return SCHEDULERS.some((prefix) => ua.startsWith(prefix));
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const errors: string[] = [];
  const db = createPublicClient();

  const read = await db.from('content').select('key').limit(1);
  if (read.error) errors.push(`content: ${read.error.message}`);

  const storage = await db.storage.from('cv').list('', { limit: 1 });
  if (storage.error) errors.push(`storage: ${storage.error.message}`);

  let wrote = false;
  if (supabaseServiceRoleKey()) {
    const source = (req.headers.get('user-agent') ?? 'desconhecido').slice(0, 80);
    const { error } = await createAdminClient()
      .from('keepalive')
      .upsert({ id: 1, pinged_at: new Date().toISOString(), source });
    if (error) errors.push(`heartbeat: ${error.message}`);
    else wrote = true;
  }

  if (errors.length) return Response.json({ ok: false, errors }, { status: 502 });
  return Response.json({ ok: true, wrote });
}
