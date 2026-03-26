import { useEffect, useRef, type ReactNode } from "react";
import { useFitTextToHeight } from "../hooks/useFitTextToHeight";
import { GAME_RULES } from "../content/rules";
import { RULES_AUDIO_DELAY_MS, RULES_AUDIO_PATH } from "../helpers/quizConfig";
import { whenAudioUnlocked } from "../lib/audioUnlock";
import { boostRulesNarration } from "../lib/volumeBoost";

type RulesCardProps = {
  footer: ReactNode;
  /** Озвучка rules.mp3 (на экране правил после интро — да; из паузы — нет) */
  playAudio?: boolean;
};

/** Текст правил + опциональная озвучка; подвал (→ или ✕) задаётся снаружи */
export function RulesCard({ footer, playAudio = true }: RulesCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { containerRef, textRef } = useFitTextToHeight({ maxPx: 44, floorMinPx: 8 });

  useEffect(() => {
    if (!playAudio) {
      return;
    }
    let cancelled = false;
    let cancelPendingPlay: (() => void) | undefined;

    const startPlayback = () => {
      if (cancelled) return;
      const audio = new Audio(RULES_AUDIO_PATH);
      audioRef.current = audio;
      boostRulesNarration(audio);
      const tryPlay = () => {
        void audio.play().catch(() => {
          if (cancelled) return;
          cancelPendingPlay?.();
          cancelPendingPlay = whenAudioUnlocked(() => {
            if (cancelled) return;
            void audio.play().catch(() => {});
          });
        });
      };
      tryPlay();
    };

    const t = window.setTimeout(() => {
      if (!cancelled) startPlayback();
    }, RULES_AUDIO_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      cancelPendingPlay?.();
      audioRef.current?.pause();
    };
  }, [playAudio]);

  return (
    <div className="rules-screen-card">
      <h2 id="rules-title" className="rules-screen-title">
        Правила игры
      </h2>
      <div ref={containerRef} className="rules-screen-body">
        <pre ref={textRef} className="rules-screen-text">
          {GAME_RULES}
        </pre>
      </div>
      {footer}
    </div>
  );
}
