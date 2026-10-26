import * as THREE from 'three';

/**
 * A iluminação já vem assada nas texturas (com a curva AgX aplicada no Blender),
 * então os materiais Baked_* viram MeshBasicMaterial, sem luz e sem tone mapping.
 */
export function bakedToBasic(root: THREE.Object3D): number {
  let count = 0;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (!mat?.name?.startsWith('Baked_')) return;
    mesh.material = new THREE.MeshBasicMaterial({ name: mat.name, map: mat.map, toneMapped: false });
    mat.dispose();
    count++;
  });
  return count;
}

/** UVs para as fitas de fumaça: v ao longo da altura, u através de cada linha de vértices. */
export function ribbonUVs(geometry: THREE.BufferGeometry): void {
  const pos = geometry.getAttribute('position');
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox!;
  const height = max.y - min.y || 1;
  const rows = new Map<number, number[]>();
  for (let i = 0; i < pos.count; i++) {
    const key = Math.round(pos.getY(i) * 1e4);
    rows.set(key, [...(rows.get(key) ?? []), i]);
  }
  const uv = new Float32Array(pos.count * 2);
  for (const idx of rows.values()) {
    const xs = idx.map((i) => pos.getX(i));
    const lo = Math.min(...xs);
    const span = Math.max(...xs) - lo || 1;
    for (const i of idx) {
      uv[i * 2] = (pos.getX(i) - lo) / span;
      uv[i * 2 + 1] = (pos.getY(i) - min.y) / height;
    }
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/** Fumaça do café: fita semitransparente que ondula e some nas pontas. */
export function vaporMaterial(seed: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uSeed: { value: seed } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSeed;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        p.x += sin(uv.y * 9.0 - uTime * 1.6 + uSeed) * 0.006 * uv.y;
        p.z += cos(uv.y * 7.0 - uTime * 1.2 + uSeed) * 0.004 * uv.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uSeed;
      varying vec2 vUv;
      void main() {
        float along = sin(3.14159 * vUv.y);
        float across = sin(3.14159 * vUv.x);
        float flicker = 0.6 + 0.4 * sin(vUv.y * 14.0 - uTime * 2.4 + uSeed * 3.0);
        float a = along * across * flicker * 0.32;
        gl_FragColor = vec4(vec3(0.95, 0.93, 0.9), a);
      }
    `,
  });
}

/** Textura radial para o brilho do CRT ligado (somado por cima da cena). */
export function glowTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, 'rgba(140,200,255,0.55)');
  grad.addColorStop(1, 'rgba(140,200,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
