import { useCoarsePointer } from "../hooks/useCoarsePointer";
import { useGesturePauseLayout } from "../hooks/useGesturePauseLayout";
import type { GameMode } from "../types";

type ControlsHintOverlayProps = {
  open: boolean;
  gameMode: GameMode;
  onDismiss: () => void;
};

export function ControlsHintOverlay({ open, gameMode, onDismiss }: ControlsHintOverlayProps) {
  const coarse = useCoarsePointer();
  const gesturePause = useGesturePauseLayout();

  if (!open) return null;

  const pauseLine = !gesturePause
    ? "Пауза — кнопка ⏸ в углу или клавиша Esc."
    : coarse
      ? "Пауза — коснитесь экрана двумя пальцами."
      : "Пауза — клавиша Esc.";

  return (
    <div className="controls-hint-overlay" role="dialog" aria-modal="true" aria-labelledby="controls-hint-title">
      <div className="controls-hint-scrim" onClick={onDismiss} role="presentation" />
      <div className="controls-hint-card">
        <h2 id="controls-hint-title" className="controls-hint-title">
          Управление
        </h2>
        <ul className="controls-hint-list">
          <li className="controls-hint-item controls-hint-item--pulse">
            <span className="controls-hint-kbd" aria-hidden>
              {gesturePause ? "👆👆" : "Esc"}
            </span>
            <span>{pauseLine}</span>
          </li>
          <li className="controls-hint-item controls-hint-item--wiggle">
            <span className="controls-hint-kbd" aria-hidden>
              R
            </span>
            <span>Повтор фрагмента — кнопка с иконкой или клавиша R.</span>
          </li>
          {gameMode === "freestyle" ? (
            <li className="controls-hint-item controls-hint-item--shake">
              <span className="controls-hint-kbd" aria-hidden>
                ␣
              </span>
              <span>Когда таймер остановился — пробел или кнопка 👁, чтобы показать ответ.</span>
            </li>
          ) : (
            <>
              <li className="controls-hint-item controls-hint-item--shake">
                <span className="controls-hint-kbd" aria-hidden>
                  ✓
                </span>
                <span>Выберите вариант и нажмите «Подтвердить» или дождитесь конца таймера.</span>
              </li>
              <li className="controls-hint-item controls-hint-item--pulse">
                <span className="controls-hint-kbd" aria-hidden>
                  →
                </span>
                <span>После ответа — стрелка или кнопка «→» для следующего раунда.</span>
              </li>
            </>
          )}
        </ul>
        <button type="button" className="controls-hint-ok" onClick={onDismiss}>
          Понятно
        </button>
      </div>
    </div>
  );
}
