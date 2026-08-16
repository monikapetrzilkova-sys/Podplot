import { useCallback, useEffect, useRef, useState } from "react";

const THRESHOLD = 72;
const MAX_PULL = 120;

/**
 * Potažení dolů nahoře ve feedu → obnovení aplikace.
 * Nahrazuje systémové pull-to-refresh, které blokuje overscroll-behavior / vnitřní scroll.
 */
export default function usePullToRefresh(scrollRef, { enabled = true, onRefresh } = {}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const armed = useRef(false);

  const doRefresh = useCallback(async () => {
    setRefreshing(true);
    setPull(THRESHOLD);
    try {
      if (onRefresh) await onRefresh();
      else window.location.reload();
    } catch {
      setRefreshing(false);
      setPull(0);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return undefined;
    const el = scrollRef?.current;
    if (!el) return undefined;

    const onTouchStart = (e) => {
      if (refreshing) return;
      if (e.touches.length !== 1) return;
      if (el.scrollTop > 2) {
        armed.current = false;
        return;
      }
      startY.current = e.touches[0].clientY;
      armed.current = true;
      pulling.current = false;
    };

    const onTouchMove = (e) => {
      if (!armed.current || refreshing) return;
      if (e.touches.length !== 1) return;
      if (el.scrollTop > 2) {
        armed.current = false;
        pulling.current = false;
        setPull(0);
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 8) {
        if (pulling.current) {
          pulling.current = false;
          setPull(0);
        }
        return;
      }
      pulling.current = true;
      // Zabránit „gumě“ prohlížeče / konfliktu se scrollem
      if (e.cancelable) e.preventDefault();
      const dampened = Math.min(MAX_PULL, dy * 0.55);
      setPull(dampened);
    };

    const onTouchEnd = () => {
      if (!armed.current) return;
      armed.current = false;
      if (!pulling.current) {
        setPull(0);
        return;
      }
      pulling.current = false;
      setPull((current) => {
        if (current >= THRESHOLD) {
          queueMicrotask(() => doRefresh());
          return THRESHOLD;
        }
        return 0;
      });
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [scrollRef, enabled, refreshing, doRefresh]);

  return { pull, refreshing, threshold: THRESHOLD };
}

export function PullToRefreshIndicator({ pull, refreshing, threshold = THRESHOLD }) {
  if (pull <= 0 && !refreshing) return null;
  const ready = pull >= threshold || refreshing;
  return (
    <div
      className="pointer-events-none flex items-center justify-center text-[#3D7A68] transition-[height] duration-150 ease-out overflow-hidden"
      style={{ height: refreshing ? 48 : Math.max(0, pull) }}
      aria-live="polite"
      aria-busy={refreshing}
    >
      <span className="text-[11px] font-semibold tracking-wide">
        {refreshing ? "Obnovuji…" : ready ? "Pusťte pro obnovení" : "Potažením obnovíte"}
      </span>
    </div>
  );
}
