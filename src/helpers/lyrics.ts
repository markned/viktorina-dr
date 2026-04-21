import type { LyricLine } from "../types";

export const pickLyricLines = (lyrics: LyricLine[], lineIds: number[]): LyricLine[] => {
  const map = new Map(lyrics.map((line) => [line.id, line]));
  return lineIds.map((id) => map.get(id)).filter((line): line is LyricLine => Boolean(line));
};
