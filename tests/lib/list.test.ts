import { describe, expect, it } from 'vitest';
import { moveItem, without } from '@/lib/list';

describe('list helpers', () => {
  it('moveItem moves an element without mutating the input', () => {
    const input = ['a', 'b', 'c'];
    expect(moveItem(input, 2, 0)).toEqual(['c', 'a', 'b']);
    expect(moveItem(input, 0, 1)).toEqual(['b', 'a', 'c']);
    expect(input).toEqual(['a', 'b', 'c']);
  });

  it('without removes the index', () => {
    expect(without(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });
});
