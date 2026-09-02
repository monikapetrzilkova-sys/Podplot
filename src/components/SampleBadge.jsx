/** Malý štítek, že obsah je z ukázkového katalogu, ne od souseda. */
export default function SampleBadge({
  className = "",
  label = "Ukázka",
  title = "Tenhle příspěvek je jen ukázka, jak Podplot vypadá",
}) {
  return (
    <span className={`pp-sample-badge ${className}`.trim()} title={title}>
      {label}
    </span>
  );
}
