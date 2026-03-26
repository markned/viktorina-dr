import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

const MODULE = "virtual:background-photos";
const RESOLVED = "\0virtual:background-photos";

function readPhotoFilenames(photosDir: string): string[] {
  try {
    const names = readdirSync(photosDir).filter((f) => /\.jpe?g$/i.test(f));
    names.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return names;
  } catch {
    return [];
  }
}

export function photosManifestPlugin(): Plugin {
  let root = process.cwd();

  return {
    name: "photos-manifest",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === MODULE) return RESOLVED;
    },
    load(id) {
      if (id !== RESOLVED) return null;
      const dir = join(root, "public/content/photos");
      const files = readPhotoFilenames(dir);
      return `export const BACKGROUND_PHOTO_FILENAMES = ${JSON.stringify(files)};`;
    },
    configureServer(server) {
      const dir = join(root, "public/content/photos");
      const invalidate = () => {
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
      };
      server.watcher.add(dir);
      server.watcher.on("all", (event, file) => {
        if (typeof file !== "string" || !file.startsWith(dir)) return;
        if (event === "change" && !/\.jpe?g$/i.test(file)) return;
        if ((event === "add" || event === "unlink") && !/\.jpe?g$/i.test(file)) return;
        invalidate();
      });
    },
  };
}
