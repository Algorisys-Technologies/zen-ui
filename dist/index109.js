import { template as c, use as u, insert as i, createComponent as m, memo as v, effect as h, className as d } from "solid-js/web";
import { createDroppable as b } from "./index137.js";
import { Show as s } from "solid-js";
import { Icon as x } from "./index21.js";
import { cn as f } from "./index103.js";
var g = /* @__PURE__ */ c('<div class="zen-mb-1.5 zen-flex zen-items-center zen-justify-between"><div class="zen-flex zen-items-center zen-gap-2 zen-text-sm zen-font-semibold zen-text-zen-foreground zen-select-none">'), p = /* @__PURE__ */ c('<div class="zen-text-xs zen-text-zen-muted-fg/50 zen-italic zen-py-0.5 zen-select-none zen-pointer-events-none">Drop fields here'), w = /* @__PURE__ */ c("<div><div>");
function j(e) {
  const o = b(e.id);
  return (() => {
    var t = w(), z = t.firstChild, a = o.ref;
    return typeof a == "function" ? u(a, t) : o.ref = t, i(t, m(s, {
      get when() {
        return !e.hideTitle;
      },
      get children() {
        var n = g(), r = n.firstChild;
        return i(r, (() => {
          var l = v(() => !!e.icon);
          return () => l() && m(x, {
            get name() {
              return e.icon;
            },
            class: "zen-h-4 zen-w-4"
          });
        })(), null), i(r, () => e.title, null), n;
      }
    }), z), i(z, () => e.children, null), i(z, m(s, {
      get when() {
        return e.isEmpty;
      },
      get children() {
        return p();
      }
    }), null), h((n) => {
      var r = f("zen-min-h-5 zen-min-w-5 zen-border zen-border-zen-border zen-bg-zen-muted/30 zen-p-2 zen-align-top zen-transition-colors", e.class, o.isActiveDroppable && "zen-border zen-border-zen-primary/40 zen-bg-zen-muted zen-border-dashed"), l = f("zen-flex zen-min-h-0 zen-min-w-0 zen-flex-1 zen-content-start zen-gap-1.5", e.horizontal ? "zen-flex-row zen-flex-wrap zen-items-center" : "zen-flex-col zen-items-stretch");
      return r !== n.e && d(t, n.e = r), l !== n.t && d(z, n.t = l), n;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
}
export {
  j as PivotDropZone
};
//# sourceMappingURL=index109.js.map
