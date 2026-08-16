import { normalizeDates as o } from "./index393.js";
function i(r, a, n) {
  const [e, t] = o(
    n?.in,
    r,
    a
  );
  return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth();
}
export {
  i as isSameMonth
};
//# sourceMappingURL=index333.js.map
