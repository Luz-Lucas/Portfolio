export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const without = <T>(list: T[], i: number): T[] => list.filter((_, j) => j !== i);
