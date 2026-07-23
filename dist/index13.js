import { template as F, spread as I, mergeProps as A, insert as y, createComponent as R, setAttribute as S, effect as N, className as D, use as U } from "solid-js/web";
import { splitProps as W, createSignal as B, onMount as P, children as C, createMemo as d, createEffect as Z, on as $, For as k, onCleanup as H } from "solid-js";
import { cn as w } from "./index106.js";
var O = /* @__PURE__ */ F("<div>");
const j = 300, T = ["start", "mid", "end"], q = {
  OneColumn: {
    start: "zen-basis-full"
  },
  TwoColumnsBeginExpanded: {
    start: "zen-basis-2/3",
    mid: "zen-basis-1/3"
  },
  TwoColumnsMidExpanded: {
    start: "zen-basis-1/3",
    mid: "zen-basis-2/3"
  },
  ThreeColumnsMidExpanded: {
    start: "zen-basis-1/4",
    mid: "zen-basis-1/2",
    end: "zen-basis-1/4"
  },
  ThreeColumnsEndExpanded: {
    start: "zen-basis-1/4",
    mid: "zen-basis-1/4",
    end: "zen-basis-1/2"
  },
  MidColumnFullScreen: {
    mid: "zen-basis-full"
  },
  EndColumnFullScreen: {
    end: "zen-basis-full"
  }
}, G = {
  OneColumn: {
    start: "zen-basis-full"
  },
  TwoColumnsBeginExpanded: {
    start: "zen-basis-2/3",
    mid: "zen-basis-1/3"
  },
  TwoColumnsMidExpanded: {
    start: "zen-basis-1/3",
    mid: "zen-basis-2/3"
  },
  ThreeColumnsMidExpanded: {
    mid: "zen-basis-2/3",
    end: "zen-basis-1/3"
  },
  ThreeColumnsEndExpanded: {
    mid: "zen-basis-1/3",
    end: "zen-basis-2/3"
  },
  MidColumnFullScreen: {
    mid: "zen-basis-full"
  },
  EndColumnFullScreen: {
    end: "zen-basis-full"
  }
};
function J(a) {
  return Math.min(3, Math.max(1, Math.floor(a / j)));
}
function K(a, t, u) {
  const s = t === 2 ? G[a] : q[a], o = T.filter((e) => s[e] && u[e]).map((e) => ({
    name: e,
    basis: s[e]
  }));
  if (t === 1) {
    const e = o[o.length - 1];
    return e ? [{
      name: e.name,
      basis: "zen-basis-full"
    }] : [];
  }
  return o;
}
const Q = "zen-flex zen-h-full zen-min-h-0 zen-w-full zen-overflow-hidden", V = "zen-flex zen-h-full zen-min-h-0 zen-min-w-0 zen-shrink zen-grow-0 zen-flex-col zen-overflow-y-auto zen-overflow-x-hidden zen-transition-all zen-duration-200 zen-ease-out", en = (a) => {
  const [t, u] = W(a, ["layout", "onLayoutChange", "startColumn", "midColumn", "endColumn", "class"]);
  let s;
  const [o, e] = B(3), b = () => {
    if (!s) return;
    const n = s.offsetWidth;
    n && e(J(n));
  };
  P(() => {
    if (!s || typeof ResizeObserver > "u") return;
    b();
    const n = new ResizeObserver(() => b());
    n.observe(s), H(() => n.disconnect());
  });
  const h = C(() => t.startColumn), p = C(() => t.midColumn), v = C(() => t.endColumn), m = () => t.layout ?? "OneColumn", x = d(() => ({
    start: h.toArray().length > 0,
    mid: p.toArray().length > 0,
    end: v.toArray().length > 0
  })), c = d(() => K(m(), o(), x())), _ = d(() => ({
    layout: m(),
    maxColumnsCount: o(),
    visibleColumns: c().map((n) => n.name)
  }));
  Z($(_, (n) => t.onLayoutChange?.(n)));
  const L = {
    start: () => h(),
    mid: () => p(),
    end: () => v()
  };
  return (() => {
    var n = O(), E = s;
    return typeof E == "function" ? U(E, n) : s = n, I(n, A({
      get "data-layout"() {
        return m();
      },
      get "data-max-columns"() {
        return o();
      },
      get class() {
        return w(Q, t.class);
      }
    }, u), !1, !0), y(n, R(k, {
      get each() {
        return T.filter((l) => x()[l]);
      },
      children: (l) => {
        const z = d(() => c().findIndex((r) => r.name === l)), f = d(() => z() > -1);
        return (() => {
          var r = O();
          return S(r, "data-column", l), y(r, () => L[l]()), N((i) => {
            var M = f() ? "true" : "false", g = w(
              V,
              // `zen-hidden` rather than unmounting: a hidden column keeps
              // its scroll position and its state for when navigation comes
              // back to it, and display:none takes it out of the
              // accessibility tree.
              f() ? c()[z()].basis : "zen-hidden",
              // Separator on every visible column but the first, so the
              // layout never opens or closes with a stray edge.
              f() && z() > 0 ? "zen-border-l zen-border-zen-border" : null
            );
            return M !== i.e && S(r, "data-visible", i.e = M), g !== i.t && D(r, i.t = g), i;
          }, {
            e: void 0,
            t: void 0
          }), r;
        })();
      }
    })), n;
  })();
};
export {
  en as FlexibleColumnLayout
};
//# sourceMappingURL=index13.js.map
