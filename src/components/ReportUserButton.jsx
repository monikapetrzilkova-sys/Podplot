import { useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import AnchoredDropdown from "./AnchoredDropdown.jsx";

const REASONS = [
  { id: "podvod", label: "Podvod" },
  { id: "nevhodne", label: "Nevhodné chování" },
  { id: "spam", label: "Spam" },
];

function IconFlag({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 21V4.5M5 4.5h9.5l-1.2 3.2 1.2 3.3H5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ikona nahlášení — vedle ostatních akcí v liště, ne velké tlačítko. */
export default function ReportUserButton({ targetId, targetName, compact = false }) {
  const { reportUser } = useApp();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center justify-center rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 ${
          compact ? "w-8 h-8" : "w-9 h-9 mt-2"
        }`}
        aria-label={`Nahlásit: ${targetName}`}
        aria-expanded={open}
        title="Nahlásit"
      >
        <IconFlag className="w-4 h-4" />
      </button>

      <AnchoredDropdown open={open} onClose={() => setOpen(false)} anchorRef={btnRef}>
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase text-stone-400 tracking-wide">
          Nahlásit
        </p>
        {REASONS.map((r) => (
          <button
            key={r.id}
            type="button"
            role="menuitem"
            className="block w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-red-50 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              reportUser(targetId, targetName, r.id);
              setOpen(false);
            }}
          >
            {r.label}
          </button>
        ))}
      </AnchoredDropdown>
    </div>
  );
}
