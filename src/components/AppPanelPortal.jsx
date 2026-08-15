import { createPortal } from "react-dom";

/** Host pro modály uvnitř telefonního rámu (#app-panel-root). */
export function getAppModalHost() {
  if (typeof document === "undefined") return null;
  return document.getElementById("app-modal-root") ?? document.getElementById("app-panel-root");
}

/** Vykreslí děti do #app-modal-root — šířka max. telefon, nad záhlavím i zápatím. */
export default function AppPanelPortal({ children }) {
  const host = getAppModalHost();
  if (!host) return children;
  return createPortal(children, host);
}
