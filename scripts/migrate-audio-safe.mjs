/**
 * Миграция: переименование в public/content/audio/music/ в формат toSafeAudioFilename
 * и обновление src/content/rounds/rounds.ts
 * Запуск: node scripts/migrate-audio-safe.mjs
 */
import { randomUUID } from "crypto";
import { readFileSync, readdirSync, renameSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const ALLOWED_EXT = new Set([".m4a", ".mp3", ".aac", ".wav", ".flac", ".ogg"]);

const RU = {
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

function fnv1aHex(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function parseStemExt(name) {
  const t = name.trim().replace(/^.*[/\\]/, "").replace(/\.\./g, "");
  const last = t.lastIndexOf(".");
  if (last <= 0) {
    return { stem: t || "track", ext: ".m4a" };
  }
  const ext = t.slice(last).toLowerCase();
  const stem = t.slice(0, last);
  return { stem: stem || "track", ext: ALLOWED_EXT.has(ext) ? ext : ".m4a" };
}

function transliterateToSlug(stem) {
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

function toSafeAudioFilename(original, salt) {
  const { stem, ext } = parseStemExt(original);
  const slug = transliterateToSlug(stem).slice(0, 56);
  const hash = fnv1aHex(`${stem}\0${ext}\0${salt ?? ""}`).slice(0, 8);
  return `${slug || "track"}-${hash}${ext}`;
}

const musicDir = join(root, "public/content/audio/music");
const roundsPath = join(root, "src/content/rounds/rounds.ts");

const files = readdirSync(musicDir).filter((f) => /\.(m4a|mp3|aac|wav|flac|ogg)$/i.test(f));

const pending = [];
for (const f of files) {
  const safe = toSafeAudioFilename(f);
  if (f === safe) continue;
  const fromPath = join(musicDir, f);
  if (!existsSync(fromPath)) continue;
  const tmpName = `__migr_${randomUUID()}`;
  const tmpPath = join(musicDir, tmpName);
  renameSync(fromPath, tmpPath);
  pending.push({ tmpPath, safeName: safe });
}

let renamed = 0;
for (const { tmpPath, safeName } of pending) {
  const dest = join(musicDir, safeName);
  if (existsSync(dest)) {
    console.warn("Target already exists, skip:", safeName);
    renameSync(tmpPath, join(musicDir, `__orphan_${randomUUID()}.m4a`));
    continue;
  }
  renameSync(tmpPath, dest);
  renamed += 1;
}

let rounds = readFileSync(roundsPath, "utf8");
const audioRe = /audioFile:\s*"([^"]+)"/g;
const seen = new Set();
let m;
while ((m = audioRe.exec(rounds)) !== null) {
  seen.add(m[1]);
}

for (const old of seen) {
  const next = toSafeAudioFilename(old);
  if (old === next) continue;
  const escaped = old.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  rounds = rounds.replace(new RegExp(`(audioFile:\\s*")${escaped}(")`, "g"), `$1${next}$2`);
}

writeFileSync(roundsPath, rounds, "utf8");
console.log("Disk: renamed", renamed, "of", pending.length, "planned.");
console.log("rounds.ts: updated", [...seen].filter((o) => toSafeAudioFilename(o) !== o).length, "unique audio paths.");
