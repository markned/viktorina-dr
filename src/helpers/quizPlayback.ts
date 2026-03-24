import type { Round } from "../types";

/** Позиция старта воспроизведения и длительность fade-in до полной громкости к моменту `fragmentStartSec`. */
export function preRollSeekAndFadeInMs(fragmentStartSec: number, transitionFadeMs: number) {
  const fadeSec = transitionFadeMs / 1000;
  const preRollStartSec = Math.max(0, fragmentStartSec - fadeSec);
  const leadSec = fragmentStartSec - preRollStartSec;
  const fadeInMs = leadSec > 0 ? Math.min(transitionFadeMs, leadSec * 1000) : 0;
  return { preRollStartSec, fadeInMs };
}

/** Сколько строк подсказок должно быть видно при текущем времени трека (до `end` фрагмента). */
export function visibleHintCountAtTime(
  currentTimeSec: number,
  round: Pick<Round, "start" | "end">,
  hintLineCount: number,
): number {
  if (hintLineCount <= 0) {
    return 0;
  }
  const fragmentDuration = round.end - round.start;
  if (fragmentDuration <= 0) {
    return hintLineCount;
  }
  const lineInterval = fragmentDuration / hintLineCount;
  const elapsed = currentTimeSec - round.start;
  const n = Math.floor(elapsed / lineInterval) + 1;
  return Math.max(0, Math.min(hintLineCount, n));
}

/** Заголовок на оверлее перехода: следующий раунд или финал. */
export function transitionOverlayTitle(nextRoundIndex: number, rounds: Round[]): string {
  if (nextRoundIndex < rounds.length) {
    return rounds[nextRoundIndex].title;
  }
  return "Спасибо!";
}
