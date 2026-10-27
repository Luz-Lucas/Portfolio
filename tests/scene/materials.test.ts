import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { bakedToBasic, ribbonUVs } from '@/scene/materials';

describe('bakedToBasic', () => {
  it('swaps Baked_* materials for unlit basic materials keeping the lightmap', () => {
    const map = new THREE.Texture();
    const baked = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ name: 'Baked_Fundo', map }));
    const other = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ name: 'Tela' }));
    const root = new THREE.Group().add(baked, other);
    expect(bakedToBasic(root)).toBe(1);
    const m = baked.material as unknown as THREE.MeshBasicMaterial;
    expect(m).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(m.map).toBe(map);
    expect(m.toneMapped).toBe(false);
    expect(other.material).toBeInstanceOf(THREE.MeshStandardMaterial);
  });

  it('is idempotent: running again keeps the same materials (cached GLTF, StrictMode)', () => {
    const baked = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ name: 'Baked_Fundo' }));
    const root = new THREE.Group().add(baked);
    bakedToBasic(root);
    const first = baked.material;
    expect(bakedToBasic(root)).toBe(0);
    expect(baked.material).toBe(first);
  });
});

describe('ribbonUVs', () => {
  it('maps height to v (0..1) and position across each row to u (0..1)', () => {
    const geo = new THREE.BufferGeometry();
    // 2 linhas (y = 0 e y = 0.1), 3 vértices em cada, deslocados em x
    geo.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.01, 0, 0, 0, 0, 0, 0.01, 0, 0,
      0.0, 0.1, 0, 0.01, 0.1, 0, 0.02, 0.1, 0,
    ], 3));
    ribbonUVs(geo);
    const uv = geo.getAttribute('uv');
    expect([uv.getX(0), uv.getY(0)]).toEqual([0, 0]);
    expect([uv.getX(1), uv.getY(1)]).toEqual([0.5, 0]);
    expect(uv.getX(5)).toBeCloseTo(1);
    expect(uv.getY(5)).toBeCloseTo(1);
  });
});
