import { INTRO_VIDEO_PATH } from "../helpers/quizConfig";
import { boostVolume } from "../lib/volumeBoost";

type IntroScreenProps = {
  onVideoEnded: () => void;
  onSkip: () => void;
};

export function IntroScreen({ onVideoEnded, onSkip }: IntroScreenProps) {
  const onPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.muted = false;
    boostVolume(video);
  };

  return (
    <main className="app-shell intro-video-shell">
      <video
        className="intro-outro-video intro-outro-foreground"
        src={INTRO_VIDEO_PATH}
        autoPlay
        playsInline
        muted
        onPlay={onPlay}
        onEnded={onVideoEnded}
      />
      <button type="button" className="intro-skip-btn" onClick={onSkip} aria-label="Пропустить интро">
        <svg
          className="intro-skip-btn-icon"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </main>
  );
}
