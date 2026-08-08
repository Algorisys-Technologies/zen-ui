import * as l from "react";
import { Primitive as x } from "./index203.js";
import { Presence as I } from "./index202.js";
import { createContextScope as te } from "./index195.js";
import { useComposedRefs as T } from "./index192.js";
import { useCallbackRef as P } from "./index207.js";
import { useDirection as ne } from "./index171.js";
import { useLayoutEffect as le } from "./index208.js";
import { clamp as ce } from "./index211.js";
import { composeEventHandlers as E } from "./index194.js";
import { jsx as b, jsxs as ie, Fragment as se } from "react/jsx-runtime";
function ae(e, t) {
  return l.useReducer((r, c) => t[r][c] ?? r, e);
}
var V = "ScrollArea", [j] = te(V), [de, v] = j(V), q = l.forwardRef(
  (e, t) => {
    const {
      __scopeScrollArea: r,
      type: c = "hover",
      dir: o,
      scrollHideDelay: n = 600,
      ...i
    } = e, [s, a] = l.useState(null), [f, u] = l.useState(null), [h, d] = l.useState(null), [S, w] = l.useState(null), [A, M] = l.useState(null), [C, L] = l.useState(0), [U, _] = l.useState(0), [D, y] = l.useState(!1), [W, H] = l.useState(!1), m = T(t, a), p = ne(o);
    return /* @__PURE__ */ b(
      de,
      {
        scope: r,
        type: c,
        dir: p,
        scrollHideDelay: n,
        scrollArea: s,
        viewport: f,
        onViewportChange: u,
        content: h,
        onContentChange: d,
        scrollbarX: S,
        onScrollbarXChange: w,
        scrollbarXEnabled: D,
        onScrollbarXEnabledChange: y,
        scrollbarY: A,
        onScrollbarYChange: M,
        scrollbarYEnabled: W,
        onScrollbarYEnabledChange: H,
        onCornerWidthChange: L,
        onCornerHeightChange: _,
        children: /* @__PURE__ */ b(
          x.div,
          {
            dir: p,
            ...i,
            ref: m,
            style: {
              position: "relative",
              // Pass corner sizes as CSS vars to reduce re-renders of context consumers
              "--radix-scroll-area-corner-width": C + "px",
              "--radix-scroll-area-corner-height": U + "px",
              ...e.style
            }
          }
        )
      }
    );
  }
);
q.displayName = V;
var $ = "ScrollAreaViewport", G = l.forwardRef(
  (e, t) => {
    const { __scopeScrollArea: r, children: c, nonce: o, ...n } = e, i = v($, r), s = l.useRef(null), a = T(t, s, i.onViewportChange);
    return /* @__PURE__ */ ie(se, { children: [
      /* @__PURE__ */ b(ue, { nonce: o }),
      /* @__PURE__ */ b(
        x.div,
        {
          "data-radix-scroll-area-viewport": "",
          ...n,
          ref: a,
          style: {
            /**
             * We don't support `visible` because the intention is to have at least one scrollbar
             * if this component is used and `visible` will behave like `auto` in that case
             * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
             *
             * We don't handle `auto` because the intention is for the native implementation
             * to be hidden if using this component. We just want to ensure the node is scrollable
             * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
             * the browser from having to work out whether to render native scrollbars or not,
             * we tell it to with the intention of hiding them in CSS.
             */
            overflowX: i.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: i.scrollbarYEnabled ? "scroll" : "hidden",
            ...e.style
          },
          children: /* @__PURE__ */ b("div", { ref: i.onContentChange, style: { minWidth: "100%", display: "table" }, children: c })
        }
      )
    ] });
  }
);
G.displayName = $;
var ue = l.memo(
  ({ nonce: e }) => /* @__PURE__ */ b(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: "[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}"
      },
      nonce: e
    }
  ),
  (e, t) => e.nonce === t.nonce
), g = "ScrollAreaScrollbar", fe = l.forwardRef(
  (e, t) => {
    const { forceMount: r, ...c } = e, o = v(g, e.__scopeScrollArea), { onScrollbarXEnabledChange: n, onScrollbarYEnabledChange: i } = o, s = e.orientation === "horizontal";
    return l.useEffect(() => (s ? n(!0) : i(!0), () => {
      s ? n(!1) : i(!1);
    }), [s, n, i]), o.type === "hover" ? /* @__PURE__ */ b(he, { ...c, ref: t, forceMount: r }) : o.type === "scroll" ? /* @__PURE__ */ b(be, { ...c, ref: t, forceMount: r }) : o.type === "auto" ? /* @__PURE__ */ b(J, { ...c, ref: t, forceMount: r }) : o.type === "always" ? /* @__PURE__ */ b(k, { ...c, ref: t, "data-state": "visible" }) : null;
  }
);
fe.displayName = g;
var he = l.forwardRef((e, t) => {
  const { forceMount: r, ...c } = e, o = v(g, e.__scopeScrollArea), [n, i] = l.useState(!1);
  return l.useEffect(() => {
    const s = o.scrollArea;
    let a = 0;
    if (s) {
      const f = () => {
        window.clearTimeout(a), i(!0);
      }, u = () => {
        a = window.setTimeout(() => i(!1), o.scrollHideDelay);
      };
      return s.addEventListener("pointerenter", f), s.addEventListener("pointerleave", u), () => {
        window.clearTimeout(a), s.removeEventListener("pointerenter", f), s.removeEventListener("pointerleave", u);
      };
    }
  }, [o.scrollArea, o.scrollHideDelay]), /* @__PURE__ */ b(I, { present: r || n, children: /* @__PURE__ */ b(
    J,
    {
      "data-state": n ? "visible" : "hidden",
      ...c,
      ref: t
    }
  ) });
}), be = l.forwardRef((e, t) => {
  const { forceMount: r, ...c } = e, o = v(g, e.__scopeScrollArea), n = e.orientation === "horizontal", i = Y(() => a("SCROLL_END"), 100), [s, a] = ae("hidden", {
    hidden: {
      SCROLL: "scrolling"
    },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: {
      SCROLL: "interacting",
      POINTER_LEAVE: "idle"
    },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  return l.useEffect(() => {
    if (s === "idle") {
      const f = window.setTimeout(() => a("HIDE"), o.scrollHideDelay);
      return () => window.clearTimeout(f);
    }
  }, [s, o.scrollHideDelay, a]), l.useEffect(() => {
    const f = o.viewport, u = n ? "scrollLeft" : "scrollTop";
    if (f) {
      let h = f[u];
      const d = () => {
        const S = f[u];
        h !== S && (a("SCROLL"), i()), h = S;
      };
      return f.addEventListener("scroll", d), () => f.removeEventListener("scroll", d);
    }
  }, [o.viewport, n, a, i]), /* @__PURE__ */ b(I, { present: r || s !== "hidden", children: /* @__PURE__ */ b(
    k,
    {
      "data-state": s === "hidden" ? "hidden" : "visible",
      ...c,
      ref: t,
      onPointerEnter: E(e.onPointerEnter, () => a("POINTER_ENTER")),
      onPointerLeave: E(e.onPointerLeave, () => a("POINTER_LEAVE"))
    }
  ) });
}), J = l.forwardRef((e, t) => {
  const r = v(g, e.__scopeScrollArea), { forceMount: c, ...o } = e, [n, i] = l.useState(!1), s = e.orientation === "horizontal", a = Y(() => {
    if (r.viewport) {
      const f = r.viewport.offsetWidth < r.viewport.scrollWidth, u = r.viewport.offsetHeight < r.viewport.scrollHeight;
      i(s ? f : u);
    }
  }, 10);
  return R(r.viewport, a), R(r.content, a), /* @__PURE__ */ b(I, { present: c || n, children: /* @__PURE__ */ b(
    k,
    {
      "data-state": n ? "visible" : "hidden",
      ...o,
      ref: t
    }
  ) });
}), k = l.forwardRef((e, t) => {
  const { orientation: r = "vertical", ...c } = e, o = v(g, e.__scopeScrollArea), n = l.useRef(null), i = l.useRef(0), [s, a] = l.useState({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  }), f = ee(s.viewport, s.content), u = {
    ...c,
    sizes: s,
    onSizesChange: a,
    hasThumb: f > 0 && f < 1,
    onThumbChange: (d) => n.current = d,
    onThumbPointerUp: () => i.current = 0,
    onThumbPointerDown: (d) => i.current = d
  };
  function h(d, S) {
    return Ce(d, i.current, s, S);
  }
  return r === "horizontal" ? /* @__PURE__ */ b(
    Se,
    {
      ...u,
      ref: t,
      onThumbPositionChange: () => {
        if (o.viewport && n.current) {
          const d = o.viewport.scrollLeft, S = F(d, s, o.dir);
          n.current.style.transform = `translate3d(${S}px, 0, 0)`;
        }
      },
      onWheelScroll: (d) => {
        o.viewport && (o.viewport.scrollLeft = d);
      },
      onDragScroll: (d) => {
        o.viewport && (o.viewport.scrollLeft = h(d, o.dir));
      }
    }
  ) : r === "vertical" ? /* @__PURE__ */ b(
    me,
    {
      ...u,
      ref: t,
      onThumbPositionChange: () => {
        if (o.viewport && n.current) {
          const d = o.viewport.scrollTop, S = F(d, s);
          n.current.style.transform = `translate3d(0, ${S}px, 0)`;
        }
      },
      onWheelScroll: (d) => {
        o.viewport && (o.viewport.scrollTop = d);
      },
      onDragScroll: (d) => {
        o.viewport && (o.viewport.scrollTop = h(d));
      }
    }
  ) : null;
}), Se = l.forwardRef((e, t) => {
  const { sizes: r, onSizesChange: c, ...o } = e, n = v(g, e.__scopeScrollArea), [i, s] = l.useState(), a = l.useRef(null), f = T(t, a, n.onScrollbarXChange);
  return l.useEffect(() => {
    a.current && s(getComputedStyle(a.current));
  }, [a]), /* @__PURE__ */ b(
    Q,
    {
      "data-orientation": "horizontal",
      ...o,
      ref: f,
      sizes: r,
      style: {
        bottom: 0,
        left: n.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
        right: n.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
        "--radix-scroll-area-thumb-width": X(r) + "px",
        ...e.style
      },
      onThumbPointerDown: (u) => e.onThumbPointerDown(u.x),
      onDragScroll: (u) => e.onDragScroll(u.x),
      onWheelScroll: (u, h) => {
        if (n.viewport) {
          const d = n.viewport.scrollLeft + u.deltaX;
          e.onWheelScroll(d), oe(d, h) && u.preventDefault();
        }
      },
      onResize: () => {
        a.current && n.viewport && i && c({
          content: n.viewport.scrollWidth,
          viewport: n.viewport.offsetWidth,
          scrollbar: {
            size: a.current.clientWidth,
            paddingStart: O(i.paddingLeft),
            paddingEnd: O(i.paddingRight)
          }
        });
      }
    }
  );
}), me = l.forwardRef((e, t) => {
  const { sizes: r, onSizesChange: c, ...o } = e, n = v(g, e.__scopeScrollArea), [i, s] = l.useState(), a = l.useRef(null), f = T(t, a, n.onScrollbarYChange);
  return l.useEffect(() => {
    a.current && s(getComputedStyle(a.current));
  }, [a]), /* @__PURE__ */ b(
    Q,
    {
      "data-orientation": "vertical",
      ...o,
      ref: f,
      sizes: r,
      style: {
        top: 0,
        right: n.dir === "ltr" ? 0 : void 0,
        left: n.dir === "rtl" ? 0 : void 0,
        bottom: "var(--radix-scroll-area-corner-height)",
        "--radix-scroll-area-thumb-height": X(r) + "px",
        ...e.style
      },
      onThumbPointerDown: (u) => e.onThumbPointerDown(u.y),
      onDragScroll: (u) => e.onDragScroll(u.y),
      onWheelScroll: (u, h) => {
        if (n.viewport) {
          const d = n.viewport.scrollTop + u.deltaY;
          e.onWheelScroll(d), oe(d, h) && u.preventDefault();
        }
      },
      onResize: () => {
        a.current && n.viewport && i && c({
          content: n.viewport.scrollHeight,
          viewport: n.viewport.offsetHeight,
          scrollbar: {
            size: a.current.clientHeight,
            paddingStart: O(i.paddingTop),
            paddingEnd: O(i.paddingBottom)
          }
        });
      }
    }
  );
}), [ve, K] = j(g), Q = l.forwardRef((e, t) => {
  const {
    __scopeScrollArea: r,
    sizes: c,
    hasThumb: o,
    onThumbChange: n,
    onThumbPointerUp: i,
    onThumbPointerDown: s,
    onThumbPositionChange: a,
    onDragScroll: f,
    onWheelScroll: u,
    onResize: h,
    ...d
  } = e, S = v(g, r), [w, A] = l.useState(null), M = T(t, A), C = l.useRef(null), L = l.useRef(""), U = S.viewport, _ = c.content - c.viewport, D = P(u), y = P(a), W = Y(h, 10);
  function H(m) {
    if (C.current) {
      const p = m.clientX - C.current.left, z = m.clientY - C.current.top;
      f({ x: p, y: z });
    }
  }
  return l.useEffect(() => {
    const m = (p) => {
      const z = p.target;
      w?.contains(z) && D(p, _);
    };
    return document.addEventListener("wheel", m, { passive: !1 }), () => document.removeEventListener("wheel", m, { passive: !1 });
  }, [U, w, _, D]), l.useEffect(y, [c, y]), R(w, W), R(S.content, W), /* @__PURE__ */ b(
    ve,
    {
      scope: r,
      scrollbar: w,
      hasThumb: o,
      onThumbChange: P(n),
      onThumbPointerUp: P(i),
      onThumbPositionChange: y,
      onThumbPointerDown: P(s),
      children: /* @__PURE__ */ b(
        x.div,
        {
          ...d,
          ref: M,
          style: { position: "absolute", ...d.style },
          onPointerDown: E(e.onPointerDown, (m) => {
            m.button === 0 && (m.target.setPointerCapture(m.pointerId), C.current = w.getBoundingClientRect(), L.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", S.viewport && (S.viewport.style.scrollBehavior = "auto"), H(m));
          }),
          onPointerMove: E(e.onPointerMove, H),
          onPointerUp: E(e.onPointerUp, (m) => {
            const p = m.target;
            p.hasPointerCapture(m.pointerId) && p.releasePointerCapture(m.pointerId), document.body.style.webkitUserSelect = L.current, S.viewport && (S.viewport.style.scrollBehavior = ""), C.current = null;
          })
        }
      )
    }
  );
}), N = "ScrollAreaThumb", pe = l.forwardRef(
  (e, t) => {
    const { forceMount: r, ...c } = e, o = K(N, e.__scopeScrollArea);
    return /* @__PURE__ */ b(I, { present: r || o.hasThumb, children: /* @__PURE__ */ b(we, { ref: t, ...c }) });
  }
), we = l.forwardRef(
  (e, t) => {
    const { __scopeScrollArea: r, style: c, ...o } = e, n = v(N, r), i = K(N, r), { onThumbPositionChange: s } = i, a = T(t, i.onThumbChange), f = l.useRef(void 0), u = Y(() => {
      f.current && (f.current(), f.current = void 0);
    }, 100);
    return l.useEffect(() => {
      const h = n.viewport;
      if (h) {
        const d = () => {
          if (u(), !f.current) {
            const S = Pe(h, s);
            f.current = S, s();
          }
        };
        return s(), h.addEventListener("scroll", d), () => h.removeEventListener("scroll", d);
      }
    }, [n.viewport, u, s]), /* @__PURE__ */ b(
      x.div,
      {
        "data-state": i.hasThumb ? "visible" : "hidden",
        ...o,
        ref: a,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...c
        },
        onPointerDownCapture: E(e.onPointerDownCapture, (h) => {
          const S = h.target.getBoundingClientRect(), w = h.clientX - S.left, A = h.clientY - S.top;
          i.onThumbPointerDown({ x: w, y: A });
        }),
        onPointerUp: E(e.onPointerUp, i.onThumbPointerUp)
      }
    );
  }
);
pe.displayName = N;
var B = "ScrollAreaCorner", Z = l.forwardRef(
  (e, t) => {
    const r = v(B, e.__scopeScrollArea), c = !!(r.scrollbarX && r.scrollbarY);
    return r.type !== "scroll" && c ? /* @__PURE__ */ b(ge, { ...e, ref: t }) : null;
  }
);
Z.displayName = B;
var ge = l.forwardRef((e, t) => {
  const { __scopeScrollArea: r, ...c } = e, o = v(B, r), [n, i] = l.useState(0), [s, a] = l.useState(0), f = !!(n && s), { onCornerWidthChange: u, onCornerHeightChange: h } = o;
  return R(o.scrollbarX, () => {
    const d = o.scrollbarX?.offsetHeight || 0;
    o.onCornerHeightChange(d), a(d);
  }), R(o.scrollbarY, () => {
    const d = o.scrollbarY?.offsetWidth || 0;
    o.onCornerWidthChange(d), i(d);
  }), l.useEffect(() => () => {
    u(0), h(0);
  }, [u, h]), f ? /* @__PURE__ */ b(
    x.div,
    {
      ...c,
      ref: t,
      style: {
        width: n,
        height: s,
        position: "absolute",
        right: o.dir === "ltr" ? 0 : void 0,
        left: o.dir === "rtl" ? 0 : void 0,
        bottom: 0,
        ...e.style
      }
    }
  ) : null;
});
function O(e) {
  return e ? parseInt(e, 10) : 0;
}
function ee(e, t) {
  const r = e / t;
  return isNaN(r) ? 0 : r;
}
function X(e) {
  const t = ee(e.viewport, e.content), r = e.scrollbar.paddingStart + e.scrollbar.paddingEnd, c = (e.scrollbar.size - r) * t;
  return Math.max(c, 18);
}
function Ce(e, t, r, c = "ltr") {
  const o = X(r), n = o / 2, i = t || n, s = o - i, a = r.scrollbar.paddingStart + i, f = r.scrollbar.size - r.scrollbar.paddingEnd - s, u = r.content - r.viewport, h = c === "ltr" ? [0, u] : [u * -1, 0];
  return re([a, f], h)(e);
}
function F(e, t, r = "ltr") {
  const c = X(t), o = t.scrollbar.paddingStart + t.scrollbar.paddingEnd, n = t.scrollbar.size - o, i = t.content - t.viewport, s = n - c, a = r === "ltr" ? [0, i] : [i * -1, 0], f = ce(e, a);
  return re([0, i], [0, s])(f);
}
function re(e, t) {
  return (r) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const c = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + c * (r - e[0]);
  };
}
function oe(e, t) {
  return e > 0 && e < t;
}
var Pe = (e, t = () => {
}) => {
  let r = { left: e.scrollLeft, top: e.scrollTop }, c = 0;
  return (function o() {
    const n = { left: e.scrollLeft, top: e.scrollTop }, i = r.left !== n.left, s = r.top !== n.top;
    (i || s) && t(), r = n, c = window.requestAnimationFrame(o);
  })(), () => window.cancelAnimationFrame(c);
};
function Y(e, t) {
  const r = P(e), c = l.useRef(0);
  return l.useEffect(() => () => window.clearTimeout(c.current), []), l.useCallback(() => {
    window.clearTimeout(c.current), c.current = window.setTimeout(r, t);
  }, [r, t]);
}
function R(e, t) {
  const r = P(t);
  le(() => {
    let c = 0;
    if (e) {
      const o = new ResizeObserver(() => {
        cancelAnimationFrame(c), c = window.requestAnimationFrame(r);
      });
      return o.observe(e), () => {
        window.cancelAnimationFrame(c), o.unobserve(e);
      };
    }
  }, [e, r]);
}
var ze = q, Ne = G, Oe = Z;
export {
  Oe as Corner,
  ze as Root,
  q as ScrollArea,
  Z as ScrollAreaCorner,
  fe as ScrollAreaScrollbar,
  pe as ScrollAreaThumb,
  G as ScrollAreaViewport,
  Ne as Viewport
};
//# sourceMappingURL=index164.js.map
