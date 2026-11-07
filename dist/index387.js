import { constructFrom as i } from "./index429.js";
import { toDate as f } from "./index430.js";
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
//# sourceMappingURL=index387.js.map
