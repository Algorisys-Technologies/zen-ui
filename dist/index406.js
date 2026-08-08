import { constructFrom as f } from "./index393.js";
import { getISOWeekYear as s } from "./index407.js";
import { startOfISOWeek as a } from "./index351.js";
function O(t, e) {
  const o = s(t, e), r = f(t, 0);
  return r.setFullYear(o, 0, 4), r.setHours(0, 0, 0, 0), a(r);
}
export {
  O as startOfISOWeekYear
};
//# sourceMappingURL=index406.js.map
