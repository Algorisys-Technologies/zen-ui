import { constructFrom as f } from "./index389.js";
import { getISOWeekYear as s } from "./index403.js";
import { startOfISOWeek as a } from "./index340.js";
function O(t, e) {
  const o = s(t, e), r = f(t, 0);
  return r.setFullYear(o, 0, 4), r.setHours(0, 0, 0, 0), a(r);
}
export {
  O as startOfISOWeekYear
};
//# sourceMappingURL=index402.js.map
