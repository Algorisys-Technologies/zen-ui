import { clsx as r } from "./index264.js";
import { extendTailwindMerge as c } from "./index311.js";
import { zenUnoTheme as t, ZEN_PREFIX as i } from "./index312.js";
const m = new RegExp(`^(-?)${i}(.*)$`), d = Object.keys(t.borderRadius), p = Object.keys(t.boxShadow), b = /* @__PURE__ */ new Map([["outline", "outline-solid"]]), l = c({
  // The density keys are spacing, so `zen-h-zen-control` and a caller's
  // `zen-h-8` are one conflict group and the caller's wins.
  extend: { theme: { radius: d, shadow: p, spacing: Object.keys(t.spacing) } },
  experimentalParseClassName({ className: e, parseClassName: a }) {
    const s = a(e), n = m.exec(s.baseClassName);
    if (!n) return s;
    const o = `${n[1]}${n[2]}`;
    return { ...s, baseClassName: b.get(o) ?? o };
  }
});
function g(...e) {
  return l(r(e));
}
export {
  g as cn
};
//# sourceMappingURL=index197.js.map
