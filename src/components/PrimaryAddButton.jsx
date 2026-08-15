/** Sjednocené primární tlačítko akce (+ Přidat …) napříč aplikací */

export default function PrimaryAddButton({ label, onClick, className = "", withPlus = true }) {
  const text = withPlus && !label.startsWith("+") ? `+ ${label}` : label;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 w-full py-2 rounded-xl text-xs font-semibold text-white text-center ${className}`}
      style={{ background: "#1B4332" }}
    >
      {text}
    </button>
  );
}
