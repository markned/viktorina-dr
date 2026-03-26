function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export async function saveRoundsTsToWorkspace(content: string): Promise<void> {
  const res = await fetch("/api/editor/save-rounds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
}

export async function uploadAudioToMusicFolder(file: File): Promise<string> {
  const dataBase64 = await readFileAsBase64(file);
  const res = await fetch("/api/editor/upload-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, dataBase64 }),
  });
  const j = (await res.json()) as { ok?: boolean; filename?: string; error?: string };
  if (!res.ok) {
    throw new Error(j.error || res.statusText);
  }
  return j.filename ?? file.name;
}

export async function deleteAudioFromMusicFolder(filename: string): Promise<void> {
  const res = await fetch("/api/editor/delete-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  if (!res.ok) {
    const j = (await res.json()) as { error?: string };
    throw new Error(j.error || res.statusText);
  }
}

export type GitPushResult = { ok: true; noop?: boolean; message?: string } | { ok: false; error: string };

/** Только при `npm run dev`: git add → commit → push для rounds.ts и music/. */
export async function pushDatabaseGit(roundsCount: number): Promise<GitPushResult> {
  const res = await fetch("/api/editor/git-push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roundsCount }),
  });
  const j = (await res.json()) as { ok?: boolean; noop?: boolean; message?: string; error?: string };
  if (!res.ok) {
    return { ok: false, error: j.error || res.statusText };
  }
  if (j.noop) {
    return { ok: true, noop: true, message: j.message };
  }
  return { ok: true };
}
