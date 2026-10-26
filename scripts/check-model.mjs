// Valida public/models/desk.glb: nós obrigatórios, câmeras e orçamento de tamanho.
import { existsSync, statSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const FILE = process.argv[2] ?? 'public/models/desk.glb';
const MAX_BYTES = 3 * 1024 * 1024;
const MESHES = ['Screen', 'PowerLED'];
const CAMERAS = ['CamStart', 'CamEnd'];

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!existsSync(FILE)) fail(`${FILE.split('/').pop()} não encontrado`);

const size = statSync(FILE).size;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
try {
  const draco3d = (await import('draco3dgltf')).default;
  io.registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
} catch {
  // Sem draco3dgltf: só funciona com arquivos não comprimidos.
}

const doc = await io.read(FILE);
const nodes = new Map(doc.getRoot().listNodes().map((n) => [n.getName(), n]));
const errors = [];

for (const name of MESHES) if (!nodes.get(name)?.getMesh()) errors.push(`malha "${name}" ausente`);
for (const name of CAMERAS) if (!nodes.get(name)?.getCamera()) errors.push(`câmera "${name}" ausente`);
if (size > MAX_BYTES) errors.push(`arquivo com ${(size / 1024 / 1024).toFixed(2)} MB (máx. 3 MB)`);

if (errors.length) fail(errors.join('; '));
console.log(`✓ ${FILE}: ${(size / 1024 / 1024).toFixed(2)} MB, ${nodes.size} nós`);
