import { getDefaultOptions as u } from "./index399.js";
import { formatters as f } from "./index400.js";
import { longFormatters as d } from "./index401.js";
import { isProtectedWeekYearToken as g, isProtectedDayOfYearToken as h, warnOrThrowProtectedError as w } from "./index402.js";
import { isValid as D } from "./index403.js";
import { toDate as T } from "./index394.js";
import { enUS as O } from "./index385.js";
const E = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g, v = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g, C = /^'([^]*?)'?$/, S = /''/g, R = /[a-zA-Z]/;
function L(o, a, r) {
  const n = u(), i = r?.locale ?? n.locale ?? O, m = r?.firstWeekContainsDate ?? r?.locale?.options?.firstWeekContainsDate ?? n.firstWeekContainsDate ?? n.locale?.options?.firstWeekContainsDate ?? 1, p = r?.weekStartsOn ?? r?.locale?.options?.weekStartsOn ?? n.weekStartsOn ?? n.locale?.options?.weekStartsOn ?? 0, s = T(o, r?.in);
  if (!D(s))
    throw new RangeError("Invalid time value");
  let c = a.match(v).map((t) => {
    const e = t[0];
    if (e === "p" || e === "P") {
      const l = d[e];
      return l(t, i.formatLong);
    }
    return t;
  }).join("").match(E).map((t) => {
    if (t === "''")
      return { isToken: !1, value: "'" };
    const e = t[0];
    if (e === "'")
      return { isToken: !1, value: W(t) };
    if (f[e])
      return { isToken: !0, value: t };
    if (e.match(R))
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + e + "`"
      );
    return { isToken: !1, value: t };
  });
  i.localize.preprocessor && (c = i.localize.preprocessor(s, c));
  const k = {
    firstWeekContainsDate: m,
    weekStartsOn: p,
    locale: i
  };
  return c.map((t) => {
    if (!t.isToken) return t.value;
    const e = t.value;
    (!r?.useAdditionalWeekYearTokens && g(e) || !r?.useAdditionalDayOfYearTokens && h(e)) && w(e, a, String(o));
    const l = f[e[0]];
    return l(s, e, i.localize, k);
  }).join("");
}
function W(o) {
  const a = o.match(C);
  return a ? a[1].replace(S, "'") : o;
}
export {
  L as format,
  L as formatDate,
  f as formatters,
  d as longFormatters
};
//# sourceMappingURL=index335.js.map
