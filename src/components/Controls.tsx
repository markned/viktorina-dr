import { useMemo, useRef } from "react";
import { ReplayWithPlayIcon } from "./ReplayWithPlayIcon";
import { useCoarsePointer } from "../hooks/useCoarsePointer";
import { useDockFitScale } from "../hooks/useDockFitScale";
import { useGesturePauseLayout } from "../hooks/useGesturePauseLayout";
import type { QuizUiVariant } from "../helpers/quizOptions";
import type { GameMode, RoundState } from "../types";

function usePauseHintText(gameMode: GameMode | null, quizVariant: QuizUiVariant | null): string {
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
      if (quizVariant === "order") {
        return `${pause} · Викторина: порядок строк — перетащите или ↑↓, затем «✓» или пробел.`;
      }
      return `${pause} · Викторина: выбери из 4 — вариант, «✓» или пробел.`;
    }
    return `${pause} · Фристайл: ответ вслух, затем пробел или 👁.`;
  }, [gesturePause, coarse, gameMode, quizVariant]);
}

type ControlsProps = {
  roundState: RoundState;
  gameMode: GameMode | null;
  quizUiVariant: QuizUiVariant | null;
  selectedQuizIndex: number | null;
  onReplaySnippet: () => void;
  onReveal: () => void;
  onConfirmQuiz: () => void;
  onNextRound: () => void;
};

export function Controls({
  roundState,
  gameMode,
  quizUiVariant,
  selectedQuizIndex,
  onReplaySnippet,
  onReveal,
  onConfirmQuiz,
  onNextRound,
}: ControlsProps) {
  const dockRef = useRef<HTMLElement>(null);
  useDockFitScale(dockRef);
  const pauseHint = usePauseHintText(gameMode, quizUiVariant);

  const isQuiz = gameMode === "quiz";
  const canRevealFreestyle = !isQuiz && roundState === "timer_finished";
  const canConfirmQuiz =
    isQuiz && roundState === "paused_for_guess" && (quizUiVariant === "order" || selectedQuizIndex !== null);
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
          disabled={
            isQuiz &&
            roundState === "paused_for_guess" &&
            quizUiVariant !== "order" &&
            selectedQuizIndex === null
          }
          title={
            isQuiz
              ? canConfirmQuiz
                ? "Подтвердить ответ (пробел)"
                : quizUiVariant === "order"
                  ? "Подтвердить порядок (пробел)"
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
