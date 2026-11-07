import { constructFrom as a } from "./index429.js";
import { toDate as c } from "./index430.js";
function l(e, n) {
  const t = c(e, n?.in), r = t.getFullYear(), s = t.getMonth(), o = a(t, 0);
  return o.setFullYear(r, s + 1, 0), o.setHours(0, 0, 0, 0), o.getDate();
}
export {
  l as getDaysInMonth
};
//# sourceMappingURL=index441.js.map
