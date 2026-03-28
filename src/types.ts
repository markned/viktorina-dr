export type LyricLine = {
  id: number;
  text: string;
};

/** Опциональный фон YouTube за слоями викторины */
export type RoundBackgroundYoutube = {
  url: string;
  /** Секунда старта воспроизведения в embed */
  start: number;
};

/**
 * Один раунд викторины: название, текст, файл аудио, опциональный фон и тайминг фрагмента.
 */
export type Round = {
  id: number;
  title: string;
  /** Имя файла в `public/content/audio/music/` */
  audioFile: string;
  /** Не участвует в игре (только редактор / экспорт) */
  hidden?: boolean;
  backgroundYoutube?: RoundBackgroundYoutube;
  start: number;
  end: number;
  lyrics: LyricLine[];
  hintLineIds: number[];
  revealLineIds: number[];
};

export type GameMode = "freestyle" | "quiz";

export type RoundState =
  | "intro"
  | "mode_select"
  | "rules"
  | "playing"
  | "paused_for_guess"
  | "quiz_feedback"
  | "timer_finished"
  | "reveal"
  | "transition"
  | "finished";
