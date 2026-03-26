import { useMemo, useRef } from "react";
import { ReplayWithPlayIcon } from "./ReplayWithPlayIcon";
import { useCoarsePointer } from "../hooks/useCoarsePointer";
import { useDockFitScale } from "../hooks/useDockFitScale";
import { useGesturePauseLayout } from "../hooks/useGesturePauseLayout";
import type { RoundState } from "../types";

function usePauseHintText(): string {
  const coarse = useCoarsePointer();
  const gesturePause = useGesturePauseLayout();
  return useMemo(() => {
    if (!gesturePause) {
      return "Пауза — кнопка в углу или клавиша Esc";
    }
    if (coarse) {
      return "Пауза — коснитесь экрана двумя пальцами";
    }
    return "Пауза — клавиша Esc";
  }, [gesturePause, coarse]);
}

type ControlsProps = {
  roundState: RoundState;
  onReplaySnippet: () => void;
  onReveal: () => void;
  onNextRound: () => void;
};

export function Controls({
  roundState,
  onReplaySnippet,
  onReveal,
  onNextRound,
}: ControlsProps) {
  const dockRef = useRef<HTMLElement>(null);
  useDockFitScale(dockRef);
  const pauseHint = usePauseHintText();

  const canReveal = roundState === "timer_finished";
  const canNext = roundState === "reveal";
  const canReplay = roundState !== "transition";

  return (
    <div className="dock-host">
      <p className="dock-pause-hint">{pauseHint}</p>
      <nav ref={dockRef} className="dock" role="toolbar">
      <button
        type="button"
        className="dock-btn dock-btn-replay"
        onClick={onReplaySnippet}
        disabled={!canReplay}
        title="Повторить фрагмент (R)"
      >
        <ReplayWithPlayIcon />
      </button>
      <button
        className={`dock-btn dock-btn-primary ${canReveal ? "" : "dock-btn-dimmed"}`}
        onClick={onReveal}
        title={canReveal ? "Открыть ответ (пробел)" : "Тройной клик или пробел — вскрыть ответ"}
      >
        👁
      </button>
      <button
        className={`dock-btn dock-btn-primary ${canNext ? "" : "dock-btn-dimmed"}`}
        onClick={onNextRound}
        disabled={!canNext}
        title="Следующий раунд (→)"
      >
        →
      </button>
    </nav>
    </div>
  );
}
