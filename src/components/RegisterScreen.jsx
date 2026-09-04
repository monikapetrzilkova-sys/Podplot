import { useState, useMemo, useEffect } from "react";
import PodplotLogo from "./PodplotLogo.jsx";
import VerifiedBadge from "./VerifiedBadge.jsx";
import { ACCOUNT_TYPE_LIST, getAccountType, BUSINESS_SUBTYPES, getRegistrationFields } from "../data/accountTypes.js";
import { verifyEmailDomain, canVerifyAccountType, getVerifiedLabel } from "../data/domainVerification.js";
import {
  validateEmail,
  validateAddressFields,
  formatFullAddress,
  formatPscInput,
  pscDigits,
} from "../data/addressValidation.js";
import StructuredAddressFields from "./StructuredAddressFields.jsx";
import LocalityRadiusPreview from "./LocalityRadiusPreview.jsx";
import { DEFAULT_NEIGHBOR_RADIUS_KM } from "../data/mapRadiusSettings.js";
import { buildMapPickResult } from "../utils/geoCoordinates.js";
import { PUBLIC_AREA_LABEL_HINT } from "../data/personDisplay.js";
import {
  buildServiceSubcategoryList,
} from "../data/serviceCategories.js";
import { useApp } from "../context/AppContext.jsx";
import AccountTypeIcon from "./AccountTypeIcon.jsx";
import { BUSINESS_SUBTYPE_DOODLE_ICONS, DoodleSousedIcon } from "./doodle/doodleIcons.jsx";
import CraftCategoryPicker from "./CraftCategoryPicker.jsx";
import InstitutionAutocomplete from "./InstitutionAutocomplete.jsx";
import {
  verifyWorkEmailForInstitution,
  lookupMunicipalityEmailDomain,
} from "../data/institutions/index.js";
import { MIN_PASSWORD_LENGTH, validatePassword } from "../data/authApi.js";
import { readRegisterIntent, clearRegisterIntent } from "../data/registrationIntent.js";

const AUTH_INPUT =
  "w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30";

function ReqStar() {
  return (
    <span className="text-teal-800" aria-hidden="true">
      {" *"}
    </span>
  );
}

export default function RegisterScreen() {
  const {
    register,
    login,
    requestPasswordReset,
    completePasswordRecovery,
    passwordRecovery,
  } = useApp();
  const [authMode, setAuthMode] = useState("register"); // register | login | forgot
  const [linkNotice, setLinkNotice] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [radiusKm, setRadiusKm] = useState(DEFAULT_NEIGHBOR_RADIUS_KM);
  const [areaPin, setAreaPin] = useState(null);
  const [accountType, setAccountType] = useState("soused");
  const [businessSubtype, setBusinessSubtype] = useState("fyzicka");
  const [serviceHomeGroup, setServiceHomeGroup] = useState("domov-zahrada");
  const [primarySubcategory, setPrimarySubcategory] = useState(null);
  const [secondarySubcategories, setSecondarySubcategories] = useState([]);
  const [customKeywords, setCustomKeywords] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);
  const [allowPublicAreaLabel, setAllowPublicAreaLabel] = useState(false);
  const [publicAreaLabel, setPublicAreaLabel] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [municipalityLookup, setMunicipalityLookup] = useState(null);
  const [municipalityLookupBusy, setMunicipalityLookupBusy] = useState(false);

  const selectedType = getAccountType(accountType);
  const registrationFields = getRegistrationFields(accountType, businessSubtype);
  const isMobilniCraft = accountType === "podnik" && businessSubtype === "mobilni";
  const isUrad = accountType === "urad" || accountType === "instituce";
  const serviceSubcategories = buildServiceSubcategoryList(
    primarySubcategory,
    secondarySubcategories
  );
  const verification = useMemo(
    () => verifyEmailDomain(email, accountType),
    [email, accountType]
  );
  const institutionEmailCheck = useMemo(() => {
    if (!isUrad || !selectedInstitution || !email.includes("@") || !municipalityLookup?.ok) {
      return null;
    }
    return verifyWorkEmailForInstitution(email, selectedInstitution, municipalityLookup.domain);
  }, [isUrad, selectedInstitution, email, municipalityLookup]);

  useEffect(() => {
    const intent = readRegisterIntent();
    if (!intent) return;
    setAuthMode("register");
    setAccountType(intent.accountType);
    if (intent.notice) setLinkNotice(intent.notice);
    clearRegisterIntent();
  }, []);

  useEffect(() => {
    if (!isUrad) {
      setSelectedInstitution(null);
      setMunicipalityLookup(null);
      setMunicipalityLookupBusy(false);
    }
  }, [isUrad]);

  useEffect(() => {
    if (!isUrad || !selectedInstitution) {
      setMunicipalityLookup(null);
      setMunicipalityLookupBusy(false);
      return undefined;
    }
    let cancelled = false;
    setMunicipalityLookupBusy(true);
    setMunicipalityLookup(null);
    lookupMunicipalityEmailDomain(selectedInstitution).then((result) => {
      if (cancelled) return;
      setMunicipalityLookup(result);
      setMunicipalityLookupBusy(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isUrad, selectedInstitution?.id]);

  useEffect(() => {
    if (!selectedInstitution) return;
    if (!name.trim()) setName(selectedInstitution.name);
    if (selectedInstitution.psc) setPsc(formatPscInput(selectedInstitution.psc));
    if (selectedInstitution.seatCity) {
      setCity(selectedInstitution.seatCity);
    }
    if (selectedInstitution.seatAddress) {
      const parts = selectedInstitution.seatAddress.split(",");
      const streetPart = parts[0]?.trim() ?? "";
      const streetMatch = streetPart.match(/^(.*)\s+(\d[\w/-]*)$/);
      if (streetMatch) {
        setStreet(streetMatch[1]);
        setHouseNumber(streetMatch[2]);
      } else if (streetPart) {
        setStreet(streetPart);
      }
    }
  }, [selectedInstitution?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const emailResult = validateEmail(email);
    const addressResult = validateAddressFields({ street, houseNumber, psc, city });
    const pwdCheck = validatePassword(password, passwordConfirm);

    setEmailError(emailResult.valid ? "" : emailResult.error);
    setFieldErrors(addressResult.errors);

    if (!name.trim()) {
      setSubmitError("Vyplň prosím jméno.");
      return;
    }
    if (!emailResult.valid) return;
    if (!pwdCheck.ok) {
      setSubmitError(pwdCheck.error);
      return;
    }
    if (!addressResult.valid) {
      setSubmitError("Zkontroluj adresu — některé údaje chybí nebo nejsou správně.");
      return;
    }

    if (accountType === "podnik" && !businessSubtype) {
      setSubmitError("Vyber formát fungování podniku / služby.");
      return;
    }

    if (accountType === "podnik" && businessSubtype === "mobilni" && !primarySubcategory) {
      setSubmitError("Vyber hlavní zaměření služby.");
      return;
    }

    if (isUrad && !selectedInstitution) {
      setSubmitError("Vyhledej a vyber svůj obecní nebo městský úřad.");
      return;
    }

    if (isUrad && selectedInstitution) {
      if (municipalityLookupBusy || !municipalityLookup?.ok) {
        setSubmitError("Počkej na ověření oficiálního webu obce, nebo vyber úřad znovu.");
        return;
      }
      const check = verifyWorkEmailForInstitution(
        email,
        selectedInstitution,
        municipalityLookup.domain
      );
      if (!check.ok) {
        setSubmitError(
          `Pracovní e-mail musí být na oficiální doméně obce @${municipalityLookup.domain} (dohledáno z webu obce).`
        );
        return;
      }
    }

    const fullAddress = formatFullAddress({ street, houseNumber, psc, city });
    const keywordList = customKeywords
      .split(/[,;]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    setBusy(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        address: fullAddress,
        accountType,
        businessSubtype: accountType === "podnik" ? businessSubtype : null,
        geo: {
          city: city.trim(),
          street: street.trim(),
          houseNumber: houseNumber.trim(),
          psc: pscDigits(psc),
          lat: areaPin?.lat ?? null,
          lng: areaPin?.lng ?? areaPin?.lon ?? null,
        },
        radiusKm,
        allowPublicAreaLabel,
        publicAreaLabel: allowPublicAreaLabel ? publicAreaLabel.trim() : "",
        serviceHomeGroup: isMobilniCraft ? serviceHomeGroup : null,
        serviceSubcategory: isMobilniCraft ? primarySubcategory : null,
        serviceSubcategories: isMobilniCraft ? serviceSubcategories : null,
        primarySubcategory: isMobilniCraft ? primarySubcategory : null,
        serviceKeywords: isMobilniCraft ? keywordList : [],
        institutionId: isUrad ? selectedInstitution?.id ?? null : null,
        institutionRole: isUrad ? "admin" : null,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const emailResult = validateEmail(email);
    setEmailError(emailResult.valid ? "" : emailResult.error);
    if (!emailResult.valid) return;
    if (!password) {
      setSubmitError("Zadej heslo.");
      return;
    }
    setBusy(true);
    try {
      const result = await login({ email: email.trim(), password });
      if (!result?.ok && result?.error) setSubmitError(result.error);
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const emailResult = validateEmail(email);
    setEmailError(emailResult.valid ? "" : emailResult.error);
    if (!emailResult.valid) return;
    setBusy(true);
    try {
      const result = await requestPasswordReset(email.trim());
      if (result?.ok) setAuthMode("login");
      else if (result?.error) setSubmitError(result.error);
    } finally {
      setBusy(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const pwdCheck = validatePassword(password, passwordConfirm);
    if (!pwdCheck.ok) {
      setSubmitError(pwdCheck.error);
      return;
    }
    setBusy(true);
    try {
      const result = await completePasswordRecovery(password, passwordConfirm);
      if (result?.ok) {
        setPassword("");
        setPasswordConfirm("");
        setAuthMode("login");
      } else if (result?.error) setSubmitError(result.error);
    } finally {
      setBusy(false);
    }
  };

  const authShell = (title, subtitle, children) => (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <PodplotLogo size={48} />
          <span className="text-2xl font-bold text-stone-900">Podplot</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-lg font-bold text-stone-900 mb-1">{title}</h1>
          {subtitle ? <p className="text-sm text-stone-500 mb-6">{subtitle}</p> : <div className="mb-6" />}
          {children}
        </div>
      </div>
    </div>
  );

  if (passwordRecovery) {
    return authShell(
      "Nové heslo",
      "Zadej nové heslo pro svůj účet (odkaz z e-mailu).",
      <form onSubmit={handleRecovery} noValidate className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Nové heslo</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Alespoň ${MIN_PASSWORD_LENGTH} znaků`}
            className={AUTH_INPUT}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Potvrzení hesla</label>
          <input
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={AUTH_INPUT}
          />
        </div>
        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{submitError}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3.5 bg-teal-700 text-white font-semibold rounded-2xl hover:bg-teal-800 disabled:opacity-60"
        >
          {busy ? "Ukládám…" : "Uložit heslo"}
        </button>
      </form>
    );
  }

  if (authMode === "login") {
    return authShell(
      "Přihlášení",
      "Vstup do svého sousedství.",
      <>
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">E-mail</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className={AUTH_INPUT}
            />
            {emailError && <p className="mt-1.5 text-xs text-red-600">{emailError}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Heslo</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={AUTH_INPUT}
            />
          </div>
          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{submitError}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-teal-700 text-white font-semibold rounded-2xl hover:bg-teal-800 disabled:opacity-60"
          >
            {busy ? "Přihlašuji…" : "Přihlásit se"}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <button type="button" className="text-teal-800 font-semibold" onClick={() => { setSubmitError(""); setAuthMode("forgot"); }}>
            Zapomenuté heslo
          </button>
          <button type="button" className="text-stone-500" onClick={() => { setSubmitError(""); setAuthMode("register"); }}>
            Nemáš účet? Zaregistruj se
          </button>
        </div>
      </>
    );
  }

  if (authMode === "forgot") {
    return authShell(
      "Zapomenuté heslo",
      "Pošleme ti odkaz pro nastavení nového hesla.",
      <>
        <form onSubmit={handleForgot} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">E-mail účtu</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className={AUTH_INPUT}
            />
            {emailError && <p className="mt-1.5 text-xs text-red-600">{emailError}</p>}
          </div>
          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{submitError}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-teal-700 text-white font-semibold rounded-2xl hover:bg-teal-800 disabled:opacity-60"
          >
            {busy ? "Odesílám…" : "Odeslat odkaz"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <button type="button" className="text-stone-500" onClick={() => { setSubmitError(""); setAuthMode("login"); }}>
            Zpět na přihlášení
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <PodplotLogo size={48} />
          <span className="text-2xl font-bold text-stone-900">Podplot</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-lg font-bold text-stone-900 mb-1">Vytvoř si účet</h1>
          <p className="text-sm text-stone-500 mb-4">Registrace je povinná. Účet zůstane uložený v tomto telefonu i po aktualizaci.</p>
          {linkNotice ? (
            <p className="text-[12px] font-medium text-[#1B4D3E] bg-[#E8F3EF] border border-[#C5DDD4] rounded-xl px-3 py-2 mb-4 leading-snug">
              {linkNotice}
            </p>
          ) : null}
          <p className="text-sm text-stone-500 mb-4">
            Už máš účet?{" "}
            <button type="button" className="text-teal-800 font-semibold" onClick={() => { setSubmitError(""); setAuthMode("login"); }}>
              Přihlas se
            </button>
          </p>
          <p className="text-[11px] text-stone-400 mb-6">
            <span className="text-teal-800">*</span> povinné údaje
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                {registrationFields.nameLabel}
                <ReqStar />
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={registrationFields.namePlaceholder}
                required
                aria-required="true"
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                E-mail
                <ReqStar />
              </label>
              <input
                type="text"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={() => {
                  if (email.trim()) setEmailError(validateEmail(email).error || "");
                }}
                placeholder={canVerifyAccountType(accountType) ? "info@obec.cz" : "vas@email.cz"}
                required
                aria-required="true"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${
                  emailError ? "border-red-300 bg-red-50/50" : "border-stone-200"
                }`}
              />
              {emailError && <p className="mt-1.5 text-xs text-red-600">{emailError}</p>}
              {!emailError && isUrad && selectedInstitution && (
                <div className="mt-2 space-y-1.5">
                  {municipalityLookupBusy ? (
                    <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2 bg-stone-50 text-stone-600 border border-stone-200">
                      Ověřuji oficiální web obce…
                    </div>
                  ) : null}
                  {!municipalityLookupBusy && municipalityLookup?.ok ? (
                    <div className="text-xs rounded-xl px-3 py-2 bg-teal-50 text-teal-900 border border-teal-200 leading-snug">
                      Dohledáno z webu obce
                      {municipalityLookup.website ? (
                        <>
                          {" "}
                          (<span className="font-semibold break-all">{municipalityLookup.website}</span>)
                        </>
                      ) : null}
                      : e-mail musí být @{municipalityLookup.domain}.
                    </div>
                  ) : null}
                  {!municipalityLookupBusy && municipalityLookup && !municipalityLookup.ok ? (
                    <div className="text-xs rounded-xl px-3 py-2 bg-amber-50 text-amber-900 border border-amber-200">
                      Oficiální web obce se nepodařilo ověřit. Zkus jiný úřad v seznamu.
                    </div>
                  ) : null}
                  {institutionEmailCheck && email.includes("@") && validateEmail(email).valid ? (
                    <div
                      className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
                        institutionEmailCheck.ok
                          ? "bg-teal-50 text-teal-800 border border-teal-200"
                          : "bg-amber-50 text-amber-900 border border-amber-200"
                      }`}
                    >
                      {institutionEmailCheck.ok ? (
                        <>
                          <VerifiedBadge accountType={accountType} compact />
                          <span>
                            Doména odpovídá oficiálnímu webu obce — účet úřadu bude ověřen
                            (@{municipalityLookup.domain}).
                          </span>
                        </>
                      ) : (
                        <span>
                          Osobní schránky (Gmail, Seznam…) nestačí. Použij @{municipalityLookup.domain}.
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
              {!emailError && !isUrad && verification.eligible && email.includes("@") && validateEmail(email).valid && (
                <div
                  className={`mt-2 flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
                    verification.isVerified
                      ? "bg-teal-50 text-teal-800 border border-teal-200"
                      : "bg-stone-50 text-stone-500 border border-stone-200"
                  }`}
                >
                  {verification.isVerified ? (
                    <>
                      <VerifiedBadge accountType={accountType} compact />
                      <span>
                        Doména <strong>@{verification.domain}</strong> bude automaticky ověřena
                      </span>
                    </>
                  ) : (
                    <span>
                      Veřejná doména (Gmail, Seznam…) — profil nebude automaticky ověřen.
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Heslo
                <ReqStar />
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Alespoň ${MIN_PASSWORD_LENGTH} znaků`}
                required
                aria-required="true"
                className={AUTH_INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Potvrzení hesla
                <ReqStar />
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                aria-required="true"
                className={AUTH_INPUT}
              />
            </div>

            {isUrad ? (
              <InstitutionAutocomplete
                value={selectedInstitution}
                onChange={setSelectedInstitution}
                required
              />
            ) : null}

            <StructuredAddressFields
              street={street}
              houseNumber={houseNumber}
              psc={psc}
              city={city}
              onStreetChange={setStreet}
              onHouseNumberChange={setHouseNumber}
              onPscChange={setPsc}
              onCityChange={setCity}
              onSuggestionPick={(item) => {
                if (item.lat != null && (item.lon != null || item.lng != null)) {
                  const lat = Number(item.lat);
                  const lng = Number(item.lon ?? item.lng);
                  setAreaPin(buildMapPickResult(lat, lng, { lat, lng }, radiusKm));
                }
              }}
              fieldErrors={fieldErrors}
              onClearError={(key) => setFieldErrors((prev) => ({ ...prev, [key]: "" }))}
              onFieldError={(key, message) => setFieldErrors((prev) => ({ ...prev, [key]: message }))}
              legend={registrationFields.addressLabel}
              required
            />

            <LocalityRadiusPreview
              street={street}
              houseNumber={houseNumber}
              psc={psc}
              city={city}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              pin={areaPin}
              onPinChange={setAreaPin}
            />

            <fieldset className="space-y-3 pt-1 border-t border-stone-100">
              <legend className="text-xs font-semibold text-stone-600 mb-1">Rozlišení u stejného jména (volitelné)</legend>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-stone-200 bg-stone-50/50">
                <input
                  type="checkbox"
                  checked={allowPublicAreaLabel}
                  onChange={(e) => {
                    setAllowPublicAreaLabel(e.target.checked);
                    if (!e.target.checked) setPublicAreaLabel("");
                  }}
                  className="mt-0.5 rounded accent-teal-700"
                />
                <span className="text-xs text-stone-600 leading-relaxed">
                  Souhlasím se zobrazením <strong>obecného popisku</strong> (ulice bez čísla, čtvrť…) u mého jména,
                  pokud v obci žije někdo stejnojmenný. Přesná adresa bydliště se nikdy nezobrazí.
                </span>
              </label>
              {allowPublicAreaLabel && (
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Veřejný popisek oblasti</label>
                  <input
                    type="text"
                    value={publicAreaLabel}
                    onChange={(e) => setPublicAreaLabel(e.target.value)}
                    placeholder="např. ulice, čtvrť"
                    maxLength={48}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">{PUBLIC_AREA_LABEL_HINT}</p>
                </div>
              )}
              {!allowPublicAreaLabel && (
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Bez souhlasu u jmenovců uvidí ostatní jen hrubou vzdálenost (např. „350 m“), ne tvoji adresu.
                </p>
              )}
            </fieldset>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2">
                Typ účtu
                <ReqStar />
              </label>
              <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
                Většina lidí volí Soused — ostatní typy až když máš podnik nebo úřad.
              </p>
              <div className="space-y-2">
                {ACCOUNT_TYPE_LIST.filter((t) => t.id === "soused").map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setAccountType(type.id);
                      setBusinessSubtype("fyzicka");
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-colors ${
                      accountType === type.id
                        ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <span className="text-sm font-semibold text-stone-800 inline-flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#F1F6F5] border border-[#C5DDD4] text-[#3D7A68] inline-flex items-center justify-center shrink-0">
                        <AccountTypeIcon accountType={type.id} className="w-4 h-4" />
                      </span>
                      {type.label}
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#3D7A68] bg-[#E8F3EF] px-1.5 py-0.5 rounded-md">
                        doporučeno
                      </span>
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5">{type.hint}</p>
                  </button>
                ))}
                <details
                  className="rounded-2xl border border-stone-200 open:border-[#C5DDD4] open:bg-[#FAFCFA]"
                  open={accountType !== "soused"}
                >
                  <summary className="cursor-pointer list-none p-3 text-xs font-semibold text-stone-600 flex items-center justify-between">
                    Jiné typy (podnik, úřad…)
                    <span className="text-stone-400 font-normal">rozbalit</span>
                  </summary>
                  <div className="px-2 pb-2 space-y-2">
                    {ACCOUNT_TYPE_LIST.filter((t) => t.id !== "soused").map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setAccountType(type.id);
                          if (type.id !== "podnik") setBusinessSubtype("fyzicka");
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-colors ${
                          accountType === type.id
                            ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <span className="text-sm font-semibold text-stone-800 inline-flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-[#F1F6F5] border border-[#C5DDD4] text-[#3D7A68] inline-flex items-center justify-center shrink-0">
                            <AccountTypeIcon accountType={type.id} className="w-4 h-4" />
                          </span>
                          {type.label}
                        </span>
                        <p className="text-xs text-stone-500 mt-0.5">{type.hint}</p>
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            {accountType === "podnik" && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">
                  Formát fungování
                  <ReqStar />
                </label>
                <div className="space-y-2">
                  {Object.values(BUSINESS_SUBTYPES).map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setBusinessSubtype(sub.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-colors ${
                        businessSubtype === sub.id
                          ? "border-[#3D7A68] bg-[#F1F6F5] ring-1 ring-[#3D7A68]"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <span className="text-sm font-semibold text-stone-800 inline-flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-white border border-[#C5DDD4] text-[#3D7A68] inline-flex items-center justify-center shrink-0">
                          {(() => {
                            const SubIcon = BUSINESS_SUBTYPE_DOODLE_ICONS[sub.id];
                            return SubIcon ? <SubIcon className="w-4 h-4" /> : null;
                          })()}
                        </span>
                        {sub.label}
                      </span>
                      <p className="text-xs text-stone-500 mt-0.5">{sub.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isMobilniCraft && (
              <div className="space-y-3 rounded-2xl border border-[#C5DDD4] bg-[#F7FAF9] p-3">
                <CraftCategoryPicker
                  homeGroup={serviceHomeGroup}
                  onHomeGroupChange={setServiceHomeGroup}
                  primaryId={primarySubcategory}
                  onPrimaryChange={setPrimarySubcategory}
                  secondaryIds={secondarySubcategories}
                  onSecondaryChange={setSecondarySubcategories}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Vlastní klíčová slova (volitelně)
                  </label>
                  <input
                    type="text"
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                    placeholder="např. bojler, sifon, havárie vody"
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3D7A68]/30"
                  />
                  <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                    Oddělujte čárkou (např. bojler, sifon). Pomáhají při párování poptávek.
                  </p>
                </div>
              </div>
            )}

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 bg-teal-700 text-white font-semibold rounded-2xl hover:bg-teal-800 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <DoodleSousedIcon className="w-5 h-5 shrink-0 text-white" />
              {busy ? "Vytvářím účet…" : "Vstoupit do sousedství"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
