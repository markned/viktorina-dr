/** Устройство с наведением мыши (не только тач). */
export function prefersHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
}
