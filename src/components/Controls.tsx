import { useMemo, useRef } from "react";
import { ReplayWithPlayIcon } from "./ReplayWithPlayIcon";
import { useCoarsePointer } from "../hooks/useCoarsePointer";
import { useDockFitScale } from "../hooks/useDockFitScale";
import { useGesturePauseLayout } from "../hooks/useGesturePauseLayout";
import type { GameMode, RoundState } from "../types";

function usePauseHintText(gameMode: GameMode | null): string {
  const coarse = useCoarsePointer();
  const gesturePause = useGesturePauseLayout();
  return useMemo(() => {
    const pause = (() => {
      if (!gesturePause) {
        return "Пауза — кнопка в углу или клавиша Esc";
      }
      if (coarse) {
        return "Пауза — коснитесь экрана двумя пальцами";
      }
      return "Пауза — клавиша Esc";
    })();
    if (gameMode === "quiz") {
      return `${pause} · Викторина: выберите вариант и «✓», пробел подтверждает.`;
    }
    return `${pause} · Фристайл: после таймера — пробел или 👁.`;
  }, [gesturePause, coarse, gameMode]);
}

type ControlsProps = {
  roundState: RoundState;
  gameMode: GameMode | null;
  selectedQuizIndex: number | null;
  onReplaySnippet: () => void;
  onReveal: () => void;
  onConfirmQuiz: () => void;
  onNextRound: () => void;
};

export function Controls({
  roundState,
  gameMode,
  selectedQuizIndex,
  onReplaySnippet,
  onReveal,
  onConfirmQuiz,
  onNextRound,
}: ControlsProps) {
  const dockRef = useRef<HTMLElement>(null);
  useDockFitScale(dockRef);
  const pauseHint = usePauseHintText(gameMode);

  const isQuiz = gameMode === "quiz";
  const canRevealFreestyle = !isQuiz && roundState === "timer_finished";
  const canConfirmQuiz =
    isQuiz && roundState === "paused_for_guess" && selectedQuizIndex !== null;
  const canNext = roundState === "reveal";
  const canReplay = roundState !== "transition" && roundState !== "quiz_feedback";

  const primaryAction = isQuiz ? onConfirmQuiz : onReveal;
  const canPrimary = isQuiz ? canConfirmQuiz : canRevealFreestyle;

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
        className={`dock-btn dock-btn-primary ${canPrimary ? "" : "dock-btn-dimmed"}`}
        onClick={primaryAction}
        disabled={isQuiz && roundState === "paused_for_guess" && selectedQuizIndex === null}
        title={
          isQuiz
            ? canConfirmQuiz
              ? "Подтвердить ответ (пробел)"
              : "Сначала выберите вариант"
            : canRevealFreestyle
              ? "Открыть ответ (пробел)"
              : "Тройной клик или пробел — вскрыть ответ"
        }
        aria-label={isQuiz ? "Подтвердить ответ" : "Показать ответ"}
      >
        {isQuiz ? "✓" : "👁"}
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
