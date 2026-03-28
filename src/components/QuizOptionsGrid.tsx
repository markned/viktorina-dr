import type { RoundState } from "../types";

type QuizOptionsGridProps = {
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  onSelect: (index: number) => void;
  roundState: RoundState;
  disabled: boolean;
};

export function QuizOptionsGrid({
  options,
  selectedIndex,
  correctIndex,
  onSelect,
  roundState,
  disabled,
}: QuizOptionsGridProps) {
  const isFeedback = roundState === "quiz_feedback";
  const visible =
    (roundState === "paused_for_guess" || isFeedback) && options.length === 4;
  if (!visible) return null;

  return (
    <section className="quiz-options-panel genius-style" role="group" aria-label="Варианты ответа">
      <div className="quiz-options-grid">
        {options.map((text, i) => {
          let cls = "lyric-line genius-bar quiz-option";
          if (!isFeedback) {
            if (selectedIndex !== i) cls += " quiz-option--shake";
            if (selectedIndex === i) cls += " quiz-option--selected";
          } else {
            cls += " quiz-option--feedback";
            if (i === correctIndex) {
              cls += " quiz-option--correct";
            } else if (selectedIndex !== null && i === selectedIndex) {
              cls += " quiz-option--wrong";
            } else {
              cls += " quiz-option--dim";
            }
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={disabled || isFeedback}
              aria-pressed={!isFeedback && selectedIndex === i ? true : false}
              onClick={() => onSelect(i)}
            >
              {text || "—"}
            </button>
          );
        })}
      </div>
    </section>
  );
}
