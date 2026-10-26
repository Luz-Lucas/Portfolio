export type UploadKind = 'cv' | 'image';
type Result = { ok: true } | { ok: false; error: string };

const MB = 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function validateUpload(file: { type: string; size: number }, kind: UploadKind): Result {
  if (kind === 'cv') {
    if (file.type !== 'application/pdf') return { ok: false, error: 'O currículo precisa ser um PDF.' };
    if (file.size > 5 * MB) return { ok: false, error: 'Arquivo maior que 5 MB.' };
    return { ok: true };
  }
  if (!IMAGE_TYPES.includes(file.type)) return { ok: false, error: 'Envie uma imagem PNG, JPEG ou WebP.' };
  if (file.size > 2 * MB) return { ok: false, error: 'Imagem maior que 2 MB.' };
  return { ok: true };
}

const startsWith = (b: Uint8Array, sig: number[], offset = 0) => sig.every((v, i) => b[offset + i] === v);

/** Tipo real pelo magic number (não confia no `type` enviado pelo navegador). */
export function sniffType(b: Uint8Array): string | null {
  if (startsWith(b, [0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
  if (startsWith(b, [0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (startsWith(b, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
  return null;
}

export const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/** Valida declarado + real; retorna o tipo real. */
export async function checkFile(file: File | null, kind: UploadKind): Promise<{ ok: true; type: string; bytes: Uint8Array } | { ok: false; error: string }> {
  if (!file || typeof file === 'string' || file.size === 0) return { ok: false, error: 'Escolha um arquivo.' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffType(bytes);
  const declared = validateUpload(file, kind);
  if (!declared.ok) return declared;
  const real = validateUpload({ type: type ?? 'unknown', size: file.size }, kind);
  if (!real.ok) return { ok: false, error: kind === 'cv' ? 'O currículo precisa ser um PDF.' : 'Arquivo não é uma imagem válida.' };
  return { ok: true, type: type!, bytes };
}
