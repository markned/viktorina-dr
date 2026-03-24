export type LyricLine = {
  id: number;
  text: string;
};

export type Round = {
  id: number;
  title: string;
  url: string;
  start: number;
  end: number;
  lyrics: LyricLine[];
  hintLineIds: number[];
  revealLineIds: number[];
};

export type RoundState =
  | "intro"
  | "rules"
  | "playing"
  | "paused_for_guess"
  | "timer_finished"
  | "reveal"
  | "transition"
  | "finished";

export type PlaybackMode = "local" | "youtube";
