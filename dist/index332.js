import { toDate as r } from "./index394.js";
function u(e, o) {
  const t = r(e, o?.in), n = t.getMonth();
  return t.setFullYear(t.getFullYear(), n + 1, 0), t.setHours(23, 59, 59, 999), t;
}
export {
  u as endOfMonth
};
//# sourceMappingURL=index332.js.map
