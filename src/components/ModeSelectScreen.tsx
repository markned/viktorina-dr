import { useCallback, useEffect, useRef } from "react";
import { MODE_SELECT_FREESTYLE_VIDEO, MODE_SELECT_QUIZ_VIDEO } from "../helpers/quizConfig";
import { boostVolume } from "../lib/volumeBoost";
import type { GameMode } from "../types";

type ModeSelectScreenProps = {
  onSelectMode: (mode: GameMode) => void;
  quizEligibleCount: number;
};

type Tint = "green" | "red";

function isHoverDevice(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
}

type ModeSelectPaneProps = {
  videoSrc: string;
  tint: Tint;
  title: string;
  description: string;
  disabled?: boolean;
  disabledHint?: string;
  onSelect: () => void;
};

function ModeSelectPane({
  videoSrc,
  tint,
  title,
  description,
  disabled,
  disabledHint,
  onSelect,
}: ModeSelectPaneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const pauseVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  const playVideo = useCallback(() => {
    if (disabled) return;
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    boostVolume(el);
    void el.play().catch(() => {
      el.muted = true;
      void el.play().catch(() => {});
    });
  }, [disabled]);

  useEffect(() => {
    return () => pauseVideo();
  }, [pauseVideo]);

  const handlePointerEnter = () => {
    if (disabled) return;
    if (isHoverDevice()) playVideo();
  };

  const handlePointerLeave = () => {
    if (isHoverDevice()) pauseVideo();
  };

  const handlePointerDown = () => {
    if (disabled) return;
    if (!isHoverDevice()) playVideo();
  };

  const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    boostVolume(e.currentTarget);
  };

  return (
    <button
      type="button"
      className={`mode-select-pane mode-select-pane--${tint}${disabled ? " mode-select-pane--disabled" : ""}`}
      onClick={() => {
        if (!disabled) onSelect();
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <video
        ref={videoRef}
        className="mode-select-pane__video"
        src={videoSrc}
        playsInline
        muted
        loop
        preload="auto"
        onPlay={handlePlay}
      />
      <div className={`mode-select-pane__tint mode-select-pane__tint--${tint}`} aria-hidden />
      <div className="mode-select-pane__content">
        <h2 className="mode-select-pane__title">{title}</h2>
        <p className="mode-select-pane__desc">{description}</p>
        {disabled && disabledHint ? <p className="mode-select-pane__warn">{disabledHint}</p> : null}
      </div>
    </button>
  );
}

export function ModeSelectScreen({ onSelectMode, quizEligibleCount }: ModeSelectScreenProps) {
  const quizDisabled = quizEligibleCount < 4;

  return (
    <main className="mode-select-shell">
      <div className="mode-select-split">
        <ModeSelectPane
          videoSrc={MODE_SELECT_FREESTYLE_VIDEO}
          tint="green"
          title="Фристайл"
          description="Угадываете вслух, ведущий открывает ответ — классический формат."
          onSelect={() => onSelectMode("freestyle")}
        />
        <ModeSelectPane
          videoSrc={MODE_SELECT_QUIZ_VIDEO}
          tint="red"
          title="Викторина"
          description="Четыре варианта, счёт правильных ответов и итоговый ролик по результату."
          disabled={quizDisabled}
          disabledHint={`Нужно минимум 4 раунда с одной строкой ответа (сейчас ${quizEligibleCount}).`}
          onSelect={() => onSelectMode("quiz")}
        />
      </div>
    </main>
  );
}
