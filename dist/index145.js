import { clsx as o } from "./index205.js";
import { extendTailwindMerge as r } from "./index225.js";
import { zenUnoTheme as n, ZEN_PREFIX as m } from "./index226.js";
const c = new RegExp(`^(-?)${m}(.*)$`), d = Object.keys(n.borderRadius), i = Object.keys(n.boxShadow), x = r({
  extend: { theme: { radius: d, shadow: i } },
  experimentalParseClassName({ className: e, parseClassName: a }) {
    const s = a(e), t = c.exec(s.baseClassName);
    return t ? { ...s, baseClassName: `${t[1]}${t[2]}` } : s;
  }
});
function w(...e) {
  return x(o(e));
}
export {
  w as cn
};
//# sourceMappingURL=index145.js.map
