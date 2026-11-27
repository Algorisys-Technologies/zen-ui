import { toDate as o } from "./index471.js";
function n(e, r) {
  const t = o(e, r?.in);
  return t.setFullYear(t.getFullYear(), 0, 1), t.setHours(0, 0, 0, 0), t;
}
export {
  n as startOfYear
};
//# sourceMappingURL=index439.js.map
