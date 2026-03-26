import { assetUrl } from "./quizConfig";

/** Треки лежат в `public/content/audio/music/` */
export const audioMusicUrl = (filename: string): string =>
  assetUrl(`/content/audio/music/${encodeURIComponent(filename.trim())}`);
