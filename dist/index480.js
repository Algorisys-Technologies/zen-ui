import { constructFrom as f } from "./index467.js";
import { getISOWeekYear as s } from "./index481.js";
import { startOfISOWeek as a } from "./index431.js";
function O(t, e) {
  const o = s(t, e), r = f(t, 0);
  return r.setFullYear(o, 0, 4), r.setHours(0, 0, 0, 0), a(r);
}
export {
  O as startOfISOWeekYear
};
//# sourceMappingURL=index480.js.map
