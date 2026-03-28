import type { Round } from "../types";
import { DEFAULT_QUIZ_SESSION_LENGTH } from "./quizConfig";
import { reorderNoConsecutiveSameTitle, shuffle } from "./shuffle";

/** Раунд подходит для режима «Викторина» (одна строка ответа). */
export function isSingleLineRevealRound(r: Round): boolean {
  return r.revealLineIds.length === 1;
}

export function buildQuizEligiblePool(visible: Round[]): Round[] {
  return visible.filter((r) => !r.hidden && isSingleLineRevealRound(r));
}

export function buildQuizSessionPlayOrder(visible: Round[]): Round[] {
  const pool = buildQuizEligiblePool(visible);
  if (pool.length === 0) return [];
  const shuffled = reorderNoConsecutiveSameTitle(shuffle([...pool]));
  return shuffled.slice(0, Math.min(DEFAULT_QUIZ_SESSION_LENGTH, pool.length));
}
