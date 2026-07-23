import { clsx as n } from "./index145.js";
import { extendTailwindMerge as a } from "./index146.js";
import { zenUnoTheme as o, ZEN_PREFIX as m } from "./index147.js";
const i = new RegExp(`^(-?)${m}(.*)$`), c = Object.keys(o.borderRadius), d = a({
  extend: { theme: { radius: c } },
  experimentalParseClassName({ className: e, parseClassName: t }) {
    const r = t(e), s = i.exec(r.baseClassName);
    return s ? { ...r, baseClassName: `${s[1]}${s[2]}` } : r;
  }
});
function b(...e) {
  return d(n(e));
}
export {
  b as cn
};
//# sourceMappingURL=index103.js.map
