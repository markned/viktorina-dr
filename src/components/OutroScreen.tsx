import { OUTRO_VIDEO_PATH } from "../helpers/quizConfig";

type OutroScreenProps = {
  onRestart: () => void;
};

export function OutroScreen({ onRestart }: OutroScreenProps) {
  return (
    <main className="app-shell outro-video-shell">
      <video
        className="intro-outro-video intro-outro-foreground"
        src={OUTRO_VIDEO_PATH}
        autoPlay
        playsInline
        muted
        loop
        onPlay={(e) => { (e.target as HTMLVideoElement).muted = false; }}
      />
      <button className="outro-restart-btn" onClick={onRestart} title="Перезапустить">
        ↻
      </button>
    </main>
  );
}
