import { template as m, spread as g, mergeProps as u, insert as y } from "solid-js/web";
import { mergeProps as z, splitProps as j } from "solid-js";
import { cn as w } from "./index106.js";
var $ = /* @__PURE__ */ m("<div>");
const b = {
  start: "zen-items-start",
  center: "zen-items-center",
  end: "zen-items-end",
  stretch: "zen-items-stretch"
}, h = {
  start: "zen-justify-start",
  center: "zen-justify-center",
  end: "zen-justify-end",
  between: "zen-justify-between"
}, a = (n) => n === void 0 ? void 0 : typeof n == "number" ? `${n}px` : n, k = (n) => {
  const c = z({
    direction: "column",
    wrap: !1
  }, n), [e, p] = j(c, ["class", "direction", "align", "justify", "wrap", "gap", "padding", "style", "children"]), l = () => {
    const t = {}, s = a(e.gap), i = a(e.padding);
    s !== void 0 && (t.gap = s), i !== void 0 && (t.padding = i);
    const r = e.style;
    if (typeof r == "string") {
      const o = Object.entries(t).map(([d, f]) => `${d}:${f}`).join(";");
      return o ? `${o};${r}` : r;
    }
    return r ? {
      ...t,
      ...r
    } : Object.keys(t).length > 0 ? t : void 0;
  };
  return (() => {
    var t = $();
    return g(t, u({
      get class() {
        return w("zen-flex", e.direction === "column" ? "zen-flex-col" : "zen-flex-row", e.wrap && "zen-flex-wrap", e.align && b[e.align], e.justify && h[e.justify], e.class);
      },
      get style() {
        return l();
      }
    }, p), !1, !0), y(t, () => e.children), t;
  })();
};
export {
  k as Stack
};
//# sourceMappingURL=index92.js.map
