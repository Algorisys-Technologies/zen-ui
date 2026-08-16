import { constructFrom as m } from "./index389.js";
import { getDaysInMonth as i } from "./index401.js";
import { toDate as u } from "./index390.js";
function l(n, r, e) {
  const t = u(n, e?.in), s = t.getFullYear(), a = t.getDate(), o = m(n, 0);
  o.setFullYear(s, r, 15), o.setHours(0, 0, 0, 0);
  const c = i(o);
  return t.setMonth(r, Math.min(a, c)), t;
}
export {
  l as setMonth
};
//# sourceMappingURL=index337.js.map
