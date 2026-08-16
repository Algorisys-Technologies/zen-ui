import * as s from "react";
import { composeEventHandlers as x } from "./index191.js";
import { useComposedRefs as H } from "./index192.js";
import { createContextScope as W } from "./index193.js";
import { DismissableLayer as $ } from "./index194.js";
import { useId as z } from "./index197.js";
import { Root as J, Anchor as Q, createPopperScope as S, Arrow as Z, Content as ee } from "./index198.js";
import { Portal as te } from "./index199.js";
import { Presence as G } from "./index200.js";
import { Primitive as oe } from "./index201.js";
import { createSlottable as re } from "./index152.js";
import { useControllableState as ne } from "./index202.js";
import { Root as se } from "./index206.js";
import { jsx as f, jsxs as ie } from "react/jsx-runtime";
var [O] = W("Tooltip", [
  S
]), A = S(), j = "TooltipProvider", ae = 700, D = "tooltip.open", [ce, k] = O(j), F = (t) => {
  const {
    __scopeTooltip: o,
    delayDuration: e = ae,
    skipDelayDuration: r = 300,
    disableHoverableContent: n = !1,
    children: c
  } = t, a = s.useRef(!0), h = s.useRef(!1), i = s.useRef(0);
  return s.useEffect(() => {
    const u = i.current;
    return () => window.clearTimeout(u);
  }, []), /* @__PURE__ */ f(
    ce,
    {
      scope: o,
      isOpenDelayedRef: a,
      delayDuration: e,
      onOpen: s.useCallback(() => {
        r <= 0 || (window.clearTimeout(i.current), a.current = !1);
      }, [r]),
      onClose: s.useCallback(() => {
        r <= 0 || (window.clearTimeout(i.current), i.current = window.setTimeout(
          () => a.current = !0,
          r
        ));
      }, [r]),
      isPointerInTransitRef: h,
      onPointerInTransitChange: s.useCallback((u) => {
        h.current = u;
      }, []),
      disableHoverableContent: n,
      children: c
    }
  );
};
F.displayName = j;
var R = "Tooltip", [le, _] = O(R), B = (t) => {
  const {
    __scopeTooltip: o,
    children: e,
    open: r,
    defaultOpen: n,
    onOpenChange: c,
    disableHoverableContent: a,
    delayDuration: h
  } = t, i = k(R, t.__scopeTooltip), u = A(o), [l, p] = s.useState(null), v = z(), d = s.useRef(0), m = a ?? i.disableHoverableContent, C = h ?? i.delayDuration, T = s.useRef(!1), [g, y] = ne({
    prop: r,
    defaultProp: n ?? !1,
    onChange: (N) => {
      N ? (i.onOpen(), document.dispatchEvent(new CustomEvent(D))) : i.onClose(), c?.(N);
    },
    caller: R
  }), w = s.useMemo(() => g ? T.current ? "delayed-open" : "instant-open" : "closed", [g]), P = s.useCallback(() => {
    window.clearTimeout(d.current), d.current = 0, T.current = !1, y(!0);
  }, [y]), E = s.useCallback(() => {
    window.clearTimeout(d.current), d.current = 0, y(!1);
  }, [y]), I = s.useCallback(() => {
    window.clearTimeout(d.current), d.current = window.setTimeout(() => {
      T.current = !0, y(!0), d.current = 0;
    }, C);
  }, [C, y]);
  return s.useEffect(() => () => {
    d.current && (window.clearTimeout(d.current), d.current = 0);
  }, []), /* @__PURE__ */ f(J, { ...u, children: /* @__PURE__ */ f(
    le,
    {
      scope: o,
      contentId: v,
      open: g,
      stateAttribute: w,
      trigger: l,
      onTriggerChange: p,
      onTriggerEnter: s.useCallback(() => {
        i.isOpenDelayedRef.current ? I() : P();
      }, [i.isOpenDelayedRef, I, P]),
      onTriggerLeave: s.useCallback(() => {
        m ? E() : (window.clearTimeout(d.current), d.current = 0);
      }, [E, m]),
      onOpen: P,
      onClose: E,
      disableHoverableContent: m,
      children: e
    }
  ) });
};
B.displayName = R;
var L = "TooltipTrigger", U = s.forwardRef(
  (t, o) => {
    const { __scopeTooltip: e, ...r } = t, n = _(L, e), c = k(L, e), a = A(e), h = s.useRef(null), i = H(o, h, n.onTriggerChange), u = s.useRef(!1), l = s.useRef(!1), p = s.useCallback(() => u.current = !1, []);
    return s.useEffect(() => () => document.removeEventListener("pointerup", p), [p]), /* @__PURE__ */ f(Q, { asChild: !0, ...a, children: /* @__PURE__ */ f(
      oe.button,
      {
        "aria-describedby": n.open ? n.contentId : void 0,
        "data-state": n.stateAttribute,
        ...r,
        ref: i,
        onPointerMove: x(t.onPointerMove, (v) => {
          v.pointerType !== "touch" && !l.current && !c.isPointerInTransitRef.current && (n.onTriggerEnter(), l.current = !0);
        }),
        onPointerLeave: x(t.onPointerLeave, () => {
          n.onTriggerLeave(), l.current = !1;
        }),
        onPointerDown: x(t.onPointerDown, () => {
          n.open && n.onClose(), u.current = !0, document.addEventListener("pointerup", p, { once: !0 });
        }),
        onFocus: x(t.onFocus, () => {
          u.current || n.onOpen();
        }),
        onBlur: x(t.onBlur, n.onClose),
        onClick: x(t.onClick, n.onClose)
      }
    ) });
  }
);
U.displayName = L;
var M = "TooltipPortal", [ue, pe] = O(M, {
  forceMount: void 0
}), V = (t) => {
  const { __scopeTooltip: o, forceMount: e, children: r, container: n } = t, c = _(M, o);
  return /* @__PURE__ */ f(ue, { scope: o, forceMount: e, children: /* @__PURE__ */ f(G, { present: e || c.open, children: /* @__PURE__ */ f(te, { asChild: !0, container: n, children: r }) }) });
};
V.displayName = M;
var b = "TooltipContent", Y = s.forwardRef(
  (t, o) => {
    const e = pe(b, t.__scopeTooltip), { forceMount: r = e.forceMount, side: n = "top", ...c } = t, a = _(b, t.__scopeTooltip);
    return /* @__PURE__ */ f(G, { present: r || a.open, children: a.disableHoverableContent ? /* @__PURE__ */ f(q, { side: n, ...c, ref: o }) : /* @__PURE__ */ f(de, { side: n, ...c, ref: o }) });
  }
), de = s.forwardRef((t, o) => {
  const e = _(b, t.__scopeTooltip), r = k(b, t.__scopeTooltip), n = s.useRef(null), c = H(o, n), [a, h] = s.useState(null), { trigger: i, onClose: u } = e, l = n.current, { onPointerInTransitChange: p } = r, v = s.useCallback(() => {
    h(null), p(!1);
  }, [p]), d = s.useCallback(
    (m, C) => {
      const T = m.currentTarget, g = { x: m.clientX, y: m.clientY }, y = me(g, T.getBoundingClientRect()), w = Te(g, y), P = Ce(C.getBoundingClientRect()), E = ge([...w, ...P]);
      h(E), p(!0);
    },
    [p]
  );
  return s.useEffect(() => () => v(), [v]), s.useEffect(() => {
    if (i && l) {
      const m = (T) => d(T, l), C = (T) => d(T, i);
      return i.addEventListener("pointerleave", m), l.addEventListener("pointerleave", C), () => {
        i.removeEventListener("pointerleave", m), l.removeEventListener("pointerleave", C);
      };
    }
  }, [i, l, d, v]), s.useEffect(() => {
    if (a) {
      const m = (C) => {
        const T = C.target, g = { x: C.clientX, y: C.clientY }, y = i?.contains(T) || l?.contains(T), w = !ye(g, a);
        y ? v() : w && (v(), u());
      };
      return document.addEventListener("pointermove", m), () => document.removeEventListener("pointermove", m);
    }
  }, [i, l, a, u, v]), /* @__PURE__ */ f(q, { ...t, ref: c });
}), [fe, ve] = O(R, { isInside: !1 }), he = re("TooltipContent"), q = s.forwardRef(
  (t, o) => {
    const {
      __scopeTooltip: e,
      children: r,
      "aria-label": n,
      onEscapeKeyDown: c,
      onPointerDownOutside: a,
      ...h
    } = t, i = _(b, e), u = A(e), { onClose: l } = i;
    return s.useEffect(() => (document.addEventListener(D, l), () => document.removeEventListener(D, l)), [l]), s.useEffect(() => {
      if (i.trigger) {
        const p = (v) => {
          v.target instanceof Node && v.target.contains(i.trigger) && l();
        };
        return window.addEventListener("scroll", p, { capture: !0 }), () => window.removeEventListener("scroll", p, { capture: !0 });
      }
    }, [i.trigger, l]), /* @__PURE__ */ f(
      $,
      {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: c,
        onPointerDownOutside: a,
        onFocusOutside: (p) => p.preventDefault(),
        onDismiss: l,
        children: /* @__PURE__ */ ie(
          ee,
          {
            "data-state": i.stateAttribute,
            ...u,
            ...h,
            ref: o,
            style: {
              ...h.style,
              "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
              "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
              "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
            },
            children: [
              /* @__PURE__ */ f(he, { children: r }),
              /* @__PURE__ */ f(fe, { scope: e, isInside: !0, children: /* @__PURE__ */ f(se, { id: i.contentId, role: "tooltip", children: n || r }) })
            ]
          }
        )
      }
    );
  }
);
Y.displayName = b;
var X = "TooltipArrow", K = s.forwardRef(
  (t, o) => {
    const { __scopeTooltip: e, ...r } = t, n = A(e);
    return ve(
      X,
      e
    ).isInside ? null : /* @__PURE__ */ f(Z, { ...n, ...r, ref: o });
  }
);
K.displayName = X;
function me(t, o) {
  const e = Math.abs(o.top - t.y), r = Math.abs(o.bottom - t.y), n = Math.abs(o.right - t.x), c = Math.abs(o.left - t.x);
  switch (Math.min(e, r, n, c)) {
    case c:
      return "left";
    case n:
      return "right";
    case e:
      return "top";
    case r:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function Te(t, o, e = 5) {
  const r = [];
  switch (o) {
    case "top":
      r.push(
        { x: t.x - e, y: t.y + e },
        { x: t.x + e, y: t.y + e }
      );
      break;
    case "bottom":
      r.push(
        { x: t.x - e, y: t.y - e },
        { x: t.x + e, y: t.y - e }
      );
      break;
    case "left":
      r.push(
        { x: t.x + e, y: t.y - e },
        { x: t.x + e, y: t.y + e }
      );
      break;
    case "right":
      r.push(
        { x: t.x - e, y: t.y - e },
        { x: t.x - e, y: t.y + e }
      );
      break;
  }
  return r;
}
function Ce(t) {
  const { top: o, right: e, bottom: r, left: n } = t;
  return [
    { x: n, y: o },
    { x: e, y: o },
    { x: e, y: r },
    { x: n, y: r }
  ];
}
function ye(t, o) {
  const { x: e, y: r } = t;
  let n = !1;
  for (let c = 0, a = o.length - 1; c < o.length; a = c++) {
    const h = o[c], i = o[a], u = h.x, l = h.y, p = i.x, v = i.y;
    l > r != v > r && e < (p - u) * (r - l) / (v - l) + u && (n = !n);
  }
  return n;
}
function ge(t) {
  const o = t.slice();
  return o.sort((e, r) => e.x < r.x ? -1 : e.x > r.x ? 1 : e.y < r.y ? -1 : e.y > r.y ? 1 : 0), xe(o);
}
function xe(t) {
  if (t.length <= 1) return t.slice();
  const o = [];
  for (let r = 0; r < t.length; r++) {
    const n = t[r];
    for (; o.length >= 2; ) {
      const c = o[o.length - 1], a = o[o.length - 2];
      if ((c.x - a.x) * (n.y - a.y) >= (c.y - a.y) * (n.x - a.x)) o.pop();
      else break;
    }
    o.push(n);
  }
  o.pop();
  const e = [];
  for (let r = t.length - 1; r >= 0; r--) {
    const n = t[r];
    for (; e.length >= 2; ) {
      const c = e[e.length - 1], a = e[e.length - 2];
      if ((c.x - a.x) * (n.y - a.y) >= (c.y - a.y) * (n.x - a.x)) e.pop();
      else break;
    }
    e.push(n);
  }
  return e.pop(), o.length === 1 && e.length === 1 && o[0].x === e[0].x && o[0].y === e[0].y ? o : o.concat(e);
}
var Ne = F, He = B, Se = U, Ge = V, je = Y, Fe = K;
export {
  Fe as Arrow,
  je as Content,
  Ge as Portal,
  Ne as Provider,
  He as Root,
  B as Tooltip,
  K as TooltipArrow,
  Y as TooltipContent,
  V as TooltipPortal,
  F as TooltipProvider,
  U as TooltipTrigger,
  Se as Trigger
};
//# sourceMappingURL=index167.js.map
