import { useApp } from "../context/AppContext.jsx";

export default function NotificationsPanel({ open, onClose }) {
  const { notifications, markNotificationRead, unreadCount } = useApp();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Zavřít" />
      <aside className="relative w-full max-w-[320px] bg-white h-full shadow-xl flex flex-col">
        <header className="px-4 py-4 border-b border-stone-200 flex items-center justify-between">
          <h2 className="font-bold text-stone-900">Oznámení {unreadCount > 0 && `(${unreadCount})`}</h2>
          <button type="button" onClick={onClose} className="text-stone-500 text-xl">×</button>
        </header>
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-stone-500">Žádná oznámení.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markNotificationRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-stone-100 hover:bg-stone-50 ${
                  !n.read ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.type === "red" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{n.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-stone-400 mt-1">{n.time}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        <p className="p-3 text-[10px] text-stone-400 text-center border-t border-stone-100">
          Modrý majáček = běžné info · Červený = krizové SOS
        </p>
      </aside>
    </div>
  );
}
