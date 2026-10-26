import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80),
  email: z.string().trim().email('E-mail inválido.'),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, 'A mensagem precisa ter pelo menos 10 caracteres.').max(2000),
  /** Honeypot: humanos não preenchem. */
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 3;

/** Limite best-effort em memória (por instância serverless). */
export function createRateLimiter() {
  const hits = new Map<string, number[]>();
  return (ip: string, now: number): boolean => {
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_PER_WINDOW) {
      hits.set(ip, recent);
      return false;
    }
    hits.set(ip, [...recent, now]);
    return true;
  };
}

export const rateLimit = createRateLimiter();
