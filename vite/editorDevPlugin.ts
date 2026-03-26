import { execFileSync } from "node:child_process";
import type { IncomingMessage } from "node:http";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";

function sanitizeAudioFilename(name: string): string {
  const base = name.replace(/^.*[/\\]/, "").replace(/\.\./g, "");
  if (!base || base.length > 220) return "track.mp3";
  return base;
}

function hasGitStagedDiff(cwd: string): boolean {
  try {
    execFileSync("git", ["diff", "--cached", "--quiet"], { cwd, stdio: "ignore" });
    return false;
  } catch (e: unknown) {
    return (e as { status?: number }).status === 1;
  }
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  const raw = await new Promise<Buffer>((resolve, reject) => {
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
  return JSON.parse(raw.toString("utf8") || "{}");
}

/**
 * Только `npm run dev`: запись `rounds.ts`, загрузка/удаление треков в `public/content/audio/music/`.
 */
export function editorDevPlugin(): Plugin {
  return {
    name: "editor-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (url === "/api/editor/save-rounds" && req.method === "POST") {
          try {
            const body = (await readJsonBody(req)) as { content?: string };
            if (typeof body.content !== "string") {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "content required" }));
              return;
            }
            const target = join(server.config.root, "src/content/rounds/rounds.ts");
            await writeFile(target, body.content, "utf8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
          }
          return;
        }
        if (url === "/api/editor/upload-audio" && req.method === "POST") {
          try {
            const body = (await readJsonBody(req)) as { filename?: string; dataBase64?: string };
            const name = sanitizeAudioFilename(body.filename ?? "");
            if (!body.dataBase64) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "dataBase64 required" }));
              return;
            }
            const dir = join(server.config.root, "public/content/audio/music");
            await mkdir(dir, { recursive: true });
            const buf = Buffer.from(body.dataBase64, "base64");
            await writeFile(join(dir, name), buf);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, filename: name }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
          }
          return;
        }
        if (url === "/api/editor/delete-audio" && req.method === "POST") {
          try {
            const body = (await readJsonBody(req)) as { filename?: string };
            const name = sanitizeAudioFilename(body.filename ?? "");
            const fp = join(server.config.root, "public/content/audio/music", name);
            await unlink(fp).catch(() => {});
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
          }
          return;
        }
        if (url === "/api/editor/git-push" && req.method === "POST") {
          try {
            const body = (await readJsonBody(req)) as { roundsCount?: number };
            const n = typeof body.roundsCount === "number" && Number.isFinite(body.roundsCount) ? Math.floor(body.roundsCount) : 0;
            const root = server.config.root;
            const msg = `База: ${n} треков (rounds.ts и music/)`;
            execFileSync(
              "git",
              ["add", "src/content/rounds/rounds.ts", "public/content/audio/music"],
              { cwd: root, stdio: "pipe" },
            );
            if (!hasGitStagedDiff(root)) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, noop: true, message: "Нет изменений для коммита" }));
              return;
            }
            execFileSync("git", ["commit", "-m", msg], { cwd: root, stdio: "pipe" });
            execFileSync("git", ["push"], { cwd: root, stdio: "pipe" });
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
          }
          return;
        }
        next();
      });
    },
  };
}
