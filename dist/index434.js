import { toDate as o } from "./index468.js";
function n(e, r) {
  const t = o(e, r?.in);
  return t.setFullYear(t.getFullYear(), 0, 1), t.setHours(0, 0, 0, 0), t;
}
export {
  n as startOfYear
};
//# sourceMappingURL=index434.js.map
