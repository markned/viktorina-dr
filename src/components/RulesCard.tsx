import { useEffect, useRef, type ReactNode } from "react";
import { useFitTextToHeight } from "../hooks/useFitTextToHeight";
import { GAME_RULES_COMMON } from "../content/rules";
import { RULES_AUDIO_DELAY_MS } from "../helpers/quizConfig";
import type { GameMode } from "../types";
import { whenAudioUnlocked } from "../lib/audioUnlock";
import { boostRulesNarration } from "../lib/volumeBoost";

type RulesCardProps = {
  footer: ReactNode;
  /** Озвучка `audioSrc` (по умолчанию выключена — общий экран без автозвука) */
  playAudio?: boolean;
  /** Текст правил (по умолчанию фристайл) */
  rulesText?: string;
  /** Заголовок карточки */
  rulesTitle?: string;
  /** Путь к озвучке (нужен, если `playAudio`) */
  audioSrc?: string;
  /** Режим для разметки / aria */
  mode?: GameMode | "common";
};

/** Текст правил + опциональная озвучка; подвал (→ или ✕) задаётся снаружи */
export function RulesCard({
  footer,
  playAudio = false,
  rulesText = GAME_RULES_COMMON,
  rulesTitle = "Правила игры",
  audioSrc,
  mode = "freestyle",
}: RulesCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { containerRef, textRef } = useFitTextToHeight({ maxPx: 44, floorMinPx: 8 });

  useEffect(() => {
    if (!playAudio || !audioSrc) {
      return;
    }
    let cancelled = false;
    let cancelPendingPlay: (() => void) | undefined;

    const startPlayback = () => {
      if (cancelled) return;
      const audio = new Audio(audioSrc);
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
  }, [playAudio, audioSrc]);

  return (
    <div className="rules-screen-card">
      <h2 id="rules-title" className="rules-screen-title">
        {rulesTitle}
      </h2>
      <div ref={containerRef} className="rules-screen-body">
        <pre ref={textRef} className="rules-screen-text" data-rules-mode={mode}>
          {rulesText}
        </pre>
      </div>
      {footer}
    </div>
  );
}
