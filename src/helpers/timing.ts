const SECOND = 1000;

export const roundSeconds = (value: number): number => Math.max(0, Math.ceil(value));

export const nowMs = (): number => performance.now();

export const createAccurateCountdown = (
  durationSec: number,
  onTick: (remainingSec: number) => void,
  onComplete: () => void,
): (() => void) => {
  let rafId: number | null = null;
  const startAt = nowMs();
  const durationMs = durationSec * SECOND;
  let ended = false;

  const tick = () => {
    if (ended) {
      return;
    }

    const elapsed = nowMs() - startAt;
    const remainingMs = Math.max(0, durationMs - elapsed);
    const remainingSec = roundSeconds(remainingMs / SECOND);
    onTick(remainingSec);

    if (remainingMs <= 0) {
      ended = true;
      onComplete();
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    ended = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
};

export const fadeOutVolume = (
  setVolume: (value: number) => void,
  durationMs: number,
  onDone: () => void,
): (() => void) => {
  const startAt = nowMs();
  let rafId: number | null = null;
  let stopped = false;

  const animate = () => {
    if (stopped) {
      return;
    }

    const elapsed = nowMs() - startAt;
    const progress = Math.min(1, elapsed / durationMs);
    setVolume(1 - progress);

    if (progress >= 1) {
      onDone();
      return;
    }

    rafId = requestAnimationFrame(animate);
  };

  rafId = requestAnimationFrame(animate);

  return () => {
    stopped = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
};
