import { AnimatePresence, motion } from "framer-motion";
import type { LyricLine } from "../types";

type RevealPanelProps = {
  revealLines: LyricLine[];
  visible: boolean;
};

export function RevealPanel({ revealLines, visible }: RevealPanelProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.section
          className="reveal-panel genius-style genius-reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="lyrics-list">
            {revealLines.map((line) => (
              <p key={line.id} className="lyric-line genius-bar genius-reveal-line">
                {line.text || "—"}
              </p>
            ))}
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
