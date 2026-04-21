import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { prefersHover } from "../lib/mediaQueries";
import { pauseModeSelectPreview, playModeSelectPreview } from "../lib/modeSelectPaneVideo";

export type ModeSelectDemoPhase = "freestyle" | "quiz";

/**
 * На тач-устройствах чередует превью двух режимов до выбора.
 * На десктопе с hover возвращает `null` — превью только по наведению на плитку.
 */
export function useModeSelectMobileDemo(quizDisabled: boolean) {
  const freestyleRef = useRef<HTMLVideoElement | null>(null);
  const quizRef = useRef<HTMLVideoElement | null>(null);

  const [mobileDemo, setMobileDemo] = useState<ModeSelectDemoPhase | null>(() =>
    typeof window !== "undefined" && !prefersHover() ? "freestyle" : null,
  );

  const handleDemoVideoEnded = useCallback(
    (mode: ModeSelectDemoPhase) => {
      if (mobileDemo === null) return;
      if (mode !== mobileDemo) return;
      if (quizDisabled) {
        playModeSelectPreview(freestyleRef.current);
        return;
      }
      setMobileDemo((prev) => (prev === "freestyle" ? "quiz" : "freestyle"));
    },
    [mobileDemo, quizDisabled],
  );

  useEffect(() => {
    if (mobileDemo === null) return;
    if (mobileDemo === "quiz" && quizDisabled) {
      setMobileDemo("freestyle");
      return;
    }
    const active = mobileDemo === "freestyle" ? freestyleRef.current : quizRef.current;
    const inactive = mobileDemo === "freestyle" ? quizRef.current : freestyleRef.current;
    pauseModeSelectPreview(inactive);
    playModeSelectPreview(active);
  }, [mobileDemo, quizDisabled]);

  useEffect(() => {
    const fv = freestyleRef.current;
    const qv = quizRef.current;
    return () => {
      pauseModeSelectPreview(fv);
      pauseModeSelectPreview(qv);
    };
  }, []);

  const isMobileDemo = mobileDemo !== null;

  const onFreestyleEnded = useCallback(() => {
    handleDemoVideoEnded("freestyle");
  }, [handleDemoVideoEnded]);

  const onQuizEnded = useCallback(() => {
    handleDemoVideoEnded("quiz");
  }, [handleDemoVideoEnded]);

  return useMemo(
    () => ({
      freestyleRef,
      quizRef,
      isMobileDemo,
      demoActiveFreestyle: mobileDemo === "freestyle",
      demoActiveQuiz: mobileDemo === "quiz",
      onDemoEndedFreestyle: isMobileDemo ? onFreestyleEnded : undefined,
      onDemoEndedQuiz: isMobileDemo ? onQuizEnded : undefined,
    }),
    [isMobileDemo, mobileDemo, onFreestyleEnded, onQuizEnded],
  );
}
