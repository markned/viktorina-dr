import { describe, it, expect } from "vitest";
import { preRollSeekAndFadeInMs, visibleHintCountAtTime, transitionOverlayTitle } from "../quizPlayback";
import type { Round } from "../../types";

// Minimal Round stub — only fields used by quizPlayback functions
function makeRound(start: number, end: number): Pick<Round, "start" | "end"> {
  return { start, end } as Round;
}

describe("preRollSeekAndFadeInMs", () => {
  it("когда фрагмент начинается позже fade — стартуем за fadeMs до start", () => {
    const { preRollStartSec, fadeInMs } = preRollSeekAndFadeInMs(10, 2000);
    expect(preRollStartSec).toBe(8);
    expect(fadeInMs).toBe(2000);
  });

  it("когда фрагмент начинается раньше fade — клипуем до 0 и укорачиваем fadeIn", () => {
    const { preRollStartSec, fadeInMs } = preRollSeekAndFadeInMs(1, 2000);
    expect(preRollStartSec).toBe(0);
    expect(fadeInMs).toBe(1000);
  });

  it("когда фрагмент стартует с 0 — нет preRoll, нет fadeIn", () => {
    const { preRollStartSec, fadeInMs } = preRollSeekAndFadeInMs(0, 2000);
    expect(preRollStartSec).toBe(0);
    expect(fadeInMs).toBe(0);
  });

  it("очень маленький fadeMs — результат пропорционален", () => {
    const { preRollStartSec, fadeInMs } = preRollSeekAndFadeInMs(5, 500);
    expect(preRollStartSec).toBeCloseTo(4.5);
    expect(fadeInMs).toBe(500);
  });
});

describe("visibleHintCountAtTime", () => {
  it("hintLineCount=0 → всегда 0", () => {
    expect(visibleHintCountAtTime(5, makeRound(0, 10), 0)).toBe(0);
  });

  it("нулевая длительность фрагмента → возвращает hintLineCount", () => {
    expect(visibleHintCountAtTime(0, makeRound(5, 5), 3)).toBe(3);
  });

  it("в самом начале фрагмента (ровно на start) → 1 строка", () => {
    expect(visibleHintCountAtTime(0, makeRound(0, 10), 2)).toBe(1);
  });

  it("ровно на середине 2-строчного фрагмента → 2 строки", () => {
    // 2 hints, interval=5s; at t=5 elapsed=5, floor(5/5)+1=2
    expect(visibleHintCountAtTime(5, makeRound(0, 10), 2)).toBe(2);
  });

  it("до начала фрагмента → 0", () => {
    // elapsed = -5, n = floor(-5/5)+1 = -1+1 = 0
    expect(visibleHintCountAtTime(0, makeRound(5, 15), 3)).toBe(0);
  });

  it("после конца фрагмента → clamp до hintLineCount", () => {
    expect(visibleHintCountAtTime(20, makeRound(0, 10), 3)).toBe(3);
  });

  it("3 строки, раскрываются равномерно за 30с", () => {
    const r = makeRound(0, 30);
    expect(visibleHintCountAtTime(0, r, 3)).toBe(1);
    expect(visibleHintCountAtTime(10, r, 3)).toBe(2);
    expect(visibleHintCountAtTime(20, r, 3)).toBe(3);
  });
});

describe("transitionOverlayTitle", () => {
  const rounds = [{ title: "Раунд 1" }, { title: "Раунд 2" }] as Round[];

  it("индекс внутри массива → заголовок раунда", () => {
    expect(transitionOverlayTitle(0, rounds)).toBe("Раунд 1");
    expect(transitionOverlayTitle(1, rounds)).toBe("Раунд 2");
  });

  it("индекс за пределами → «Спасибо!»", () => {
    expect(transitionOverlayTitle(2, rounds)).toBe("Спасибо!");
    expect(transitionOverlayTitle(99, rounds)).toBe("Спасибо!");
  });

  it("пустой массив → «Спасибо!»", () => {
    expect(transitionOverlayTitle(0, [])).toBe("Спасибо!");
  });
});
