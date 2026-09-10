export function activePostsLabel(count) {
  const n = Number(count) || 0;
  if (n <= 0) return "Žádný aktivní příspěvek";
  if (n === 1) return "1 aktivní příspěvek";
  if (n >= 2 && n <= 4) return `${n} aktivní příspěvky`;
  return `${n} aktivních příspěvků`;
}
