import { template as s, spread as a, mergeProps as c } from "solid-js/web";
import { splitProps as m } from "solid-js";
import { ZEN_ICONS as n } from "./index105.js";
import { ZEN_ICON_NAMES as _ } from "./index105.js";
import { cn as p } from "./index103.js";
var g = /* @__PURE__ */ s('<svg viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>');
const u = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), v = (t) => {
  const [e, i] = m(t, ["name", "size", "title", "class"]), r = () => e.size ?? 16, l = () => e.title ? `<title>${u(e.title)}</title>${n[e.name]}` : n[e.name];
  return (() => {
    var o = g();
    return a(o, c({
      get width() {
        return r();
      },
      get height() {
        return r();
      },
      get class() {
        return p("zen-inline-block zen-shrink-0", e.class);
      },
      get role() {
        return e.title ? "img" : void 0;
      },
      get "aria-hidden"() {
        return e.title ? void 0 : !0;
      },
      get "aria-label"() {
        return e.title;
      },
      get innerHTML() {
        return l();
      }
    }, i), !0, !1), o;
  })();
};
export {
  v as Icon,
  _ as ZEN_ICON_NAMES
};
//# sourceMappingURL=index21.js.map
