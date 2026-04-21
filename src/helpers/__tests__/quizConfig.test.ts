import { describe, it, expect } from "vitest";
import {
  getGuessSeconds,
  fragmentStopTimeSec,
  outroQuizVideoIndexForScore,
  STOP_SAFETY_MARGIN_SEC,
} from "../quizConfig";

describe("getGuessSeconds", () => {
  it("0 строк → 30с", () => {
    expect(getGuessSeconds(0)).toBe(30);
  });

  it("1 строка → 30с", () => {
    expect(getGuessSeconds(1)).toBe(30);
  });

  it("2 строки → 45с", () => {
    expect(getGuessSeconds(2)).toBe(45);
  });

  it("3 строки → 60с", () => {
    expect(getGuessSeconds(3)).toBe(60);
  });

  it("4+ строки → 60с", () => {
    expect(getGuessSeconds(4)).toBe(60);
    expect(getGuessSeconds(10)).toBe(60);
  });
});

describe("fragmentStopTimeSec", () => {
  it("отнимает STOP_SAFETY_MARGIN_SEC от конца фрагмента", () => {
    expect(fragmentStopTimeSec(10)).toBeCloseTo(10 - STOP_SAFETY_MARGIN_SEC);
  });

  it("не уходит в отрицательные значения", () => {
    expect(fragmentStopTimeSec(0)).toBe(0);
    expect(fragmentStopTimeSec(0.05)).toBe(0); // меньше margin → 0
  });
});

describe("outroQuizVideoIndexForScore", () => {
  it("0 правильных → ролик 0", () => {
    expect(outroQuizVideoIndexForScore(0)).toBe(0);
  });

  it("2 правильных → ролик 0 (граница)", () => {
    expect(outroQuizVideoIndexForScore(2)).toBe(0);
  });

  it("3 правильных → ролик 1", () => {
    expect(outroQuizVideoIndexForScore(3)).toBe(1);
  });

  it("5 правильных → ролик 1 (граница)", () => {
    expect(outroQuizVideoIndexForScore(5)).toBe(1);
  });

  it("6 правильных → ролик 2", () => {
    expect(outroQuizVideoIndexForScore(6)).toBe(2);
  });

  it("9 правильных → ролик 2 (граница)", () => {
    expect(outroQuizVideoIndexForScore(9)).toBe(2);
  });

  it("10 правильных → ролик 3", () => {
    expect(outroQuizVideoIndexForScore(10)).toBe(3);
  });

  it("12 правильных → ролик 3 (граница)", () => {
    expect(outroQuizVideoIndexForScore(12)).toBe(3);
  });

  it("13 правильных → ролик 4", () => {
    expect(outroQuizVideoIndexForScore(13)).toBe(4);
  });

  it("14+ правильных → ролик 4", () => {
    expect(outroQuizVideoIndexForScore(14)).toBe(4);
    expect(outroQuizVideoIndexForScore(100)).toBe(4);
  });
});
