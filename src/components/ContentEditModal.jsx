import { useEffect, useState } from "react";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";

/** Jednoduchá úprava nadpisu + textu (hlášení, oznámení úřadu) */
export default function ContentEditModal({
  open,
  onClose,
  title: dialogTitle = "Upravit",
  initialTitle = "",
  initialBody = "",
  titleLabel = "Nadpis",
  bodyLabel = "Text",
  onSave,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle ?? "");
    setBody(initialBody ?? "");
  }, [open, initialTitle, initialBody]);

  if (!open) return null;

  const canSave = title.trim().length >= 2 && body.trim().length >= 3;

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={onClose} />
        </div>
        <div className="pp-app-sheet p-5" role="dialog" aria-label={dialogTitle}>
          <h2 className="text-lg font-bold text-stone-900 mb-3">{dialogTitle}</h2>
          <label className="block mb-3">
            <span className="text-[11px] font-semibold text-stone-600">{titleLabel}</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm"
            />
          </label>
          <label className="block mb-4">
            <span className="text-[11px] font-semibold text-stone-600">{bodyLabel}</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="mt-1 w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-stone-200 rounded-xl"
            >
              Zrušit
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => {
                if (!canSave) return;
                const ok = onSave?.({ title: title.trim(), body: body.trim() });
                if (ok !== false) onClose();
              }}
              className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
              style={{ background: "#1B4332" }}
            >
              Uložit úpravy
            </button>
          </div>
        </div>
      </div>
    </AppPanelPortal>
  );
}
