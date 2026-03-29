import type { Round } from "../types";
import { buildSessionPlayOrder } from "./quizOrder";

/** Раунд подходит для режима «Викторина» (есть хотя бы одна строка ответа). */
export function isQuizEligibleRevealRound(r: Round): boolean {
  return r.revealLineIds.length >= 1;
}

export function buildQuizEligiblePool(visible: Round[]): Round[] {
  return visible.filter((r) => !r.hidden && isQuizEligibleRevealRound(r));
}

/** Как во фристайле: по возрастанию «сложности» (число строк ответа), хвост сессии — многострочные ответы. */
export function buildQuizSessionPlayOrder(visible: Round[]): Round[] {
  const pool = buildQuizEligiblePool(visible);
  if (pool.length === 0) return [];
  return buildSessionPlayOrder(pool);
}
