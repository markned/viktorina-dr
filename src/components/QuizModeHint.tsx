import type { QuizUiVariant } from "../helpers/quizOptions";

type QuizModeHintProps = {
  variant: QuizUiVariant | null;
  visible: boolean;
};

/** Короткая анимированная подсказка механики викторины на экране вопроса. */
export function QuizModeHint({ variant, visible }: QuizModeHintProps) {
  if (!visible || !variant) return null;
  return (
    <div className="quiz-mode-hint" role="status">
      {variant === "mc4" ? (
        <p className="quiz-mode-hint__text quiz-mode-hint__text--pulse">
          Выберите одно из четырёх продолжений — как в оригинале.
        </p>
      ) : (
        <p className="quiz-mode-hint__text quiz-mode-hint__text--pulse">
          Расставьте строки в том порядке, в каком они идут в песне.
        </p>
      )}
    </div>
  );
}
