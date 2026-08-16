import { normalizeInterval as i } from "./index394.js";
import { constructFrom as m } from "./index389.js";
function p(s, a) {
  const { start: t, end: r } = i(a?.in, s);
  let n = +t > +r;
  const l = n ? +t : +r, e = n ? r : t;
  e.setHours(0, 0, 0, 0), e.setMonth(0, 1);
  let c = 1;
  const o = [];
  for (; +e <= l; )
    o.push(m(t, e)), e.setFullYear(e.getFullYear() + c);
  return n ? o.reverse() : o;
}
export {
  p as eachYearOfInterval
};
//# sourceMappingURL=index319.js.map
