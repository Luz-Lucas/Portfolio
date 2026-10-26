// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { Document, NodeIO } from '@gltf-transform/core';

async function makeGlb(names: { meshes: string[]; cameras: string[] }) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const pos = doc.createAccessor().setType('VEC3').setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])).setBuffer(buffer);
  const scene = doc.createScene();
  for (const n of names.meshes) {
    const mesh = doc.createMesh(n).addPrimitive(doc.createPrimitive().setAttribute('POSITION', pos));
    scene.addChild(doc.createNode(n).setMesh(mesh));
  }
  for (const n of names.cameras) scene.addChild(doc.createNode(n).setCamera(doc.createCamera(n).setType('perspective').setYFov(0.6).setZNear(0.01).setAspectRatio(1.7)));
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'glb-')), 'desk.glb');
  await new NodeIO().write(file, doc);
  return file;
}

const run = (file: string) => {
  try {
    return { code: 0, out: execFileSync('node', ['scripts/check-model.mjs', file], { encoding: 'utf8', stdio: 'pipe' }) };
  } catch (e) {
    const err = e as { status: number; stderr: string };
    return { code: err.status, out: err.stderr };
  }
};

describe('check-model', () => {
  it('passes a model with all required nodes', async () => {
    const file = await makeGlb({ meshes: ['Screen', 'PowerLED'], cameras: ['CamStart', 'CamEnd'] });
    expect(run(file).code).toBe(0);
  });

  it('fails and names what is missing', async () => {
    const file = await makeGlb({ meshes: ['Screen'], cameras: ['CamStart'] });
    const r = run(file);
    expect(r.code).toBe(1);
    expect(r.out).toContain('PowerLED');
    expect(r.out).toContain('CamEnd');
  });
});
