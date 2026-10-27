/** Ciclos desliga→liga da luminária que disparam o easter egg. */
export const EGG_CYCLES = 3;

/** Evento disparado na janela quando o easter egg acontece (a cena 3D avisa a área de trabalho). */
export const MORE_LIGHT_EVENT = 'luz95:mais-luz';

export function createLamp() {
  let on = true;
  let cycles = 0;
  return {
    get on() {
      return on;
    },
    toggle(): { on: boolean; egg: boolean } {
      on = !on;
      if (!on) return { on, egg: false };
      cycles += 1;
      const egg = cycles === EGG_CYCLES;
      if (egg) cycles = 0;
      return { on, egg };
    },
  };
}
