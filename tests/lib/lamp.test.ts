import { describe, expect, it } from 'vitest';
import { createLamp } from '@/lib/lamp';

describe('createLamp', () => {
  it('starts on and toggles', () => {
    const lamp = createLamp();
    expect(lamp.on).toBe(true);
    expect(lamp.toggle()).toEqual({ on: false, egg: false });
    expect(lamp.toggle()).toEqual({ on: true, egg: false });
  });

  it('fires the easter egg on the third off→on cycle, then starts counting again', () => {
    const lamp = createLamp();
    const cycle = () => (lamp.toggle(), lamp.toggle().egg);
    expect([cycle(), cycle(), cycle()]).toEqual([false, false, true]);
    expect([cycle(), cycle(), cycle()]).toEqual([false, false, true]);
  });
});
