import { describe, it, expect } from "vitest";
import type { Round } from "../../types";
import { isQuizEligibleRevealRound, buildQuizEligiblePool } from "../quizMode";

function makeRound(id: number, revealCount: number, hidden?: boolean): Round {
  const lyrics = Array.from({ length: revealCount + 1 }, (_, i) => ({ id: i + 1, text: `Строка ${i + 1}` }));
  return {
    id,
    title: `Трек ${id}`,
    audioFile: `track-${id}.m4a`,
    start: 0,
    end: 10,
    lyrics,
    hintLineIds: [],
    revealLineIds: lyrics.slice(0, revealCount).map((l) => l.id),
    hidden,
  };
}

describe("isQuizEligibleRevealRound", () => {
  it("true если есть хотя бы одна строка ответа", () => {
    expect(isQuizEligibleRevealRound(makeRound(1, 1))).toBe(true);
    expect(isQuizEligibleRevealRound(makeRound(1, 3))).toBe(true);
  });

  it("false если нет строк ответа", () => {
    expect(isQuizEligibleRevealRound(makeRound(1, 0))).toBe(false);
  });
});

describe("buildQuizEligiblePool", () => {
  it("исключает скрытые раунды", () => {
    const rounds = [makeRound(1, 1), makeRound(2, 1, true), makeRound(3, 1)];
    const result = buildQuizEligiblePool(rounds);
    expect(result.map((r) => r.id)).toEqual([1, 3]);
  });

  it("исключает раунды без строк ответа", () => {
    const rounds = [makeRound(1, 1), makeRound(2, 0), makeRound(3, 2)];
    const result = buildQuizEligiblePool(rounds);
    expect(result.map((r) => r.id)).toEqual([1, 3]);
  });

  it("пустой пул возвращает пустой массив", () => {
    expect(buildQuizEligiblePool([])).toEqual([]);
  });

  it("все подходящие раунды остаются", () => {
    const rounds = [makeRound(1, 1), makeRound(2, 2), makeRound(3, 3)];
    expect(buildQuizEligiblePool(rounds)).toHaveLength(3);
  });
});
