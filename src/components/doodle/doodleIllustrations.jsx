import { doodleStroke, DOODLE_OLIVE } from "./doodleStroke.js";

const s = doodleStroke;

/**
 * Čitelné sluníčko i vedle vyhledávání: kotouč + 8 delších paprsků.
 * currentColor — olivová byla na světlém pozadí moc bledá.
 * Bez obličeje — oči a úsměv v malém rozměru slunce rozmazávají.
 */
function DoodleSun({ cx, cy, r = 7 }) {
  const ray = r * 1.05;
  const gap = r + 1.7;
  const dRay = ray * 0.72;
  const dGap = gap * 0.72;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        {...s}
        strokeWidth={1.7}
        fill="currentColor"
        fillOpacity={0.16}
      />
      <path
        {...s}
        strokeWidth={1.65}
        d={`M${cx} ${cy - gap}v${-ray}M${cx} ${cy + gap}v${ray}M${cx + gap} ${cy}h${ray}M${cx - gap} ${cy}h${-ray}M${cx + dGap} ${cy - dGap}l${dRay} ${-dRay}M${cx - dGap} ${cy + dGap}l${-dRay} ${dRay}M${cx + dGap} ${cy + dGap}l${dRay} ${dRay}M${cx - dGap} ${cy - dGap}l${-dRay} ${-dRay}`}
      />
    </g>
  );
}

/** Jemná silueta domků a stromů pro záhlaví */
export function DoodleHeaderLandscape({ className = "w-20 h-8" }) {
  return (
    <svg
      viewBox="0 0 80 32"
      fill="none"
      className={`pp-doodle-landscape ${className}`}
      aria-hidden
    >
      <path
        {...s}
        stroke={DOODLE_OLIVE}
        strokeWidth={1.5}
        d="M2 26c8-4 14-3 20 0s14 4 22 1 18-2 24 2"
        opacity={0.7}
      />
      <path {...s} stroke={DOODLE_OLIVE} strokeWidth={1.5} d="M12 24V16l5-4 5 4v8" opacity={0.85} />
      <path {...s} stroke={DOODLE_OLIVE} strokeWidth={1.5} d="M14 24h6" opacity={0.85} />
      <path {...s} stroke={DOODLE_OLIVE} strokeWidth={1.5} d="M38 24V14l6-5 6 5v10" opacity={0.75} />
      <path {...s} stroke={DOODLE_OLIVE} strokeWidth={1.5} d="M58 24V18c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5v6" opacity={0.65} />
      <circle cx="58" cy="13" r="3.5" {...s} stroke={DOODLE_OLIVE} strokeWidth={1.5} opacity={0.55} />
      <path {...s} stroke={DOODLE_OLIVE} strokeWidth={1.5} d="M58 16.5V24" opacity={0.55} />
    </svg>
  );
}

/** Dva panáčci — úvod sekce Sousedé */
export function DoodleNeighborsIntro({ className = "w-28 h-14" }) {
  return (
    <svg viewBox="0 0 112 56" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      {/* Panáček vlevo — zvednutá ruka od ramene šikmo ven, mimo hlavu */}
      <circle cx="28" cy="14" r="6" {...s} />
      <path {...s} d="M28 20v14M28 26l-8 6M34 22l12-14" />
      <path {...s} d="M28 34l-5 10M28 34l5 10" />
      {/* Panáček vpravo */}
      <circle cx="72" cy="16" r="5.5" {...s} />
      <path {...s} d="M72 21.5v12M72 27l-7 5M72 27l7 4" />
      <path {...s} d="M72 33.5l-4.5 9M72 33.5l4.5 9" />
      {/* Bublina */}
      <path
        {...s}
        stroke={DOODLE_OLIVE}
        d="M48 8c3-2 8-1.5 10 2s-1 7-5 7.5c-1.5.2-2.5 1.5-2.5 1.5l-2.5-1.5s-3-.5-4-3 1.5-6.5 4-6.5z"
        opacity={0.75}
      />
      <path {...s} stroke={DOODLE_OLIVE} d="M52 13h6M52 16h4" strokeWidth={1.25} opacity={0.6} />
    </svg>
  );
}

/** Panáček s nástrojem — úvod Katalog */
export function DoodleCatalogIntro({ className = "w-28 h-14" }) {
  return (
    <svg viewBox="0 0 112 56" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <path {...s} d="M18 38V26l6-5 6 5v12" opacity={0.75} />
      <path {...s} d="M22 38h4" opacity={0.75} />
      <path {...s} stroke={DOODLE_OLIVE} d="M14 40c6-2 12-1 18 1" strokeWidth={1.5} opacity={0.55} />
      <circle cx="62" cy="16" r="6" {...s} />
      <path {...s} d="M62 22v16M62 28l-9 6M62 28l7 5" />
      <path {...s} d="M62 38l-5 10M62 38l5 10" />
      <path {...s} d="M74 30l8-4M74 30l-2 8M82 26v8" stroke={DOODLE_OLIVE} opacity={0.8} />
      <path {...s} stroke={DOODLE_OLIVE} d="M76 34h4" strokeWidth={1.25} opacity={0.55} />
    </svg>
  );
}

/**
 * Služby / katalog — decentní scéna dole na úvodní obrazovce.
 * Provozovna, řemeslník a nápis „otevřeno“.
 */
export function DoodleSluzbyScene({ className = "w-full max-w-[240px] h-auto" }) {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      className={`pp-doodle-characters text-[#3D7A68] ${className}`}
      aria-hidden
    >
      <path
        {...s}
        stroke={DOODLE_OLIVE}
        strokeWidth={1.5}
        d="M10 102c22-6 44-4 66 2 24 6 42 4 62-2 22-6 42-4 62 4 12 5 22 3 30 0"
        opacity={0.6}
      />

      {/* Provozovna */}
      <path {...s} d="M28 96V48l36-16 36 16v48" />
      <path {...s} d="M52 96V72h24v24" />
      <path {...s} stroke={DOODLE_OLIVE} d="M44 58h16M44 66h12" strokeWidth={1.35} opacity={0.5} />
      <path {...s} stroke={DOODLE_OLIVE} d="M58 42h28" strokeWidth={1.4} opacity={0.55} />
      <path
        {...s}
        stroke={DOODLE_OLIVE}
        d="M62 34c2-1.5 8-1.5 10 1.2s-1 5-4.2 5.4c-1 .15-1.8 1-1.8 1l-1.8-1s-2.4-.4-3.2-2.4 1.2-4.5 3-4.2z"
        opacity={0.7}
      />

      {/* Řemeslník */}
      <circle cx="156" cy="52" r="7" {...s} />
      <path {...s} d="M156 59v22M156 68l-9 7M156 68l8 5" />
      <path {...s} d="M156 81l-5 14M156 81l5 14" />
      <path {...s} d="M164 66l12-6M164 66l-1 10M176 60v10" stroke={DOODLE_OLIVE} opacity={0.85} />
      <path {...s} stroke={DOODLE_OLIVE} d="M168 72h5" strokeWidth={1.25} opacity={0.55} />

      {/* Malý vozík / balík */}
      <path {...s} d="M188 88h22v8H188z" opacity={0.75} />
      <circle cx="194" cy="98" r="3" {...s} opacity={0.7} />
      <circle cx="206" cy="98" r="3" {...s} opacity={0.7} />
      <path {...s} stroke={DOODLE_OLIVE} d="M192 82h14v6H192z" opacity={0.55} />
    </svg>
  );
}

/** Mapa se špendlíkem — úvod Mapa */
export function DoodleMapIntro({ className = "w-28 h-14" }) {
  return (
    <svg viewBox="0 0 112 56" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <path
        {...s}
        d="M20 14c0-2 1.5-3.5 3.5-3.5h28c2 0 3.5 1.5 3.5 3.5v28c0 2-1.5 3.5-3.5 3.5h-28c-2 0-3.5-1.5-3.5-3.5V14z"
        opacity={0.85}
      />
      <path {...s} d="M20 22h35M28 30h8M28 36h14" opacity={0.55} />
      <path
        {...s}
        d="M58 12c-2.5 0-4.5 2-4.5 4.5 0 3.5 4.5 8 4.5 8s4.5-4.5 4.5-8c0-2.5-2-4.5-4.5-4.5z"
        stroke={DOODLE_OLIVE}
      />
      <circle cx="58" cy="16.5" r="1.8" {...s} stroke={DOODLE_OLIVE} opacity={0.7} />
      <circle cx="82" cy="20" r="5" {...s} />
      <path {...s} d="M82 25v12M82 30l-5 4M82 30l5 3" />
      <path {...s} d="M82 37l-4 8M82 37l4 8" />
    </svg>
  );
}

/** Domeček a sluníčko — úvod Domů */
export function DoodleHomeIntro({ className = "w-28 h-14" }) {
  return (
    <svg viewBox="0 0 112 56" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <DoodleSun cx={94} cy={20} r={7.6} />
      <path {...s} d="M18 40V26l12-9 12 9v14" />
      <path {...s} d="M26 40v-8h8v8" />
      <path {...s} stroke={DOODLE_OLIVE} d="M10 42c10-3 20-2 28 2" strokeWidth={1.5} opacity={0.55} />
      <circle cx="56" cy="24" r="5" {...s} />
      <path {...s} d="M56 29v11M56 33l-7 6M62 31l12-16" />
      <path {...s} d="M56 40l-4 9M56 40l4 9" />
    </svg>
  );
}

/** Kalendář a panáčci — úvod stránky Akce */
export function DoodleEventsIntro({ className = "w-36 h-14" }) {
  return (
    <svg viewBox="0 0 144 56" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <path
        {...s}
        d="M18 16c.2-2 1.6-3.5 3.5-3.5h28c1.9 0 3.3 1.5 3.5 3.5v28c-.2 2-1.6 3.5-3.5 3.5h-28c-1.9 0-3.3-1.5-3.5-3.5V16z"
      />
      <path {...s} d="M17.5 24h35" />
      <path {...s} d="M28 12v7M38 12v7" />
      <circle cx="29" cy="34" r="2.2" fill="currentColor" stroke="none" opacity={0.45} />
      <circle cx="38" cy="34" r="2.2" fill="currentColor" stroke="none" opacity={0.45} />
      <circle cx="47" cy="34" r="2.2" fill="currentColor" stroke="none" opacity={0.35} />
      <circle cx="29" cy="42" r="2.2" fill="currentColor" stroke="none" opacity={0.35} />
      <circle cx="38" cy="42" r="2.2" {...s} stroke={DOODLE_OLIVE} opacity={0.8} />

      <circle cx="78" cy="16" r="5.5" {...s} />
      <path {...s} d="M78 21.5v12M78 27l7 4M72 23l-12-14" />
      <path {...s} d="M78 33.5l-4.5 10M78 33.5l4.5 10" />

      <circle cx="104" cy="18" r="5" {...s} />
      <path {...s} d="M104 23v11M104 28l-6 4M104 28l6 3.5" />
      <path {...s} d="M104 34l-4 9M104 34l4 9" />

      <path
        {...s}
        stroke={DOODLE_OLIVE}
        d="M120 14c2.5-1.5 6-1 7.5 1.5s0 5.5-3 6c-1 .2-1.8 1.2-1.8 1.2l-1.8-1.2s-2.2-.4-3-2.2 1-5.3 3.1-5.3z"
        opacity={0.8}
      />
      <path {...s} stroke={DOODLE_OLIVE} d="M122 18h4" strokeWidth={1.25} opacity={0.55} />
      <path {...s} stroke={DOODLE_OLIVE} d="M68 48c12-3 24-2 36 2" strokeWidth={1.5} opacity={0.5} />
    </svg>
  );
}

/** Prázdný stav — panáčci si povídají */
export function DoodleEmptyChat({ className = "w-24 h-20" }) {
  return (
    <svg viewBox="0 0 96 80" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <circle cx="30" cy="22" r="7" {...s} />
      <path {...s} d="M30 29v18M30 36l-9 7M30 36l8 5" />
      <path {...s} d="M30 47l-6 12M30 47l6 12" />
      <circle cx="66" cy="26" r="6" {...s} />
      <path {...s} d="M66 32v16M66 38l-7 6M66 38l7 4" />
      <path {...s} d="M66 48l-5 10M66 48l5 10" />
      <ellipse cx="48" cy="14" rx="14" ry="8" {...s} stroke={DOODLE_OLIVE} opacity={0.7} />
      <path {...s} stroke={DOODLE_OLIVE} d="M42 14h12" strokeWidth={1.25} opacity={0.55} />
    </svg>
  );
}

/** Prázdný stav — pomocné ruce */
export function DoodleEmptyHands({ className = "w-24 h-20" }) {
  return (
    <svg viewBox="0 0 96 80" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <path {...s} d="M20 50c4-8 12-14 22-14s18 6 22 14" />
      <path {...s} d="M32 36l-8-6M32 36l2-10M40 34l4-12" />
      <path {...s} d="M64 36l8-6M64 36l-2-10M56 34l-4-12" />
      <circle cx="48" cy="28" r="8" {...s} />
      <path {...s} d="M48 36v10M48 42l-6 8M48 42l6 8" />
      <path {...s} stroke={DOODLE_OLIVE} d="M38 58h20" strokeWidth={1.5} opacity={0.5} />
    </svg>
  );
}

/** Prázdný stav — skupina panáčků */
export function DoodleEmptyGroup({ className = "w-24 h-20" }) {
  return (
    <svg viewBox="0 0 96 80" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <circle cx="48" cy="20" r="6" {...s} />
      <circle cx="28" cy="28" r="5" {...s} opacity={0.85} />
      <circle cx="68" cy="28" r="5" {...s} opacity={0.85} />
      <path {...s} d="M48 26v14M48 32l-8 6M48 32l8 6" />
      <path {...s} d="M28 33v12M68 33v12" opacity={0.85} />
      <path {...s} stroke={DOODLE_OLIVE} d="M20 58c8-4 16-4 24 0s16 4 24 0" strokeWidth={1.5} opacity={0.55} />
    </svg>
  );
}

/** Prázdný stav — prázdná krabice / bazar */
export function DoodleEmptyBox({ className = "w-24 h-20" }) {
  return (
    <svg viewBox="0 0 96 80" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <path {...s} d="M24 32l24-12 24 12v28l-24 12-24-12V32z" />
      <path {...s} d="M48 20v52M24 32l24 12 24-12" opacity={0.65} />
      <circle cx="48" cy="14" r="5" {...s} stroke={DOODLE_OLIVE} opacity={0.7} />
      <path {...s} stroke={DOODLE_OLIVE} d="M48 19v5M45 24h6" strokeWidth={1.25} opacity={0.55} />
    </svg>
  );
}

/** Prázdný stav — kalendář */
export function DoodleEmptyCalendar({ className = "w-24 h-20" }) {
  return (
    <svg viewBox="0 0 96 80" fill="none" className={`pp-doodle-characters ${className}`} aria-hidden>
      <path {...s} d="M28 24c.2-2 1.8-3.5 3.8-3.5h32c2 0 3.6 1.5 3.8 3.5v36c-.2 2-1.8 3.5-3.8 3.5h-32c-2 0-3.6-1.5-3.8-3.5V24z" />
      <path {...s} d="M27 34h42" />
      <path {...s} d="M38 20v6M58 20v6" />
      <circle cx="48" cy="52" r="6" {...s} stroke={DOODLE_OLIVE} opacity={0.65} />
      <path {...s} stroke={DOODLE_OLIVE} d="M45 52h6" strokeWidth={1.25} opacity={0.5} />
    </svg>
  );
}

/**
 * Sousedství u plotu — dva domky, plot uprostřed, sousedi si povídají.
 * Pro Příběh Podplotu (větší scéna).
 */
export function DoodleSousedstviScene({ className = "w-full max-w-[280px] h-auto" }) {
  return (
    <svg
      viewBox="0 0 280 140"
      fill="none"
      className={`pp-doodle-characters text-[#3D7A68] ${className}`}
      aria-hidden
    >
      {/* Terén */}
      <path
        {...s}
        stroke={DOODLE_OLIVE}
        strokeWidth={1.5}
        d="M8 118c28-8 52-6 78 2 26 8 48 6 72-2 24-8 48-6 74 4 18 7 32 4 40 0"
        opacity={0.65}
      />

      {/* Domek vlevo */}
      <path {...s} d="M28 96V62l28-22 28 22v34" />
      <path {...s} d="M48 96V78h16v18" />
      <path {...s} d="M62 58l18-8" opacity={0.55} />
      <path {...s} stroke={DOODLE_OLIVE} d="M36 72h10M36 80h8" strokeWidth={1.4} opacity={0.5} />

      {/* Domek vpravo */}
      <path {...s} d="M196 96V66l26-20 26 20v30" />
      <path {...s} d="M214 96V80h14v16" />
      <path {...s} stroke={DOODLE_OLIVE} d="M228 74h10M228 82h8" strokeWidth={1.4} opacity={0.5} />

      {/* Plot uprostřed — laťky se špičkami a dvě příčky */}
      <path
        {...s}
        d="M116 98V66M112.8 68L116 58L119.2 68M124 98V64M120.8 66L124 56L127.2 66M132 98V62M128.8 64L132 54L135.2 64M140 98V60M136.8 62L140 52L143.2 62M148 98V62M144.8 64L148 54L151.2 64M156 98V64M152.8 66L156 56L159.2 66M164 98V66M160.8 68L164 58L167.2 68"
      />
      <path {...s} d="M112 72h56M112 86h56" />

      {/* Soused vlevo u plotu */}
      <circle cx="98" cy="72" r="7" {...s} />
      <path {...s} d="M98 79v18M98 86l-8 6M98 86l7 3" />
      <path {...s} d="M98 97l-5 12M98 97l5 12" />
      <path {...s} d="M105 86l11 0" />

      {/* Soused vpravo u plotu */}
      <circle cx="178" cy="74" r="6.5" {...s} />
      <path {...s} d="M178 80.5v16M178 87l-7 5M178 87l8 4" />
      <path {...s} d="M178 96.5l-4.5 12M178 96.5l5 12" />
      <path {...s} d="M171 87l-11 0" />

      {/* Bublina nad plotem, ne přes laťky */}
      <path
        {...s}
        stroke={DOODLE_OLIVE}
        d="M128 26c5-3.5 14-3 17.5 2.5s-1 11-7 12c-2 .3-3.5 2-3.5 2l-3.5-2s-5-.8-6.5-4.5 2.5-10 5.5-10z"
        opacity={0.8}
      />
      <path {...s} stroke={DOODLE_OLIVE} d="M132 32h10M132 37h7" strokeWidth={1.3} opacity={0.55} />

      {/* Strom vpravo — koruna ze tří bublin a kmen */}
      <circle cx="254" cy="68" r="11" {...s} />
      <circle cx="243" cy="76" r="7.5" {...s} />
      <circle cx="265" cy="75" r="7.5" {...s} />
      <path {...s} d="M254 80v22" />
      <path {...s} d="M249 102h10" opacity={0.55} />

      <DoodleSun cx={232} cy={24} r={7.2} />
    </svg>
  );
}

/**
 * Sousedská akce — větší scéna dole v Akcích (vidět hlavně při málo příspěvcích).
 * Stan / praporek, stůl s občerstvením, sousedi a kalendář.
 */
export function DoodleSousedskaAkceScene({ className = "w-full max-w-[320px] h-auto" }) {
  return (
    <svg
      viewBox="0 0 320 168"
      fill="none"
      className={`pp-doodle-characters text-[#3D7A68] ${className}`}
      aria-hidden
    >
      {/* Terén */}
      <path
        {...s}
        stroke={DOODLE_OLIVE}
        strokeWidth={1.5}
        d="M10 142c36-10 70-8 102 2 34 10 62 8 94-2 30-10 62-8 94 4 12 5 18 3 20 0"
        opacity={0.6}
      />

      {/* Stan / baldachýn */}
      <path {...s} d="M48 78l42-28 42 28" strokeWidth={1.85} />
      <path {...s} d="M52 78v40M128 78v40" opacity={0.9} />
      <path {...s} d="M48 78h84" opacity={0.75} />
      <path {...s} stroke={DOODLE_OLIVE} d="M90 50v-10" strokeWidth={1.5} opacity={0.7} />
      <path {...s} stroke={DOODLE_OLIVE} d="M84 40h12l-2 8h-8l-2-8z" strokeWidth={1.4} opacity={0.8} />

      {/* Stůl */}
      <path {...s} d="M58 108h72" strokeWidth={1.85} />
      <path {...s} d="M68 108v18M120 108v18" opacity={0.8} />
      <ellipse cx="78" cy="102" rx="7" ry="4" {...s} opacity={0.75} />
      <ellipse cx="98" cy="100" rx="5" ry="3.5" {...s} stroke={DOODLE_OLIVE} opacity={0.8} />
      <path {...s} d="M112 104c2-4 8-4 10 0" opacity={0.7} />

      {/* Kalendář vpravo nahoře */}
      <path
        {...s}
        d="M214 28c.2-2 1.6-3.5 3.5-3.5h40c1.9 0 3.3 1.5 3.5 3.5v36c-.2 2-1.6 3.5-3.5 3.5h-40c-1.9 0-3.3-1.5-3.5-3.5V28z"
      />
      <path {...s} d="M213.5 40h47" />
      <path {...s} d="M226 24v6M246 24v6" />
      <circle cx="228" cy="52" r="2.2" fill="currentColor" stroke="none" opacity={0.4} />
      <circle cx="238" cy="52" r="2.2" fill="currentColor" stroke="none" opacity={0.4} />
      <circle cx="248" cy="52" r="2.2" {...s} stroke={DOODLE_OLIVE} opacity={0.85} />
      <circle cx="228" cy="60" r="2.2" fill="currentColor" stroke="none" opacity={0.35} />
      <circle cx="238" cy="60" r="2.2" fill="currentColor" stroke="none" opacity={0.35} />

      {/* Sousedi u stolu */}
      <circle cx="72" cy="86" r="5.5" {...s} />
      <path {...s} d="M72 91.5v12M72 97l-6 4M72 97l6 3.5" />
      <path {...s} d="M72 103.5l-4 10M72 103.5l4 10" />

      <circle cx="118" cy="84" r="5" {...s} />
      <path {...s} d="M118 89v12M118 95l6 3M112 91l-12-14" />
      <path {...s} d="M118 101l-3.5 10M118 101l3.5 10" />

      {/* Třetí soused s míčem / hrou */}
      <circle cx="168" cy="96" r="5.5" {...s} />
      <path {...s} d="M168 101.5v14M168 108l-7 5M168 108l7 4" />
      <path {...s} d="M168 115.5l-4.5 12M168 115.5l4.5 12" />
      <circle cx="182" cy="118" r="5" {...s} stroke={DOODLE_OLIVE} opacity={0.85} />
      <path {...s} stroke={DOODLE_OLIVE} d="M179 118h6M182 115v6" strokeWidth={1.25} opacity={0.55} />

      {/* Bublina */}
      <path
        {...s}
        stroke={DOODLE_OLIVE}
        d="M148 72c3-2 8-1.5 10 2s-1 7-5 7.5c-1.5.2-2.5 1.5-2.5 1.5l-2.5-1.5s-3-.5-4-3 1.5-6.5 4-6.5z"
        opacity={0.8}
      />
      <path {...s} stroke={DOODLE_OLIVE} d="M152 77h6" strokeWidth={1.25} opacity={0.55} />

      <DoodleSun cx={292} cy={28} r={7.5} />
    </svg>
  );
}

export const DOODLE_EMPTY_ILLUSTRATIONS = {
  chat: DoodleEmptyChat,
  hands: DoodleEmptyHands,
  group: DoodleEmptyGroup,
  box: DoodleEmptyBox,
  calendar: DoodleEmptyCalendar,
  neighborEvent: DoodleSousedskaAkceScene,
};
