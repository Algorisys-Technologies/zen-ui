import { defaultDateLib as s } from "./index256.js";
function u(f, r, t = !1, o = s) {
  let { from: n, to: e } = f;
  const { differenceInCalendarDays: i, isSameDay: a } = o;
  return n && e ? (i(e, n) < 0 && ([n, e] = [e, n]), i(r, n) >= (t ? 1 : 0) && i(e, r) >= (t ? 1 : 0)) : !t && e ? a(e, r) : !t && n ? a(n, r) : !1;
}
export {
  u as rangeIncludesDate
};
//# sourceMappingURL=index276.js.map
