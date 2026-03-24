import type { LyricLine, Round, RoundState } from "../types";
import { Controls } from "./Controls";
import { LyricsPanel } from "./LyricsPanel";
import { RevealPanel } from "./RevealPanel";
import { Timer } from "./Timer";

type QuizScreenProps = {
  round: Round;
  roundIndex: number;
  totalRounds: number;
  roundState: RoundState;
  hintLines: LyricLine[];
  revealLines: LyricLine[];
  visibleHintLineCount: number;
  timerSeconds: number;
  totalSeconds: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReplaySnippet: () => void;
  onReveal: () => void;
  onNextRound: () => void;
  onRestartRequest: () => void;
};

export function QuizScreen(props: QuizScreenProps) {
  const {
    round,
    roundIndex,
    totalRounds,
    roundState,
    hintLines,
    revealLines,
    visibleHintLineCount,
    timerSeconds,
    totalSeconds,
    isPlaying,
    onPlayPause,
    onReplaySnippet,
    onReveal,
    onNextRound,
    onRestartRequest,
  } = props;

  const revealVisible = roundState === "reveal";
  const timerActive = roundState === "paused_for_guess";

  return (
    <div className="quiz-screen">
      <div className="timer-with-counter">
        <Timer seconds={timerSeconds} isActive={timerActive} totalSeconds={totalSeconds} />
        <span className="quiz-round-counter">{roundIndex + 1}/{totalRounds}</span>
      </div>
      <div className="quiz-content">
        <h2 className="quiz-title">{round.title}</h2>
        <LyricsPanel hintLines={hintLines} visibleCount={visibleHintLineCount} />
        <RevealPanel revealLines={revealLines} visible={revealVisible} />
      </div>
      <Controls
        roundState={roundState}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onReplaySnippet={onReplaySnippet}
        onReveal={onReveal}
        onNextRound={onNextRound}
        onRestartRequest={onRestartRequest}
      />
    </div>
  );
}
