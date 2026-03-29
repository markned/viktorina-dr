import { RulesCard } from "./RulesCard";

type GameRulesScreenProps = {
  onComplete: () => void;
};

/** Общие правила — до выбора режима */
export function GameRulesScreen({ onComplete }: GameRulesScreenProps) {
  return (
    <main className="app-shell rules-screen-shell">
      <RulesCard
        mode="common"
        rulesTitle="Об игре"
        playAudio={false}
        footer={
          <div className="rules-screen-start-wrap">
            <button
              type="button"
              className="rules-screen-start-btn"
              onClick={onComplete}
              aria-label="К выбору режима"
            >
              →
            </button>
          </div>
        }
      />
    </main>
  );
}
