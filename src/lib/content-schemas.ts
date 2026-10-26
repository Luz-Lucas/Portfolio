import { z } from 'zod';
import type { ContentKey } from './content';

/** Só http(s): bloqueia javascript:, data: e afins em links renderizados no site. */
export const httpUrl = (message = 'Informe uma URL válida (com https://).') =>
  z.string().trim().url(message).regex(/^https?:\/\//i, message);
const url = httpUrl();
const yearMonth = z.string().regex(/^\d{4}(-\d{2})?$/, 'Use o formato AAAA ou AAAA-MM.');

export const contentSchemas = {
  readme: z.object({ body: z.string().trim().min(1, 'O Leia-me não pode ficar vazio.').max(4000) }),
  about: z.object({
    name: z.string().trim().min(1, 'Informe o nome.').max(80),
    role: z.string().trim().min(1, 'Informe o cargo.').max(120),
    bio: z.string().trim().max(4000),
    location: z.string().trim().max(120),
    availability: z.string().trim().max(120),
    // https:// ou um arquivo do próprio site (ex.: /images/avatar.webp); "//host" não conta como local.
    photoUrl: z.union([url, z.string().regex(/^\/(?!\/)[\w./-]+$/, 'Informe uma URL válida.')]).nullable(),
  }),
  contact: z.object({
    email: z.string().trim().email('E-mail inválido.'),
    linkedin: url,
    github: url,
  }),
  skills: z.array(
    z.object({
      group: z.string().trim().min(1, 'Informe o nome do grupo.').max(60),
      description: z.string().trim().max(200).optional(),
      items: z.array(
        z.object({
          name: z.string().trim().min(1, 'Informe o nome da skill.').max(60),
          level: z.number().int().min(1, 'Nível de 1 a 5.').max(5, 'Nível de 1 a 5.').optional(),
          years: z.number().min(0).max(60).optional(),
        }),
      ),
    }),
  ),
  experience: z.array(
    z.object({
      kind: z.enum(['job', 'education']),
      title: z.string().trim().min(1, 'Informe o título.').max(120),
      org: z.string().trim().min(1, 'Informe a organização.').max(120),
      start: yearMonth,
      end: yearMonth.nullable(),
      description: z.string().trim().max(2000),
      highlights: z.array(z.string().trim().min(1).max(200)).max(10).optional(),
    }),
  ),
} satisfies Record<ContentKey, z.ZodTypeAny>;
