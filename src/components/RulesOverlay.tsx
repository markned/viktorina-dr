import { GAME_RULES_QUIZ } from "../content/rules";
import { RULES_QUIZ_AUDIO_PATH } from "../helpers/quizConfig";
import type { GameMode } from "../types";
import { RulesCard } from "./RulesCard";

type RulesOverlayProps = {
  open: boolean;
  onClose: () => void;
  gameMode: GameMode;
};

/** Правила поверх квиза: раунд не перезапускается */
export function RulesOverlay({ open, onClose, gameMode }: RulesOverlayProps) {
  if (!open) {
    return null;
  }

  const isQuiz = gameMode === "quiz";

  return (
    <div className="rules-overlay-root" role="dialog" aria-modal="true" aria-labelledby="rules-title">
      <div className="rules-overlay-scrim" onClick={onClose} role="presentation" />
      <div className="rules-overlay-stage">
        <RulesCard
          mode={gameMode}
          rulesTitle={isQuiz ? "Правила викторины" : "Правила игры"}
          rulesText={isQuiz ? GAME_RULES_QUIZ : undefined}
          audioSrc={isQuiz ? RULES_QUIZ_AUDIO_PATH : undefined}
          playAudio={false}
          footer={
            <div className="rules-screen-start-wrap">
              <button
                type="button"
                className="rules-screen-start-btn"
                onClick={onClose}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}
