import { isServer as g, createComponent as m, mergeProps as U, memo as se, Portal as le } from "solid-js/web";
import { PopperArrow as q, Popper as G } from "./index154.js";
import { DismissableLayer as ae } from "./index168.js";
import { createDisclosureState as ce } from "./index170.js";
import { createRegisterId as pe } from "./index173.js";
import { Polymorphic as ue } from "./index175.js";
import { __export as fe } from "./index159.js";
import { mergeDefaultProps as X, getDocument as B, getWindow as de, createGenerateId as ge, isPointInPolygon as me, getEventPoint as he, contains as _, callHandler as b } from "./index160.js";
import { createUniqueId as Te, splitProps as $, createSignal as x, createEffect as H, onCleanup as E, createMemo as ve, createContext as we, Show as Y, useContext as Pe } from "solid-js";
import ye from "./index177.js";
import { mergeRefs as z } from "./index161.js";
import { combineStyle as be } from "./index179.js";
var De = {};
fe(De, {
  Arrow: () => q,
  Content: () => K,
  Portal: () => N,
  Root: () => Q,
  Tooltip: () => ke,
  Trigger: () => V,
  useTooltipContext: () => I
});
var J = we();
function I() {
  const p = Pe(J);
  if (p === void 0)
    throw new Error("[kobalte]: `useTooltipContext` must be used within a `Tooltip` component");
  return p;
}
function K(p) {
  const s = I(), n = X({
    id: s.generateId("content")
  }, p), [a, o] = $(n, ["ref", "style"]);
  return H(() => E(s.registerContentId(o.id))), m(Y, {
    get when() {
      return s.contentPresent();
    },
    get children() {
      return m(G.Positioner, {
        get children() {
          return m(ae, U({
            ref(t) {
              var e = z((l) => {
                s.setContentRef(l);
              }, a.ref);
              typeof e == "function" && e(t);
            },
            role: "tooltip",
            disableOutsidePointerEvents: !1,
            get style() {
              return be({
                "--kb-tooltip-content-transform-origin": "var(--kb-popper-content-transform-origin)",
                position: "relative"
              }, a.style);
            },
            onFocusOutside: (t) => t.preventDefault(),
            onDismiss: () => s.hideTooltip(!0)
          }, () => s.dataset(), o));
        }
      });
    }
  });
}
function N(p) {
  const s = I();
  return m(Y, {
    get when() {
      return s.contentPresent();
    },
    get children() {
      return m(le, p);
    }
  });
}
function Oe(p, s, n) {
  const a = p.split("-")[0], o = s.getBoundingClientRect(), t = n.getBoundingClientRect(), e = [], l = o.left + o.width / 2, u = o.top + o.height / 2;
  switch (a) {
    case "top":
      e.push([o.left, u]), e.push([t.left, t.bottom]), e.push([t.left, t.top]), e.push([t.right, t.top]), e.push([t.right, t.bottom]), e.push([o.right, u]);
      break;
    case "right":
      e.push([l, o.top]), e.push([t.left, t.top]), e.push([t.right, t.top]), e.push([t.right, t.bottom]), e.push([t.left, t.bottom]), e.push([l, o.bottom]);
      break;
    case "bottom":
      e.push([o.left, u]), e.push([t.left, t.top]), e.push([t.left, t.bottom]), e.push([t.right, t.bottom]), e.push([t.right, t.top]), e.push([o.right, u]);
      break;
    case "left":
      e.push([l, o.top]), e.push([t.right, t.top]), e.push([t.left, t.top]), e.push([t.left, t.bottom]), e.push([t.right, t.bottom]), e.push([l, o.bottom]);
      break;
  }
  return e;
}
var P = {}, Ce = 0, D = !1, f, k, O;
function Q(p) {
  const s = `tooltip-${Te()}`, n = `${++Ce}`, a = X({
    id: s,
    openDelay: 700,
    closeDelay: 300,
    skipDelayDuration: 300
  }, p), [o, t] = $(a, ["id", "open", "defaultOpen", "onOpenChange", "disabled", "triggerOnFocusOnly", "openDelay", "closeDelay", "skipDelayDuration", "ignoreSafeArea", "forceMount"]);
  let e;
  const [l, u] = x(), [h, C] = x(), [y, R] = x(), [S, L] = x(t.placement), c = ce({
    open: () => o.open,
    defaultOpen: () => o.defaultOpen,
    onOpenChange: (r) => o.onOpenChange?.(r)
  }), {
    present: F
  } = ye({
    show: () => o.forceMount || c.isOpen(),
    element: () => y() ?? null
  }), i = () => {
    P[n] = v;
  }, T = () => {
    for (const r in P)
      r !== n && (P[r](!0), delete P[r]);
  }, v = (r = !1) => {
    g || (r || o.closeDelay && o.closeDelay <= 0 ? (window.clearTimeout(e), e = void 0, c.close()) : e || (e = window.setTimeout(() => {
      e = void 0, c.close();
    }, o.closeDelay)), window.clearTimeout(f), f = void 0, o.skipDelayDuration && o.skipDelayDuration >= 0 && (O = window.setTimeout(() => {
      window.clearTimeout(O), O = void 0;
    }, o.skipDelayDuration)), D && (window.clearTimeout(k), k = window.setTimeout(() => {
      delete P[n], k = void 0, D = !1;
    }, o.closeDelay)));
  }, A = () => {
    g || (clearTimeout(e), e = void 0, T(), i(), D = !0, c.open(), window.clearTimeout(f), f = void 0, window.clearTimeout(k), k = void 0, window.clearTimeout(O), O = void 0);
  }, Z = () => {
    g || (T(), i(), !c.isOpen() && !f && !D ? f = window.setTimeout(() => {
      f = void 0, D = !0, A();
    }, o.openDelay) : c.isOpen() || A());
  }, ee = (r = !1) => {
    g || (!r && o.openDelay && o.openDelay > 0 && !e && !O ? Z() : A());
  }, te = () => {
    g || (window.clearTimeout(f), f = void 0, D = !1);
  }, M = () => {
    g || (window.clearTimeout(e), e = void 0);
  }, W = (r) => _(h(), r) || _(y(), r), oe = (r) => {
    const w = h(), d = y();
    if (!(!w || !d))
      return Oe(r, w, d);
  }, j = (r) => {
    const w = r.target;
    if (W(w)) {
      M();
      return;
    }
    if (!o.ignoreSafeArea) {
      const d = oe(S());
      if (d && me(he(r), d)) {
        M();
        return;
      }
    }
    e || v();
  };
  H(() => {
    if (g || !c.isOpen())
      return;
    const r = B();
    r.addEventListener("pointermove", j, !0), E(() => {
      r.removeEventListener("pointermove", j, !0);
    });
  }), H(() => {
    const r = h();
    if (!r || !c.isOpen())
      return;
    const w = (re) => {
      const ie = re.target;
      _(ie, r) && v(!0);
    }, d = de();
    d.addEventListener("scroll", w, {
      capture: !0
    }), E(() => {
      d.removeEventListener("scroll", w, {
        capture: !0
      });
    });
  }), E(() => {
    clearTimeout(e), P[n] && delete P[n];
  });
  const ne = {
    dataset: ve(() => ({
      "data-expanded": c.isOpen() ? "" : void 0,
      "data-closed": c.isOpen() ? void 0 : ""
    })),
    isOpen: c.isOpen,
    isDisabled: () => o.disabled ?? !1,
    triggerOnFocusOnly: () => o.triggerOnFocusOnly ?? !1,
    contentId: l,
    contentPresent: F,
    openTooltip: ee,
    hideTooltip: v,
    cancelOpening: te,
    generateId: ge(() => a.id),
    registerContentId: pe(u),
    isTargetOnTooltip: W,
    setTriggerRef: C,
    setContentRef: R
  };
  return m(J.Provider, {
    value: ne,
    get children() {
      return m(G, U({
        anchorRef: h,
        contentRef: y,
        onCurrentPlacementChange: L
      }, t));
    }
  });
}
function V(p) {
  let s;
  const n = I(), [a, o] = $(p, ["ref", "onPointerEnter", "onPointerLeave", "onPointerDown", "onClick", "onFocus", "onBlur"]);
  let t = !1, e = !1, l = !1;
  const u = () => {
    t = !1;
  }, h = () => {
    !n.isOpen() && (e || l) && n.openTooltip(l);
  }, C = (i) => {
    n.isOpen() && !e && !l && n.hideTooltip(i);
  }, y = (i) => {
    b(i, a.onPointerEnter), !(i.pointerType === "touch" || n.triggerOnFocusOnly() || n.isDisabled() || i.defaultPrevented) && (e = !0, h());
  }, R = (i) => {
    b(i, a.onPointerLeave), i.pointerType !== "touch" && (e = !1, l = !1, n.isOpen() ? C() : n.cancelOpening());
  }, S = (i) => {
    b(i, a.onPointerDown), t = !0, B(s).addEventListener("pointerup", u, {
      once: !0
    });
  }, L = (i) => {
    b(i, a.onClick), e = !1, l = !1, C(!0);
  }, c = (i) => {
    b(i, a.onFocus), !(n.isDisabled() || i.defaultPrevented || t) && (l = !0, h());
  }, F = (i) => {
    b(i, a.onBlur);
    const T = i.relatedTarget;
    n.isTargetOnTooltip(T) || (e = !1, l = !1, C(!0));
  };
  return E(() => {
    g || B(s).removeEventListener("pointerup", u);
  }), m(ue, U({
    as: "button",
    ref(i) {
      var T = z((v) => {
        n.setTriggerRef(v), s = v;
      }, a.ref);
      typeof T == "function" && T(i);
    },
    get "aria-describedby"() {
      return se(() => !!n.isOpen())() ? n.contentId() : void 0;
    },
    onPointerEnter: y,
    onPointerLeave: R,
    onPointerDown: S,
    onClick: L,
    onFocus: c,
    onBlur: F
  }, () => n.dataset(), o));
}
var ke = Object.assign(Q, {
  Arrow: q,
  Content: K,
  Portal: N,
  Trigger: V
});
export {
  ke as Tooltip,
  K as TooltipContent,
  N as TooltipPortal,
  Q as TooltipRoot,
  V as TooltipTrigger,
  De as tooltip_exports,
  I as useTooltipContext
};
//# sourceMappingURL=index122.js.map
