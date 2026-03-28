import { useCallback, useRef } from "react";

const WINDOW_MS = 1200;

/** Тройное срабатывание в окне времени (тапы, клики, пробелы). */
export function useTripleActivation(onTriple: () => void) {
  const ref = useRef({ count: 0, lastMs: 0 });

  return useCallback(() => {
    const now = performance.now();
    const isFast = now - ref.current.lastMs < WINDOW_MS;
    const nextCount = isFast ? ref.current.count + 1 : 1;
    ref.current = { count: nextCount, lastMs: now };
    if (nextCount >= 3) {
      ref.current = { count: 0, lastMs: 0 };
      onTriple();
    }
  }, [onTriple]);
}
