import { describe, expect, it } from 'vitest';
import { contactSchema, createRateLimiter } from '@/lib/contact';

const valid = { name: 'Ana', email: 'ana@exemplo.com', message: 'Olá, vi seu portfólio!' };

describe('contactSchema', () => {
  it('accepts a valid message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it('rejects an invalid e-mail', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'ana@' }).success).toBe(false);
  });
  it('rejects a message shorter than 10 chars', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'oi' }).success).toBe(false);
  });
});

describe('rateLimit', () => {
  it('allows 3 sends per IP per 10 minutes', () => {
    const rateLimit = createRateLimiter();
    const t0 = 1_000_000;
    expect([rateLimit('1.1.1.1', t0), rateLimit('1.1.1.1', t0 + 1), rateLimit('1.1.1.1', t0 + 2)]).toEqual([
      true,
      true,
      true,
    ]);
    expect(rateLimit('1.1.1.1', t0 + 3)).toBe(false);
    expect(rateLimit('2.2.2.2', t0 + 3)).toBe(true);
    expect(rateLimit('1.1.1.1', t0 + 10 * 60_000 + 1)).toBe(true);
  });
});
