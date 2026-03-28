import type { GameMode } from "../types";

export type ControlsHintAnim = "pulse" | "wiggle" | "shake";

export type ControlsHintLine = {
  kbd: string;
  text: string;
  anim: ControlsHintAnim;
};

export function getControlsHintLines(
  gameMode: GameMode,
  opts: { gesturePause: boolean; coarse: boolean },
): ControlsHintLine[] {
  const { gesturePause, coarse } = opts;
  const pauseLine = !gesturePause
    ? "Пауза — кнопка ⏸ в углу или клавиша Esc."
    : coarse
      ? "Пауза — коснитесь экрана двумя пальцами."
      : "Пауза — клавиша Esc.";

  const lines: ControlsHintLine[] = [
    {
      kbd: gesturePause ? "👆👆" : "Esc",
      text: pauseLine,
      anim: "pulse",
    },
    {
      kbd: "R",
      text: "Повтор фрагмента — кнопка с иконкой или клавиша R.",
      anim: "wiggle",
    },
  ];

  if (gameMode === "freestyle") {
    lines.push({
      kbd: "␣",
      text: "Когда таймер остановился — ответьте вслух, затем пробел или 👁, чтобы показать строку.",
      anim: "shake",
    });
  } else {
    lines.push(
      {
        kbd: "✓",
        text: "Выберите одну из четырёх строк и нажмите «Подтвердить» или дождитесь конца таймера.",
        anim: "shake",
      },
      {
        kbd: "→",
        text: "После ответа — стрелка или кнопка «→» для следующего раунда.",
        anim: "pulse",
      },
    );
  }

  return lines;
}
