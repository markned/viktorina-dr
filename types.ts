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
