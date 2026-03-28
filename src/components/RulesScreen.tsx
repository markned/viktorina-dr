import { useCoarsePointer } from "../hooks/useCoarsePointer";
import { useGesturePauseLayout } from "../hooks/useGesturePauseLayout";
import { getControlsHintLines } from "../helpers/controlsCopy";
import type { GameMode } from "../types";

type RulesScreenProps = {
  onComplete: () => void;
  gameMode: GameMode;
};

/** Только управление — после выбора режима, перед первым раундом */
export function RulesScreen({ onComplete, gameMode }: RulesScreenProps) {
  const coarse = useCoarsePointer();
  const gesturePause = useGesturePauseLayout();
  const lines = getControlsHintLines(gameMode, { gesturePause, coarse });

  return (
    <main className="app-shell rules-screen-shell">
      <div className="rules-screen-card controls-screen-card">
        <h2 id="rules-title" className="rules-screen-title">
          Управление
        </h2>
        <div className="rules-screen-body controls-screen-body">
          <ul className="controls-hint-list controls-hint-list--in-rules">
            {lines.map((line, i) => (
              <li
                key={i}
                className={`controls-hint-item controls-hint-item--${line.anim}`}
              >
                <span className="controls-hint-kbd" aria-hidden>
                  {line.kbd}
                </span>
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rules-screen-start-wrap">
          <button
            type="button"
            className="rules-screen-start-btn"
            onClick={onComplete}
            aria-label="Начать игру"
          >
            →
          </button>
        </div>
      </div>
    </main>
  );
}
