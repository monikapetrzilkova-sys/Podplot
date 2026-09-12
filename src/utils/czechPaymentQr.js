/** Česká QR platba (SPD 1.0) + generování QR obrázku */

import QRCode from "qrcode";

const ACCOUNT_STORAGE_KEY = "podplot-payment-iban-v1";

/** Odstraní mezery a převede na velká písmena. */
export function normalizeIbanOrAccount(raw) {
  return String(raw ?? "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

/**
 * Převede české číslo účtu (předčíslí-základ/kód banky) na IBAN CZ…
 * Pokud už je IBAN, vrátí ho normalizovaný.
 */
export function toCzechIban(raw) {
  const cleaned = normalizeIbanOrAccount(raw);
  if (!cleaned) return null;
  if (/^CZ\d{22}$/.test(cleaned)) return cleaned;

  const m = cleaned.match(/^(?:(\d{1,6})-)?(\d{2,10})\/(\d{4})$/);
  if (!m) return null;

  const prefix = (m[1] || "").padStart(6, "0");
  const number = m[2].padStart(10, "0");
  const bank = m[3];
  const bban = `${bank}${prefix}${number}`;
  const checkInput = `${bban}123500`; // C=12 Z=35 + "00"
  let rem = 0;
  for (const ch of checkInput) {
    rem = (rem * 10 + Number(ch)) % 97;
  }
  const check = String(98 - rem).padStart(2, "0");
  return `CZ${check}${bban}`;
}

export function formatAmountCzk(value) {
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}

/**
 * Sestaví SPD řetězec pro bankovní aplikace (QR platba).
 * @see https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
 */
export function buildSpdString({
  iban,
  amount,
  currency = "CZK",
  message = "",
  variableSymbol = "",
  recipientName = "",
} = {}) {
  const acc = toCzechIban(iban);
  if (!acc) throw new Error("Zadej platný IBAN nebo číslo účtu (např. 19-2000145399/0800).");
  const am = formatAmountCzk(amount);
  if (!am) throw new Error("Zadej částku větší než 0.");

  const parts = [`SPD*1.0*ACC:${acc}*AM:${am}*CC:${currency}`];
  const msg = String(message || "")
    .replace(/[*\n\r]/g, " ")
    .trim()
    .slice(0, 60);
  if (msg) parts.push(`MSG:${msg}`);
  const vs = String(variableSymbol || "").replace(/\D/g, "").slice(0, 10);
  if (vs) parts.push(`X-VS:${vs}`);
  const rn = String(recipientName || "")
    .replace(/[*\n\r]/g, " ")
    .trim()
    .slice(0, 35);
  if (rn) parts.push(`RN:${rn}`);
  return parts.join("*");
}

export async function spdToQrDataUrl(spd) {
  return QRCode.toDataURL(spd, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: { dark: "#1B4332", light: "#FFFFFF" },
  });
}

export function loadSavedPaymentAccount() {
  try {
    return localStorage.getItem(ACCOUNT_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function savePaymentAccount(account) {
  try {
    const v = String(account || "").trim();
    if (v) localStorage.setItem(ACCOUNT_STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
}

export function formatPaymentSummary({ amount, message }) {
  const am = formatAmountCzk(amount);
  const label = message ? String(message).trim() : "";
  if (am && label) return `QR platba · ${am.replace(".", ",")} Kč · ${label}`;
  if (am) return `QR platba · ${am.replace(".", ",")} Kč`;
  return "QR platba";
}
