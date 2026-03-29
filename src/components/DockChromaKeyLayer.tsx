import { DockChromaKeyVideo } from "./DockChromaKeyVideo";
import { DOCK_UI_CHROMA_VIDEO } from "../helpers/quizConfig";

/** Фиксированный слой под контентом викторины (z-index ниже `.app-overlay`), над фоном */
export function DockChromaKeyLayer() {
  return (
    <div className="dock-chroma-layer" aria-hidden>
      <div className="dock-chroma-layer__inner">
        <DockChromaKeyVideo src={DOCK_UI_CHROMA_VIDEO} />
      </div>
    </div>
  );
}
