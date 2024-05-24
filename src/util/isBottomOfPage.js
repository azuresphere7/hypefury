export function isBottomOfPage() {
  const scrollY = window.scrollY;
  const visible = document.documentElement.clientHeight;
  const pageHeight = document.documentElement.scrollHeight;
  const bottomOfPage = visible + scrollY + 1000 >= pageHeight;
  return bottomOfPage || pageHeight - 200 < visible;
}
