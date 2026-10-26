import { Resend } from 'resend';
import { contactSchema, rateLimit } from '@/lib/contact';

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, 400);

  const { name, email, message, website } = parsed.data;
  if (website) return json({ ok: true });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip, Date.now())) return json({ error: 'Muitas mensagens, tente mais tarde.' }, 429);

  const to = process.env.CONTACT_TO_EMAIL;
  if (!to || !process.env.RESEND_API_KEY) return json({ error: 'Contato indisponível no momento.' }, 503);

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: 'Portfólio <onboarding@resend.dev>',
    to,
    replyTo: email,
    subject: `Portfólio: mensagem de ${name}`,
    text: `${name} <${email}>\n\n${message}`,
  });
  if (error) return json({ error: 'Não foi possível enviar agora.' }, 502);

  return json({ ok: true });
}
