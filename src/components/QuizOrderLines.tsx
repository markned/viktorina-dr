import { useRef } from "react";
import type { RoundState } from "../types";

type QuizOrderLinesProps = {
  roundState: RoundState;
  orderedIds: number[];
  lineText: (id: number) => string;
  correctIds: number[];
  disabled: boolean;
  onReorder: (ids: number[]) => void;
};

export function QuizOrderLines({
  roundState,
  orderedIds,
  lineText,
  correctIds,
  disabled,
  onReorder,
}: QuizOrderLinesProps) {
  const dragFrom = useRef<number | null>(null);
  const isFeedback = roundState === "quiz_feedback";
  const visible = (roundState === "paused_for_guess" || isFeedback) && orderedIds.length >= 3;
  if (!visible) return null;

  const move = (from: number, to: number) => {
    if (from === to || disabled || isFeedback) return;
    const next = [...orderedIds];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onReorder(next);
  };

  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragFrom.current = idx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (toIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from === null || from === toIdx || disabled || isFeedback) return;
    move(from, toIdx);
  };

  return (
    <section className="quiz-options-panel genius-style quiz-order-panel" aria-label="Порядок строк ответа">
      <ol className="quiz-order-list">
        {orderedIds.map((id, idx) => {
          const ok = isFeedback && correctIds[idx] === id;
          const rowCls =
            "lyric-line genius-bar quiz-option quiz-order-row" +
            (!isFeedback ? " quiz-option--shake" : "") +
            (isFeedback ? " quiz-option--feedback" : "") +
            (isFeedback && ok ? " quiz-option--correct" : "") +
            (isFeedback && !ok ? " quiz-option--wrong" : "");
          return (
            <li key={`${id}-${idx}`} className="quiz-order-li">
              <div
                className={rowCls}
                draggable={!disabled && !isFeedback}
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver}
                onDrop={onDrop(idx)}
              >
                {!isFeedback ? (
                  <span className="quiz-order-grip" aria-hidden title="Перетащить строку">
                    <span className="quiz-order-grip__dots" />
                  </span>
                ) : null}
                <span className="quiz-order-row__text">{lineText(id) || "—"}</span>
                {!isFeedback ? (
                  <div className="quiz-order-row__nudges">
                    <button
                      type="button"
                      className="quiz-order-nudge"
                      disabled={disabled || idx === 0}
                      onClick={() => move(idx, idx - 1)}
                      aria-label="Переместить строку вверх"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="quiz-order-nudge"
                      disabled={disabled || idx >= orderedIds.length - 1}
                      onClick={() => move(idx, idx + 1)}
                      aria-label="Переместить строку вниз"
                    >
                      ↓
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
