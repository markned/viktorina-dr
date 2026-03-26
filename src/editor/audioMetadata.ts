import { parseBlob } from "music-metadata";
import { parseArtistTitleFromFilename } from "./editorUtils";

export type ArtistTitleFromTags = { artist?: string; title?: string };

/** Читает исполнителя и название трека из ID3 / метаданных контейнера (mp3, m4a, flac и т.д.). */
export async function readArtistTitleFromAudioFile(file: File): Promise<ArtistTitleFromTags | null> {
  try {
    const meta = await parseBlob(file);
    const c = meta.common;
    const artist =
      c.artists?.find((a) => a?.trim())?.trim() ||
      (typeof c.artist === "string" ? c.artist.trim() : undefined) ||
      c.albumartists?.find((a) => a?.trim())?.trim() ||
      (typeof c.albumartist === "string" ? c.albumartist.trim() : undefined);
    const title = c.title?.trim();
    if (!artist && !title) {
      return null;
    }
    return {
      ...(artist ? { artist } : {}),
      ...(title ? { title } : {}),
    };
  } catch {
    return null;
  }
}

export type GeniusSearchBuild = {
  query: string;
  source: "metadata" | "filename";
};

/**
 * Запрос для Genius: сначала полные теги (исполнитель + трек), иначе комбинации тегов с именем файла,
 * иначе разбор «Исполнитель - Название» из имени файла.
 */
export function buildGeniusSearchQuery(tags: ArtistTitleFromTags | null, filenameBase: string): GeniusSearchBuild | null {
  const base = filenameBase.trim();
  const fromFile = parseArtistTitleFromFilename(base);

  const artist = tags?.artist?.trim();
  const title = tags?.title?.trim();

  if (artist && title) {
    return { query: `${artist} ${title}`.replace(/\s+/g, " "), source: "metadata" };
  }
  if (title) {
    return { query: title, source: "metadata" };
  }
  if (artist && fromFile?.title) {
    return { query: `${artist} ${fromFile.title}`.replace(/\s+/g, " "), source: "metadata" };
  }
  if (artist) {
    return { query: artist, source: "metadata" };
  }
  if (fromFile) {
    return { query: `${fromFile.artist} ${fromFile.title}`.replace(/\s+/g, " "), source: "filename" };
  }
  return null;
}

/** Название трека для поля round.title: тег title → часть после « - » в имени файла → имя файла без расширения. */
export function pickRoundTitleFromTagsAndFilename(
  tags: ArtistTitleFromTags | null,
  filenameBase: string,
): string | null {
  const t = tags?.title?.trim();
  if (t) return t;
  const fromFile = parseArtistTitleFromFilename(filenameBase.trim());
  if (fromFile?.title) return fromFile.title;
  const b = filenameBase.trim();
  return b.length > 0 ? b : null;
}
