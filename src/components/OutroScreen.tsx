import { boostVolume } from "../lib/volumeBoost";

type OutroScreenProps = {
  videoSrc: string;
  /** Подпись под кнопками (например счёт викторины) */
  subtitle?: string;
  onRestart: () => void;
  onExitToStart: () => void;
};

export function OutroScreen({ videoSrc, subtitle, onRestart, onExitToStart }: OutroScreenProps) {
  const onPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.muted = false;
    boostVolume(video);
  };

  return (
    <main className="app-shell outro-video-shell">
      <video
        className="intro-outro-video intro-outro-foreground"
        src={videoSrc}
        autoPlay
        playsInline
        muted
        loop
        onPlay={onPlay}
      />
      {subtitle ? (
        <p className="outro-subtitle" role="status">
          {subtitle}
        </p>
      ) : null}
      <div className="outro-actions">
        <button type="button" className="outro-restart-btn" onClick={onRestart} title="Перезапустить" aria-label="Перезапустить">
          ↻
        </button>
        <button
          type="button"
          className="outro-menu-btn"
          onClick={onExitToStart}
          title="В меню"
          aria-label="Выйти в меню"
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
    </main>
  );
}
