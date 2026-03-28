import { boostVolume } from "./volumeBoost";

/** Превью в меню режимов: с начала, с усилением громкости. */
export function playModeSelectPreview(el: HTMLVideoElement | null): void {
  if (!el) return;
  el.currentTime = 0;
  el.muted = false;
  boostVolume(el);
  void el.play().catch(() => {
    el.muted = true;
    void el.play().catch(() => {});
  });
}

export function pauseModeSelectPreview(el: HTMLVideoElement | null): void {
  if (!el) return;
  el.pause();
  el.currentTime = 0;
}
