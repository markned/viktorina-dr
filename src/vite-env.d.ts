/// <reference types="vite/client" />

declare module "virtual:background-photos" {
  /** Имена `*.jpg` в `public/content/photos/` (на этапе сборки и при обновлении в dev). */
  export const BACKGROUND_PHOTO_FILENAMES: readonly string[];
}
