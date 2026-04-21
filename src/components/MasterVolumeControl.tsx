import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { readMasterVolume, setMasterVolume, subscribeMasterVolume } from "../lib/masterVolume";

type VolumeIconLevel = "mute" | "low" | "mid" | "high";

function volumeLevel(value: number): VolumeIconLevel {
  if (value <= 0.02) return "mute";
  if (value < 0.34) return "low";
  if (value < 0.67) return "mid";
  return "high";
}

function VolumeGlyph({ level }: { level: VolumeIconLevel }) {
  const stroke = "currentColor";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (level === "mute") {
    return (
      <svg {...common} aria-hidden>
        <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" opacity={0.9} />
        <path d="m23 9-6 6M17 9l6 6" strokeWidth={2.2} />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" opacity={0.9} />
      {level === "low" ? (
        <path d="M16 9.5c1.5 2 1.5 3.5 0 5.5" opacity={0.85} />
      ) : level === "mid" ? (
        <>
          <path d="M16 9.5c1.5 2 1.5 3.5 0 5.5" opacity={0.85} />
          <path d="M18.5 7c2.5 2.8 2.5 7.2 0 10" opacity={0.65} />
        </>
      ) : (
        <>
          <path d="M16 9.5c1.5 2 1.5 3.5 0 5.5" opacity={0.85} />
          <path d="M18.5 7c2.5 2.8 2.5 7.2 0 10" opacity={0.65} />
          <path d="M21 4.5c3.5 3.8 3.5 11.2 0 15" opacity={0.45} />
        </>
      )}
    </svg>
  );
}

/**
 * Общая громкость (ПК): видна иконка; при наведении выезжает ползунок; клик по иконке — mute.
 */
export function MasterVolumeControl() {
  const [value, setValue] = useState(() => readMasterVolume());
  const level = useMemo(() => volumeLevel(value), [value]);
  const lastNonZeroRef = useRef(1);

  useEffect(() => {
    return subscribeMasterVolume(() => {
      setValue(readMasterVolume());
    });
  }, []);

  useEffect(() => {
    if (value > 0.02) lastNonZeroRef.current = value;
  }, [value]);

  const pct = Math.round(value * 100);
  const muted = value <= 0.02;

  type RangeProps = ComponentPropsWithoutRef<"input"> & {
    orient?: "vertical" | "horizontal";
  };

  const rangeProps: RangeProps = {
    id: "master-volume-slider",
    className: "master-volume-slider",
    type: "range",
    min: 0,
    max: 1,
    step: 0.02,
    orient: "vertical",
    value,
    style: { "--mv-fill-pct": `${value * 100}%` } as CSSProperties,
    onChange: (e) => {
      const v = parseFloat(e.target.value);
      setMasterVolume(Number.isFinite(v) ? v : 1);
    },
    "aria-label": "Громкость",
    "aria-valuemin": 0,
    "aria-valuemax": 1,
    "aria-valuenow": value,
    "aria-valuetext": `${pct}%`,
  };

  function toggleMute(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const v = readMasterVolume();
    if (v <= 0.02) {
      const restore = lastNonZeroRef.current > 0.02 ? lastNonZeroRef.current : 1;
      setMasterVolume(restore);
    } else {
      lastNonZeroRef.current = v;
      setMasterVolume(0);
    }
  }

  return (
    <div className="master-volume-dock">
      <div className="master-volume-inner">
        <div className="master-volume-panel">
          <input {...rangeProps} />
        </div>
        <button
          type="button"
          className="master-volume-icon-btn"
          title={muted ? "Включить звук" : "Выключить звук"}
          aria-label={muted ? "Включить звук" : "Выключить звук"}
          aria-pressed={muted}
          onClick={toggleMute}
        >
          <VolumeGlyph level={level} />
        </button>
      </div>
    </div>
  );
}
