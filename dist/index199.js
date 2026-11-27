import { clsx as r } from "./index284.js";
import { extendTailwindMerge as c } from "./index315.js";
import { zenUnoTheme as e, ZEN_PREFIX as i } from "./index208.js";
const m = new RegExp(`^(-?)${i}(.*)$`), d = Object.keys(e.borderRadius), b = Object.keys(e.boxShadow), p = /* @__PURE__ */ new Map([["outline", "outline-solid"]]), l = c({
  // The density keys are spacing, so `zen-h-zen-control` and a caller's
  // `zen-h-8` are one conflict group and the caller's wins.
  // The font sizes, so `zen-text-zen-cell` reads as a SIZE: tailwind-merge
  // would otherwise take an unknown text-* value for a colour, and drop the
  // cell's `zen-text-zen-foreground` beside it.
  extend: {
    theme: {
      radius: d,
      shadow: b,
      spacing: Object.keys(e.spacing),
      text: Object.keys(e.fontSize)
    }
  },
  experimentalParseClassName({ className: t, parseClassName: a }) {
    const s = a(t), n = m.exec(s.baseClassName);
    if (!n) return s;
    const o = `${n[1]}${n[2]}`;
    return { ...s, baseClassName: p.get(o) ?? o };
  }
});
function f(...t) {
  return l(r(t));
}
export {
  f as cn
};
//# sourceMappingURL=index199.js.map
