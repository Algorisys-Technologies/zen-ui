function o(e) {
  return !!(e && typeof e == "object" && "before" in e && "after" in e);
}
function t(e) {
  return !!(e && typeof e == "object" && "from" in e);
}
function r(e) {
  return !!(e && typeof e == "object" && "after" in e);
}
function f(e) {
  return !!(e && typeof e == "object" && "before" in e);
}
function i(e) {
  return !!(e && typeof e == "object" && "dayOfWeek" in e);
}
function y(e, n) {
  return Array.isArray(e) && e.every(n.isDate);
}
export {
  r as isDateAfterType,
  f as isDateBeforeType,
  o as isDateInterval,
  t as isDateRange,
  y as isDatesArray,
  i as isDayOfWeekType
};
//# sourceMappingURL=index287.js.map
