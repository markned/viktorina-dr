import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import type { Plugin } from "vite";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const GENIUS_REFERER = "https://genius.com/";

/**
 * Загрузка HTML без глобального `fetch` (Node до 18).
 * Редиректы, без gzip (Accept-Encoding: identity).
 */
function fetchUrlText(targetUrl: string, maxRedirects = 8): Promise<string> {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      reject(new Error("Слишком много редиректов"));
      return;
    }
    let url: URL;
    try {
      url = new URL(targetUrl);
    } catch {
      reject(new Error("Некорректный URL"));
      return;
    }
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          "Accept-Encoding": "identity",
          Referer: GENIUS_REFERER,
        },
      },
      (res) => {
        const code = res.statusCode ?? 0;
        const loc = res.headers.location;
        if (code >= 300 && code < 400 && loc) {
          res.resume();
          const nextHref = new URL(loc, url).href;
          void fetchUrlText(nextHref, maxRedirects - 1).then(resolve, reject);
          return;
        }
        if (code >= 400) {
          res.resume();
          reject(new Error(`HTTP ${code}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      reject(new Error("Некорректный URL"));
      return;
    }
    const lib = parsedUrl.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: "GET",
        headers: {
          "User-Agent": UA,
          Accept: "application/json, text/plain, */*",
          "Accept-Encoding": "identity",
          Referer: GENIUS_REFERER,
        },
      },
      (res) => {
        const code = res.statusCode ?? 0;
        if (code >= 400) {
          res.resume();
          reject(new Error(`HTTP ${code}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          try {
            const text = Buffer.concat(chunks).toString("utf8");
            resolve(JSON.parse(text) as unknown);
          } catch (e) {
            reject(e);
          }
        });
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function firstSongUrlFromSearch(json: unknown): string | null {
  const j = json as {
    response?: { sections?: Array<{ hits?: Array<{ type?: string; result?: { url?: string } }> }> };
  };
  for (const sec of j.response?.sections ?? []) {
    for (const h of sec.hits ?? []) {
      if (h.type === "song" && h.result?.url?.includes("genius.com")) {
        return h.result.url;
      }
    }
  }
  return null;
}

/** Внутренность одного `<div>...</div>` по позиции сразу после открывающего `>`. */
function sliceBalancedDivInner(html: string, afterOpenGt: number): string | null {
  const lower = html.toLowerCase();
  let depth = 1;
  let i = afterOpenGt;
  while (depth > 0 && i < html.length) {
    const nextOpen = lower.indexOf("<div", i);
    const nextClose = lower.indexOf("</div>", i);
    if (nextClose === -1) {
      return null;
    }
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + 4;
    } else {
      depth -= 1;
      if (depth === 0) {
        return html.slice(afterOpenGt, nextClose);
      }
      i = nextClose + 6;
    }
  }
  return null;
}

/** Удаляет первый `<div ... data-exclude-from-selection="true" ...>...</div>` (вложенность учитывается). */
function stripExcludeFromSelectionHeader(fragment: string): string {
  const openRe = /<div\b[^>]*\bdata-exclude-from-selection\s*=\s*["']true["'][^>]*>/i;
  const m = fragment.match(openRe);
  if (!m || m.index === undefined) {
    return fragment;
  }
  const blockStart = m.index;
  const innerStart = m.index + m[0].length;
  const lower = fragment.toLowerCase();
  let depth = 1;
  let i = innerStart;
  while (depth > 0 && i < fragment.length) {
    const nextOpen = lower.indexOf("<div", i);
    const nextClose = lower.indexOf("</div>", i);
    if (nextClose === -1) {
      return fragment;
    }
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + 4;
    } else {
      depth -= 1;
      i = nextClose + 6;
    }
  }
  return fragment.slice(0, blockStart) + fragment.slice(i);
}

function htmlFragmentToPlainLyrics(fragment: string): string {
  return fragment
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

/** Без cheerio: полный разбор `data-lyrics-container="true"` + снятие шапки Contributors. */
export function parseGeniusHtml(html: string): { title: string; lyrics: string } {
  const og = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i);
  const title =
    og?.[1]
      ?.replace(/\s*[-|]\s*Genius.*$/i, "")
      ?.replace(/\s*Lyrics\s*$/i, "")
      ?.trim() ?? "";

  const h1 =
    html.match(/<h1[^>]*class="[^"]*SongHeader[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "")?.trim() ??
    "";

  /** Genius кладёт куплеты/скиты в несколько соседних `div[data-lyrics-container]` — собираем все. */
  const openContainerRe = /<div\b[^>]*\bdata-lyrics-container\s*=\s*["']true["'][^>]*>/gi;
  const lyricParts: string[] = [];
  let cm: RegExpExecArray | null;
  while ((cm = openContainerRe.exec(html)) !== null) {
    const inner = sliceBalancedDivInner(html, cm.index + cm[0].length);
    if (!inner?.trim()) {
      continue;
    }
    const withoutHeader = stripExcludeFromSelectionHeader(inner);
    const plain = htmlFragmentToPlainLyrics(withoutHeader).trim();
    if (plain) {
      lyricParts.push(plain);
    }
  }

  let lyrics = lyricParts.join("\n\n");

  if (!lyrics) {
    const fallback = html.match(/class="lyrics"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? null;
    if (fallback) {
      lyrics = htmlFragmentToPlainLyrics(fallback);
    }
  }

  return { title: h1 || title, lyrics };
}

export function geniusDevPlugin(): Plugin {
  return {
    name: "genius-dev-lyrics",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/genius-lyrics", async (req, res, next) => {
        if (req.method !== "GET") {
          next();
          return;
        }
        const u = new URL(req.url || "", "http://localhost");
        const search = u.searchParams.get("search")?.trim();
        const target = u.searchParams.get("url")?.trim();

        try {
          if (search) {
            const apiUrl = `https://genius.com/api/search/multi?q=${encodeURIComponent(search)}`;
            const data = await fetchJson(apiUrl);
            const songUrl = firstSongUrlFromSearch(data);
            if (!songUrl) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Текст на Genius не найден" }));
              return;
            }
            const html = await fetchUrlText(songUrl);
            const parsed = parseGeniusHtml(html);
            if (!parsed.lyrics?.trim()) {
              res.statusCode = 404;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Текст на Genius не найден", url: songUrl }));
              return;
            }
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ...parsed, url: songUrl }));
            return;
          }

          if (!target?.includes("genius.com")) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Нужна ссылка на genius.com или параметр search" }));
            return;
          }
          const html = await fetchUrlText(target);
          const parsed = parseGeniusHtml(html);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ...parsed, url: target }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: String(e) }));
        }
      });
    },
  };
}
