/** Větší doodle dole na stránce, když je málo obsahu (stejný jazyk jako Sousedé / Akce). */

export default function SparsePageDoodle({
  Scene,
  count = 0,
  hideFrom = 4,
  className = "",
  maxWidthClass = "max-w-[190px]",
}) {
  if (count >= hideFrom) return null;
  if (!Scene) return null;

  return (
    <div className={`pp-hub-doodle-footer ${className}`.trim()} aria-hidden>
      <Scene className={`w-full ${maxWidthClass} h-auto text-[#3D7A68]`} />
    </div>
  );
}
