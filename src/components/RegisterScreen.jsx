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
import {
  verifyExistingCzechAddress,
  fieldErrorsFromAddressVerify,
  formatSuggestionAddress,
} from "../data/addressAutocomplete.js";
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
import OfficeByPscPicker from "./OfficeByPscPicker.jsx";
import {
  verifyWorkEmailForInstitution,
  lookupMunicipalityEmailDomain,
} from "../data/institutions/index.js";
import { EMAIL_TAKEN_CODE, EMAIL_TAKEN_MESSAGE, MIN_PASSWORD_LENGTH, validatePassword } from "../data/authApi.js";
import { ENABLE_TEST_PROFILE_ENTRY } from "../data/devConfig.js";
import { readRegisterIntent, clearRegisterIntent } from "../data/registrationIntent.js";
import { lookupCompanyByIco, isValidIco, normalizeIco } from "../data/aresLookup.js";
import { refineLocalityFromPsc } from "../data/czechCityDistricts.js";
import { findOrgMembers } from "../data/orgMembers.js";
import PasswordField from "./PasswordField.jsx";

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
    enterTestProfile,
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
  const [emailTaken, setEmailTaken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [allowPublicAreaLabel, setAllowPublicAreaLabel] = useState(false);
  const [publicAreaLabel, setPublicAreaLabel] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [municipalityLookup, setMunicipalityLookup] = useState(null);
  const [municipalityLookupBusy, setMunicipalityLookupBusy] = useState(false);
  const [regStep, setRegStep] = useState("type");
  const [contactName, setContactName] = useState("");
  const [ico, setIco] = useState("");
  const [icoBusy, setIcoBusy] = useState(false);
  const [icoError, setIcoError] = useState("");
  const [orgPeers, setOrgPeers] = useState([]);
  const [testEntryName, setTestEntryName] = useState("");
  const [aresLocalityLock, setAresLocalityLock] = useState(false);

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
    setRegStep("form");
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
    if (accountType !== "podnik") {
      setIcoError("");
      return undefined;
    }
    const digits = ico.replace(/\D/g, "");
    if (digits.length !== 8) {
      setIcoError("");
      setAresLocalityLock(false);
      return undefined;
    }
    if (!isValidIco(digits)) {
      setIcoError("IČO nemá platný kontrolní součet.");
      return undefined;
    }
    let cancelled = false;
    setIcoBusy(true);
    lookupCompanyByIco(digits).then((result) => {
      if (cancelled) return;
      setIcoBusy(false);
      if (!result.ok) {
        setIcoError(result.error);
        return;
      }
      setIcoError("");
      const company = result.company;
      if (company.name) {
        if (businessSubtype === "mobilni") {
          setContactName(company.name);
          setName((prev) => (prev === company.name ? "" : prev));
        } else {
          setName(company.name);
        }
      }
      if (company.psc) setPsc(formatPscInput(company.psc));
      const locality = refineLocalityFromPsc(
        company.psc,
        company.district || company.city,
        company.suburb
      );
      if (locality) {
        setCity(locality);
        setAresLocalityLock(true);
      }
      if (company.street) setStreet(company.street);
      if (company.houseNumber) setHouseNumber(String(company.houseNumber));
    });
    return () => {
      cancelled = true;
    };
  }, [accountType, businessSubtype, ico]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (isUrad && selectedInstitution?.id) {
        const rows = await findOrgMembers({ institutionId: selectedInstitution.id });
        if (!cancelled) setOrgPeers(rows);
        return;
      }
      if (accountType === "podnik" && businessSubtype !== "mobilni" && ico.replace(/\D/g, "").length === 8) {
        const rows = await findOrgMembers({ businessIco: ico });
        if (!cancelled) setOrgPeers(rows);
        return;
      }
      if (!cancelled) setOrgPeers([]);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isUrad, selectedInstitution?.id, accountType, businessSubtype, ico]);

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

  const switchAuthMode = (mode) => {
    setSubmitError("");
    setEmailTaken(false);
    setAuthMode(mode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setEmailTaken(false);

    const emailResult = validateEmail(email);
    const officeAddress =
      isUrad && selectedInstitution
        ? selectedInstitution.seatAddress ||
          formatFullAddress({
            street: street || selectedInstitution.seatCity || selectedInstitution.name,
            houseNumber: houseNumber || "1",
            psc: selectedInstitution.psc || psc,
            city: selectedInstitution.seatCity || city,
          })
        : null;
    const addressResult = officeAddress
      ? { valid: true, errors: {} }
      : validateAddressFields({ street, houseNumber, psc, city });
    const pwdCheck = validatePassword(password, passwordConfirm);

    setEmailError(emailResult.valid ? "" : emailResult.error);
    setFieldErrors(addressResult.errors);

    if (accountType === "podnik") {
      const digits = ico.replace(/\D/g, "");
      if (!isValidIco(digits)) {
        setSubmitError("Zadej platné IČO — podle něj ověříme podnik v ARES.");
        return;
      }
    }

    if (isUrad || accountType === "podnik") {
      if (!contactName.trim()) {
        setSubmitError(isMobilniCraft ? "Chybí jméno z ARES — zkontroluj IČO." : "Vyplň svoje jméno.");
        return;
      }
    }

    if (!name.trim()) {
      setSubmitError(
        isMobilniCraft
          ? "Doplň krátký název do katalogu služeb."
          : isUrad || accountType === "podnik"
            ? "Chybí název úřadu / podniku."
            : "Vyplň prosím jméno."
      );
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

    if (isMobilniCraft) {
      const existing = await findOrgMembers({ businessIco: ico });
      if (existing.length > 0) {
        setSubmitError("Toto IČO už v Podplotu někdo používá. Mobilní služba patří jen jednomu člověku.");
        return;
      }
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

    const keywordList = customKeywords
      .split(/[,;]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    setBusy(true);
    try {
      let resolvedStreet = street.trim();
      let resolvedHouse = houseNumber.trim();
      let resolvedPsc = psc;
      let resolvedCity = (selectedInstitution?.seatCity || city).trim();
      let resolvedAddress = officeAddress || formatFullAddress({ street, houseNumber, psc, city });
      let resolvedLat = areaPin?.lat ?? null;
      let resolvedLng = areaPin?.lng ?? areaPin?.lon ?? null;

      if (!officeAddress) {
        const verified = await verifyExistingCzechAddress({ street, houseNumber, psc, city });
        if (!verified.ok) {
          setSubmitError(verified.error);
          setFieldErrors((prev) => ({ ...prev, ...fieldErrorsFromAddressVerify(verified) }));
          return;
        }
        const match = verified.match;
        resolvedStreet = match.street || resolvedStreet;
        resolvedHouse = match.houseNumber || resolvedHouse;
        if (match.psc) resolvedPsc = match.psc;
        if (match.city) resolvedCity = match.city;
        resolvedAddress = formatSuggestionAddress(match) || resolvedAddress;
        if (resolvedLat == null && match.lat != null) {
          resolvedLat = Number(match.lat);
          resolvedLng = Number(match.lon ?? match.lng);
        }
      }

      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        address: resolvedAddress,
        accountType,
        businessSubtype: accountType === "podnik" ? businessSubtype : null,
        geo: {
          city: resolvedCity,
          street: resolvedStreet,
          houseNumber: resolvedHouse,
          psc: pscDigits(selectedInstitution?.psc || resolvedPsc),
          lat: resolvedLat,
          lng: resolvedLng,
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
        contactName: isUrad || accountType === "podnik" ? contactName.trim() : "",
        businessIco: accountType === "podnik" ? normalizeIco(ico) : null,
      });
      if (result?.code === EMAIL_TAKEN_CODE) {
        setEmailTaken(true);
        setSubmitError(result.error || EMAIL_TAKEN_MESSAGE);
      } else if (!result?.ok && result?.error) {
        setSubmitError(result.error);
      }
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
        <PasswordField
          id="recovery-password"
          label="Nové heslo"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder={`Alespoň ${MIN_PASSWORD_LENGTH} znaků`}
          showStrength
        />
        <PasswordField
          id="recovery-password-confirm"
          label="Potvrzení hesla"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          autoComplete="new-password"
        />
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
          <PasswordField
            id="login-password"
            label="Heslo"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
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
          <button type="button" className="text-teal-800 font-semibold" onClick={() => switchAuthMode("forgot")}>
            Zapomenuté heslo
          </button>
          <button type="button" className="text-stone-500" onClick={() => switchAuthMode("register")}>
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
          <button type="button" className="text-stone-500" onClick={() => switchAuthMode("login")}>
            Zpět na přihlášení
          </button>
        </div>
      </>
    );
  }

  if (regStep === "type") {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <PodplotLogo size={48} />
            <span className="text-2xl font-bold text-stone-900">Podplot</span>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h1 className="text-lg font-bold text-stone-900 mb-1">Kdo bude účet používat?</h1>
            <p className="text-sm text-stone-500 mb-4">
              Typ zvol hned — podle něj se změní povinné údaje. Už máš účet?{" "}
              <button type="button" className="text-teal-800 font-semibold" onClick={() => switchAuthMode("login")}>
                Přihlaš se
              </button>
            </p>
            <div className="space-y-2">
              {ACCOUNT_TYPE_LIST.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setAccountType(type.id);
                    if (type.id !== "podnik") setBusinessSubtype("fyzicka");
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
                    {type.id === "soused" ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#3D7A68] bg-[#E8F3EF] px-1.5 py-0.5 rounded-md">
                        doporučeno
                      </span>
                    ) : null}
                  </span>
                  <p className="text-xs text-stone-500 mt-0.5">{type.hint}</p>
                </button>
              ))}
            </div>
            {accountType === "podnik" ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-stone-600">Jak podnik funguje?</p>
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
            ) : null}
            <button
              type="button"
              onClick={() => setRegStep("form")}
              className="mt-5 w-full py-3.5 bg-teal-700 text-white font-semibold rounded-2xl hover:bg-teal-800"
            >
              Pokračovat
            </button>
          </div>
        </div>
      </div>
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
          <button
            type="button"
            onClick={() => setRegStep("type")}
            className="text-xs font-semibold text-teal-800 mb-3"
          >
            ← Změnit typ účtu ({selectedType.label})
          </button>
          <h1 className="text-lg font-bold text-stone-900 mb-1">Vytvoř si účet</h1>
          <p className="text-sm text-stone-500 mb-4">
            {isUrad
              ? "Úřad vyberu z katalogu po PSČ. E-mail musí být z oficiálního webu obce. Spravovat ho může víc lidí."
              : isMobilniCraft
                ? "Službu ověříme podle IČO — účet patří jednomu člověku. Do katalogu pak dáš krátký název, třeba Účetnictví."
                : accountType === "podnik"
                ? "Podnik ověříme podle IČO v ARES. Firemní e-mail účet rovnou ověří; osobní e-mail stačí na start, bez odznaku."
                : "Registrace je povinná. Účet zůstane uložený v tomto telefonu i po aktualizaci."}
          </p>
          {linkNotice ? (
            <p className="text-[12px] font-medium text-[#1B4D3E] bg-[#E8F3EF] border border-[#C5DDD4] rounded-xl px-3 py-2 mb-4 leading-snug">
              {linkNotice}
            </p>
          ) : null}
          <p className="text-sm text-stone-500 mb-4">
            Už máš účet?{" "}
            <button type="button" className="text-teal-800 font-semibold" onClick={() => switchAuthMode("login")}>
              Přihlaš se
            </button>
          </p>
          <p className="text-[11px] text-stone-400 mb-6">
            <span className="text-teal-800">*</span> povinné údaje
          </p>

          {ENABLE_TEST_PROFILE_ENTRY ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Jen pro testovací verzi
              </p>
              <p className="text-xs text-amber-900 leading-snug">
                Chceš si jen prohlédnout profil {selectedType.shortLabel.toLowerCase()}? Stačí jméno. Před ostrou
                verzí se to vypne.
              </p>
              <label className="block">
                <span className="text-[11px] font-semibold text-amber-900">Jméno pro test</span>
                <input
                  type="text"
                  value={testEntryName}
                  onChange={(e) => setTestEntryName(e.target.value)}
                  placeholder={
                    isUrad
                      ? "např. Městský úřad Jesenice"
                      : accountType === "podnik"
                        ? registrationFields.namePlaceholder
                        : "Jan Novák"
                  }
                  className="mt-1 w-full px-3 py-2.5 border border-amber-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  enterTestProfile({
                    name: testEntryName,
                    accountType,
                    businessSubtype: accountType === "podnik" ? businessSubtype : null,
                  })
                }
                className="w-full py-2.5 text-sm font-semibold text-amber-950 bg-white border border-amber-300 rounded-xl hover:bg-amber-100"
              >
                Vstoupit bez ověření
              </button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {isUrad ? (
              <OfficeByPscPicker
                psc={psc}
                onPscChange={setPsc}
                value={selectedInstitution}
                onChange={setSelectedInstitution}
                required
              />
            ) : null}

            {isUrad && selectedInstitution ? (
              <div className="space-y-1.5">
                {municipalityLookupBusy ? (
                  <p className="text-xs rounded-xl px-3 py-2 bg-stone-50 text-stone-600 border border-stone-200">
                    Dohledávám oficiální web obce a e-mailovou doménu…
                  </p>
                ) : null}
                {!municipalityLookupBusy && municipalityLookup?.ok ? (
                  <p className="text-xs rounded-xl px-3 py-2 bg-teal-50 text-teal-900 border border-teal-200 leading-snug">
                    Oficiální doména z webu obce
                    {municipalityLookup.website ? (
                      <>
                        {" "}
                        (<span className="font-semibold break-all">{municipalityLookup.website}</span>)
                      </>
                    ) : null}
                    : registrace jen na @{municipalityLookup.domain}.
                  </p>
                ) : null}
                {!municipalityLookupBusy && municipalityLookup && !municipalityLookup.ok ? (
                  <p className="text-xs rounded-xl px-3 py-2 bg-amber-50 text-amber-900 border border-amber-200">
                    Oficiální e-mailovou doménu obce se nepodařilo dohledat. Zkus jiný úřad v seznamu.
                  </p>
                ) : null}
              </div>
            ) : null}

            {accountType === "podnik" ? (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  IČO
                  <ReqStar />
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ico}
                  onChange={(e) => setIco(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="12345678"
                  maxLength={8}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                />
                {icoBusy ? <p className="mt-1.5 text-xs text-stone-500">Ověřuji v ARES…</p> : null}
                {icoError ? <p className="mt-1.5 text-xs text-red-600">{icoError}</p> : null}
                {!icoError && !icoBusy && ico.replace(/\D/g, "").length === 8 && (isMobilniCraft ? contactName : name) ? (
                  <p className="mt-1.5 text-xs text-teal-800">
                    Nalezeno v ARES: {isMobilniCraft ? contactName : name}
                    {city ? ` · ${city}` : ""}
                  </p>
                ) : null}
                <p className="mt-1 text-[10px] text-stone-400 leading-relaxed">
                  {isMobilniCraft
                    ? "IČO je veřejné. Poznáme podle něj konkrétního člověka — tenhle účet spravuje jen on."
                    : "IČO je veřejné. Podle něj poznáme firmu a umožníme, aby stejný podnik spravovalo víc lidí."}
                </p>
              </div>
            ) : null}

            {isUrad || accountType === "podnik" ? (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Tvoje jméno
                  <ReqStar />
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Jan Novák"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                />
                <p className="mt-1 text-[10px] text-stone-400">
                  {isMobilniCraft
                    ? "Doplní se z ARES podle IČO. Můžeš ho ještě upravit, pokud nesedí."
                    : "Sem napiš svoje jméno, ať tě kolegové v týmu poznají."}
                </p>
              </div>
            ) : (
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
            )}

            {accountType === "podnik" ? (
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
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                />
                {isMobilniCraft ? (
                  <p className="mt-1 text-[10px] text-stone-400 leading-relaxed">
                    Jen krátké pojmenování do katalogu služeb — jak tě uvidí sousedé. Třeba Účetnictví, Instalatér
                    nebo Zahrada. Ne celý název z ARES.
                  </p>
                ) : null}
              </div>
            ) : null}

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
                  if (emailTaken) setEmailTaken(false);
                }}
                onBlur={() => {
                  if (email.trim()) setEmailError(validateEmail(email).error || "");
                }}
                placeholder={
                  isUrad && municipalityLookup?.domain
                    ? `podatelna@${municipalityLookup.domain}`
                    : canVerifyAccountType(accountType)
                      ? "info@firma.cz"
                      : "vas@email.cz"
                }
                disabled={isUrad && !municipalityLookup?.ok}
                required
                aria-required="true"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30 disabled:bg-stone-50 disabled:text-stone-400 ${
                  emailError ? "border-red-300 bg-red-50/50" : "border-stone-200"
                }`}
              />
              {isUrad && !municipalityLookup?.ok && !emailError ? (
                <p className="mt-1.5 text-[11px] text-stone-400">
                  Nejdřív vyber úřad — e-mail musí být z jeho oficiální, veřejně dohledatelné domény.
                </p>
              ) : null}
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

            <PasswordField
              id="register-password"
              label={
                <>
                  Heslo
                  <ReqStar />
                </>
              }
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder={`Alespoň ${MIN_PASSWORD_LENGTH} znaků`}
              required
              showStrength
            />
            <PasswordField
              id="register-password-confirm"
              label={
                <>
                  Potvrzení hesla
                  <ReqStar />
                </>
              }
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              autoComplete="new-password"
              required
            />

            {isUrad && selectedInstitution ? (
              <div className="text-xs rounded-xl px-3 py-2.5 bg-stone-50 border border-stone-200 text-stone-600 leading-snug">
                <p className="font-semibold text-stone-800">Sídlo úřadu</p>
                <p className="mt-0.5">{selectedInstitution.seatAddress || selectedInstitution.seatCity}</p>
              </div>
            ) : null}

            {!isUrad ? (
              <>
                <StructuredAddressFields
                  street={street}
                  houseNumber={houseNumber}
                  psc={psc}
                  city={city}
                  localitySource={aresLocalityLock ? "ares" : null}
                  onStreetChange={setStreet}
                  onHouseNumberChange={setHouseNumber}
                  onPscChange={(value) => {
                    setAresLocalityLock(false);
                    setPsc(value);
                  }}
                  onCityChange={(value) => {
                    setAresLocalityLock(false);
                    setCity(value);
                  }}
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
                  laterEditNote
                />
              </>
            ) : null}

            {orgPeers.length > 0 ? (
              <div className="text-xs text-teal-900 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5 leading-snug space-y-1">
                <p className="font-semibold">
                  Tento {isUrad ? "úřad" : "podnik"} už spravuje{" "}
                  {orgPeers.length === 1 ? "1 člověk" : `${orgPeers.length} lidí`}.
                </p>
                <p>
                  {orgPeers
                    .map((peer) => peer.contact_name || peer.name)
                    .filter(Boolean)
                    .slice(0, 6)
                    .join(", ")}
                  . Připojíš se jako další správce — uvidíte se navzájem ve správě týmu.
                </p>
              </div>
            ) : isUrad || (accountType === "podnik" && !isMobilniCraft) ? (
              <p className="text-[11px] text-stone-400 leading-relaxed">
                {isUrad
                  ? "Účet může spravovat více lidí. Kolega si vytvoří vlastní účet pod svým pracovním e-mailem obce."
                  : "Účet může spravovat více lidí. Kolega si vytvoří vlastní účet se stejným IČO."}
              </p>
            ) : null}

            {accountType === "soused" ? (
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
            ) : null}

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

            {emailTaken ? (
              <div className="text-sm text-amber-950 bg-amber-50 border border-amber-200 rounded-xl px-3 py-3 space-y-3">
                <p className="leading-snug">{submitError || EMAIL_TAKEN_MESSAGE}</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => switchAuthMode("login")}
                    className="w-full py-2.5 bg-teal-700 text-white font-semibold rounded-xl hover:bg-teal-800"
                  >
                    Přihlásit se
                  </button>
                  <button
                    type="button"
                    onClick={() => switchAuthMode("forgot")}
                    className="w-full py-2.5 bg-white text-teal-800 font-semibold rounded-xl border border-teal-200 hover:bg-teal-50"
                  >
                    Poslat odkaz na nové heslo
                  </button>
                </div>
              </div>
            ) : submitError ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {submitError}
              </p>
            ) : null}

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
