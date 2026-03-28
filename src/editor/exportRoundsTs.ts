import type { Round } from "../types";

function formatRound(r: Round): string {
  const lyricLines = r.lyrics
    .map((l) => `      { id: ${l.id}, text: ${JSON.stringify(l.text)} },`)
    .join("\n");

  const bgVideoBlock = r.backgroundVideo
    ? `
    backgroundVideo: {
      file: ${JSON.stringify(r.backgroundVideo.file)},
      start: ${r.backgroundVideo.start},
    },`
    : "";

  const bgYoutubeBlock =
    !r.backgroundVideo && r.backgroundYoutube
      ? `
    backgroundYoutube: {
      url: ${JSON.stringify(r.backgroundYoutube.url)},
      start: ${r.backgroundYoutube.start},
    },`
      : "";

  const hiddenBlock = r.hidden ? `\n    hidden: true,` : "";

  return `  {
    id: ${r.id},
    title: ${JSON.stringify(r.title)},
    audioFile: ${JSON.stringify(r.audioFile)},${hiddenBlock}${bgVideoBlock}${bgYoutubeBlock}
    start: ${r.start},
    end: ${r.end},
    lyrics: [
${lyricLines}
    ],
    hintLineIds: [${r.hintLineIds.join(", ")}],
    revealLineIds: [${r.revealLineIds.join(", ")}],
  },`;
}

/** Готовый файл для замены `src/content/rounds/rounds.ts` */
export function exportRoundsTsFile(rounds: Round[]): string {
  const header = `import type { Round } from "../../types";

/** Все раунды викторины. Аудио — \`public/content/audio/music/\` (предпочтительно AAC .m4a). Фон — путь от \`public/content/video/\` (например \`bg/…\`). */
`;

  const roundsArr = rounds.map(formatRound).join("\n");
  return `${header}export const rounds: Round[] = [
${roundsArr}
];
`;
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
