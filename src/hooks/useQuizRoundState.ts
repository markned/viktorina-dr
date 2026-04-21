import { useCallback, useRef, useState } from "react";
import type { Round } from "../types";
import {
  buildQuizMcOptions,
  getQuizUiVariant,
  revealAnswerText,
  type QuizUiVariant,
} from "../helpers/quizOptions";
import { shuffleUntilOrderDiffers } from "../helpers/shuffle";

export function useQuizRoundState() {
  const [quizScore, setQuizScore] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizUiVariant, setQuizUiVariant] = useState<QuizUiVariant | null>(null);
  const [quizOrderUserIds, setQuizOrderUserIds] = useState<number[]>([]);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);

  const correctIndexRef = useRef(0);
  const variantRef = useRef<QuizUiVariant | null>(null);
  const orderIdsRef = useRef<number[]>([]);
  const selectedIndexRef = useRef<number | null>(null);
  /** Тексты ответов уже завершённых раундов — не использовать как дистракторы. */
  const priorCorrectAnswersRef = useRef<Set<string>>(new Set());
  const distractorPoolRef = useRef<Round[]>([]);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // Sync refs with state (намеренный паттерн для callbacks без stale closure)
  variantRef.current = quizUiVariant;
  orderIdsRef.current = quizOrderUserIds;
  selectedIndexRef.current = selectedQuizIndex;

  const resetQuizRoundUi = useCallback(() => {
    setQuizScore(0);
    setQuizOptions([]);
    setQuizUiVariant(null);
    setQuizOrderUserIds([]);
    setSelectedQuizIndex(null);
    setQuizCorrectIndex(0);
    correctIndexRef.current = 0;
    priorCorrectAnswersRef.current.clear();
  }, []);

  /** Инициализирует UI ответов для раунда в режиме «Викторина». */
  const setupRoundQuizUi = useCallback((r: Round) => {
    const v = getQuizUiVariant(r);
    setQuizUiVariant(v);
    variantRef.current = v;
    if (v === "mc4") {
      const built = buildQuizMcOptions(r, distractorPoolRef.current, priorCorrectAnswersRef.current);
      correctIndexRef.current = built.correctIndex;
      setQuizCorrectIndex(built.correctIndex);
      setQuizOptions(built.options);
      setSelectedQuizIndex(null);
      setQuizOrderUserIds([]);
    } else if (v === "order") {
      correctIndexRef.current = 0;
      setQuizCorrectIndex(0);
      setQuizOptions([]);
      setSelectedQuizIndex(null);
      setQuizOrderUserIds(shuffleUntilOrderDiffers(r.revealLineIds));
    } else {
      correctIndexRef.current = 0;
      setQuizCorrectIndex(0);
      setQuizOptions([]);
      setSelectedQuizIndex(null);
      setQuizOrderUserIds([]);
    }
  }, []);

  /** Сбрасывает UI ответов при переходе в режим «Фристайл». */
  const clearRoundForFreestyle = useCallback(() => {
    setQuizUiVariant(null);
    variantRef.current = null;
    setQuizOptions([]);
    setSelectedQuizIndex(null);
    setQuizOrderUserIds([]);
    setQuizCorrectIndex(0);
    correctIndexRef.current = 0;
  }, []);

  const computeIsCorrect = useCallback((r: Round): boolean => {
    const variant = variantRef.current;
    if (variant === "order") {
      const order = orderIdsRef.current;
      const reveal = r.revealLineIds;
      return order.length === reveal.length && order.every((id, i) => id === reveal[i]);
    }
    if (variant === "mc4") {
      const selected = selectedIndexRef.current;
      const correctIdx = correctIndexRef.current;
      return selected !== null && selected === correctIdx;
    }
    return false;
  }, []);

  const addScore = useCallback(() => {
    setQuizScore((s) => s + 1);
  }, []);

  const recordAnswer = useCallback((r: Round) => {
    priorCorrectAnswersRef.current.add(revealAnswerText(r));
  }, []);

  const setQuizSelection = useCallback((index: number | null) => {
    setSelectedQuizIndex(index);
  }, []);

  const reorderQuizOrderLines = useCallback((ids: number[]) => {
    setQuizOrderUserIds(ids);
  }, []);

  return {
    quizScore,
    quizOptions,
    quizUiVariant,
    quizOrderUserIds,
    selectedQuizIndex,
    quizCorrectIndex,
    correctIndexRef,
    variantRef,
    orderIdsRef,
    selectedIndexRef,
    priorCorrectAnswersRef,
    distractorPoolRef,
    feedbackTimeoutRef,
    resetQuizRoundUi,
    setupRoundQuizUi,
    clearRoundForFreestyle,
    computeIsCorrect,
    addScore,
    recordAnswer,
    setQuizSelection,
    reorderQuizOrderLines,
  };
}
