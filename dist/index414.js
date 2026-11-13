import { toDate as n } from "./index468.js";
function s(t, r) {
  const e = n(t, r?.in), o = e.getFullYear();
  return e.setFullYear(o + 1, 0, 0), e.setHours(23, 59, 59, 999), e;
}
export {
  s as endOfYear
};
//# sourceMappingURL=index414.js.map
