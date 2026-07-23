import { createComponent as $, mergeProps as D, template as I, effect as N, setAttribute as U } from "solid-js/web";
import { useLocale as j } from "./index147.js";
import { Polymorphic as M } from "./index161.js";
import { mergeDefaultProps as O, getWindow as F } from "./index163.js";
import { splitProps as _, createContext as H, useContext as G, createSignal as g, createEffect as b, onCleanup as Z } from "solid-js";
import { autoUpdate as q, offset as J, flip as X, shift as Y, size as K, hide as Q, arrow as tt, computePosition as et, platform as rt } from "./index176.js";
import { combineStyle as L } from "./index167.js";
import { mergeRefs as T } from "./index166.js";
var ot = /* @__PURE__ */ I('<svg display=block viewBox="0 0 30 30"style=transform:scale(1.02)><g><path fill=none d=M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z></path><path stroke=none d=M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z>'), R = H();
function E() {
  const o = G(R);
  if (o === void 0)
    throw new Error("[kobalte]: `usePopperContext` must be used within a `Popper` component");
  return o;
}
var v = 30, S = v / 2, nt = {
  top: 180,
  right: -90,
  bottom: 0,
  left: 90
};
function it(o) {
  const t = E(), n = O({
    size: v
  }, o), [r, s] = _(n, ["ref", "style", "size"]), l = () => t.currentPlacement().split("-")[0], u = st(t.contentRef), y = () => u()?.getPropertyValue("background-color") || "none", m = () => u()?.getPropertyValue(`border-${l()}-color`) || "none", h = () => u()?.getPropertyValue(`border-${l()}-width`) || "0px", P = () => Number.parseInt(h()) * 2 * (v / r.size), w = () => `rotate(${nt[l()]} ${S} ${S}) translate(0 2)`;
  return $(M, D({
    as: "div",
    ref(i) {
      var e = T(t.setArrowRef, r.ref);
      typeof e == "function" && e(i);
    },
    "aria-hidden": "true",
    get style() {
      return L({
        // server side rendering
        position: "absolute",
        "font-size": `${r.size}px`,
        width: "1em",
        height: "1em",
        "pointer-events": "none",
        fill: y(),
        stroke: m(),
        "stroke-width": P()
      }, r.style);
    }
  }, s, {
    get children() {
      var i = ot(), e = i.firstChild, a = e.firstChild;
      return a.nextSibling, N(() => U(e, "transform", w())), i;
    }
  }));
}
function st(o) {
  const [t, n] = g();
  return b(() => {
    const r = o();
    r && n(F(r).getComputedStyle(r));
  }), t;
}
function ct(o) {
  const t = E(), [n, r] = _(o, ["ref", "style"]);
  return $(M, D({
    as: "div",
    ref(s) {
      var l = T(t.setPositionerRef, n.ref);
      typeof l == "function" && l(s);
    },
    "data-popper-positioner": "",
    get style() {
      return L({
        position: "absolute",
        top: 0,
        left: 0,
        "min-width": "max-content"
      }, n.style);
    }
  }, r));
}
function z(o) {
  const {
    x: t = 0,
    y: n = 0,
    width: r = 0,
    height: s = 0
  } = o ?? {};
  if (typeof DOMRect == "function")
    return new DOMRect(t, n, r, s);
  const l = {
    x: t,
    y: n,
    width: r,
    height: s,
    top: n,
    right: t + r,
    bottom: n + s,
    left: t
  };
  return {
    ...l,
    toJSON: () => l
  };
}
function lt(o, t) {
  return {
    contextElement: o,
    getBoundingClientRect: () => {
      const r = t(o);
      return r ? z(r) : o ? o.getBoundingClientRect() : z();
    }
  };
}
function at(o) {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(o);
}
var pt = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
function ft(o, t) {
  const [n, r] = o.split("-"), s = pt[n];
  return r ? n === "left" || n === "right" ? `${s} ${r === "start" ? "top" : "bottom"}` : r === "start" ? `${s} ${t === "rtl" ? "right" : "left"}` : `${s} ${t === "rtl" ? "left" : "right"}` : `${s} center`;
}
function dt(o) {
  const t = O({
    getAnchorRect: (i) => i?.getBoundingClientRect(),
    placement: "bottom",
    gutter: 0,
    shift: 0,
    flip: !0,
    slide: !0,
    overlap: !1,
    sameWidth: !1,
    fitViewport: !1,
    hideWhenDetached: !1,
    detachedPadding: 0,
    arrowPadding: 4,
    overflowPadding: 8
  }, o), [n, r] = g(), [s, l] = g(), [u, y] = g(t.placement), m = () => lt(t.anchorRef?.(), t.getAnchorRect), {
    direction: h
  } = j();
  async function P() {
    const i = m(), e = n(), a = s();
    if (!i || !e)
      return;
    const A = (a?.clientHeight || 0) / 2, V = typeof t.gutter == "number" ? t.gutter + A : t.gutter ?? A;
    e.style.setProperty("--kb-popper-content-overflow-padding", `${t.overflowPadding}px`), i.getBoundingClientRect();
    const d = [
      // https://floating-ui.com/docs/offset
      J(({
        placement: c
      }) => {
        const f = !!c.split("-")[1];
        return {
          mainAxis: V,
          crossAxis: f ? void 0 : t.shift,
          alignmentAxis: t.shift
        };
      })
    ];
    if (t.flip !== !1) {
      const c = typeof t.flip == "string" ? t.flip.split(" ") : void 0;
      if (c !== void 0 && !c.every(at))
        throw new Error("`flip` expects a spaced-delimited list of placements");
      d.push(X({
        padding: t.overflowPadding,
        fallbackPlacements: c
      }));
    }
    (t.slide || t.overlap) && d.push(Y({
      mainAxis: t.slide,
      crossAxis: t.overlap,
      padding: t.overflowPadding
    })), d.push(K({
      padding: t.overflowPadding,
      apply({
        availableWidth: c,
        availableHeight: f,
        rects: x
      }) {
        const k = Math.round(x.reference.width);
        c = Math.floor(c), f = Math.floor(f), e.style.setProperty("--kb-popper-anchor-width", `${k}px`), e.style.setProperty("--kb-popper-content-available-width", `${c}px`), e.style.setProperty("--kb-popper-content-available-height", `${f}px`), t.sameWidth && (e.style.width = `${k}px`), t.fitViewport && (e.style.maxWidth = `${c}px`, e.style.maxHeight = `${f}px`);
      }
    })), t.hideWhenDetached && d.push(Q({
      padding: t.detachedPadding
    })), a && d.push(tt({
      element: a,
      padding: t.arrowPadding
    }));
    const p = await et(i, e, {
      placement: t.placement,
      strategy: "absolute",
      middleware: d,
      platform: {
        ...rt,
        isRTL: () => h() === "rtl"
      }
    });
    if (y(p.placement), t.onCurrentPlacementChange?.(p.placement), !e)
      return;
    e.style.setProperty("--kb-popper-content-transform-origin", ft(p.placement, h()));
    const W = Math.round(p.x), B = Math.round(p.y);
    let C;
    if (t.hideWhenDetached && (C = p.middlewareData.hide?.referenceHidden ? "hidden" : "visible"), Object.assign(e.style, {
      top: "0",
      left: "0",
      transform: `translate3d(${W}px, ${B}px, 0)`,
      visibility: C
    }), a && p.middlewareData.arrow) {
      const {
        x: c,
        y: f
      } = p.middlewareData.arrow, x = p.placement.split("-")[0];
      Object.assign(a.style, {
        left: c != null ? `${c}px` : "",
        top: f != null ? `${f}px` : "",
        [x]: "100%"
      });
    }
  }
  b(() => {
    const i = m(), e = n();
    if (!i || !e)
      return;
    const a = q(i, e, P, {
      // JSDOM doesn't support ResizeObserver
      elementResize: typeof ResizeObserver == "function"
    });
    Z(a);
  }), b(() => {
    const i = n(), e = t.contentRef?.();
    !i || !e || queueMicrotask(() => {
      i.style.zIndex = getComputedStyle(e).zIndex;
    });
  });
  const w = {
    currentPlacement: u,
    contentRef: () => t.contentRef?.(),
    setPositionerRef: r,
    setArrowRef: l
  };
  return $(R.Provider, {
    value: w,
    get children() {
      return t.children;
    }
  });
}
var bt = Object.assign(dt, {
  Arrow: it,
  Context: R,
  usePopperContext: E,
  Positioner: ct
});
export {
  bt as Popper,
  it as PopperArrow,
  R as PopperContext,
  ct as PopperPositioner,
  dt as PopperRoot,
  E as usePopperContext
};
//# sourceMappingURL=index169.js.map
