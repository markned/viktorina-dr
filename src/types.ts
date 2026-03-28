export type LyricLine = {
  id: number;
  text: string;
};

/** Опциональный фон YouTube за слоями викторины (устарело — предпочтительно backgroundVideo) */
export type RoundBackgroundYoutube = {
  url: string;
  /** Секунда старта воспроизведения в embed */
  start: number;
};

/** Локальное видео: путь от `public/content/video/` (например `bg/bg_round_8.mp4`), приоритетнее YouTube. */
export type RoundBackgroundVideo = {
  /** Путь от `public/content/video/`, например `bg/bg_round_8.mp4` */
  file: string;
  /** Секунда, с которой зацикливать воспроизведение */
  start: number;
};

/**
 * Один раунд викторины: название, текст, файл аудио, опциональный фон и тайминг фрагмента.
 */
export type Round = {
  id: number;
  title: string;
  /** Имя файла в `public/content/audio/music/` (предпочтительно `.m4a` AAC 192) */
  audioFile: string;
  /** Не участвует в игре (только редактор / экспорт) */
  hidden?: boolean;
  backgroundVideo?: RoundBackgroundVideo;
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
  | "game_rules"
  | "mode_select"
  | "rules"
  | "playing"
  | "paused_for_guess"
  | "quiz_feedback"
  | "timer_finished"
  | "reveal"
  | "transition"
  | "finished";
