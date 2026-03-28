import type { GameMode } from "../types";

const SESSION_KEY = "technique_quiz.hintsSeenMode";

export function shouldShowControlsHint(mode: GameMode): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== mode;
  } catch {
    return true;
  }
}

export function markControlsHintSeen(mode: GameMode): void {
  try {
    sessionStorage.setItem(SESSION_KEY, mode);
  } catch {
    /* ignore */
  }
}
