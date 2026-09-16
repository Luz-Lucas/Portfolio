'use client';

import * as React from 'react';
import {
  LayoutGroup,
  motion,
  useAnimate,
  type Transition,
  type AnimationSequence,
} from 'motion/react';

interface ComponentProps {
  orbitItems: OrbitItem[];
  stageSize?: number;
  imageSize?: number;
}

type OrbitItem = {
  id: number;
  name: string;
  src: string;
};

const transition: Transition = {
  stiffness: 300,
  damping: 35,
  type: 'spring',
  restSpeed: 0.01,
  restDelta: 0.01,
};

const spinConfig = {
  duration: 30,
  ease: 'linear' as const,
  repeat: Infinity,
};

const qsa = (root: Element, sel: string) =>
  Array.from(root.querySelectorAll(sel));

const angleOf = (el: Element) => Number((el as HTMLElement).dataset.angle || 0);

const armOfImg = (img: Element) =>
  (img as HTMLElement).closest('[data-arm]') as HTMLElement | null;

function RadialIntro({
  orbitItems,
  stageSize = 320,
  imageSize = 60,
}: ComponentProps) {
  const step = 360 / orbitItems.length;
  const [scope, animate] = useAnimate();
  const stopsRef = React.useRef<Array<() => void>>([]);

  React.useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const arms = qsa(root, '[data-arm]');
    const imgs = qsa(root, '[data-arm-image]');
    stopsRef.current = [];

    const timers: number[] = [];

    // Image lift-in animation
    timers.push(
      window.setTimeout(() => {
        void animate(imgs, { top: 0 }, transition);
      }, 250)
    );

    // Build sequence for orbit placement
    const orbitPlacementSequence = [
      ...arms.map((el) => [
        el,
        { rotate: angleOf(el) },
        { ...transition, at: 0 },
      ]),
      ...imgs.map((img) => [
        img,
        { rotate: -angleOf(armOfImg(img)!), opacity: 1 },
        { ...transition, at: 0 },
      ]),
    ] as AnimationSequence;

    timers.push(
      window.setTimeout(() => {
        void animate(orbitPlacementSequence);
      }, 700)
    );

    // Start continuous spin
    timers.push(
      window.setTimeout(() => {
        // Arms spin clockwise
        arms.forEach((el) => {
          const angle = angleOf(el);
          const ctrl = animate(el, { rotate: [angle, angle + 360] }, spinConfig);
          stopsRef.current.push(() => ctrl.cancel());
        });

        // Images counter-spin to stay upright
        imgs.forEach((img) => {
          const arm = armOfImg(img);
          const angle = arm ? angleOf(arm) : 0;
          const ctrl = animate(
            img,
            { rotate: [-angle, -angle - 360] },
            spinConfig,
          );
          stopsRef.current.push(() => ctrl.cancel());
        });
      }, 1300)
    );

    return () => {
      timers.forEach(clearTimeout);
      stopsRef.current.forEach((stop) => stop());
    };
  }, [scope, animate, step]);

  return (
    <LayoutGroup>
      <motion.div
        ref={scope}
        className="relative overflow-visible will-change-transform"
        style={{ width: stageSize, height: stageSize }}
        initial={false}
      >
        {orbitItems.map((item, i) => (
          <motion.div
            key={item.id}
            data-arm
            className="will-change-transform absolute inset-0"
            style={{ zIndex: orbitItems.length - i }}
            data-angle={i * step}
            layoutId={`arm-${item.id}`}
          >
            <motion.img
              data-arm-image
              className="rounded-full object-fill absolute left-1/2 -translate-x-1/2 will-change-transform"
              style={{
                width: imageSize,
                height: imageSize,
                opacity: i === 0 ? 1 : 0,
                top: '50%',
              }}
              src={item.src}
              alt={item.name}
              draggable={false}
              layoutId={`arm-img-${item.id}`}
              loading="lazy"
            />
          </motion.div>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

export { RadialIntro };
