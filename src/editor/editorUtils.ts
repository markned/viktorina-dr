import type { LyricLine, Round } from "../types";

/**
 * Подсказки — выбранные id; ответ — подряд идущие строки после max(подсказки), их число задаётся `answerLineCount`.
 */
export function clampHintsAndReveal(
  lineCount: number,
  hintLineIds: number[],
  answerLineCount: number,
): { hintLineIds: number[]; revealLineIds: number[] } {
  const hints = [...new Set(hintLineIds.filter((id) => id >= 1 && id <= lineCount))].sort((a, b) => a - b);
  if (hints.length === 0) {
    return { hintLineIds: [], revealLineIds: [] };
  }
  const lastHint = Math.max(...hints);
  const maxK = lineCount - lastHint;
  if (maxK <= 0) {
    return { hintLineIds: hints, revealLineIds: [] };
  }
  const k = Math.min(Math.max(1, Math.floor(answerLineCount)), maxK);
  const revealLineIds = Array.from({ length: k }, (_, i) => lastHint + 1 + i);
  return { hintLineIds: hints, revealLineIds };
}

/** Приводит hint/reveal к правилу «ответ — N строк подряд после последней подсказки». */
export function normalizeRoundHints(r: Round): Round {
  const answerCount = Math.max(1, r.revealLineIds?.length ?? 1);
  const { hintLineIds, revealLineIds } = clampHintsAndReveal(r.lyrics.length, r.hintLineIds, answerCount);
  if (
    hintLineIds.join(",") === r.hintLineIds.join(",") &&
    revealLineIds.join(",") === r.revealLineIds.join(",")
  ) {
    return r;
  }
  return { ...r, hintLineIds, revealLineIds };
}

export function clone<T>(x: T): T {
  return structuredClone(x);
}

export function parseIdList(s: string): number[] {
  return s
    .split(/[,;\s]+/)
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function linesToLyrics(text: string): LyricLine[] {
  return text
    .split("\n")
    .map((line, i) => ({ id: i + 1, text: line }))
    .filter((l) => l.text.trim().length > 0);
}

/** Перед разбором: единые переносы строк (без «лишнего» CR из Genius / Windows). */
export function normalizeRawLyricsForEditor(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/** Одна строка textarea = одна строка с id (пустые сохраняются — нумерация = номер строки). */
export function editorLinesToLyrics(text: string): LyricLine[] {
  const t = normalizeRawLyricsForEditor(text);
  return t.split("\n").map((line, i) => ({ id: i + 1, text: line }));
}

export function lyricsToText(lines: LyricLine[]): string {
  return lines.map((l) => l.text).join("\n");
}

/** Имя файла по названию трека (в `public/content/audio/music/`). */
export function defaultAudioFileForTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replaceAll(/[^a-z0-9а-яё]+/gi, "-")
    .replaceAll(/^-+|-+$/g, "");
  return `${slug || "track"}.mp3`;
}

/**
 * Имя файла без расширения вида «Исполнитель - Название трека»
 * (например `Паша Техник - Черная дыра`, `kunteynir - tuberculosis`).
 */
export function parseArtistTitleFromFilename(baseName: string): { artist: string; title: string } | null {
  const trimmed = baseName.trim();
  const parts = trimmed.split(/\s+-\s+/);
  if (parts.length < 2) {
    return null;
  }
  const artist = parts[0]?.trim() ?? "";
  const title = parts.slice(1).join(" - ").trim();
  if (!artist || !title) {
    return null;
  }
  return { artist, title };
}

/** Оставляет только строки подсказок и ответа, перенумеровывает id подряд с 1. */
export function pruneRoundLyricsToHintsAndReveal(r: Round): Round {
  const ids = new Set([...r.hintLineIds, ...r.revealLineIds]);
  const sorted = [...ids].sort((a, b) => a - b);
  const byId = new Map(r.lyrics.map((line) => [line.id, line]));
  const newLyrics: LyricLine[] = [];
  const idMap = new Map<number, number>();
  for (let i = 0; i < sorted.length; i++) {
    const oldId = sorted[i];
    const line = byId.get(oldId);
    if (!line) continue;
    const newId = i + 1;
    idMap.set(oldId, newId);
    newLyrics.push({ id: newId, text: line.text });
  }
  const hintLineIds = r.hintLineIds.map((id) => idMap.get(id)).filter((n): n is number => n !== undefined);
  const revealLineIds = r.revealLineIds.map((id) => idMap.get(id)).filter((n): n is number => n !== undefined);
  const answerCount = Math.max(1, revealLineIds.length);
  const fixed = clampHintsAndReveal(newLyrics.length, hintLineIds, answerCount);
  let next: Round = { ...r, lyrics: newLyrics, hintLineIds: fixed.hintLineIds, revealLineIds: fixed.revealLineIds };
  next = normalizeRoundHints(next);
  return next;
}
