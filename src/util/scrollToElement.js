export function scrollToElement(element) {
  const offsetTop = (element.getBoundingClientRect().top + document.documentElement.scrollTop);
  const position = offsetTop -
    window.innerHeight / 2 +
    element.offsetHeight / 2;
  window.scrollTo({ top: position, behavior: 'smooth' });
}
