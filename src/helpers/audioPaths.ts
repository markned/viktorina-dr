import { assetUrl } from "./quizConfig";

/** Треки раундов — `public/content/audio/music/`. Таймер, правила, SFX — `public/content/audio/ui/` (`quizConfig`). */
export const audioMusicUrl = (filename: string): string =>
  assetUrl(`/content/audio/music/${encodeURIComponent(filename.trim())}`);
