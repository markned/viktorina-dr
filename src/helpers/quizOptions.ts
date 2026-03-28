import type { Round } from "../types";
import { pickLyricLines } from "./lyrics";
import { shuffle } from "./shuffle";

export function revealAnswerText(r: Round): string {
  const lines = pickLyricLines(r.lyrics, r.revealLineIds);
  return lines.map((l) => l.text).join("\n");
}

/**
 * Четыре варианта: один правильный + три отличных от других раундов пула.
 */
export function buildQuizOptions(
  round: Round,
  distractorPool: Round[],
): { options: string[]; correctIndex: number } {
  const correct = revealAnswerText(round);
  const wrongCandidates = distractorPool
    .filter((r) => r.id !== round.id && r.revealLineIds.length === 1)
    .map((r) => revealAnswerText(r))
    .filter((t) => t !== correct);

  const uniqueShuffled = shuffle([...new Set(wrongCandidates)]);
  const wrong: string[] = [];
  for (const t of uniqueShuffled) {
    if (wrong.length >= 3) break;
    wrong.push(t);
  }

  const fb = shuffle([...wrongCandidates]);
  let fi = 0;
  while (wrong.length < 3 && fb.length > 0) {
    const t = fb[fi % fb.length]!;
    fi += 1;
    if (t === correct) continue;
    if (!wrong.includes(t)) wrong.push(t);
  }

  while (wrong.length < 3) {
    wrong.push(wrong[wrong.length - 1] ?? "…");
  }

  const options = shuffle([correct, wrong[0]!, wrong[1]!, wrong[2]!]);
  const correctIndex = options.findIndex((o) => o === correct);
  return { options, correctIndex: correctIndex >= 0 ? correctIndex : 0 };
}
