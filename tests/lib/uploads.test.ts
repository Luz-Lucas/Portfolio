import { describe, expect, it } from 'vitest';
import { sniffType, validateUpload } from '@/lib/uploads';

const MB = 1024 * 1024;

describe('validateUpload', () => {
  it('accepts a 4 MB pdf as cv', () => {
    expect(validateUpload({ type: 'application/pdf', size: 4 * MB }, 'cv')).toEqual({ ok: true });
  });
  it('rejects a png as cv', () => {
    expect(validateUpload({ type: 'image/png', size: MB }, 'cv')).toEqual({ ok: false, error: 'O currículo precisa ser um PDF.' });
  });
  it('rejects a 6 MB pdf', () => {
    expect(validateUpload({ type: 'application/pdf', size: 6 * MB }, 'cv')).toEqual({ ok: false, error: 'Arquivo maior que 5 MB.' });
  });
  it('accepts a 1 MB webp image', () => {
    expect(validateUpload({ type: 'image/webp', size: MB }, 'image')).toEqual({ ok: true });
  });
  it('rejects a pdf as image', () => {
    expect(validateUpload({ type: 'application/pdf', size: MB }, 'image').ok).toBe(false);
  });
  it('rejects a 3 MB image', () => {
    expect(validateUpload({ type: 'image/jpeg', size: 3 * MB }, 'image')).toEqual({ ok: false, error: 'Imagem maior que 2 MB.' });
  });
});

describe('sniffType', () => {
  const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);
  it('recognizes pdf, png, jpeg and webp magic numbers', () => {
    expect(sniffType(bytes(0x25, 0x50, 0x44, 0x46))).toBe('application/pdf');
    expect(sniffType(bytes(0x89, 0x50, 0x4e, 0x47))).toBe('image/png');
    expect(sniffType(bytes(0xff, 0xd8, 0xff))).toBe('image/jpeg');
    expect(sniffType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe('image/webp');
  });
  it('returns null for anything else', () => {
    expect(sniffType(bytes(0x3c, 0x73, 0x76, 0x67))).toBeNull();
  });
});
