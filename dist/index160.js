import { clsx as o } from "./index229.js";
import { extendTailwindMerge as r } from "./index265.js";
import { zenUnoTheme as t, ZEN_PREFIX as c } from "./index266.js";
const i = new RegExp(`^(-?)${c}(.*)$`), m = Object.keys(t.borderRadius), d = Object.keys(t.boxShadow), p = r({
  // The density keys are spacing, so `zen-h-zen-control` and a caller's
  // `zen-h-8` are one conflict group and the caller's wins.
  extend: { theme: { radius: m, shadow: d, spacing: Object.keys(t.spacing) } },
  experimentalParseClassName({ className: e, parseClassName: a }) {
    const s = a(e), n = i.exec(s.baseClassName);
    return n ? { ...s, baseClassName: `${n[1]}${n[2]}` } : s;
  }
});
function w(...e) {
  return p(o(e));
}
export {
  w as cn
};
//# sourceMappingURL=index160.js.map
