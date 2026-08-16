import { normalizeInterval as m } from "./index394.js";
import { constructFrom as h } from "./index389.js";
function p(s, a) {
  const { start: e, end: r } = m(a?.in, s);
  let n = +e > +r;
  const c = n ? +e : +r, t = n ? r : e;
  t.setHours(0, 0, 0, 0), t.setDate(1);
  let i = 1;
  const o = [];
  for (; +t <= c; )
    o.push(h(e, t)), t.setMonth(t.getMonth() + i);
  return n ? o.reverse() : o;
}
export {
  p as eachMonthOfInterval
};
//# sourceMappingURL=index318.js.map
