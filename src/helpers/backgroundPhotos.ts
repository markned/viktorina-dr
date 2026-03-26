import { shuffle } from "./shuffle";

/**
 * Строит последовательность имён файлов из `pool` длины `length` (фоны раундов).
 *
 * Логика «кругов»: в каждом круге длины `pool.length` каждая картинка встречается ровно один раз
 * (случайная перестановка всего пула). Если раундов больше, чем файлов, следующий круг снова —
 * полная перестановка; повтор конкретного файла возможен только после того, как в предыдущем круге
 * были показаны все картинки. На стыке кругов два одинаковых подряд не ставятся (при `pool.length >= 2`).
 *
 * Если всего раундов меньше, чем картинок — берётся начало одной перестановки (все выбранные раунды
 * с разными фото).
 *
 * Список `pool` задаётся на этапе сборки из `public/content/photos/*.jpg`.
 */
export function buildBackgroundPhotoSequence(length: number, pool: readonly string[]): (string | null)[] {
  if (length <= 0) return [];
  if (pool.length === 0) return Array.from({ length }, () => null);
  if (pool.length === 1) return Array.from({ length }, () => pool[0]!);

  const p = pool.length;
  const out: string[] = [];
  let remaining = length;

  while (remaining > 0) {
    const chunk = Math.min(p, remaining);
    let cycle = shuffle([...pool]);
    const prev = out.length > 0 ? out[out.length - 1]! : null;

    if (prev !== null && cycle[0] === prev) {
      const fixIdx = cycle.findIndex((f, i) => i > 0 && f !== prev);
      if (fixIdx >= 0) {
        [cycle[0], cycle[fixIdx]] = [cycle[fixIdx], cycle[0]];
      } else {
        let tries = 0;
        while (cycle[0] === prev && tries < 100) {
          cycle = shuffle([...pool]);
          tries += 1;
        }
      }
    }

    for (let i = 0; i < chunk; i++) {
      out.push(cycle[i]!);
    }
    remaining -= chunk;
  }

  return out;
}
