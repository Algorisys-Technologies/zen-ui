import { constructFrom as s } from "./index393.js";
import { startOfISOWeek as a } from "./index351.js";
import { toDate as m } from "./index394.js";
function Y(f, n) {
  const e = m(f, n?.in), t = e.getFullYear(), r = s(e, 0);
  r.setFullYear(t + 1, 0, 4), r.setHours(0, 0, 0, 0);
  const u = a(r), o = s(e, 0);
  o.setFullYear(t, 0, 4), o.setHours(0, 0, 0, 0);
  const i = a(o);
  return e.getTime() >= u.getTime() ? t + 1 : e.getTime() >= i.getTime() ? t : t - 1;
}
export {
  Y as getISOWeekYear
};
//# sourceMappingURL=index407.js.map
