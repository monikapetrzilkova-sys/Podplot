/** Malý štítek, že obsah je z ukázkového katalogu, ne od souseda. */
export default function SampleBadge({ className = "" }) {
  return (
    <span
      className={`pp-sample-badge ${className}`.trim()}
      title="Tenhle příspěvek je jen ukázka, jak Podplot vypadá"
    >
      Ukázka
    </span>
  );
}
