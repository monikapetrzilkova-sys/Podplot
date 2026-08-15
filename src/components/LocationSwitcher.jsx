import { useApp } from "../context/AppContext.jsx";
import { USER_LOCATIONS } from "../data/locations.js";
import { LOCATION_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";

export default function LocationSwitcher() {
  const { activeLocationId, setActiveLocation } = useApp();
  const current = USER_LOCATIONS.find((l) => l.id === activeLocationId) ?? USER_LOCATIONS[0];
  const CurrentIcon = LOCATION_DOODLE_ICONS[current.id] ?? LOCATION_DOODLE_ICONS.domov;

  return (
    <div className="pp-location-switcher flex items-center gap-1.5 min-w-0 mt-2">
      <CurrentIcon className="w-4 h-4 shrink-0 text-[#1B4332]" aria-hidden />
      <select
        value={activeLocationId}
        onChange={(e) => setActiveLocation(e.target.value)}
        className="pp-location-label min-w-0 truncate bg-transparent border-none p-0 cursor-pointer focus:outline-none"
        aria-label={`Lokalita: ${current.label} · ${current.shortLabel}`}
      >
        {USER_LOCATIONS.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.label} · {loc.shortLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
