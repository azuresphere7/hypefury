export function getSelectionText() {
  if (window.getSelection) {
    try {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.value) {
        // Workaround for this Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=85686
        return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
      } else {
        return window.getSelection().toString();
      }
    } catch (e) {
    }
  } else if (document.selection && document.selection.type !== "Control") {
    return document.selection.createRange().text; // For IE
  }
}
