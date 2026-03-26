import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { editorDevPlugin } from "./vite/editorDevPlugin";
import { geniusDevPlugin } from "./vite/geniusDevPlugin";
import { photosManifestPlugin } from "./vite/photosManifestPlugin";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/technique_quiz/" : "/",
  plugins: [react(), photosManifestPlugin(), geniusDevPlugin(), editorDevPlugin()],
});
