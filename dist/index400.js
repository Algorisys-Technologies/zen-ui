import { differenceInCalendarDays as a } from "./index316.js";
import { startOfYear as e } from "./index343.js";
import { toDate as o } from "./index390.js";
function s(t, f) {
  const r = o(t, f?.in);
  return a(r, e(r)) + 1;
}
export {
  s as getDayOfYear
};
//# sourceMappingURL=index400.js.map
