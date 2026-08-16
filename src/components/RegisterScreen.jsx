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
  lookupCityByPsc,
  ADDRESS_PRIVACY_NOTE_INLINE,
} from "../data/addressValidation.js";
import { PUBLIC_AREA_LABEL_HINT } from "../data/personDisplay.js";
import {
  HOME_SERVICE_SUB_FILTERS,
  getSubcategoriesForHomeGroup,
  formatServiceSubcategoryLabels,
} from "../data/serviceCategories.js";
import { useApp } from "../context/AppContext.jsx";
import AccountTypeIcon from "./AccountTypeIcon.jsx";
import { BUSINESS_SUBTYPE_DOODLE_ICONS } from "./doodle/doodleIcons.jsx";
import InstitutionAutocomplete from "./InstitutionAutocomplete.jsx";
import { verifyWorkEmailForInstitution } from "../data/institutions/index.js";

export default function RegisterScreen() {
  const { register } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [psc, setPsc] = useState("");
  const [city, setCity] = useState("");
  const [cityLoading, setCityLoading] = useState(false);
  const [cityManual, setCityManual] = useState(false);
  const [accountType, setAccountType] = useState("soused");
  const [businessSubtype, setBusinessSubtype] = useState("fyzicka");
  const [serviceHomeGroup, setServiceHomeGroup] = useState("domov-zahrada");
  const [serviceSubcategories, setServiceSubcategories] = useState(["instalater"]);
  const [customKeywords, setCustomKeywords] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [allowPublicAreaLabel, setAllowPublicAreaLabel] = useState(false);
  const [publicAreaLabel, setPublicAreaLabel] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  const selectedType = getAccountType(accountType);
  const registrationFields = getRegistrationFields(accountType, businessSubtype);
  const isMobilniCraft = accountType === "podnik" && businessSubtype === "mobilni";
  const isUrad = accountType === "urad" || accountType === "instituce";
  const craftSubcategories = useMemo(
    () => getSubcategoriesForHomeGroup(serviceHomeGroup),
    [serviceHomeGroup]
  );
  const verification = useMemo(
    () => verifyEmailDomain(email, accountType),
    [email, accountType]
  );
  const institutionEmailCheck = useMemo(() => {
    if (!isUrad || !selectedInstitution || !email.includes("@")) return null;
    return verifyWorkEmailForInstitution(email, selectedInstitution);
  }, [isUrad, selectedInstitution, email]);

  useEffect(() => {
    if (!isUrad) setSelectedInstitution(null);
  }, [isUrad]);

  useEffect(() => {
    if (!selectedInstitution) return;
    if (!name.trim()) setName(selectedInstitution.name);
    if (selectedInstitution.psc) setPsc(formatPscInput(selectedInstitution.psc));
    if (selectedInstitution.seatCity) {
      setCity(selectedInstitution.seatCity);
      setCityManual(true);
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

  useEffect(() => {
    const digits = pscDigits(psc);
    if (digits.length !== 5 || cityManual) return;

    let cancelled = false;
    setCityLoading(true);
    lookupCityByPsc(digits).then((result) => {
      if (cancelled) return;
      if (result?.city) {
        setCity(result.city);
        setFieldErrors((prev) => ({ ...prev, city: "", psc: "" }));
      } else {
        setCity("");
        setFieldErrors((prev) => ({
          ...prev,
          city: "Obec k tomuto PSČ nenašla — doplňte ji ručně níže.",
        }));
      }
      setCityLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [psc, cityManual]);

  const handlePscChange = (value) => {
    setPsc(formatPscInput(value));
    setCityManual(false);
    if (fieldErrors.psc || fieldErrors.city) {
      setFieldErrors((prev) => ({ ...prev, psc: "", city: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const emailResult = validateEmail(email);
    const addressResult = validateAddressFields({ street, houseNumber, psc, city });

    setEmailError(emailResult.valid ? "" : emailResult.error);
    setFieldErrors(addressResult.errors);

    if (!name.trim()) {
      setSubmitError("Vyplňte prosím jméno.");
      return;
    }
    if (!emailResult.valid) return;
    if (!addressResult.valid) {
      setSubmitError("Zkontrolujte adresu — některé údaje chybí nebo nejsou správně.");
      return;
    }

    if (accountType === "podnik" && !businessSubtype) {
      setSubmitError("Vyberte formát fungování podniku / služby.");
      return;
    }

    if (accountType === "podnik" && businessSubtype === "mobilni" && serviceSubcategories.length === 0) {
      setSubmitError("Vyberte alespoň jedno zaměření služby.");
      return;
    }

    if (isUrad && !selectedInstitution) {
      setSubmitError("Vyhledejte a vyberte svůj obecní nebo městský úřad.");
      return;
    }

    if (isUrad && selectedInstitution) {
      const check = verifyWorkEmailForInstitution(email, selectedInstitution);
      if (!check.ok) {
        setSubmitError(
          `Pracovní e-mail musí být na oficiální doméně @${selectedInstitution.allowedEmailDomain}.`
        );
        return;
      }
    }

    const fullAddress = formatFullAddress({ street, houseNumber, psc, city });
    const keywordList = customKeywords
      .split(/[,;]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    await register({
      name: name.trim(),
      email: email.trim(),
      address: fullAddress,
      accountType,
      businessSubtype: accountType === "podnik" ? businessSubtype : null,
      geo: { city: city.trim() },
      allowPublicAreaLabel,
      publicAreaLabel: allowPublicAreaLabel ? publicAreaLabel.trim() : "",
      serviceHomeGroup: isMobilniCraft ? serviceHomeGroup : null,
      serviceSubcategory: isMobilniCraft ? serviceSubcategories[0] : null,
      serviceSubcategories: isMobilniCraft ? serviceSubcategories : null,
      serviceKeywords: isMobilniCraft ? keywordList : [],
      institutionId: isUrad ? selectedInstitution?.id ?? null : null,
      institutionRole: isUrad ? "admin" : null,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <PodplotLogo size={48} />
          <span className="text-2xl font-bold text-stone-900">Podplot</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-lg font-bold text-stone-900 mb-1">Vytvořte si účet</h1>
          <p className="text-sm text-stone-500 mb-6">Otevřená registrace pro testery MVP verze.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">{registrationFields.nameLabel}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={registrationFields.namePlaceholder}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">E-mail</label>
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
                placeholder={canVerifyAccountType(accountType) ? "info@jesenice.cz" : "monika@email.cz"}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${
                  emailError ? "border-red-300 bg-red-50/50" : "border-stone-200"
                }`}
              />
              {emailError && <p className="mt-1.5 text-xs text-red-600">{emailError}</p>}
              {!emailError && isUrad && selectedInstitution && institutionEmailCheck && email.includes("@") && validateEmail(email).valid && (
                <div
                  className={`mt-2 flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
                    institutionEmailCheck.ok
                      ? "bg-teal-50 text-teal-800 border border-teal-200"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  {institutionEmailCheck.ok ? (
                    <>
                      <VerifiedBadge accountType={accountType} compact />
                      <span>
                        Doména odpovídá úřadu — přístup ihned bez ručního schválení
                        (@{selectedInstitution.allowedEmailDomain}).
                      </span>
                    </>
                  ) : (
                    <span>
                      E-mail musí končit @{selectedInstitution.allowedEmailDomain}.
                    </span>
                  )}
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

            {isUrad ? (
              <InstitutionAutocomplete
                value={selectedInstitution}
                onChange={setSelectedInstitution}
              />
            ) : null}

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold text-stone-600 mb-1">{registrationFields.addressLabel}</legend>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Ulice</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    if (fieldErrors.street) setFieldErrors((p) => ({ ...p, street: "" }));
                  }}
                  placeholder="Na Louce"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${
                    fieldErrors.street ? "border-red-300" : "border-stone-200"
                  }`}
                />
                {fieldErrors.street && <p className="mt-1 text-xs text-red-600">{fieldErrors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">Číslo popisné</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={houseNumber}
                    onChange={(e) => {
                      setHouseNumber(e.target.value);
                      if (fieldErrors.houseNumber) setFieldErrors((p) => ({ ...p, houseNumber: "" }));
                    }}
                    placeholder="12"
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${
                      fieldErrors.houseNumber ? "border-red-300" : "border-stone-200"
                    }`}
                  />
                  {fieldErrors.houseNumber && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.houseNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">PSČ</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={psc}
                    onChange={(e) => handlePscChange(e.target.value)}
                    placeholder="142 00"
                    maxLength={6}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${
                      fieldErrors.psc ? "border-red-300" : "border-stone-200"
                    }`}
                  />
                  {fieldErrors.psc && <p className="mt-1 text-xs text-red-600">{fieldErrors.psc}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Obec (dle PSČ)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cityLoading ? "Načítám obec…" : city}
                    onChange={(e) => {
                      setCityManual(true);
                      setCity(e.target.value);
                      if (fieldErrors.city) setFieldErrors((p) => ({ ...p, city: "" }));
                    }}
                    readOnly={cityLoading && !cityManual}
                    placeholder={pscDigits(psc).length === 5 ? "Doplní se automaticky" : "Nejdřív zadejte PSČ"}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30 ${
                      fieldErrors.city ? "border-red-300" : city && !cityManual ? "bg-teal-50/50 border-teal-200" : "border-stone-200"
                    }`}
                  />
                </div>
                {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
                {city && !cityManual && !cityLoading && (
                  <p className="mt-1 text-[11px] text-teal-700">✓ Obec doplněna podle PSČ</p>
                )}
              </div>

              <p className="text-[11px] text-stone-400 leading-relaxed">{ADDRESS_PRIVACY_NOTE_INLINE}</p>
            </fieldset>

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
                    placeholder="např. ulice Lípová, Na Louce"
                    maxLength={48}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-700/30"
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">{PUBLIC_AREA_LABEL_HINT}</p>
                </div>
              )}
              {!allowPublicAreaLabel && (
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Bez souhlasu u jmenovců uvidí ostatní jen hrubou vzdálenost (např. „350 m“), ne vaši adresu.
                </p>
              )}
            </fieldset>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2">Typ účtu</label>
              <div className="space-y-2">
                {ACCOUNT_TYPE_LIST.map((type) => (
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
                        : "border-stone-200 hover:border-stone-300"
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
            </div>

            {accountType === "podnik" && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Formát fungování</label>
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
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Hlavní kategorie služeb
                  </label>
                  <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
                    Můžete zvolit více zaměření (např. elektrikář a truhlář). Podle nich a klíčových
                    slov vám budeme párovat poptávky v dojezdu.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {HOME_SERVICE_SUB_FILTERS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setServiceHomeGroup(g.id)}
                        className={`px-2.5 py-2 rounded-xl border text-xs font-semibold ${
                          serviceHomeGroup === g.id
                            ? "border-[#3D7A68] bg-white text-[#1B4D3E]"
                            : "border-stone-200 bg-white text-stone-600"
                        }`}
                      >
                        {g.shortLabel ?? g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Zaměření (více možností)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {craftSubcategories.map((c) => {
                      const selected = serviceSubcategories.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setServiceSubcategories((prev) => {
                              if (prev.includes(c.id)) {
                                if (prev.length <= 1) return prev;
                                return prev.filter((x) => x !== c.id);
                              }
                              return [...prev, c.id];
                            })
                          }
                          aria-pressed={selected}
                          className={`px-2.5 py-1.5 rounded-full border text-[11px] font-semibold ${
                            selected
                              ? "border-[#3D7A68] bg-[#E8F3EF] text-[#1B4D3E]"
                              : "border-stone-200 bg-white text-stone-600"
                          }`}
                        >
                          {selected ? "✓ " : ""}
                          {c.emoji} {c.label}
                        </button>
                      );
                    })}
                  </div>
                  {serviceSubcategories.length > 0 && (
                    <p className="text-[10px] text-[#3D7A68] mt-1.5">
                      Vybráno: {formatServiceSubcategoryLabels(serviceSubcategories)}
                    </p>
                  )}
                </div>

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
                  <p className="text-[10px] text-stone-400 mt-1">
                    Oddělte čárkou. Pomáhají při párování poptávek.
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
              className="w-full py-3.5 bg-teal-700 text-white font-semibold rounded-2xl hover:bg-teal-800 transition-colors"
            >
              Vstoupit do sousedství 🏘️
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
