import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import EditedBadge from "./EditedBadge.jsx";
import { DoodleMegaphoneIcon } from "./doodle/doodleIcons.jsx";
import SampleBadge from "./SampleBadge.jsx";
import { isSampleContent } from "../data/sampleContent.js";

export default function AreaNewsWidget() {
  const { areaNews, acknowledgedNewsIds } = useApp();
  const [openId, setOpenId] = useState(null);

  const visible = areaNews.filter(
    (n) => n.type !== "crisis" && !acknowledgedNewsIds.includes(n.id)
  );

  if (visible.length === 0) return null;

  return (
    <section className="px-4 py-3 bg-white border-b border-stone-200 shrink-0">
      <h2 className="text-sm font-semibold text-stone-800 mb-3">Aktuality z okolí</h2>
      <div className="space-y-2">
        {visible.map((item) => {
          const open = openId === item.id;
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-blue-200 bg-blue-50/80 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                className="w-full text-left p-3 flex items-start gap-2"
                aria-expanded={open}
              >
                <span className="shrink-0 text-[#3D7A68]" title="Běžná aktualita" aria-hidden>
                  <DoodleMegaphoneIcon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                    <span>
                      {item.author} · {item.time}
                    </span>
                    <EditedBadge item={item} />
                  </p>
                  <h3 className="text-sm font-semibold text-stone-900 mt-0.5 flex items-center gap-2 flex-wrap">
                    {item.title}
                    {isSampleContent(item) ? <SampleBadge /> : null}
                  </h3>
                  {!open && (
                    <p className="text-[10px] text-blue-700/80 mt-1 font-medium">
                      Zobrazit detail ›
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-stone-500 shrink-0 mt-1">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="px-3 pb-3 pt-0 border-t border-blue-100 animate-[fadeIn_0.15s_ease-out]">
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed whitespace-pre-wrap">
                    {item.body}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
