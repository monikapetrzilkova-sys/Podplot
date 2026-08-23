import { useEffect } from "react";

/**
 * Při aktivním hledání posune kotvu (pole) k hornímu okraji visual viewportu,
 * aby výsledky pod polem zůstaly nad mobilní klávesnicí.
 */
export function useKeepSearchAboveKeyboard(anchorRef, active) {
  useEffect(() => {
    if (!active) return undefined;

    const main = () => document.getElementById("app-main-scroll");
    const vv = window.visualViewport;

    const placeNearTop = () => {
      const anchor = anchorRef.current;
      const scrollEl = main();
      if (!anchor || !scrollEl) return;

      const viewportTop = vv ? vv.offsetTop + 6 : 6;
      const rect = anchor.getBoundingClientRect();
      const delta = rect.top - viewportTop;
      if (Math.abs(delta) > 3) {
        scrollEl.scrollBy({ top: delta, behavior: "smooth" });
      }
    };

    const syncInset = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const inset = vv
        ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        : 0;
      const results = anchor.parentElement?.querySelector("[data-catalog-search-results]");
      if (results) {
        results.style.paddingBottom = `${Math.max(24, inset + 16)}px`;
      }
      placeNearTop();
    };

    const t = window.setTimeout(syncInset, 50);
    vv?.addEventListener("resize", syncInset);
    vv?.addEventListener("scroll", syncInset);
    window.addEventListener("focusin", placeNearTop);

    return () => {
      window.clearTimeout(t);
      vv?.removeEventListener("resize", syncInset);
      vv?.removeEventListener("scroll", syncInset);
      window.removeEventListener("focusin", placeNearTop);
      const results = anchorRef.current?.parentElement?.querySelector(
        "[data-catalog-search-results]"
      );
      if (results) results.style.paddingBottom = "";
    };
  }, [active, anchorRef]);
}
