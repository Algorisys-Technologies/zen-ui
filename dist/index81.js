import { template as x, insert as g, createComponent as y, memo as S, effect as h, setStyleProperty as m, className as $, use as V } from "solid-js/web";
import { createEffect as C, onCleanup as I, For as R, createMemo as b } from "solid-js";
import { createVirtualizer as w } from "./index139.js";
import { cn as E } from "./index106.js";
var _ = /* @__PURE__ */ x("<div><div style=position:relative;width:100%>"), k = /* @__PURE__ */ x("<div style=position:absolute;top:0;left:0;width:100%>");
const c = (e) => e.totalCount !== void 0;
function P(e) {
  let u;
  const z = () => c(e) ? e.totalCount : e.items.length, s = w({
    get count() {
      return z();
    },
    getScrollElement: () => u ?? null,
    estimateSize: (i) => typeof e.estimateSize == "function" ? e.estimateSize(i) : e.estimateSize ?? 36,
    // A getter, like `count` above. As a plain value this read props.overscan
    // once at setup and froze: passing a different overscan later changed
    // nothing, silently.
    get overscan() {
      return e.overscan ?? 6;
    }
  });
  let d = "";
  return C(() => {
    const i = s.getVirtualItems();
    if (!i.length || !c(e) || !e.onVisibleRange) return;
    const a = i[0].index, l = i[i.length - 1].index, t = `${a}:${l}`;
    t !== d && (d = t, e.onVisibleRange(a, l));
  }), I(() => d = ""), (() => {
    var i = _(), a = i.firstChild, l = u;
    return typeof l == "function" ? V(l, i) : u = i, g(a, y(R, {
      get each() {
        return s.getVirtualItems();
      },
      children: (t) => {
        const o = b(() => c(e) ? e.getItem(t.index) : e.items[t.index]);
        return (() => {
          var r = k();
          return g(r, (() => {
            var n = S(() => !!c(e));
            return () => n() ? e.children({
              item: o(),
              index: t.index
            }) : e.children({
              item: o(),
              index: t.index
            });
          })()), h((n) => {
            var f = `translateY(${t.start}px)`, v = `${t.size}px`;
            return f !== n.e && m(r, "transform", n.e = f), v !== n.t && m(r, "height", n.t = v), n;
          }, {
            e: void 0,
            t: void 0
          }), r;
        })();
      }
    })), h((t) => {
      var o = E("zen-overflow-y-auto", e.class), r = `${e.maxHeight ?? 280}px`, n = `${s.getTotalSize()}px`;
      return o !== t.e && $(i, t.e = o), r !== t.t && m(i, "max-height", t.t = r), n !== t.a && m(a, "height", t.a = n), t;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), i;
  })();
}
export {
  P as VirtualizedItems
};
//# sourceMappingURL=index81.js.map
