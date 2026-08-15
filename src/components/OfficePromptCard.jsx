import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { IconMapPin } from "../data/icons.jsx";

/**
 * Detail podnětu v Agendě úřadu (uvnitř LiveFeedCard):
 * — Napsat zprávu (+ volitelně zveřejnit u hlášení)
 * — V řešení / Vyřešeno (auto zpráva autorovi + stav na mapě)
 * — Neřešíme (povinná zpráva, pryč z agendy)
 */
export default function OfficePromptCard({ prompt }) {
  const { updatePromptStatus, sendOfficePromptReply, declineOfficePrompt } = useApp();
  const authorId = prompt.authorId;
  const authorName = prompt.authorName ?? "Soused";

  const [mode, setMode] = useState(null); // 'reply' | 'decline' | null
  const [text, setText] = useState("");
  const [publish, setPublish] = useState(false);

  const resetCompose = () => {
    setMode(null);
    setText("");
    setPublish(false);
  };

  const submitReply = () => {
    if (sendOfficePromptReply?.(prompt.id, text, { publish })) resetCompose();
  };

  const submitDecline = () => {
    if (declineOfficePrompt?.(prompt.id, text)) resetCompose();
  };

  return (
    <div className="space-y-2">
      <p className="pp-text-body text-sm leading-relaxed">{prompt.body}</p>
      {prompt.callTitle && (
        <p className="text-[11px] text-[#3D7A68] font-medium bg-[#F1F6F5] px-2 py-1 rounded-lg inline-block">
          Výzva: {prompt.callTitle}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
        <span>{authorName}</span>
        <span>{prompt.time}</span>
        {prompt.distance && (
          <span className="flex items-center gap-1">
            <IconMapPin className="w-3.5 h-3.5" />
            {prompt.distance}
          </span>
        )}
        {prompt.fromReportId && (
          <span className="text-[10px] text-[#3D7A68] font-medium">Propojeno s hlášením</span>
        )}
      </div>

      {!mode && (
        <div className="flex flex-wrap gap-2 pt-1">
          {authorId && (
            <button
              type="button"
              onClick={() => setMode("reply")}
              className="px-3 py-1.5 text-xs font-semibold text-[#1B4D3E] bg-[#F1F6F5] rounded-xl border border-[#C5DDD4]"
            >
              Napsat zprávu
            </button>
          )}
          {prompt.status !== "done" && prompt.status !== "declined" && (
            <>
              {prompt.status !== "progress" && (
                <button
                  type="button"
                  onClick={() => updatePromptStatus(prompt.id, "progress")}
                  className="px-3 py-1.5 bg-[#E8F0ED] text-[#1B4D3E] rounded-xl text-xs font-semibold"
                >
                  V řešení
                </button>
              )}
              <button
                type="button"
                onClick={() => updatePromptStatus(prompt.id, "done")}
                className="px-3 py-1.5 bg-[#F1F6F5] text-[#3D7A68] border border-[#C5DDD4] rounded-xl text-xs font-semibold"
              >
                Vyřešeno
              </button>
              <button
                type="button"
                onClick={() => setMode("decline")}
                className="px-3 py-1.5 bg-stone-100 text-stone-600 border border-stone-200 rounded-xl text-xs font-semibold"
              >
                Neřešíme
              </button>
            </>
          )}
        </div>
      )}

      {mode === "reply" && (
        <div className="space-y-2 border-t border-stone-100 pt-3">
          <p className="text-[11px] text-stone-500">
            Zpráva půjde přímo autorovi podnětu ({authorName}).
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Napište odpověď občanovi…"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none"
            autoFocus
          />
          {prompt.fromReportId && (
            <label className="flex items-start gap-2 text-xs text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
                className="mt-0.5 accent-[#3D7A68]"
              />
              <span>
                Zveřejnit u hlášení — text uvidí i ostatní občané na mapě a v seznamu dění
              </span>
            </label>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitReply}
              className="flex-1 py-2 bg-[#3D7A68] text-white rounded-xl text-xs font-semibold"
            >
              Odeslat
            </button>
            <button
              type="button"
              onClick={resetCompose}
              className="px-3 py-2 text-xs font-semibold text-stone-500"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {mode === "decline" && (
        <div className="space-y-2 border-t border-stone-100 pt-3">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Podnět zmizí z aktivní Agendy. Občanovi musíte napsat zprávu (např. proč to obec
            neřeší, nebo na koho se obrátit).
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Např. Děkujeme za podnět — jde o majetek soukromého vlastníka, kontaktujte…"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitDecline}
              className="flex-1 py-2 bg-stone-700 text-white rounded-xl text-xs font-semibold"
            >
              Odeslat a odložit
            </button>
            <button
              type="button"
              onClick={resetCompose}
              className="px-3 py-2 text-xs font-semibold text-stone-500"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
