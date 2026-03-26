import type { Round } from "../types";

export const PREVIEW_ROUND_SESSION_KEY = "technique_quiz_preview_round";
export const EDITOR_SNAPSHOT_SESSION_KEY = "technique_quiz_editor_snapshot";

/** Снимок всех раундов перед уходом в предпросмотр — чтобы после возврата на `/editor` не потерять несохранённые правки. */
export function stashEditorSnapshotBeforePreview(snapshot: { rounds: Round[]; selectedIndex: number }): void {
  sessionStorage.setItem(EDITOR_SNAPSHOT_SESSION_KEY, JSON.stringify(snapshot));
}

let cachedEditorSnapshotForBootstrap: { rounds: Round[]; selectedIndex: number } | null | undefined;

function clampSelectedIndex(i: number, len: number): number {
  if (len <= 0) return 0;
  return Math.min(Math.max(0, i), len - 1);
}

/**
 * Один раз за загрузку страницы читает снимок из sessionStorage (и кэширует в модуле для Strict Mode).
 */
export function consumeEditorSnapshotForInitialState(): { rounds: Round[]; selectedIndex: number } | null {
  if (cachedEditorSnapshotForBootstrap !== undefined) {
    return cachedEditorSnapshotForBootstrap;
  }
  if (typeof window === "undefined") {
    cachedEditorSnapshotForBootstrap = null;
    return null;
  }
  const raw = sessionStorage.getItem(EDITOR_SNAPSHOT_SESSION_KEY);
  if (!raw) {
    cachedEditorSnapshotForBootstrap = null;
    return null;
  }
  try {
    const data = JSON.parse(raw) as { rounds?: Round[]; selectedIndex?: number };
    sessionStorage.removeItem(EDITOR_SNAPSHOT_SESSION_KEY);
    if (!data?.rounds || !Array.isArray(data.rounds)) {
      cachedEditorSnapshotForBootstrap = null;
      return null;
    }
    const rounds = data.rounds as Round[];
    const selectedIndex = clampSelectedIndex(data.selectedIndex ?? 0, rounds.length);
    cachedEditorSnapshotForBootstrap = { rounds, selectedIndex };
    return cachedEditorSnapshotForBootstrap;
  } catch {
    sessionStorage.removeItem(EDITOR_SNAPSHOT_SESSION_KEY);
    cachedEditorSnapshotForBootstrap = null;
    return null;
  }
}

/** Читает раунд из sessionStorage при `?preview=1` (без очистки — очистка в useEffect). */
export function parsePreviewRoundFromSession(): Round | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  if (sp.get("preview") !== "1") return null;
  const raw = sessionStorage.getItem(PREVIEW_ROUND_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Round;
  } catch {
    return null;
  }
}

export function stashRoundForPreview(round: Round): void {
  sessionStorage.setItem(PREVIEW_ROUND_SESSION_KEY, JSON.stringify(round));
}

export function navigateToQuizPreview(): void {
  const u = new URL(import.meta.env.BASE_URL, window.location.origin);
  u.searchParams.set("preview", "1");
  window.location.href = u.pathname + u.search + u.hash;
}

/** Путь к редактору относительно `base` (dev: `/editor`, prod: `/technique_quiz/editor`). */
export function editorHref(): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return `${base}editor`;
}

/** Корень приложения — полноэкранная викторина (без `/editor`). */
export function gameHref(): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return base || "/";
}
