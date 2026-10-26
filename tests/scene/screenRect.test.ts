import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { projectScreenRect } from '@/scene/screenRect';

function setup(x = 0) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 3));
  mesh.position.set(x, 0, 0);
  mesh.updateMatrixWorld();
  const camera = new THREE.PerspectiveCamera(50, 1600 / 900, 0.1, 100);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return { mesh, camera };
}

describe('projectScreenRect', () => {
  it('projects a centered 4:3 plane to a centered 4:3 rect', () => {
    const { mesh, camera } = setup();
    const r = projectScreenRect(mesh, camera, { w: 1600, h: 900 });
    expect(r.left + r.width / 2).toBeCloseTo(800, 0);
    expect(r.top + r.height / 2).toBeCloseTo(450, 0);
    expect(r.width / r.height).toBeCloseTo(4 / 3, 2);
  });

  it('moving the plane to +x moves the rect right', () => {
    const a = setup(0);
    const b = setup(1);
    expect(projectScreenRect(b.mesh, b.camera, { w: 1600, h: 900 }).left).toBeGreaterThan(
      projectScreenRect(a.mesh, a.camera, { w: 1600, h: 900 }).left,
    );
  });
});
