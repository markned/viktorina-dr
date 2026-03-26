import { useCallback } from "react";
import type { LyricLine } from "../types";
import { clampHintsAndReveal } from "./editorUtils";

type LyricsLineEditorProps = {
  lyrics: LyricLine[];
  hintLineIds: number[];
  revealLineIds: number[];
  onLyricsChange: (next: {
    lyrics: LyricLine[];
    hintLineIds: number[];
    revealLineIds: number[];
  }) => void;
};

export function LyricsLineEditor({ lyrics, hintLineIds, revealLineIds, onLyricsChange }: LyricsLineEditorProps) {
  const lineCount = lyrics.length;
  const answerLineCount = Math.max(1, revealLineIds.length);
  const lastHint = hintLineIds.length > 0 ? Math.max(...hintLineIds) : null;
  const maxAnswerLines =
    lastHint !== null && lastHint < lineCount ? Math.min(32, lineCount - lastHint) : 1;

  const applyRows = useCallback(
    (rows: string[]) => {
      const nextLyrics = rows.map((text, i) => ({ id: i + 1, text }));
      const n = nextLyrics.length;
      const prevHints = hintLineIds.filter((id) => id >= 1 && id <= n);
      const ac = Math.max(1, revealLineIds.length);
      const { hintLineIds: h, revealLineIds: r } = clampHintsAndReveal(n, prevHints, ac);
      onLyricsChange({ lyrics: nextLyrics, hintLineIds: h, revealLineIds: r });
    },
    [hintLineIds, revealLineIds.length, onLyricsChange],
  );

  const changeLine = useCallback(
    (index: number, text: string) => {
      const rows = lyrics.map((l) => l.text);
      rows[index] = text;
      applyRows(rows);
    },
    [lyrics, applyRows],
  );

  const addLine = useCallback(() => {
    applyRows([...lyrics.map((l) => l.text), ""]);
  }, [lyrics, applyRows]);

  const removeLine = useCallback(
    (index: number) => {
      if (lyrics.length <= 1) return;
      applyRows(lyrics.filter((_, i) => i !== index).map((l) => l.text));
    },
    [lyrics, applyRows],
  );

  const toggleHint = useCallback(
    (lineId: number) => {
      const set = new Set(hintLineIds);
      if (set.has(lineId)) {
        set.delete(lineId);
      } else {
        set.add(lineId);
      }
      const ac = Math.max(1, revealLineIds.length);
      const { hintLineIds: h, revealLineIds: r } = clampHintsAndReveal(lineCount, [...set], ac);
      onLyricsChange({ lyrics, hintLineIds: h, revealLineIds: r });
    },
    [hintLineIds, lineCount, lyrics, revealLineIds.length, onLyricsChange],
  );

  const setAnswerLineCount = useCallback(
    (k: number) => {
      const kk = Math.max(1, Math.min(k, maxAnswerLines));
      const { hintLineIds: h, revealLineIds: r } = clampHintsAndReveal(lineCount, hintLineIds, kk);
      onLyricsChange({ lyrics, hintLineIds: h, revealLineIds: r });
    },
    [hintLineIds, lineCount, lyrics, maxAnswerLines, onLyricsChange],
  );

  const hintSet = new Set(hintLineIds);
  const revealSet = new Set(revealLineIds);
  const missingAnswer =
    hintLineIds.length > 0 &&
    (lastHint === null || lastHint + Math.max(1, revealLineIds.length) > lineCount);

  return (
    <div className="editor-lyrics-block">
      <p className="editor-muted editor-lyrics-legend">
        Каждая строка — отдельная ячейка. Клик по номеру — строка в <strong>подсказки</strong>.{" "}
        <strong>Ответ</strong> — непрерывный блок сразу после последней подсказки.
      </p>
      {missingAnswer ? (
        <p className="editor-lyrics-warn">
          Не хватает строк для ответа — добавьте строку или уменьшите число строк ответа / подсказки.
        </p>
      ) : null}
      <div className="editor-lyrics-answer-tools">
        <label className="editor-answer-count">
          <span>Строк в ответе</span>
          <input
            type="range"
            min={1}
            max={maxAnswerLines}
            value={Math.min(answerLineCount, maxAnswerLines)}
            disabled={hintLineIds.length === 0}
            onChange={(e) => setAnswerLineCount(parseInt(e.target.value, 10))}
          />
          <select
            value={Math.min(answerLineCount, maxAnswerLines)}
            disabled={hintLineIds.length === 0}
            onChange={(e) => setAnswerLineCount(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: maxAnswerLines }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="editor-lyrics-table-wrap">
        <table className="editor-lyrics-table">
          <tbody>
            {lyrics.map((line, i) => {
              const isHint = hintSet.has(line.id);
              const isReveal = revealSet.has(line.id);
              let cls = "editor-line-num-btn";
              if (isHint) cls += " editor-line-num-btn--hint";
              if (isReveal) cls += " editor-line-num-btn--reveal";
              return (
                <tr key={`${line.id}-${i}`}>
                  <td className="editor-lyrics-td-num">
                    <button
                      type="button"
                      className={cls}
                      title={isHint ? "Убрать из подсказок" : "В подсказки"}
                      onClick={() => toggleHint(line.id)}
                    >
                      {line.id}
                    </button>
                  </td>
                  <td className="editor-lyrics-td-text">
                    <input
                      type="text"
                      className="editor-lyrics-line-input"
                      spellCheck={false}
                      value={line.text}
                      onChange={(e) => changeLine(i, e.target.value)}
                      aria-label={`Строка ${line.id}`}
                    />
                  </td>
                  <td className="editor-lyrics-td-del">
                    <button
                      type="button"
                      className="editor-lyrics-row-del"
                      disabled={lyrics.length <= 1}
                      title="Удалить строку"
                      onClick={() => removeLine(i)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className="editor-btn editor-btn--small editor-lyrics-add-row" onClick={addLine}>
        + строка
      </button>
      <div className="editor-lyrics-meta">
        <span>Подсказки: {hintLineIds.length ? hintLineIds.join(", ") : "—"}</span>
        <span>Ответ (строки): {revealLineIds.length ? revealLineIds.join(", ") : "—"}</span>
      </div>
    </div>
  );
}
