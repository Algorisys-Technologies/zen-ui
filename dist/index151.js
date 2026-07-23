import { createComponent as o, template as m, insert as u, effect as g, className as f, setAttribute as b, delegateEvents as v } from "solid-js/web";
import { Show as h } from "solid-js";
import { WindowedVirtualList as w } from "./index192.js";
import { isValueSelected as c } from "./index74.js";
import { Icon as x } from "./index21.js";
import { cn as d } from "./index106.js";
var V = /* @__PURE__ */ m('<button type=button class="zen-flex zen-h-full zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-px-2 zen-text-start zen-text-sm zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50"><span aria-hidden=true></span><span class=zen-truncate>');
const R = (e) => o(w, {
  get label() {
    return e.label;
  },
  get totalCount() {
    return e.totalCount;
  },
  get optionsWindows() {
    return e.optionsWindows;
  },
  get loadingWindow() {
    return e.loadingWindow;
  },
  get onVisibleRange() {
    return e.onVisibleRange;
  },
  isSelected: (n) => c(e.selection(), n),
  renderRow: (n) => {
    const l = () => c(e.selection(), n);
    return (() => {
      var r = V(), i = r.firstChild, z = i.nextSibling;
      return r.$$click = () => {
        e.onToggleValue(n);
      }, u(i, o(h, {
        get when() {
          return l();
        },
        get children() {
          return o(x, {
            name: "check",
            get class() {
              return d(e.singleSelect ? "zen-size-2.5" : "zen-size-3");
            }
          });
        }
      })), u(z, () => e.formatValue(n)), g((t) => {
        var s = d("zen-flex zen-size-4 zen-shrink-0 zen-items-center zen-justify-center zen-border zen-border-zen-border zen-text-zen-primary-fg", e.singleSelect ? "zen-rounded-full" : "zen-rounded-sm", l() && "zen-border-zen-primary zen-bg-zen-primary"), a = e.formatValue(n);
        return s !== t.e && f(i, t.e = s), a !== t.t && b(z, "title", t.t = a), t;
      }, {
        e: void 0,
        t: void 0
      }), r;
    })();
  }
});
v(["click"]);
export {
  R as PivotFilterVirtualList
};
//# sourceMappingURL=index151.js.map
