/** Fisher–Yates shuffle (копия массива). */
export const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** Переупорядочивает раунды так, чтобы один трек (title) не шёл два раза подряд. */
export const reorderNoConsecutiveSameTitle = <T extends { title: string }>(rounds: T[]): T[] => {
  if (rounds.length <= 1) return [...rounds];
  const result: T[] = [];
  const remaining = [...rounds];
  while (remaining.length > 0) {
    const lastTitle = result[result.length - 1]?.title ?? null;
    const idx = remaining.findIndex((r) => r.title !== lastTitle);
    const pickIdx = idx >= 0 ? idx : 0;
    result.push(remaining[pickIdx]);
    remaining.splice(pickIdx, 1);
  }
  return result;
};
