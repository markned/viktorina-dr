import { useEffect } from "react";
import { useTripleActivation } from "../hooks/useTripleActivation";
import { INTRO_VIDEO_PATH } from "../helpers/quizConfig";
import { boostVolume } from "../lib/volumeBoost";

type IntroScreenProps = {
  onVideoEnded: () => void;
  onSkip: () => void;
};

export function IntroScreen({ onVideoEnded, onSkip }: IntroScreenProps) {
  const bumpTriple = useTripleActivation(onSkip);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      bumpTriple();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bumpTriple]);

  const onPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.muted = false;
    boostVolume(video);
  };

  return (
    <main className="app-shell intro-video-shell" onClick={bumpTriple}>
      <video
        className="intro-outro-video intro-outro-foreground"
        src={INTRO_VIDEO_PATH}
        autoPlay
        playsInline
        muted
        onPlay={onPlay}
        onEnded={onVideoEnded}
      />
      <p className="intro-skip-hint">Тройной тап или пробел — пропустить</p>
    </main>
  );
}
