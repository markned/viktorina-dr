import {
  QUIZ_ANSWER_RIGHT_SOUND,
  QUIZ_ANSWER_WRONG_SOUND,
  QUIZ_TIMER_END_SOUND,
  TIMER_COUNT_SOUND,
  TIMER_END_SOUND,
  TIMER_END_SOUND_ALT,
} from "../helpers/quizConfig";
import { whenAudioUnlocked } from "./audioUnlock";

const TICK_BASE_VOL = 0.5;
const END_BASE_VOL = 0.8;

let timerSoundsDucked = false;
const activeTickAudios = new Set<HTMLAudioElement>();
/** Чередование двух звуков конца таймера (фристайл). */
let timerEndFreestyleVariant = 0;

export function stopAllTimerCountSounds(): void {
  const list = [...activeTickAudios];
  activeTickAudios.clear();
  for (const a of list) {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {
      /* ignore */
    }
  }
}

export function setTimerSoundsDucked(ducked: boolean): void {
  timerSoundsDucked = ducked;
  if (ducked) {
    stopAllTimerCountSounds();
  }
}

export function playTimerEndSound(): void {
  stopAllTimerCountSounds();
  const urls = [TIMER_END_SOUND, TIMER_END_SOUND_ALT] as const;
  const url = urls[timerEndFreestyleVariant % 2];
  timerEndFreestyleVariant += 1;
  const a = new Audio(url);
  a.volume = timerSoundsDucked ? 0 : END_BASE_VOL;
  void a.play().catch(() => {
    if (timerSoundsDucked) return;
    whenAudioUnlocked(() => void a.play().catch(() => {}));
  });
}

/** Конец таймера в режиме «Викторина» (отдельная озвучка). */
export function playQuizTimerEndSound(): void {
  stopAllTimerCountSounds();
  const a = new Audio(QUIZ_TIMER_END_SOUND);
  a.volume = timerSoundsDucked ? 0 : END_BASE_VOL;
  void a.play().catch(() => {
    if (timerSoundsDucked) return;
    whenAudioUnlocked(() => void a.play().catch(() => {}));
  });
}

/** Подтверждённый ответ в викторине: верный / неверный. */
export function playQuizAnswerFeedbackSound(isCorrect: boolean): void {
  stopAllTimerCountSounds();
  const url = isCorrect ? QUIZ_ANSWER_RIGHT_SOUND : QUIZ_ANSWER_WRONG_SOUND;
  const a = new Audio(url);
  a.volume = timerSoundsDucked ? 0 : END_BASE_VOL;
  void a.play().catch(() => {
    if (timerSoundsDucked) return;
    whenAudioUnlocked(() => void a.play().catch(() => {}));
  });
}

export function playTimerTickSound(): void {
  if (timerSoundsDucked) {
    return;
  }
  stopAllTimerCountSounds();
  const a = new Audio(TIMER_COUNT_SOUND);
  a.volume = TICK_BASE_VOL;
  activeTickAudios.add(a);
  const onDone = () => {
    activeTickAudios.delete(a);
    a.removeEventListener("ended", onDone);
  };
  a.addEventListener("ended", onDone);
  void a.play().catch(() => {
    if (timerSoundsDucked) {
      activeTickAudios.delete(a);
      return;
    }
    whenAudioUnlocked(() => {
      if (timerSoundsDucked) {
        activeTickAudios.delete(a);
        return;
      }
      void a.play().catch(() => {
        activeTickAudios.delete(a);
      });
    });
  });
}
