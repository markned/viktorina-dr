import { useTripleTap } from "../hooks/useTripleTap";
import { INTRO_VIDEO_PATH } from "../helpers/quizConfig";

type IntroScreenProps = {
  onVideoEnded: () => void;
  onSkip: () => void;
};

export function IntroScreen({ onVideoEnded, onSkip }: IntroScreenProps) {
  const handleTripleTap = useTripleTap(onSkip);

  return (
    <main className="app-shell intro-video-shell" onClick={handleTripleTap}>
      <video
        className="intro-outro-video intro-outro-foreground"
        src={INTRO_VIDEO_PATH}
        autoPlay
        playsInline
        muted
        onPlay={(e) => { (e.target as HTMLVideoElement).muted = false; }}
        onEnded={onVideoEnded}
      />
    </main>
  );
}
