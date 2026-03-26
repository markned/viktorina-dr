import { useEffect, useState } from "react";
import { BACKGROUND_CROSSFADE_MS } from "../helpers/quizConfig";

type DualState = {
  a: string | null;
  b: string | null;
  showA: boolean;
};

function useDualCrossfade(current: string | null): DualState {
  const [state, setState] = useState<DualState>(() => ({
    a: current,
    b: null,
    showA: true,
  }));

  useEffect(() => {
    if (current == null) {
      setState({ a: null, b: null, showA: true });
      return;
    }
    setState((prev) => {
      const visible = prev.showA ? prev.a : prev.b;
      if (current === visible) return prev;
      if (prev.a === null && prev.b === null) {
        return { a: current, b: null, showA: true };
      }
      if (prev.showA) {
        return { ...prev, b: current, showA: false };
      }
      return { ...prev, a: current, showA: true };
    });
  }, [current]);

  return state;
}

type QuizBackgroundProps = {
  photoUrl: string | null;
  youtubeSrc: string | null;
};

export function QuizBackground({ photoUrl, youtubeSrc }: QuizBackgroundProps) {
  const useYoutube = !!youtubeSrc;
  const photo = useDualCrossfade(photoUrl);

  const t = `${BACKGROUND_CROSSFADE_MS}ms`;
  const ease = "ease-in-out";

  return (
    <div className="quiz-bg-root">
      <div
        className="quiz-bg-surface quiz-bg-surface-photo"
        style={{
          opacity: useYoutube ? 0 : 1,
          transition: `opacity ${t} ${ease}`,
        }}
      >
        <div className="photo-bg-stack">
          <div
            className="photo-bg-layer"
            style={{
              backgroundImage: photo.a ? `url("${photo.a}")` : undefined,
              opacity: photo.showA ? 0.45 : 0,
              transition: `opacity ${t} ${ease}`,
            }}
          />
          <div
            className="photo-bg-layer"
            style={{
              backgroundImage: photo.b ? `url("${photo.b}")` : undefined,
              opacity: photo.showA ? 0 : 0.45,
              transition: `opacity ${t} ${ease}`,
            }}
          />
        </div>
      </div>

      <div
        className="quiz-bg-surface quiz-bg-surface-youtube"
        style={{
          opacity: useYoutube ? 1 : 0,
          transition: `opacity ${t} ${ease}`,
        }}
      >
        {youtubeSrc ? (
          <div className="youtube-bg-dual">
            <div className="youtube-bg-wrap youtube-bg-wrap-layer">
              <iframe
                key={youtubeSrc}
                className="youtube-bg"
                src={youtubeSrc}
                title="Фоновое видео YouTube"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                loading="eager"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="youtube-bg-dim-scrim" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}
