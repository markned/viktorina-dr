import { describe, it, expect } from "vitest";
import type { Round } from "../../types";
import { isMultiLineRevealRound, shuffleWithinDifficultyBuckets, buildSessionPlayOrder } from "../quizOrder";

function makeRound(id: number, revealCount: number, title = `Трек ${id}`): Round {
  const lyrics = Array.from({ length: revealCount + 2 }, (_, i) => ({ id: i + 1, text: `Строка ${i + 1}` }));
  const revealLineIds = lyrics.slice(0, revealCount).map((l) => l.id);
  return {
    id,
    title,
    audioFile: `track-${id}.m4a`,
    start: 0,
    end: 10,
    lyrics,
    hintLineIds: [lyrics[lyrics.length - 1]!.id],
    revealLineIds,
  };
}

/** 20 раундов с разными числами строк ответа */
function makeLargePool(): Round[] {
  return [
    ...Array.from({ length: 8 }, (_, i) => makeRound(i + 1, 1, `Трек A${i + 1}`)),
    ...Array.from({ length: 8 }, (_, i) => makeRound(i + 9, 2, `Трек B${i + 1}`)),
    ...Array.from({ length: 4 }, (_, i) => makeRound(i + 17, 3, `Трек C${i + 1}`)),
  ];
}

describe("isMultiLineRevealRound", () => {
  it("true для 2 строк ответа", () => {
    expect(isMultiLineRevealRound(makeRound(1, 2))).toBe(true);
  });

  it("true для 3 строк ответа", () => {
    expect(isMultiLineRevealRound(makeRound(1, 3))).toBe(true);
  });

  it("false для 1 строки ответа", () => {
    expect(isMultiLineRevealRound(makeRound(1, 1))).toBe(false);
  });
});

describe("shuffleWithinDifficultyBuckets", () => {
  it("возвращает те же раунды", () => {
    const pool = makeLargePool();
    const result = shuffleWithinDifficultyBuckets(pool);
    expect(result).toHaveLength(pool.length);
    const ids = new Set(result.map((r) => r.id));
    pool.forEach((r) => expect(ids.has(r.id)).toBe(true));
  });

  it("однострочные идут раньше двухстрочных, двухстрочные — раньше трёхстрочных", () => {
    const pool = makeLargePool();
    const result = shuffleWithinDifficultyBuckets(pool);
    let maxRevealSeen = 0;
    for (const r of result) {
      expect(r.revealLineIds.length).toBeGreaterThanOrEqual(maxRevealSeen);
      maxRevealSeen = Math.max(maxRevealSeen, r.revealLineIds.length);
    }
  });

  it("пустой массив", () => {
    expect(shuffleWithinDifficultyBuckets([])).toEqual([]);
  });
});

describe("buildSessionPlayOrder", () => {
  it("длина не превышает DEFAULT_QUIZ_SESSION_LENGTH (14)", () => {
    const pool = makeLargePool();
    const result = buildSessionPlayOrder(pool);
    expect(result.length).toBeLessThanOrEqual(14);
  });

  it("последние 4 раунда — все многострочные, если пула достаточно", () => {
    const pool = makeLargePool();
    const result = buildSessionPlayOrder(pool);
    expect(result.length).toBeGreaterThan(4);
    const tail = result.slice(-4);
    tail.forEach((r) => {
      expect(r.revealLineIds.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("возвращает все раунды, если пул меньше длины сессии", () => {
    const small = [makeRound(1, 1), makeRound(2, 2)];
    const result = buildSessionPlayOrder(small);
    expect(result).toHaveLength(small.length);
  });

  it("пустой пул возвращает пустой массив", () => {
    expect(buildSessionPlayOrder([])).toEqual([]);
  });

  it("все элементы из входного пула", () => {
    const pool = makeLargePool();
    const result = buildSessionPlayOrder(pool);
    const poolIds = new Set(pool.map((r) => r.id));
    result.forEach((r) => expect(poolIds.has(r.id)).toBe(true));
  });
});
