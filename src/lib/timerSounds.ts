import { TIMER_COUNT_SOUND, TIMER_END_SOUND } from "../helpers/quizConfig";

export function playTimerEndSound() {
  const a = new Audio(TIMER_END_SOUND);
  a.volume = 0.8;
  void a.play();
}

export function playTimerTickSound() {
  const a = new Audio(TIMER_COUNT_SOUND);
  a.volume = 0.5;
  void a.play();
}
