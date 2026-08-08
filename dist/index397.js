import { constructFrom as r } from "./index393.js";
function i(e, ...o) {
  const n = r.bind(
    null,
    o.find((t) => typeof t == "object")
  );
  return o.map(n);
}
export {
  i as normalizeDates
};
//# sourceMappingURL=index397.js.map
