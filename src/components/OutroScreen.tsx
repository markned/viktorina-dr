import { OUTRO_VIDEO_PATH } from "../helpers/quizConfig";
import { boostVolume } from "../lib/volumeBoost";

type OutroScreenProps = {
  onRestart: () => void;
  onExitToStart: () => void;
};

export function OutroScreen({ onRestart, onExitToStart }: OutroScreenProps) {
  const onPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.muted = false;
    boostVolume(video);
  };

  return (
    <main className="app-shell outro-video-shell">
      <button
        type="button"
        className="outro-close-btn"
        onClick={onExitToStart}
        aria-label="Выйти на главный экран"
        title="Выйти"
      >
        <span aria-hidden>✕</span>
      </button>
      <video
        className="intro-outro-video intro-outro-foreground"
        src={OUTRO_VIDEO_PATH}
        autoPlay
        playsInline
        muted
        loop
        onPlay={onPlay}
      />
      <div className="outro-actions">
        <button type="button" className="outro-menu-btn" onClick={onExitToStart}>
          В меню
        </button>
        <button type="button" className="outro-restart-btn" onClick={onRestart} title="Перезапустить" aria-label="Перезапустить">
          ↻
        </button>
      </div>
    </main>
  );
}
