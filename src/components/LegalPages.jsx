import { DoodleSousedstviScene } from "./doodle/doodleIllustrations.jsx";

const PAGES = {
  terms: {
    title: "Obchodní podmínky",
    content: [
      "Podplot je komunitní platforma pro sousedskou výpomoc, sdílení a lokální služby.",
      "Používáním aplikace souhlasíte s pravidly slušného chování vůči ostatním uživatelům a s tím, že nebudete zneužívat platformu k podvodům, spamu nebo nelegálním aktivitám.",
      "Provozovatel si vyhrazuje právo moderovat obsah a omezit účty porušující pravidla komunity.",
      "Placené služby (TOP inzerát, propagace profilu) jsou nevratné po aktivaci, pokud není uvedeno jinak.",
    ],
  },
  privacy: {
    title: "Zásady ochrany osobních údajů",
    content: [
      "Vaše přesná adresa není veřejně zobrazena ostatním uživatelům — slouží pouze k určení vaší lokality v okolí.",
      "Poloha (GPS) se používá jen ke zobrazení obsahu v okolí a k označení místa u hlášení. Bez GPS vycházíme z adresy zadané při registraci.",
      "Údaje z profilu sdílíme pouze v rozsahu nezbytném pro fungování služby (např. jméno u inzerátu, kontakt při domluvě).",
      "Pro základní běh aplikace ukládáme nezbytné údaje v zařízení (např. přihlášení, preference). Marketingové cookies a sledování třetími stranami v této verzi nepoužíváme.",
      "Máte právo požádat o export nebo smazání svých údajů kontaktováním provozovatele.",
    ],
  },
  about: {
    title: "Informace o aplikaci",
    content: [
      "Podplot propojuje sousedy, místní podnikatele a instituce v jedné aplikaci.",
      "Verze: 1.0 (demo)",
      "Kontakt: podpora@podplot.cz",
      "Podplot — sousedská síť pro váš kousek světa.",
    ],
  },
};

const STORY = {
  title: "Příběh Podplotu",
  tagline: "Sousedství v kapse",
  headline: "Sociální sítě nás spojily s celým světem, ale odpojily od vlastních sousedů.",
  subheadline:
    "Je čas vrátit se zpátky k plotu. Podplot je digitální nástroj pro čistě fyzický svět.",
  body: [
    "Žijeme v době, kdy můžeme sledovat životy lidí na druhém konci planety, ale často netušíme, kdo bydlí za naším vlastním plotem. Stali jsme se součástí anonymních digitálních skupin plných informačního šumu a zbytečných konfliktů.",
    "Ztratili jsme to kouzlo starého dobrého sousedství – ten moment, kdy se potkáte u plotu, prohodíte pár slov, bezpečně si půjčíte nářadí nebo si doporučíte spolehlivého řemeslníka z vedlejší ulice.",
    "Podplot nevzniká proto, aby lidi držel u displejů. Vzniká proto, aby je vrátil zpátky do reálného života. Naším cílem je odbourat anonymitu moderních obcí a propojit lidi tam, kde na tom záleží nejvíce – doma.",
  ],
};

/** Společný obsah Příběhu Podplotu (profil i po registraci) */
export function PodplotStoryContent() {
  return (
    <>
      <p className="text-[11px] font-bold tracking-[0.12em] text-[#3D7A68] uppercase mb-2">
        {STORY.title}
      </p>
      <p className="text-sm font-semibold text-[#64A08D] mb-4">{STORY.tagline}</p>
      <h1 className="text-[1.65rem] sm:text-3xl font-extrabold text-stone-900 leading-[1.2] tracking-tight mb-4">
        {STORY.headline}
      </h1>
      <p className="text-base font-semibold text-stone-700 leading-snug mb-6">{STORY.subheadline}</p>
      <div className="space-y-4">
        {STORY.body.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="text-sm text-stone-600 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="mt-10 flex justify-center" aria-hidden>
        <DoodleSousedstviScene className="w-full max-w-[260px] h-auto opacity-90" />
      </div>
    </>
  );
}

function StoryPage() {
  return (
    <div className="px-4 py-4 pb-8">
      <PodplotStoryContent />
    </div>
  );
}

/** Celá obrazovka po registraci — uživatel potvrdí a vstoupí do aplikace */
export function PodplotStoryWelcome({ onContinue }) {
  return (
    <div className="fixed inset-0 z-[90] bg-[#F9F9F9] overflow-y-auto">
      <div className="min-h-full max-w-[390px] mx-auto px-4 py-6 pb-10 flex flex-col">
        <PodplotStoryContent />
        <button
          type="button"
          onClick={onContinue}
          className="mt-8 w-full py-3.5 rounded-2xl text-sm font-semibold text-white shrink-0"
          style={{ background: "#1B4332" }}
        >
          Pokračovat do aplikace
        </button>
      </div>
    </div>
  );
}

export default function LegalPages({ page }) {
  if (page === "story") {
    return <StoryPage />;
  }

  const doc = PAGES[page];
  if (!doc) return null;

  return (
    <div className="px-4 py-4 pb-8">
      <h2 className="pp-text-title text-xl mb-4">{doc.title}</h2>
      <div className="space-y-3">
        {doc.content.map((paragraph) => (
          <p key={paragraph} className="pp-text-body">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export function LegalLinksSection({ onOpen }) {
  const links = [
    { id: "story", label: "Příběh" },
    { id: "terms", label: "Obchodní podmínky" },
    { id: "privacy", label: "Zásady ochrany osobních údajů" },
    { id: "about", label: "Informace o aplikaci" },
  ];

  return (
    <section className="pp-card p-4">
      <h3 className="pp-text-title mb-3">Podplot</h3>
      <div className="space-y-1">
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onOpen(link.id)}
            className="w-full flex items-center justify-between py-2.5 px-1 text-left pp-text-body hover:text-[#3D7A68] transition-colors border-b border-stone-100 last:border-0"
          >
            {link.label}
            <span className="pp-text-meta">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}
