import { GAME_RULES_QUIZ } from "../content/rules";
import { RULES_QUIZ_AUDIO_PATH } from "../helpers/quizConfig";
import type { GameMode } from "../types";
import { RulesCard } from "./RulesCard";

type RulesScreenProps = {
  onComplete: () => void;
  gameMode: GameMode;
};

export function RulesScreen({ onComplete, gameMode }: RulesScreenProps) {
  const isQuiz = gameMode === "quiz";
  return (
    <main className="app-shell rules-screen-shell">
      <RulesCard
        mode={gameMode}
        rulesTitle={isQuiz ? "Правила викторины" : "Правила игры"}
        rulesText={isQuiz ? GAME_RULES_QUIZ : undefined}
        audioSrc={isQuiz ? RULES_QUIZ_AUDIO_PATH : undefined}
        footer={
          <div className="rules-screen-start-wrap">
            <button
              type="button"
              className="rules-screen-start-btn"
              onClick={onComplete}
              aria-label="Начать викторину"
            >
              →
            </button>
          </div>
        }
      />
    </main>
  );
}
