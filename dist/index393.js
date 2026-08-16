import { constructFrom as r } from "./index389.js";
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
//# sourceMappingURL=index393.js.map
