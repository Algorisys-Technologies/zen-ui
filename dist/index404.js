import { differenceInCalendarDays as a } from "./index327.js";
import { startOfYear as e } from "./index354.js";
import { toDate as o } from "./index394.js";
function s(t, f) {
  const r = o(t, f?.in);
  return a(r, e(r)) + 1;
}
export {
  s as getDayOfYear
};
//# sourceMappingURL=index404.js.map
