import { describe, it, expect } from "vitest";
import { shuffle, shuffleUntilOrderDiffers, reorderNoConsecutiveSameTitle } from "../shuffle";

describe("shuffle", () => {
  it("возвращает те же элементы", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toHaveLength(arr.length);
    expect([...result].sort()).toEqual([...arr].sort());
  });

  it("не мутирует исходный массив", () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it("пустой массив", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("одноэлементный массив", () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe("shuffleUntilOrderDiffers", () => {
  it("возвращает те же элементы", () => {
    const arr = [1, 2, 3, 4];
    const result = shuffleUntilOrderDiffers(arr);
    expect([...result].sort()).toEqual([...arr].sort());
  });

  it("одноэлементный массив возвращается как есть", () => {
    expect(shuffleUntilOrderDiffers([7])).toEqual([7]);
  });

  it("пустой массив возвращается как есть", () => {
    expect(shuffleUntilOrderDiffers([])).toEqual([]);
  });

  it("для двух элементов всегда возвращает другой порядок", () => {
    const arr = ["a", "b"];
    const result = shuffleUntilOrderDiffers(arr);
    expect(result).not.toEqual(arr);
    expect(result).toEqual(["b", "a"]);
  });
});

describe("reorderNoConsecutiveSameTitle", () => {
  it("нет двух подряд с одинаковым title", () => {
    const rounds = [
      { title: "A", id: 1 },
      { title: "A", id: 2 },
      { title: "B", id: 3 },
    ];
    const result = reorderNoConsecutiveSameTitle(rounds);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].title).not.toBe(result[i - 1]!.title);
    }
  });

  it("не меняет длину массива", () => {
    const rounds = [{ title: "A" }, { title: "B" }, { title: "C" }];
    expect(reorderNoConsecutiveSameTitle(rounds)).toHaveLength(3);
  });

  it("возвращает копию для одного элемента", () => {
    const rounds = [{ title: "X" }];
    const result = reorderNoConsecutiveSameTitle(rounds);
    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe("X");
  });

  it("пустой массив", () => {
    expect(reorderNoConsecutiveSameTitle([])).toEqual([]);
  });

  it("когда все одного title — не падает, возвращает все элементы", () => {
    const rounds = [
      { title: "X", id: 1 },
      { title: "X", id: 2 },
      { title: "X", id: 3 },
    ];
    const result = reorderNoConsecutiveSameTitle(rounds);
    expect(result).toHaveLength(3);
  });
});
