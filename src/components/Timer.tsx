type TimerProps = {
  seconds: number;
  isActive: boolean;
  totalSeconds: number;
};

export function Timer({ seconds, isActive, totalSeconds }: TimerProps) {
  const progress = totalSeconds > 0 ? 1 - seconds / totalSeconds : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`timer-corner ${isActive ? "timer-corner-active" : ""}`} aria-label="Таймер">
      <svg className="timer-ring" viewBox="0 0 100 100" aria-hidden>
        <circle className="timer-ring-bg" cx="50" cy="50" r="45" fill="none" strokeWidth="6" />
        <circle
          className="timer-ring-fill"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="timer-value">{seconds}</span>
    </div>
  );
}
