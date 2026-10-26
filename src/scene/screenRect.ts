import * as THREE from 'three';

export type ScreenRect = { left: number; top: number; width: number; height: number };

/** Palco lógico da área de trabalho dentro do monitor (escalado para caber no retângulo projetado). */
export const DESKTOP_LOGICAL = { w: 800, h: 600 } as const;

const corner = new THREE.Vector3();

/** Retângulo em pixels que envolve a malha da tela vista pela câmera. */
export function projectScreenRect(mesh: THREE.Mesh, camera: THREE.Camera, viewport: { w: number; h: number }): ScreenRect {
  const geometry = mesh.geometry;
  if (!geometry.boundingBox) geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox!;

  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const x of [min.x, max.x])
    for (const y of [min.y, max.y])
      for (const z of [min.z, max.z]) {
        corner.set(x, y, z).applyMatrix4(mesh.matrixWorld).project(camera);
        const px = ((corner.x + 1) / 2) * viewport.w;
        const py = ((1 - corner.y) / 2) * viewport.h;
        x0 = Math.min(x0, px);
        y0 = Math.min(y0, py);
        x1 = Math.max(x1, px);
        y1 = Math.max(y1, py);
      }

  return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
}
