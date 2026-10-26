import { createPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

/** Chamado pelo Vercel Cron diariamente para o Supabase free não pausar por inatividade. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { error } = await createPublicClient().from('content').select('key').limit(1);
  if (error) return Response.json({ error: error.message }, { status: 502 });
  return Response.json({ ok: true });
}
