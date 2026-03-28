/**
 * Сколько раундов играть за одну сессию (из пула не скрытых в `rounds.ts`).
 * Заглушка до UI выбора длины (например 10 / 25 / 50).
 */
export const DEFAULT_QUIZ_SESSION_LENGTH = 14;

/** Базовый URL статики (`import.meta.env.BASE_URL` из Vite). */
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
/** Пауза после подсветки верного/неверного ответа в викторине, до продолжения трека (мс). */
export const QUIZ_FEEDBACK_DELAY_MS = 1800;
export const INTRO_VIDEO_SECONDS = 15;

export const TIMER_COUNT_SOUND = assetUrl("/content/audio/timercount.mp3");
export const TIMER_END_SOUND = assetUrl("/content/audio/timerend.mp3");
/** Конец таймера в режиме «Викторина» (озвучка «Давайте думать») */
export const QUIZ_TIMER_END_SOUND = assetUrl("/content/audio/quizTimerEnd.mp3");
export const RULES_AUDIO_PATH = assetUrl("/content/audio/rules.mp3");
export const RULES_QUIZ_AUDIO_PATH = assetUrl("/content/audio/rules_quiz.mp3");
export const RULES_AUDIO_DELAY_MS = 2000;
export const INTRO_VIDEO_PATH = assetUrl("/content/video/intro.mp4");

/** Фон половин экрана выбора режима (сжатый MP4, исходники .mov в `public/content/video/`) */
export const MODE_SELECT_FREESTYLE_VIDEO = assetUrl("/content/video/freestyleMenu.mp4");
export const MODE_SELECT_QUIZ_VIDEO = assetUrl("/content/video/quizMenu.mp4");
export const OUTRO_VIDEO_PATH = assetUrl("/content/video/outro.mp4");

/** Финальные ролики викторины по числу правильных ответов (плейсхолдеры — заменить файлами). */
export const OUTRO_QUIZ_VIDEOS = [
  assetUrl("/content/video/outro_quiz_0.mp4"),
  assetUrl("/content/video/outro_quiz_1.mp4"),
  assetUrl("/content/video/outro_quiz_2.mp4"),
  assetUrl("/content/video/outro_quiz_3.mp4"),
  assetUrl("/content/video/outro_quiz_4.mp4"),
] as const;

/** Индекс ролика 0..4 для счёта правильных ответов в викторине. */
export function outroQuizVideoIndexForScore(score: number): number {
  if (score <= 2) return 0;
  if (score <= 5) return 1;
  if (score <= 9) return 2;
  if (score <= 12) return 3;
  return 4;
}
