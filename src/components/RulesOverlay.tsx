import { RulesCard } from "./RulesCard";

type RulesOverlayProps = {
  open: boolean;
  onClose: () => void;
};

/** Общие правила поверх квиза (пауза) */
export function RulesOverlay({ open, onClose }: RulesOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="rules-overlay-root" role="dialog" aria-modal="true" aria-labelledby="rules-title">
      <div className="rules-overlay-scrim" onClick={onClose} role="presentation" />
      <div className="rules-overlay-stage">
        <RulesCard
          mode="common"
          rulesTitle="Об игре"
          playAudio={false}
          footer={
            <div className="rules-screen-start-wrap">
              <button type="button" className="rules-screen-start-btn" onClick={onClose} aria-label="Закрыть">
                ✕
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}
