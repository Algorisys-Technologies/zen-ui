import { getBroadcastWeeksInMonth as n } from "./index467.js";
import { startOfBroadcastWeek as s } from "./index405.js";
function d(e, t) {
  const o = s(e, t), r = n(e, t);
  return t.addDays(o, r * 7 - 1);
}
export {
  d as endOfBroadcastWeek
};
//# sourceMappingURL=index404.js.map
