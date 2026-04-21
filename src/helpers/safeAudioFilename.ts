/**
 * Имена аудио в `public/content/audio/music/` — только латиница, цифры и дефисы,
 * чтобы URL на GitHub Pages и в браузере совпадали с файлами на диске (без 404 из‑за кириллицы, пробелов, скобок).
 */

const ALLOWED_EXT = new Set([".m4a", ".mp3", ".aac", ".wav", ".flac", ".ogg"]);

/** Простая транслитерация русских букв в латиницу (по одной букве). */
const RU: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function fnv1aHex(s: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function parseStemExt(name: string): { stem: string; ext: string } {
  const t = name
    .trim()
    .replace(/^.*[/\\]/, "")
    .replace(/\.\./g, "");
  const last = t.lastIndexOf(".");
  if (last <= 0) {
    return { stem: t || "track", ext: ".m4a" };
  }
  const ext = t.slice(last).toLowerCase();
  const stem = t.slice(0, last);
  return { stem: stem || "track", ext: ALLOWED_EXT.has(ext) ? ext : ".m4a" };
}

function transliterateToSlug(stem: string): string {
  let out = "";
  for (const ch of stem.toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) {
      out += ch;
      continue;
    }
    const t = RU[ch];
    if (t !== undefined) {
      out += t;
      continue;
    }
    if (/\s/.test(ch) || /[._\-()[\]{}«»"'`~!@#$%^&*+=|\\/:;?,]/.test(ch)) {
      out += "-";
      continue;
    }
    out += "-";
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Безопасное имя файла для статики: `slug-latin-<8hex>.m4a`.
 * `salt` — для загрузок (уникальность при одинаковом исходном имени); без salt — детерминированно от stem+ext.
 */
export function toSafeAudioFilename(original: string, salt?: string): string {
  const { stem, ext } = parseStemExt(original);
  const slug = transliterateToSlug(stem).slice(0, 56);
  const hash = fnv1aHex(`${stem}\0${ext}\0${salt ?? ""}`).slice(0, 8);
  return `${slug || "track"}-${hash}${ext}`;
}
