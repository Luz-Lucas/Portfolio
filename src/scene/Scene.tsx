'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { PerformanceMonitor, PerspectiveCamera, useGLTF, useProgress } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SCENE_MESSAGES, showSceneMessage } from '@/lib/easterEggs';
import { createLamp } from '@/lib/lamp';
import type { IntroPhase } from './intro';
import { fitFov } from './fov';
import { frameMode, IDLE_FPS } from './frames';
import { bakedToBasic, glowTexture, ribbonUVs, vaporMaterial } from './materials';
import { projectScreenRect, type ScreenRect } from './screenRect';

const MODEL = '/models/desk.glb';
const DRACO = '/draco/'; // decoder hospedado no próprio site (sem depender do gstatic)
useGLTF.preload(MODEL, DRACO);

type Props = {
  phase: IntroPhase;
  progress: () => number;
  /** 0..1 da aproximação da câmera (atravessa as fases da intro). */
  dolly: () => number;
  onReady: () => void;
  onProgress: (pct: number) => void;
  onScreenRect: (rect: ScreenRect) => void;
  /** Área de trabalho em tela cheia cobrindo a cena: para de renderizar. */
  covered?: boolean;
};

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
// Objetos assados em Bake_Objetos não são clicáveis: os cliques caem em volumes invisíveis.
// Posições lidas do desk.blend e convertidas de Z-up (Blender) para Y-up (glTF): (x, z, -y).
const LAMP_HIT = new THREE.Vector3(-0.35, 1.25, 0.04); // cúpula da luminária
const MUG_HIT = new THREE.Vector3(0.36, 0.8, -0.04); // caneca de café
const CLEAN_CODE_HIT = new THREE.Vector3(0.3881, 1.2385, -0.294); // lombada do Clean Code
const LAMP_OFF_DIM = 0.28;
/**
 * Pose final: de frente para o vidro do CRT, sem giro, para a área de trabalho (um retângulo) ficar reta sobre a tela.
 * Distância e deslocamento (m) escolhidos para a luminária e a caneca de café caberem no quadro (easter eggs).
 */
const END_VIEW = { distance: 0.64, right: -0.01, up: -0.03 };
const SCREEN_OFF = new THREE.Color('#0b0f0e');
const SCREEN_ON = new THREE.Color('#2a6f8a');
// BIOS e boot são telas pretas: o vidro fica quase preto, senão o azul aparece nas bordas do overlay em movimento.
const SCREEN_TEXT_MODE = new THREE.Color('#050607');
const LED_OFF = new THREE.Color('#14301a');
// acima de 1 para o Bloom pegar o LED aceso
const LED_ON = new THREE.Color('#39ff5a').multiplyScalar(2.5);

function Model({ phase, progress, dolly, onReady, onScreenRect }: Omit<Props, 'onProgress' | 'covered'>) {
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
    const baked: THREE.MeshBasicMaterial[] = [];
    scene.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
      if (mat?.name?.startsWith('Baked_')) baked.push(mat);
    });
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
    const glass = new THREE.Box3().setFromObject(screen).getCenter(new THREE.Vector3());
    const end = {
      position: glass.clone().add(new THREE.Vector3(END_VIEW.right, END_VIEW.up, END_VIEW.distance)),
      quaternion: new THREE.Quaternion(),
    };
    return { start: pose(camStart), end, fov: camEnd.fov, screen, led, vapors, glow, baked };
  }, [scene]);

  // Luminária: desligada, a iluminação assada escurece e só a tela do CRT continua acesa.
  const lamp = useMemo(() => createLamp(), []);
  const [lampOn, setLampOn] = useState(true);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    for (const m of parts.baked) m.color.setScalar(lampOn ? 1 : LAMP_OFF_DIM);
    invalidate();
  }, [lampOn, parts, invalidate]);
  useEffect(
    () => () => {
      for (const m of parts.baked) m.color.setScalar(1);
    },
    [parts],
  );
  const toggleLamp = () => {
    const { on, egg } = lamp.toggle();
    setLampOn(on);
    if (egg) showSceneMessage({ text: SCENE_MESSAGES.light, flicker: true });
  };

  useEffect(onReady, [onReady]);

  const fov = fitFov(parts.fov, size.width / size.height);

  // Retângulo da tela visto da pose final, com o aspecto atual da janela (refeito ao fim da intro).
  const settled = phase === 'desktop' || dolly() >= 1;
  useEffect(() => {
    if (!settled) return;
    const cam = new THREE.PerspectiveCamera(fov, size.width / size.height, 0.01, 50);
    cam.position.copy(parts.end.position);
    cam.quaternion.copy(parts.end.quaternion);
    cam.updateMatrixWorld();
    onScreenRect(projectScreenRect(parts.screen, cam, { w: size.width, h: size.height }));
  }, [parts, size, fov, onScreenRect, settled]);

  useFrame(({ clock }) => {
    const cam = camera.current;
    if (!cam) return;
    const t = easeInOut(dolly());
    cam.position.lerpVectors(parts.start.position, parts.end.position, t);
    cam.quaternion.slerpQuaternions(parts.start.quaternion, parts.end.quaternion, t);
    // A BIOS aparece no CRT durante a aproximação: o overlay acompanha a tela a cada quadro.
    if (phase !== 'loading' && t < 1) {
      cam.updateMatrixWorld();
      onScreenRect(projectScreenRect(parts.screen, cam, { w: size.width, h: size.height }));
    }

    const on = phase === 'poweron' ? progress() : phase === 'loading' ? 0 : 1;
    const lit = phase === 'desktop' ? SCREEN_ON : SCREEN_TEXT_MODE;
    (parts.screen.material as THREE.MeshBasicMaterial).color.lerpColors(SCREEN_OFF, lit, on);
    (parts.led.material as THREE.MeshBasicMaterial).color.copy(on > 0 ? LED_ON : LED_OFF);
    (parts.glow.material as THREE.MeshBasicMaterial).opacity = on * (phase === 'desktop' ? 0.5 : 0.12);
    for (const v of parts.vapors) v.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={fov} near={0.01} far={50} />
      <primitive object={scene} />
      <Hotspot enabled={phase === 'desktop'} position={LAMP_HIT} size={[0.18, 0.16, 0.18]} onClick={toggleLamp} />
      <Hotspot
        enabled={phase === 'desktop'}
        position={MUG_HIT}
        size={[0.1, 0.11, 0.1]}
        onDoubleClick={() => showSceneMessage({ text: SCENE_MESSAGES.coffee })}
      />
      <Hotspot
        enabled={phase === 'desktop'}
        position={CLEAN_CODE_HIT}
        size={[0.032, 0.235, 0.172]}
        onClick={() => showSceneMessage({ text: SCENE_MESSAGES.cleanCode })}
      />
    </>
  );
}

/** Volume invisível que recebe cliques sobre um objeto assado da cena. */
function Hotspot({
  enabled,
  position,
  size,
  onClick,
  onDoubleClick,
}: {
  enabled: boolean;
  position: THREE.Vector3;
  size: [number, number, number];
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onDoubleClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const guard = (fn?: (e: ThreeEvent<MouseEvent>) => void) =>
    fn &&
    ((e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (enabled) fn(e);
    });
  return (
    <mesh
      position={position}
      onClick={guard(onClick)}
      onDoubleClick={guard(onDoubleClick)}
      onPointerOver={() => enabled && (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  );
}

function Progress({ onProgress }: { onProgress: (pct: number) => void }) {
  const { progress } = useProgress();
  useEffect(() => {
    onProgress(progress);
  }, [progress, onProgress]);
  return null;
}

/** Renderiza sob demanda: contínuo na intro, IDLE_FPS na área de trabalho, nada em tela cheia. */
function FrameDriver({ phase, covered }: { phase: IntroPhase; covered: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const mode = frameMode(phase, covered);
  useEffect(() => {
    if (mode === 'off') return;
    // Ocioso: ainda pelo requestAnimationFrame (alinhado ao vsync, sem trancos na fumaça), pulando quadros.
    const minGap = mode === 'idle' ? 1000 / IDLE_FPS - 4 : 0;
    let raf = 0;
    let last = -Infinity;
    const loop = (now: number) => {
      if (now - last >= minGap) {
        last = now;
        invalidate();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, invalidate]);
  return null;
}

export default function Scene(props: Props) {
  const { onProgress, covered = false, ...rest } = props;
  // Qualidade alta = Bloom + dpr até 2. Se o FPS cair, o PerformanceMonitor desliga os dois.
  const [high, setHigh] = useState(true);
  return (
    <Canvas className="p3d-canvas" frameloop="demand" dpr={high ? [1, 2] : 1} gl={{ antialias: true }} flat>
      <FrameDriver phase={rest.phase} covered={covered} />
      <PerformanceMonitor onDecline={() => setHigh(false)} flipflops={2} />
      <color attach="background" args={['#0b0b0d']} />
      <Progress onProgress={onProgress} />
      <Suspense fallback={null}>
        <Model {...rest} />
      </Suspense>
      {high && (
        // As texturas já têm AgX: o Bloom só realça o que passa do limiar (lâmpada, LED, tela ligada).
        // multisampling > 0 deixava a cena preta (só uma faixa à esquerda desenhada) em GPUs reais (D3D11/ANGLE).
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.97} luminanceSmoothing={0.05} intensity={0.45} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
