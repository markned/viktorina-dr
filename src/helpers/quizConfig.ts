/**
 * Сколько раундов играть за одну сессию (из пула не скрытых в `rounds.ts`).
 * Заглушка до UI выбора длины (например 10 / 25 / 50).
 */
export const DEFAULT_QUIZ_SESSION_LENGTH = 14;

/** Базовый URL для статики (на GitHub Pages: /technique_quiz/) */
const BASE = `${(import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/")}`;

/** Путь к файлу с учётом base (работает на GitHub Pages) */
export const assetUrl = (path: string) =>
  BASE + (path.startsWith("/") ? path.slice(1) : path);

/**
 * Тайминги викторины — правь здесь:
 * - getGuessSeconds(revealLineCount) — 1 строка ответа=30с, 2=45с, 3+=60с
 * - STOP_SAFETY_MARGIN_SEC — запас до `end`, чтобы не проскочить конец (сек)
 * - TRANSITION_FADE_MS — затухание в конце раунда; нарастание за ту же длительность на отрезке ДО start (мс)
 * - INTRO_VIDEO_SECONDS — сколько секунд показывать стартовое видео
 *
 * Тайминги фрагментов трека (start / end секунд) — в `src/content/rounds/rounds.ts` у каждого раунда.
 */
export const getGuessSeconds = (revealLineCount: number): number =>
  revealLineCount <= 1 ? 30 : revealLineCount === 2 ? 45 : 60;

export const STOP_SAFETY_MARGIN_SEC = 0.02;
export const TRANSITION_FADE_MS = 2000;
/** Плавная смена фото / YouTube-фона между раундами (мс) */
export const BACKGROUND_CROSSFADE_MS = 1400;
/** Задержка между видео/раундами и стартом следующего фрагмента (мс) */
export const ROUND_DELAY_MS = 2000;
export const INTRO_VIDEO_SECONDS = 15;

export const TIMER_COUNT_SOUND = assetUrl("/content/audio/timercount.mp3");
export const TIMER_END_SOUND = assetUrl("/content/audio/timerend.mp3");
export const RULES_AUDIO_PATH = assetUrl("/content/audio/rules.mp3");
export const RULES_AUDIO_DELAY_MS = 2000;
export const INTRO_VIDEO_PATH = assetUrl("/content/video/intro.mp4");
export const OUTRO_VIDEO_PATH = assetUrl("/content/video/outro.mp4");
