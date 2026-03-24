export type PlayerAdapter = {
  load: (source: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  setVolume: (volume: number) => void;
  destroy?: () => void;
};
