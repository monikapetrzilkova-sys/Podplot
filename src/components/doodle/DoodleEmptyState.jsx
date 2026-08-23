import { DOODLE_EMPTY_ILLUSTRATIONS } from "./doodleIllustrations.jsx";

/** Prázdný stav s doodle panáčky / ilustrací */
export default function DoodleEmptyState({
  illustration = "chat",
  message = "Zatím tu nic není.",
  className = "",
}) {
  const Illustration = DOODLE_EMPTY_ILLUSTRATIONS[illustration] ?? DOODLE_EMPTY_ILLUSTRATIONS.chat;
  const large = illustration === "neighborEvent";

  return (
    <div className={`pp-doodle-empty flex flex-col items-center justify-center py-8 px-4 ${className}`}>
      <Illustration className={`pp-doodle-empty-art mb-3 ${large ? "pp-doodle-empty-art--lg" : ""}`} />
      <p className="text-sm text-center font-medium text-[#3D7A68]/80 max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}
