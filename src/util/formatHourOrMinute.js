export function formatHourOrMinute(n) {
  return n.toLocaleString(undefined, { minimumIntegerDigits: 2 });
}
