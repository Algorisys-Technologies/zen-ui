import "./index316.js";
import { toTimeZone as i } from "./index286.js";
import { isDateRange as e, isDateInterval as p, isDateAfterType as y, isDateBeforeType as D } from "./index287.js";
function n(o, f, u) {
  return i(o, f);
}
function t(o, f, u) {
  return typeof o == "boolean" || typeof o == "function" ? o : o instanceof Date ? n(o, f) : Array.isArray(o) ? o.map((r) => r instanceof Date ? n(r, f) : r) : e(o) ? {
    ...o,
    from: o.from ? i(o.from, f) : o.from,
    to: o.to ? i(o.to, f) : o.to
  } : p(o) ? {
    before: n(o.before, f),
    after: n(o.after, f)
  } : y(o) ? {
    after: n(o.after, f)
  } : D(o) ? {
    before: n(o.before, f)
  } : o;
}
function T(o, f, u) {
  return o && (Array.isArray(o) ? o.map((r) => t(r, f)) : t(o, f));
}
export {
  T as convertMatchersToTimeZone
};
//# sourceMappingURL=index284.js.map
