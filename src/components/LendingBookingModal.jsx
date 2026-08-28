import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { PAYMENT_METHODS, calcServiceFee, SERVICE_FEE_PERCENT } from "../data/monetization.js";
import ModalDoodleBackdrop from "./ModalDoodleBackdrop.jsx";
import AppPanelPortal from "./AppPanelPortal.jsx";
import LendingOwnerStatus from "./LendingOwnerStatus.jsx";
import { topicFromLending } from "../data/chatTopics.js";

const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toKey(d) {
  const x = startOfDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return startOfDay(new Date(y, m - 1, d));
}

function formatCs(key) {
  if (!key) return "";
  const d = parseKey(key);
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
}

function daysBetween(startKey, endKey) {
  if (!startKey || !endKey) return 1;
  const a = parseKey(startKey).getTime();
  const b = parseKey(endKey).getTime();
  const diff = Math.round((b - a) / 86400000);
  return Math.max(1, diff + 1);
}

function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString("cs-CZ", { month: "long", year: "numeric" });
}

function buildMonthCells(year, month) {
  const first = new Date(year, month, 1);
  // Monday-first offset
  const mondayOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toKey(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function LendingBookingModal({ open, item, onClose }) {
  const { rentItem, sendMessage, openChat } = useApp();
  const todayKey = toKey(new Date());
  const now = new Date();
  const [step, setStep] = useState("schedule");
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [startKey, setStartKey] = useState(todayKey);
  const [endKey, setEndKey] = useState(todayKey);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("card");
  const [paidReservation, setPaidReservation] = useState(null);

  useEffect(() => {
    if (!open) return;
    const t = toKey(new Date());
    const n = new Date();
    setStep("schedule");
    setStartKey(t);
    setEndKey(t);
    setPickingEnd(false);
    setNote("");
    setMethod("card");
    setPaidReservation(null);
    setViewYear(n.getFullYear());
    setViewMonth(n.getMonth());
  }, [open, item?.id]);

  const days = daysBetween(startKey, endKey);
  const perDay = item?.credits ?? 0;
  const total = perDay * days;
  const { fee, sellerGets } = calcServiceFee(total);
  const ownerId = item?.authorId ?? item?.id;
  const ownerName = item?.author ?? "Majitel";
  const itemLabel = item?.item ?? item?.label ?? item?.title ?? "věc";

  const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);

  if (!open || !item) return null;

  const resetAndClose = () => {
    setStep("schedule");
    setStartKey(todayKey);
    setEndKey(todayKey);
    setPickingEnd(false);
    setNote("");
    setMethod("card");
    setPaidReservation(null);
    onClose();
  };

  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const onPickDay = (key) => {
    if (!key || key < todayKey) return;
    if (!pickingEnd || !startKey || key < startKey) {
      setStartKey(key);
      setEndKey(key);
      setPickingEnd(true);
      return;
    }
    setEndKey(key);
    setPickingEnd(false);
  };

  const inRange = (key) => {
    if (!key || !startKey || !endKey) return false;
    return key >= startKey && key <= endKey;
  };

  const handlePay = () => {
    const ok = rentItem(item, method, {
      startDate: startKey,
      endDate: endKey,
      days,
      note: note.trim(),
    });
    if (!ok) return;

    const summary = [
      `Ahoj, rezervuji si „${itemLabel}“ od ${formatCs(startKey)} do ${formatCs(endKey)} (${days} ${days === 1 ? "den" : days < 5 ? "dny" : "dní"}).`,
      note.trim() || null,
      "Domluvíme ještě předání?",
    ]
      .filter(Boolean)
      .join("\n\n");

    sendMessage(ownerId, ownerName, summary, topicFromLending(item));
    setPaidReservation({ startKey, endKey, days, total });
    setStep("done");
  };

  const openConversation = () => {
    openChat(ownerId, ownerName, topicFromLending(item));
    resetAndClose();
  };

  return (
    <AppPanelPortal>
      <div className="pp-app-sheet-overlay">
        <div className="absolute inset-0 pointer-events-auto">
          <ModalDoodleBackdrop onClose={step === "done" ? resetAndClose : onClose} />
        </div>
        <div className="pp-app-sheet p-5" role="dialog" aria-label="Rezervace půjčení">
          {item.onVacation ? (
            <>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Teď nedostupné</h2>
                  <p className="text-sm text-stone-600 mt-0.5">{itemLabel}</p>
                </div>
                <button type="button" onClick={onClose} className="text-stone-400 text-xl px-1" aria-label="Zavřít">
                  ×
                </button>
              </div>
              <LendingOwnerStatus
                onVacation
                availabilityMessage={item.availabilityMessage}
                className="mb-4"
              />
              <p className="text-xs text-stone-500 mb-4">
                Můžete napsat majiteli a domluvit se na termínu po návratu.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openChat(ownerId, ownerName);
                    resetAndClose();
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#1B4332" }}
                >
                  Napsat majiteli
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-sm border border-stone-200 rounded-xl"
                >
                  Zavřít
                </button>
              </div>
            </>
          ) : null}
          {!item.onVacation && step === "schedule" && (
            <>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Kdy chcete půjčit?</h2>
                  <p className="text-sm text-stone-600 mt-0.5">{itemLabel}</p>
                  <p className="text-xs text-stone-500">{perDay} Kč / den · od {ownerName}</p>
                </div>
                <button type="button" onClick={onClose} className="text-stone-400 text-xl px-1" aria-label="Zavřít">
                  ×
                </button>
              </div>
              <LendingOwnerStatus
                availabilityMessage={item.availabilityMessage}
                className="mb-3"
              />

              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={() => shiftMonth(-1)} className="px-2 py-1 text-sm text-stone-600">
                  ‹
                </button>
                <p className="text-sm font-semibold text-stone-800 capitalize">{monthLabel(viewYear, viewMonth)}</p>
                <button type="button" onClick={() => shiftMonth(1)} className="px-2 py-1 text-sm text-stone-600">
                  ›
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-stone-400 py-1">
                    {d}
                  </div>
                ))}
                {cells.map((key, i) => {
                  if (!key) return <div key={`e-${i}`} />;
                  const disabled = key < todayKey;
                  const selected = inRange(key);
                  const isEdge = key === startKey || key === endKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={disabled}
                      onClick={() => onPickDay(key)}
                      className={`aspect-square rounded-lg text-xs font-medium ${
                        disabled
                          ? "text-stone-300"
                          : isEdge
                            ? "bg-[#1B4D3E] text-white"
                            : selected
                              ? "bg-emerald-100 text-emerald-900"
                              : "text-stone-800 hover:bg-stone-100"
                      }`}
                    >
                      {Number(key.slice(-2))}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-stone-500 mb-3">
                Klepněte na začátek a pak na konec období
                {pickingEnd ? " — teď vyberte poslední den." : "."}
              </p>

              <div className="rounded-xl bg-stone-50 border border-stone-200 px-3 py-2 mb-3 text-sm">
                <p className="text-stone-800">
                  {formatCs(startKey)}
                  {endKey !== startKey ? ` – ${formatCs(endKey)}` : ""}
                  <span className="text-stone-500">
                    {" "}
                    · {days} {days === 1 ? "den" : days < 5 ? "dny" : "dní"}
                  </span>
                </p>
                <p className="font-bold text-emerald-800 mt-0.5">{total} Kč celkem</p>
              </div>

              <label className="block mb-3">
                <span className="text-xs font-semibold text-stone-700">Zpráva majiteli (volitelné)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Např. kdy se hodí předání, adresa, poznámka k použití…"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </label>

              <button
                type="button"
                onClick={() => setStep("pay")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "#1B4332" }}
              >
                Pokračovat k platbě · {total} Kč
              </button>
            </>
          )}

          {!item.onVacation && step === "pay" && (
            <>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Platba rezervace</h2>
                  <p className="text-sm text-stone-600 mt-0.5">{itemLabel}</p>
                  <p className="text-xs text-stone-500">
                    {formatCs(startKey)}
                    {endKey !== startKey ? ` – ${formatCs(endKey)}` : ""} · {days}{" "}
                    {days === 1 ? "den" : days < 5 ? "dny" : "dní"}
                  </p>
                </div>
                <button type="button" onClick={() => setStep("schedule")} className="text-xs text-stone-500 underline">
                  Změnit termín
                </button>
              </div>

              <p className="text-2xl font-bold text-emerald-700 mb-1">{total} Kč</p>
              <p className="text-xs text-stone-500 mb-4 leading-snug">
                {perDay} Kč / den × {days}. Majitel dostane {sellerGets} Kč · poplatek Podplot {fee}{" "}
                Kč ({SERVICE_FEE_PERCENT} %). Po platbě můžete rovnou domluvit detaily ve zprávách.
              </p>

              <div className="space-y-2 mb-4">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`w-full text-left p-3 rounded-2xl border text-sm ${
                      method === m.id
                        ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                        : "border-stone-200"
                    }`}
                  >
                    <span className="font-medium text-stone-900">
                      {m.icon} {m.label}
                    </span>
                    {m.hint && <span className="block text-xs text-stone-500 mt-0.5">{m.hint}</span>}
                  </button>
                ))}
              </div>

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
                  onClick={handlePay}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
                  style={{ background: "#1B4332" }}
                >
                  Zaplatit {total} Kč
                </button>
              </div>
            </>
          )}

          {!item.onVacation && step === "done" && paidReservation && (
            <>
              <h2 className="text-lg font-bold text-stone-900 mb-1">Rezervace hotová</h2>
              <p className="text-sm text-stone-600 mb-3">
                „{itemLabel}“ · {formatCs(paidReservation.startKey)}
                {paidReservation.endKey !== paidReservation.startKey
                  ? ` – ${formatCs(paidReservation.endKey)}`
                  : ""}{" "}
                · {paidReservation.total} Kč
              </p>
              <p className="text-xs text-stone-500 mb-4">
                Majiteli jsme poslali zprávu s termínem. Domluvte si předání a další detaily v konverzaci.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={openConversation}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#1B4332" }}
                >
                  Pokračovat ve zprávách
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full py-2.5 text-sm border border-stone-200 rounded-xl"
                >
                  Hotovo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppPanelPortal>
  );
}
