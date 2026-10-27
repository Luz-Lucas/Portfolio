import { Resend } from 'resend';
import { SEED_CONTENT } from '@/content/seed';
import { contactSchema, rateLimit, type ContactInput } from '@/lib/contact';
import { SITE_URL } from '@/lib/site';

const json = (body: unknown, status = 200) => Response.json(body, { status });

async function sendWithResend(to: string, { name, email, subject, message }: ContactInput): Promise<boolean> {
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: 'Luz 95 <onboarding@resend.dev>',
    to,
    replyTo: email,
    subject: `Luz 95: ${subject || `mensagem de ${name}`}`,
    text: `${name} <${email}>\n\n${message}`,
  });
  return !error;
}

/** Mesmo serviço do portfólio anterior: sem chave, já ativado para o e-mail do dono. */
async function sendWithFormSubmit(to: string, { name, email, subject, message }: ContactInput): Promise<boolean> {
  // lido a cada envio para respeitar NEXT_PUBLIC_SITE_URL/VERCEL_* do ambiente
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).href;
  const res = await fetch(`https://formsubmit.co/ajax/${to}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Referer: site, Origin: new URL(site).origin },
    body: JSON.stringify({ name, email, subject: subject ?? '', message, _captcha: 'false', _template: 'table' }),
  });
  const body = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
  const ok = res.ok && (body.success === true || body.success === 'true');
  // Ex.: "This form needs Activation" — aparece nos logs da Vercel até o dono confirmar o e-mail.
  if (!ok) console.error('[contato] FormSubmit recusou o envio:', res.status, body.message ?? '');
  return ok;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, 400);
  if (parsed.data.website) return json({ ok: true });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, Date.now())) return json({ error: 'Muitas mensagens, tente mais tarde.' }, 429);

  const to = process.env.CONTACT_TO_EMAIL || SEED_CONTENT.contact.email;
  try {
    const sent = process.env.RESEND_API_KEY
      ? await sendWithResend(to, parsed.data)
      : await sendWithFormSubmit(to, parsed.data);
    if (!sent) return json({ error: 'Não foi possível enviar agora.' }, 502);
  } catch {
    return json({ error: 'Não foi possível enviar agora.' }, 502);
  }
  return json({ ok: true });
}
