import { useState, useEffect } from "react";

import { useApp } from "../context/AppContext.jsx";

import BusinessProfileModal from "./BusinessProfileModal.jsx";
import { PlaceIcon } from "./module/placeIcons.jsx";

const ROTATE_MS = 4000;

export default function SponsoredStrip() {
  const { sponsoredBanners } = useApp();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [paused, setPaused] = useState(false);

  const banners = sponsoredBanners.length > 0 ? sponsoredBanners : [];

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [banners.length, paused]);

  if (banners.length === 0) return null;

  const b = banners[index % banners.length];

  return (
    <>
      <section className="px-4 pt-1.5 pb-0 shrink-0">
        <article
          className="pp-home-card pp-partner-card-compact relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <span className="pp-badge pp-partner-badge">Partner</span>
          <button
            type="button"
            onClick={() => setSelected(b)}
            className="w-full h-full box-border flex items-center gap-2 px-3 pt-8 pb-2 text-left transition-colors hover:bg-[#FAFAFA] rounded-2xl"
          >
            <PlaceIcon place={b} className="w-4 h-4 shrink-0 pp-icon-meta" />
            <span className="flex-1 min-w-0 pp-text-meta line-clamp-1 leading-snug">
              <span className="font-semibold text-stone-900">{b.name}</span>
              {b.tagline ? ` · ${b.tagline}` : ""}
            </span>
            <span className="pp-text-meta shrink-0">{b.distance}</span>
          </button>
        </article>

        {banners.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-1.5">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setIndex(i)}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{
                  background: i === index % banners.length ? "#3D7A68" : "#D8E8E2",
                }}
                aria-label={`Partner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      <BusinessProfileModal business={selected} onClose={() => setSelected(null)} />
    </>
  );
}
