import { getSharedAudioContext } from "./audioUnlock";

const STORAGE_KEY = "technique-master-volume";
const DEFAULT = 1;

/** Общий множитель громкости (0–1), синхронизируется с localStorage и GainNode для видео через Web Audio. */
export function readMasterVolume(): number {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return DEFAULT;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return DEFAULT;
    return Math.min(1, Math.max(0, n));
  } catch {
    return DEFAULT;
  }
}

let masterGainNode: GainNode | null = null;
const listeners = new Set<() => void>();

function syncMasterGainNode(value: number): void {
  if (masterGainNode) {
    masterGainNode.gain.value = value;
  }
}

/**
 * Единый выход для всех цепочек boostVolume: источники → … → masterGain → destination.
 */
export function getMasterGainNode(ctx: AudioContext): GainNode {
  if (!masterGainNode || masterGainNode.context !== ctx) {
    masterGainNode = ctx.createGain();
    masterGainNode.gain.value = readMasterVolume();
    masterGainNode.connect(ctx.destination);
  } else {
    masterGainNode.gain.value = readMasterVolume();
  }
  return masterGainNode;
}

export function setMasterVolume(value: number): void {
  const v = Math.min(1, Math.max(0, value));
  try {
    localStorage.setItem(STORAGE_KEY, String(v));
  } catch {
    /* ignore */
  }
  syncMasterGainNode(v);
  for (const fn of listeners) {
    fn();
  }
}

export function subscribeMasterVolume(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Вызвать после первого unlock, чтобы masterGain существовал до первого видео (необязательно). */
export function ensureMasterGainPrewired(): void {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  getMasterGainNode(ctx);
}
