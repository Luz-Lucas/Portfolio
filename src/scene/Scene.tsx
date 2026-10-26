'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor, PerspectiveCamera, useGLTF, useProgress } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { IntroPhase } from './intro';
import { fitFov } from './fov';
import { bakedToBasic, glowTexture, ribbonUVs, vaporMaterial } from './materials';
import { projectScreenRect, type ScreenRect } from './screenRect';

const MODEL = '/models/desk.glb';
const DRACO = '/draco/'; // decoder hospedado no próprio site (sem depender do gstatic)
useGLTF.preload(MODEL, DRACO);

type Props = {
  phase: IntroPhase;
  progress: () => number;
  onReady: () => void;
  onProgress: (pct: number) => void;
  onScreenRect: (rect: ScreenRect) => void;
};

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const SCREEN_OFF = new THREE.Color('#0b0f0e');
const SCREEN_ON = new THREE.Color('#2a6f8a');
const LED_OFF = new THREE.Color('#14301a');
// acima de 1 para o Bloom pegar o LED aceso
const LED_ON = new THREE.Color('#39ff5a').multiplyScalar(2.5);

function Model({ phase, progress, onReady, onScreenRect }: Omit<Props, 'onProgress'>) {
  const { scene } = useGLTF(MODEL, DRACO);
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const size = useThree((s) => s.size);

  const parts = useMemo(() => {
    scene.updateMatrixWorld(true);
    const camStart = scene.getObjectByName('CamStart') as THREE.PerspectiveCamera;
    const camEnd = scene.getObjectByName('CamEnd') as THREE.PerspectiveCamera;
    const screen = scene.getObjectByName('Screen') as THREE.Mesh;
    const led = scene.getObjectByName('PowerLED') as THREE.Mesh;
    bakedToBasic(scene);
    screen.material = new THREE.MeshBasicMaterial({ color: SCREEN_OFF.clone(), toneMapped: false });
    led.material = new THREE.MeshBasicMaterial({ color: LED_OFF.clone(), toneMapped: false });
    const vapors: THREE.ShaderMaterial[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.name.startsWith('Vapor')) return;
      ribbonUVs(m.geometry);
      const mat = vaporMaterial(vapors.length * 2.1);
      m.material = mat;
      m.renderOrder = 2;
      vapors.push(mat);
    });
    // brilho somado na frente da tela quando o CRT liga
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
    );
    screen.geometry.computeBoundingBox();
    const box = screen.geometry.boundingBox!.clone().applyMatrix4(screen.matrixWorld);
    const sz = box.getSize(new THREE.Vector3());
    glow.scale.set(sz.x * 2.2, sz.y * 2.4, 1);
    glow.position.copy(box.getCenter(new THREE.Vector3())).add(new THREE.Vector3(0, 0, 0.03));
    glow.renderOrder = 3;
    glow.name = 'ScreenGlow';
    // a cena do GLTF fica em cache: remove o brilho de uma montagem anterior antes de adicionar
    scene.getObjectByName('ScreenGlow')?.removeFromParent();
    scene.add(glow);
    const pose = (c: THREE.Object3D) => ({
      position: c.getWorldPosition(new THREE.Vector3()),
      quaternion: c.getWorldQuaternion(new THREE.Quaternion()),
    });
    return { start: pose(camStart), end: pose(camEnd), fov: camEnd.fov, screen, led, vapors, glow };
  }, [scene]);

  useEffect(onReady, [onReady]);

  const fov = fitFov(parts.fov, size.width / size.height);

  // Retângulo da tela visto da pose final, com o aspecto atual da janela.
  useEffect(() => {
    const cam = new THREE.PerspectiveCamera(fov, size.width / size.height, 0.01, 50);
    cam.position.copy(parts.end.position);
    cam.quaternion.copy(parts.end.quaternion);
    cam.updateMatrixWorld();
    onScreenRect(projectScreenRect(parts.screen, cam, { w: size.width, h: size.height }));
  }, [parts, size, fov, onScreenRect]);

  useFrame(({ clock }) => {
    const cam = camera.current;
    if (!cam) return;
    const t = phase === 'dolly' ? easeInOut(progress()) : phase === 'loading' ? 0 : 1;
    cam.position.lerpVectors(parts.start.position, parts.end.position, t);
    cam.quaternion.slerpQuaternions(parts.start.quaternion, parts.end.quaternion, t);

    const on = phase === 'poweron' ? progress() : phase === 'boot' || phase === 'desktop' ? 1 : 0;
    (parts.screen.material as THREE.MeshBasicMaterial).color.lerpColors(SCREEN_OFF, SCREEN_ON, on);
    (parts.led.material as THREE.MeshBasicMaterial).color.copy(on > 0 ? LED_ON : LED_OFF);
    (parts.glow.material as THREE.MeshBasicMaterial).opacity = on * 0.5;
    for (const v of parts.vapors) v.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={fov} near={0.01} far={50} />
      <primitive object={scene} />
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
  // Qualidade alta = Bloom + dpr até 2. Se o FPS cair, o PerformanceMonitor desliga os dois.
  const [high, setHigh] = useState(true);
  return (
    <Canvas className="p3d-canvas" dpr={high ? [1, 2] : 1} gl={{ antialias: true }} flat>
      <PerformanceMonitor onDecline={() => setHigh(false)} flipflops={2} />
      <color attach="background" args={['#0b0b0d']} />
      <Progress onProgress={onProgress} />
      <Suspense fallback={null}>
        <Model {...rest} />
      </Suspense>
      {high && (
        // As texturas já têm AgX: o Bloom só realça o que passa do limiar (lâmpada, LED, tela ligada).
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={0.97} luminanceSmoothing={0.05} intensity={0.45} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
