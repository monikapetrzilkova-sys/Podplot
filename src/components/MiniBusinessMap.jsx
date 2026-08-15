export default function MiniBusinessMap({ mapPos, label }) {
  const x = mapPos?.x ?? 50;
  const y = mapPos?.y ?? 50;

  return (
    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-stone-200 bg-gradient-to-br from-emerald-50 via-stone-100 to-teal-100">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-full flex items-center justify-center bg-emerald-600 text-white rounded-full border-2 border-white shadow-lg text-sm"
        style={{ left: `${x}%`, top: `${y}%` }}
        title={label}
      >
        📍
      </div>
      <p className="absolute bottom-2 left-3 right-3 text-[10px] text-stone-600 bg-white/80 rounded-lg px-2 py-1 truncate">
        {label}
      </p>
    </div>
  );
}
