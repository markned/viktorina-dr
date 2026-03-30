import { useLayoutEffect, useRef } from "react";

const MIN_SCALE = 0.22;
/** Допуск при сравнении высоты с контейнером (округление / субпиксели). */
const LAYOUT_EPSILON_PX = 1;

function clearZoom(inner: HTMLElement) {
  const s = inner.style as CSSStyleDeclaration & { zoom?: string };
  s.zoom = "";
  s.transform = "";
}

function setZoom(inner: HTMLElement, scale: number) {
  (inner.style as CSSStyleDeclaration & { zoom?: string }).zoom = String(scale);
}

/**
 * Масштабирует блок с вопросами/подсказками/вариантами (CSS zoom), чтобы всё помещалось по высоте без скролла.
 * `measureKey` — при смене контента (варианты, строки порядка и т.д.) пересчитываем масштаб.
 */
export function useQuizContentFit(measureKey: unknown) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const outer = containerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const fit = () => {
      clearZoom(inner);
      void inner.offsetHeight;

      const avail = outer.clientHeight;
      if (avail <= 0) return;

      const naturalH = inner.scrollHeight;
      if (naturalH <= 0) return;

      let s = Math.max(MIN_SCALE, Math.min(1, avail / naturalH));
      setZoom(inner, s);
      void inner.offsetHeight;

      const rendered = inner.getBoundingClientRect().height;
      if (rendered > avail + LAYOUT_EPSILON_PX && rendered > 0) {
        s = Math.max(MIN_SCALE, Math.min(s, s * (avail / rendered)));
        setZoom(inner, s);
      }
    };

    const schedule = () => requestAnimationFrame(fit);
    const ro = new ResizeObserver(schedule);
    ro.observe(outer);
    ro.observe(inner);

    void document.fonts?.ready?.then(schedule);
    schedule();
    window.addEventListener("orientationchange", schedule);
    window.addEventListener("resize", schedule);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [measureKey]);

  return { containerRef, innerRef };
}
