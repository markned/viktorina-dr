import type { PlayerAdapter } from "./player";

export class LocalMediaPlayer implements PlayerAdapter {
  private media: HTMLAudioElement;

  constructor() {
    this.media = new Audio();
    this.media.preload = "auto";
    this.media.crossOrigin = "anonymous";
    this.media.setAttribute("playsinline", "true");
  }

  async load(source: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error(`Failed to load media source: ${source}`));
      };
      const cleanup = () => {
        this.media.removeEventListener("loadedmetadata", onLoaded);
        this.media.removeEventListener("error", onError);
      };

      this.media.pause();
      this.media.src = source;
      this.media.load();
      this.media.addEventListener("loadedmetadata", onLoaded, { once: true });
      this.media.addEventListener("error", onError, { once: true });
    });
  }

  play(): void {
    void this.media.play();
  }

  pause(): void {
    this.media.pause();
  }

  seekTo(time: number): void {
    this.media.currentTime = Math.max(0, time);
  }

  getCurrentTime(): number {
    return this.media.currentTime || 0;
  }

  setVolume(volume: number): void {
    this.media.volume = Math.min(1, Math.max(0, volume));
  }

  destroy(): void {
    this.media.pause();
    this.media.src = "";
    this.media.load();
  }
}
