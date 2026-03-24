import { useCallback, useRef } from "react";

const TAP_WINDOW_MS = 1200;

export function useTripleTap(onTriple: () => void) {
  const ref = useRef({ count: 0, lastTapMs: 0 });

  return useCallback(() => {
    const now = performance.now();
    const isFastTap = now - ref.current.lastTapMs < TAP_WINDOW_MS;
    const nextCount = isFastTap ? ref.current.count + 1 : 1;
    ref.current = { count: nextCount, lastTapMs: now };
    if (nextCount >= 3) {
      ref.current = { count: 0, lastTapMs: 0 };
      onTriple();
    }
  }, [onTriple]);
}
