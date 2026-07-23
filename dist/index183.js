import { template as a, insert as l, createComponent as i, effect as z, setAttribute as s } from "solid-js/web";
import { Show as u } from "solid-js";
import { pivotFilterWindowValueAt as m } from "./index182.js";
import { Loading as c } from "./index36.js";
import { VirtualizedItems as f } from "./index81.js";
var b = /* @__PURE__ */ a('<div class="zen-flex zen-justify-center zen-border-t zen-border-zen-border zen-px-2 zen-py-2">'), v = /* @__PURE__ */ a('<div class="zen-flex zen-flex-col"><div role=listbox aria-multiselectable=true>'), g = /* @__PURE__ */ a('<div role=option class="zen-h-full zen-w-full">'), h = /* @__PURE__ */ a('<div class="zen-flex zen-h-full zen-items-center zen-gap-2 zen-px-2"aria-busy=true aria-label="Loading value"><span class="zen-size-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-muted/60 motion-safe:zen-animate-pulse"aria-hidden=true></span><div class="zen-h-3 zen-w-3/4 zen-rounded-zen-sm zen-bg-zen-muted motion-safe:zen-animate-pulse"aria-hidden=true>');
const w = 36, _ = 4, R = (n) => (() => {
  var o = v(), d = o.firstChild;
  return l(d, i(f, {
    get totalCount() {
      return n.totalCount;
    },
    getItem: (e) => m(n.optionsWindows, e),
    onVisibleRange: (e, t) => n.onVisibleRange(e, t),
    estimateSize: w,
    overscan: _,
    maxHeight: 256,
    class: "zen-p-1",
    children: ({
      item: e
    }) => (() => {
      var t = g();
      return l(t, i(u, {
        when: e,
        get fallback() {
          return (
            // A skeleton, not a blank: an empty row reads as "no value"
            // rather than "not yet".
            h()
          );
        },
        children: (r) => n.renderRow(r())
      })), z(() => s(t, "aria-selected", e ? n.isSelected?.(e) ?? !1 : !1)), t;
    })()
  })), l(o, i(u, {
    get when() {
      return n.loadingWindow;
    },
    get children() {
      var e = b();
      return l(e, i(c, {
        size: "sm",
        label: "Loading more…"
      })), e;
    }
  }), null), z((e) => {
    var t = `${n.label} values`, r = n.loadingWindow || void 0;
    return t !== e.e && s(d, "aria-label", e.e = t), r !== e.t && s(d, "aria-busy", e.t = r), e;
  }, {
    e: void 0,
    t: void 0
  }), o;
})();
export {
  R as WindowedVirtualList
};
//# sourceMappingURL=index183.js.map
