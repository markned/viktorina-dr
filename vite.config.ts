/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { editorDevPlugin } from "./vite/editorDevPlugin";
import { geniusDevPlugin } from "./vite/geniusDevPlugin";
import { photosManifestPlugin } from "./vite/photosManifestPlugin";

/** Кастомный домен на GitHub Pages — корень сайта; подпуть `/technique_quiz/` нужен только для `username.github.io/technique_quiz/` без своего домена. */
export default defineConfig({
  base: "/",
  server: {
    /** Не 5173 — отдельный порт для technique_quiz (при занятости: `vite --port …`) */
    port: 18768,
    strictPort: true,
  },
  plugins: [react(), photosManifestPlugin(), geniusDevPlugin(), editorDevPlugin()],
  test: {
    environment: "node",
  },
});
