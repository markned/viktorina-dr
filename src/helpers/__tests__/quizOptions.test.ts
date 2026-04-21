import { describe, it, expect } from "vitest";
import type { Round } from "../../types";
import {
  revealAnswerText,
  getQuizUiVariant,
  buildQuizOptionsOneLine,
  buildQuizMcOptions,
} from "../quizOptions";

function makeRound(id: number, revealTexts: string[], allTexts?: string[]): Round {
  const combined = allTexts ?? revealTexts;
  const lyrics = combined.map((text, i) => ({ id: i + 1, text }));
  const revealLineIds = revealTexts.map((_, i) => i + 1);
  return {
    id,
    title: `Трек ${id}`,
    audioFile: `track-${id}.m4a`,
    start: 0,
    end: 10,
    lyrics,
    hintLineIds: [],
    revealLineIds,
  };
}

function makePool(count: number): Round[] {
  return Array.from({ length: count }, (_, i) => makeRound(i + 100, [`Дистрактор ${i + 1}`]));
}

describe("revealAnswerText", () => {
  it("одна строка", () => {
    const r = makeRound(1, ["Первая строка"]);
    expect(revealAnswerText(r)).toBe("Первая строка");
  });

  it("две строки соединяются через \\n", () => {
    const r = makeRound(1, ["Первая строка", "Вторая строка"]);
    expect(revealAnswerText(r)).toBe("Первая строка\nВторая строка");
  });
});

describe("getQuizUiVariant", () => {
  it("null если нет строк ответа", () => {
    const r = makeRound(1, []);
    expect(getQuizUiVariant(r)).toBeNull();
  });

  it("mc4 для 1 строки", () => {
    const r = makeRound(1, ["Строка"]);
    expect(getQuizUiVariant(r)).toBe("mc4");
  });

  it("mc4 для 2 строк", () => {
    const r = makeRound(1, ["Строка 1", "Строка 2"]);
    expect(getQuizUiVariant(r)).toBe("mc4");
  });

  it("order для 3 строк", () => {
    const r = makeRound(1, ["Строка 1", "Строка 2", "Строка 3"]);
    expect(getQuizUiVariant(r)).toBe("order");
  });

  it("order для 4 строк", () => {
    const r = makeRound(1, ["1", "2", "3", "4"]);
    expect(getQuizUiVariant(r)).toBe("order");
  });
});

describe("buildQuizOptionsOneLine", () => {
  it("возвращает ровно 4 варианта", () => {
    const round = makeRound(1, ["Правильный ответ"]);
    const pool = makePool(10);
    const { options } = buildQuizOptionsOneLine(round, pool);
    expect(options).toHaveLength(4);
  });

  it("правильный ответ присутствует в вариантах", () => {
    const round = makeRound(1, ["Правильный ответ"]);
    const pool = makePool(10);
    const { options, correctIndex } = buildQuizOptionsOneLine(round, pool);
    expect(options[correctIndex]).toBe("Правильный ответ");
  });

  it("correctIndex в допустимом диапазоне", () => {
    const round = makeRound(1, ["Правильный ответ"]);
    const pool = makePool(10);
    const { correctIndex } = buildQuizOptionsOneLine(round, pool);
    expect(correctIndex).toBeGreaterThanOrEqual(0);
    expect(correctIndex).toBeLessThan(4);
  });

  it("не использует priorCorrectAnswers как дистракторы", () => {
    const round = makeRound(1, ["Правильный ответ"]);
    const pool = makePool(5);
    const prior = new Set(["Дистрактор 1", "Дистрактор 2"]);
    const { options } = buildQuizOptionsOneLine(round, pool, prior);
    options.forEach((o) => {
      if (o !== "Правильный ответ") {
        expect(prior.has(o)).toBe(false);
      }
    });
  });

  it("все варианты уникальны (если пула достаточно)", () => {
    const round = makeRound(1, ["Правильный ответ"]);
    const pool = makePool(10);
    const { options } = buildQuizOptionsOneLine(round, pool);
    expect(new Set(options).size).toBe(4);
  });
});

describe("buildQuizMcOptions", () => {
  it("делегирует к buildQuizOptionsOneLine для 1 строки", () => {
    const round = makeRound(1, ["Ответ"]);
    const pool = makePool(10);
    const { options } = buildQuizMcOptions(round, pool);
    expect(options).toHaveLength(4);
    expect(options).toContain("Ответ");
  });

  it("делегирует к buildQuizOptionsTwoLine для 2 строк", () => {
    const round = makeRound(1, ["Строка 1", "Строка 2"]);
    const pool = [
      makeRound(10, ["Дист 1"]),
      makeRound(11, ["Дист 2"]),
      makeRound(12, ["Дист 3"]),
      ...makePool(8),
    ];
    const { options, correctIndex } = buildQuizMcOptions(round, pool);
    expect(options).toHaveLength(4);
    expect(options[correctIndex]).toBe("Строка 1\nСтрока 2");
  });
});
