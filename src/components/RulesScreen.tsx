import { RulesCard } from "./RulesCard";

type RulesScreenProps = {
  onComplete: () => void;
};

export function RulesScreen({ onComplete }: RulesScreenProps) {
  return (
    <main className="app-shell rules-screen-shell">
      <RulesCard
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
