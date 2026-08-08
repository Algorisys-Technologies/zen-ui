import { constructFrom as e } from "./index393.js";
import { toDate as f } from "./index394.js";
function u(i, c) {
  let t, o = c?.in;
  return i.forEach((r) => {
    !o && typeof r == "object" && (o = e.bind(null, r));
    const n = f(r, o);
    (!t || t < n || isNaN(+n)) && (t = n);
  }), e(o, t || NaN);
}
export {
  u as max
};
//# sourceMappingURL=index346.js.map
