/** Proporção mais estreita em que o enquadramento das câmeras do Blender ainda cabe sem cortar (16:10). */
export const REFERENCE_ASPECT = 16 / 10;

/**
 * FOV vertical (graus) para a proporção atual. Em telas mais estreitas que 16:10 (tablet em pé)
 * mantém o FOV horizontal de 16:10, para o monitor não sair cortado dos lados.
 */
export function fitFov(fovYDeg: number, aspect: number, reference = REFERENCE_ASPECT): number {
  if (aspect >= reference) return fovYDeg;
  const half = (fovYDeg * Math.PI) / 360;
  return (2 * Math.atan((Math.tan(half) * reference) / aspect) * 180) / Math.PI;
}
