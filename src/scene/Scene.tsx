'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import type { IntroPhase } from './intro';
import { projectScreenRect, type ScreenRect } from './screenRect';

const MODEL = '/models/desk.glb';
useGLTF.preload(MODEL, true);

type Props = {
  phase: IntroPhase;
  progress: () => number;
  onReady: () => void;
  onProgress: (pct: number) => void;
  onScreenRect: (rect: ScreenRect) => void;
};

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const SCREEN_ON = new THREE.Color('#2a6f8a');

function Model({ phase, progress, onReady, onScreenRect }: Omit<Props, 'onProgress'>) {
  const { scene } = useGLTF(MODEL, true);
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const size = useThree((s) => s.size);

  const parts = useMemo(() => {
    scene.updateMatrixWorld(true);
    const camStart = scene.getObjectByName('CamStart') as THREE.PerspectiveCamera;
    const camEnd = scene.getObjectByName('CamEnd') as THREE.PerspectiveCamera;
    const screen = scene.getObjectByName('Screen') as THREE.Mesh;
    const led = scene.getObjectByName('PowerLED') as THREE.Mesh;
    screen.material = new THREE.MeshStandardMaterial({ color: '#141816', roughness: 0.15, metalness: 0.1 });
    led.material = new THREE.MeshStandardMaterial({ color: '#203020' });
    const pose = (c: THREE.Object3D) => ({
      position: c.getWorldPosition(new THREE.Vector3()),
      quaternion: c.getWorldQuaternion(new THREE.Quaternion()),
    });
    return { start: pose(camStart), end: pose(camEnd), fov: camEnd.fov, screen, led };
  }, [scene]);

  const glow = useRef<THREE.PointLight>(null);

  useEffect(onReady, [onReady]);

  // Retângulo da tela visto da pose final, com o aspecto atual da janela.
  useEffect(() => {
    const cam = new THREE.PerspectiveCamera(parts.fov, size.width / size.height, 0.01, 50);
    cam.position.copy(parts.end.position);
    cam.quaternion.copy(parts.end.quaternion);
    cam.updateMatrixWorld();
    onScreenRect(projectScreenRect(parts.screen, cam, { w: size.width, h: size.height }));
  }, [parts, size, onScreenRect]);

  useFrame(() => {
    const cam = camera.current;
    if (!cam) return;
    const t = phase === 'dolly' ? easeInOut(progress()) : phase === 'loading' ? 0 : 1;
    cam.position.lerpVectors(parts.start.position, parts.end.position, t);
    cam.quaternion.slerpQuaternions(parts.start.quaternion, parts.end.quaternion, t);

    const on = phase === 'poweron' ? progress() : phase === 'boot' || phase === 'desktop' ? 1 : 0;
    const mat = parts.screen.material as THREE.MeshStandardMaterial;
    mat.emissive.copy(SCREEN_ON);
    mat.emissiveIntensity = on * 1.2;
    (parts.led.material as THREE.MeshStandardMaterial).emissive.set(on > 0 || phase !== 'loading' ? '#39ff5a' : '#000');
    if (glow.current) glow.current.intensity = on * 0.15;
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={parts.fov} near={0.01} far={50} />
      <primitive object={scene} />
      <pointLight
        ref={glow}
        color="#7fb6ff"
        distance={1.2}
        decay={2}
        position={[parts.end.position.x, parts.end.position.y - 0.05, parts.end.position.z - 0.35]}
      />
    </>
  );
}

function Progress({ onProgress }: { onProgress: (pct: number) => void }) {
  const { progress } = useProgress();
  useEffect(() => onProgress(progress), [progress, onProgress]);
  return null;
}

export default function Scene(props: Props) {
  const { onProgress, ...rest } = props;
  return (
    <Canvas className="p3d-canvas" dpr={[1, 2]} gl={{ antialias: true }} flat>
      <color attach="background" args={['#0b0b0d']} />
      <ambientLight intensity={0.25} />
      <spotLight position={[-0.6, 1.6, 0.4]} angle={0.8} penumbra={0.8} intensity={1.5} color="#ffcf8a" />
      <Progress onProgress={onProgress} />
      <Suspense fallback={null}>
        <Model {...rest} />
      </Suspense>
    </Canvas>
  );
}
