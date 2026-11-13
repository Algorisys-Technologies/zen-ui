import { constructFrom as i } from "./index467.js";
import { toDate as f } from "./index468.js";
function u(e, c) {
  let t, o = c?.in;
  return e.forEach((r) => {
    !o && typeof r == "object" && (o = i.bind(null, r));
    const n = f(r, o);
    (!t || t > n || isNaN(+n)) && (t = n);
  }), i(o, t || NaN);
}
export {
  u as min
};
//# sourceMappingURL=index427.js.map
