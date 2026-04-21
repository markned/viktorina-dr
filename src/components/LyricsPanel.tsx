import { memo } from "react";
import { motion } from "framer-motion";
import type { LyricLine } from "../types";

type LyricsPanelProps = {
  hintLines: LyricLine[];
  visibleCount: number;
};

export const LyricsPanel = memo(function LyricsPanel({ hintLines, visibleCount }: LyricsPanelProps) {
  const visibleLines = hintLines.slice(0, visibleCount);

  return (
    <section className="lyrics-panel genius-style">
      <div className="lyrics-list">
        {visibleLines.map((line) => (
          <motion.p
            key={line.id}
            className="lyric-line genius-bar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {line.text || "•••"}
          </motion.p>
        ))}
      </div>
    </section>
  );
});
