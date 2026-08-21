import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import PillFilterRow from "./PillFilterRow.jsx";

const TYPE_OPTIONS = [
  { id: "hledam", label: "Hledám pomoc" },
  { id: "nabizim", label: "Nabízím pomoc" },
];

export default function CreateHelpModal() {
  const {
    createHelpOpen,
    createHelpPresetType,
    closeCreateHelp,
    addNeighborHelpPost,
  } = useApp();

  const [type, setType] = useState("hledam");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!createHelpOpen) return;
    setType(createHelpPresetType === "nabizim" ? "nabizim" : "hledam");
    setTitle("");
    setBody("");
    setError("");
  }, [createHelpOpen, createHelpPresetType]);

  if (!createHelpOpen) return null;

  const heading = type === "hledam" ? "Hledám pomoc" : "Nabízím pomoc";
  const titlePlaceholder =
    type === "hledam"
      ? "Co potřebujete? — např. Hlídání psa o víkendu"
      : "Co nabízíte? — např. Pomoc se stěhováním";
  const bodyPlaceholder =
    type === "hledam"
      ? "Popište, s čím potřebujete pomoci, kdy a kde…"
      : "Popište, jak můžete pomoci sousedům…";

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Zadejte krátký název.");
      return;
    }
    if (!body.trim()) {
      setError("Doplňte popis.");
      return;
    }
    setError("");
    addNeighborHelpPost({ type, title, body });
    closeCreateHelp();
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={closeCreateHelp} />
        </div>

        <div className="pp-app-sheet flex flex-col overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-stone-200 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-stone-900">{heading}</h2>
              <button
                type="button"
                onClick={closeCreateHelp}
                className="text-stone-400 hover:text-stone-600 text-xl px-2"
                aria-label="Zavřít"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-500">
              Neformální sousedská výpomoc — uvidí ji lidé ve vašem okolí.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-3 min-w-0"
          >
            <div>
              <p className="text-xs font-semibold text-stone-600 mb-1.5">Typ *</p>
              <PillFilterRow options={TYPE_OPTIONS} value={type} onChange={setType} />
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <div>
              <label htmlFor="help-title" className="block text-xs font-semibold text-stone-600 mb-1">
                Název *
              </label>
              <input
                id="help-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titlePlaceholder}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="help-body" className="block text-xs font-semibold text-stone-600 mb-1">
                Popis *
              </label>
              <textarea
                id="help-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={bodyPlaceholder}
                rows={4}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm resize-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-2 pb-1">
              <button
                type="button"
                onClick={closeCreateHelp}
                className="flex-1 py-3 border rounded-2xl text-sm font-semibold"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-semibold"
              >
                Zveřejnit
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppPanelPortal>
  );
}
