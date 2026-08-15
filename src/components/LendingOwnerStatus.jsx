/** Stav majitele u nabídky v půjčovně (dovolená / předání). */
export default function LendingOwnerStatus({ onVacation, availabilityMessage, className = "" }) {
  if (!onVacation && !availabilityMessage?.trim()) return null;

  return (
    <div className={`space-y-1 ${className}`}>
      {onVacation && (
        <p className="text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
          Majitel je teď na dovolené — rezervace dočasně není možná.
        </p>
      )}
      {availabilityMessage?.trim() && (
        <p className="text-[11px] text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5">
          <span className="font-semibold text-stone-700">Předání: </span>
          {availabilityMessage.trim()}
        </p>
      )}
    </div>
  );
}
