import { constructFrom as s } from "./index389.js";
import { toDate as a } from "./index390.js";
function M(n, o, i) {
  const t = a(n, i?.in);
  if (isNaN(o)) return s(n, NaN);
  if (!o)
    return t;
  const r = t.getDate(), e = s(n, t.getTime());
  e.setMonth(t.getMonth() + o + 1, 0);
  const f = e.getDate();
  return r >= f ? e : (t.setFullYear(
    e.getFullYear(),
    e.getMonth(),
    r
  ), t);
}
export {
  M as addMonths
};
//# sourceMappingURL=index313.js.map
