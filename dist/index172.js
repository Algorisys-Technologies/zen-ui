import * as n from "react";
import * as Pe from "react-dom";
import { composeEventHandlers as R } from "./index191.js";
import { useComposedRefs as oe } from "./index192.js";
import { createCollection as Ce } from "./index217.js";
import { createContextScope as xe } from "./index193.js";
import { Branch as he, Root as Re } from "./index194.js";
import { Portal as be } from "./index199.js";
import { Presence as ge } from "./index200.js";
import { Primitive as I, dispatchDiscreteCustomEvent as Se } from "./index201.js";
import { useCallbackRef as U } from "./index207.js";
import { useControllableState as Ie } from "./index202.js";
import { useLayoutEffect as Ae } from "./index208.js";
import { VisuallyHidden as re } from "./index206.js";
import { jsx as l, jsxs as z, Fragment as ne } from "react/jsx-runtime";
var G = "ToastProvider", [J, Fe, _e] = Ce("Toast"), [se] = xe("Toast", [_e]), [De, X] = se(G), ae = (e) => {
  const {
    __scopeToast: o,
    label: r = "Notification",
    duration: t = 5e3,
    swipeDirection: c = "right",
    swipeThreshold: d = 50,
    announcerContainer: p,
    children: v
  } = e, [T, i] = n.useState(null), [h, w] = n.useState(0), A = n.useRef(!1), F = n.useRef(!1);
  return r.trim() || console.error(
    `Invalid prop \`label\` supplied to \`${G}\`. Expected non-empty \`string\`.`
  ), /* @__PURE__ */ l(J.Provider, { scope: o, children: /* @__PURE__ */ l(
    De,
    {
      scope: o,
      label: r,
      duration: t,
      swipeDirection: c,
      swipeThreshold: d,
      toastCount: h,
      viewport: T,
      onViewportChange: i,
      onToastAdd: n.useCallback(() => w((x) => x + 1), []),
      onToastRemove: n.useCallback(() => w((x) => x - 1), []),
      isFocusedToastEscapeKeyDownRef: A,
      isClosePausedRef: F,
      announcerContainer: p,
      children: v
    }
  ) });
};
ae.displayName = G;
var ie = "ToastViewport", Ne = ["F8"], B = "toast.viewportPause", j = "toast.viewportResume", ce = n.forwardRef(
  (e, o) => {
    const {
      __scopeToast: r,
      hotkey: t = Ne,
      label: c = "Notifications ({hotkey})",
      ...d
    } = e, p = X(ie, r), v = Fe(r), T = n.useRef(null), i = n.useRef(null), h = n.useRef(null), w = n.useRef(null), A = oe(o, w, p.onViewportChange), F = t.join("+").replace(/Key/g, "").replace(/Digit/g, ""), x = p.toastCount > 0;
    n.useEffect(() => {
      const s = (y) => {
        t.length !== 0 && t.every((m) => y[m] || y.code === m) && w.current?.focus();
      };
      return document.addEventListener("keydown", s), () => document.removeEventListener("keydown", s);
    }, [t]), n.useEffect(() => {
      const s = T.current, y = w.current;
      if (x && s && y) {
        const f = () => {
          if (!p.isClosePausedRef.current) {
            const E = new CustomEvent(B);
            y.dispatchEvent(E), p.isClosePausedRef.current = !0;
          }
        }, m = () => {
          if (p.isClosePausedRef.current) {
            const E = new CustomEvent(j);
            y.dispatchEvent(E), p.isClosePausedRef.current = !1;
          }
        }, P = (E) => {
          !s.contains(E.relatedTarget) && m();
        }, C = () => {
          s.contains(document.activeElement) || m();
        };
        return s.addEventListener("focusin", f), s.addEventListener("focusout", P), s.addEventListener("pointermove", f), s.addEventListener("pointerleave", C), window.addEventListener("blur", f), window.addEventListener("focus", m), () => {
          s.removeEventListener("focusin", f), s.removeEventListener("focusout", P), s.removeEventListener("pointermove", f), s.removeEventListener("pointerleave", C), window.removeEventListener("blur", f), window.removeEventListener("focus", m);
        };
      }
    }, [x, p.isClosePausedRef]);
    const u = n.useCallback(
      ({ tabbingDirection: s }) => {
        const f = v().map((m) => {
          const P = m.ref.current, C = [P, ...Be(P)];
          return s === "forwards" ? C : C.reverse();
        });
        return (s === "forwards" ? f.reverse() : f).flat();
      },
      [v]
    );
    return n.useEffect(() => {
      const s = w.current;
      if (s) {
        const y = (f) => {
          const m = f.altKey || f.ctrlKey || f.metaKey;
          if (f.key === "Tab" && !m) {
            const C = document.activeElement, E = f.shiftKey;
            if (f.target === s && E) {
              i.current?.focus();
              return;
            }
            const N = u({ tabbingDirection: E ? "backwards" : "forwards" }), k = N.findIndex((S) => S === C);
            $(N.slice(k + 1)) ? f.preventDefault() : E ? i.current?.focus() : h.current?.focus();
          }
        };
        return s.addEventListener("keydown", y), () => s.removeEventListener("keydown", y);
      }
    }, [v, u]), /* @__PURE__ */ z(
      he,
      {
        ref: T,
        role: "region",
        "aria-label": c.replace("{hotkey}", F),
        tabIndex: -1,
        style: { pointerEvents: x ? void 0 : "none" },
        children: [
          x && /* @__PURE__ */ l(
            q,
            {
              ref: i,
              onFocusFromOutsideViewport: () => {
                const s = u({
                  tabbingDirection: "forwards"
                });
                $(s);
              }
            }
          ),
          /* @__PURE__ */ l(J.Slot, { scope: r, children: /* @__PURE__ */ l(I.ol, { tabIndex: -1, ...d, ref: A }) }),
          x && /* @__PURE__ */ l(
            q,
            {
              ref: h,
              onFocusFromOutsideViewport: () => {
                const s = u({
                  tabbingDirection: "backwards"
                });
                $(s);
              }
            }
          )
        ]
      }
    );
  }
);
ce.displayName = ie;
var ue = "ToastFocusProxy", q = n.forwardRef(
  (e, o) => {
    const { __scopeToast: r, onFocusFromOutsideViewport: t, ...c } = e, d = X(ue, r);
    return /* @__PURE__ */ l(
      re,
      {
        tabIndex: 0,
        ...c,
        ref: o,
        style: { position: "fixed" },
        onFocus: (p) => {
          const v = p.relatedTarget;
          !d.viewport?.contains(v) && t();
        }
      }
    );
  }
);
q.displayName = ue;
var O = "Toast", Le = "toast.swipeStart", Me = "toast.swipeMove", Oe = "toast.swipeCancel", ke = "toast.swipeEnd", le = n.forwardRef(
  (e, o) => {
    const { forceMount: r, open: t, defaultOpen: c, onOpenChange: d, ...p } = e, [v, T] = Ie({
      prop: t,
      defaultProp: c ?? !0,
      onChange: d,
      caller: O
    });
    return /* @__PURE__ */ l(ge, { present: r || v, children: /* @__PURE__ */ l(
      He,
      {
        open: v,
        ...p,
        ref: o,
        onClose: () => T(!1),
        onPause: U(e.onPause),
        onResume: U(e.onResume),
        onSwipeStart: R(e.onSwipeStart, (i) => {
          i.currentTarget.setAttribute("data-swipe", "start");
        }),
        onSwipeMove: R(e.onSwipeMove, (i) => {
          const { x: h, y: w } = i.detail.delta;
          i.currentTarget.setAttribute("data-swipe", "move"), i.currentTarget.style.setProperty("--radix-toast-swipe-move-x", `${h}px`), i.currentTarget.style.setProperty("--radix-toast-swipe-move-y", `${w}px`);
        }),
        onSwipeCancel: R(e.onSwipeCancel, (i) => {
          i.currentTarget.setAttribute("data-swipe", "cancel"), i.currentTarget.style.removeProperty("--radix-toast-swipe-move-x"), i.currentTarget.style.removeProperty("--radix-toast-swipe-move-y"), i.currentTarget.style.removeProperty("--radix-toast-swipe-end-x"), i.currentTarget.style.removeProperty("--radix-toast-swipe-end-y");
        }),
        onSwipeEnd: R(e.onSwipeEnd, (i) => {
          const { x: h, y: w } = i.detail.delta;
          i.currentTarget.setAttribute("data-swipe", "end"), i.currentTarget.style.removeProperty("--radix-toast-swipe-move-x"), i.currentTarget.style.removeProperty("--radix-toast-swipe-move-y"), i.currentTarget.style.setProperty("--radix-toast-swipe-end-x", `${h}px`), i.currentTarget.style.setProperty("--radix-toast-swipe-end-y", `${w}px`), T(!1);
        })
      }
    ) });
  }
);
le.displayName = O;
var [Ke, Ve] = se(O, {
  onClose() {
  }
}), He = n.forwardRef(
  (e, o) => {
    const {
      __scopeToast: r,
      type: t = "foreground",
      duration: c,
      open: d,
      onClose: p,
      onEscapeKeyDown: v,
      onPause: T,
      onResume: i,
      onSwipeStart: h,
      onSwipeMove: w,
      onSwipeCancel: A,
      onSwipeEnd: F,
      ...x
    } = e, u = X(O, r), [s, y] = n.useState(null), f = oe(o, y), m = n.useRef(null), P = n.useRef(null), C = c || u.duration, E = n.useRef(0), _ = n.useRef(C), D = n.useRef(0), { onToastAdd: N, onToastRemove: k } = u, S = U(() => {
      s?.contains(document.activeElement) && u.viewport?.focus(), p();
    }), K = n.useCallback(
      (a) => {
        !a || a === 1 / 0 || (window.clearTimeout(D.current), E.current = (/* @__PURE__ */ new Date()).getTime(), D.current = window.setTimeout(S, a));
      },
      [S]
    );
    n.useEffect(() => {
      const a = u.viewport;
      if (a) {
        const b = () => {
          K(_.current), i?.();
        }, g = () => {
          const L = (/* @__PURE__ */ new Date()).getTime() - E.current;
          _.current = _.current - L, window.clearTimeout(D.current), T?.();
        };
        return a.addEventListener(B, g), a.addEventListener(j, b), () => {
          a.removeEventListener(B, g), a.removeEventListener(j, b);
        };
      }
    }, [u.viewport, C, T, i, K]), n.useEffect(() => {
      d && !u.isClosePausedRef.current && K(C);
    }, [d, C, u.isClosePausedRef, K]), n.useEffect(() => () => {
      window.clearTimeout(D.current);
    }, []), n.useEffect(() => (N(), () => k()), [N, k]);
    const Z = n.useMemo(() => s ? we(s) : null, [s]);
    return u.viewport ? /* @__PURE__ */ z(ne, { children: [
      Z && /* @__PURE__ */ l(
        We,
        {
          __scopeToast: r,
          role: "status",
          "aria-live": t === "foreground" ? "assertive" : "polite",
          children: Z
        }
      ),
      /* @__PURE__ */ l(Ke, { scope: r, onClose: S, children: Pe.createPortal(
        /* @__PURE__ */ l(J.ItemSlot, { scope: r, children: /* @__PURE__ */ l(
          Re,
          {
            asChild: !0,
            onEscapeKeyDown: R(v, () => {
              u.isFocusedToastEscapeKeyDownRef.current || S(), u.isFocusedToastEscapeKeyDownRef.current = !1;
            }),
            children: /* @__PURE__ */ l(
              I.li,
              {
                tabIndex: 0,
                "data-state": d ? "open" : "closed",
                "data-swipe-direction": u.swipeDirection,
                ...x,
                ref: f,
                style: { userSelect: "none", touchAction: "none", ...e.style },
                onKeyDown: R(e.onKeyDown, (a) => {
                  a.key === "Escape" && (v?.(a.nativeEvent), a.nativeEvent.defaultPrevented || (u.isFocusedToastEscapeKeyDownRef.current = !0, S()));
                }),
                onPointerDown: R(e.onPointerDown, (a) => {
                  a.button === 0 && (m.current = { x: a.clientX, y: a.clientY });
                }),
                onPointerMove: R(e.onPointerMove, (a) => {
                  if (!m.current) return;
                  const b = a.clientX - m.current.x, g = a.clientY - m.current.y, L = !!P.current, M = ["left", "right"].includes(u.swipeDirection), V = ["left", "up"].includes(u.swipeDirection) ? Math.min : Math.max, Ee = M ? V(0, b) : 0, ye = M ? 0 : V(0, g), Y = a.pointerType === "touch" ? 10 : 2, H = { x: Ee, y: ye }, ee = { originalEvent: a, delta: H };
                  L ? (P.current = H, W(Me, w, ee, {
                    discrete: !1
                  })) : te(H, u.swipeDirection, Y) ? (P.current = H, W(Le, h, ee, {
                    discrete: !1
                  }), a.target.setPointerCapture(a.pointerId)) : (Math.abs(b) > Y || Math.abs(g) > Y) && (m.current = null);
                }),
                onPointerUp: R(e.onPointerUp, (a) => {
                  const b = P.current, g = a.target;
                  if (g.hasPointerCapture(a.pointerId) && g.releasePointerCapture(a.pointerId), P.current = null, m.current = null, b) {
                    const L = a.currentTarget, M = { originalEvent: a, delta: b };
                    te(b, u.swipeDirection, u.swipeThreshold) ? W(ke, F, M, {
                      discrete: !0
                    }) : W(
                      Oe,
                      A,
                      M,
                      {
                        discrete: !0
                      }
                    ), L.addEventListener("click", (V) => V.preventDefault(), {
                      once: !0
                    });
                  }
                })
              }
            )
          }
        ) }),
        u.viewport
      ) })
    ] }) : null;
  }
), We = (e) => {
  const { __scopeToast: o, children: r, ...t } = e, c = X(O, o), [d, p] = n.useState(!1), [v, T] = n.useState(!1);
  return Ye(() => p(!0)), n.useEffect(() => {
    const i = window.setTimeout(() => T(!0), 1e3);
    return () => window.clearTimeout(i);
  }, []), v ? null : /* @__PURE__ */ l(be, { asChild: !0, container: c.announcerContainer || void 0, children: /* @__PURE__ */ l(re, { ...t, children: d && /* @__PURE__ */ z(ne, { children: [
    c.label,
    " ",
    r
  ] }) }) });
}, Ue = "ToastTitle", de = n.forwardRef(
  (e, o) => {
    const { __scopeToast: r, ...t } = e;
    return /* @__PURE__ */ l(I.div, { ...t, ref: o });
  }
);
de.displayName = Ue;
var Xe = "ToastDescription", pe = n.forwardRef(
  (e, o) => {
    const { __scopeToast: r, ...t } = e;
    return /* @__PURE__ */ l(I.div, { ...t, ref: o });
  }
);
pe.displayName = Xe;
var fe = "ToastAction", me = n.forwardRef(
  (e, o) => {
    const { altText: r, ...t } = e;
    return r.trim() ? /* @__PURE__ */ l(Te, { altText: r, asChild: !0, children: /* @__PURE__ */ l(Q, { ...t, ref: o }) }) : (console.error(
      `Invalid prop \`altText\` supplied to \`${fe}\`. Expected non-empty \`string\`.`
    ), null);
  }
);
me.displayName = fe;
var ve = "ToastClose", Q = n.forwardRef(
  (e, o) => {
    const { __scopeToast: r, ...t } = e, c = Ve(ve, r);
    return /* @__PURE__ */ l(Te, { asChild: !0, children: /* @__PURE__ */ l(
      I.button,
      {
        type: "button",
        ...t,
        ref: o,
        onClick: R(e.onClick, c.onClose)
      }
    ) });
  }
);
Q.displayName = ve;
var Te = n.forwardRef((e, o) => {
  const { __scopeToast: r, altText: t, ...c } = e;
  return /* @__PURE__ */ l(
    I.div,
    {
      "data-radix-toast-announce-exclude": "",
      "data-radix-toast-announce-alt": t || void 0,
      ...c,
      ref: o
    }
  );
});
function we(e) {
  const o = [];
  return Array.from(e.childNodes).forEach((t) => {
    if (t.nodeType === t.TEXT_NODE && t.textContent && o.push(t.textContent), $e(t)) {
      const c = t.ariaHidden || t.hidden || t.style.display === "none", d = t.dataset.radixToastAnnounceExclude === "";
      if (!c)
        if (d) {
          const p = t.dataset.radixToastAnnounceAlt;
          p && o.push(p);
        } else
          o.push(...we(t));
    }
  }), o;
}
function W(e, o, r, { discrete: t }) {
  const c = r.originalEvent.currentTarget, d = new CustomEvent(e, { bubbles: !0, cancelable: !0, detail: r });
  o && c.addEventListener(e, o, { once: !0 }), t ? Se(c, d) : c.dispatchEvent(d);
}
var te = (e, o, r = 0) => {
  const t = Math.abs(e.x), c = Math.abs(e.y), d = t > c;
  return o === "left" || o === "right" ? d && t > r : !d && c > r;
};
function Ye(e = () => {
}) {
  const o = U(e);
  Ae(() => {
    let r = 0, t = 0;
    return r = window.requestAnimationFrame(() => t = window.requestAnimationFrame(o)), () => {
      window.cancelAnimationFrame(r), window.cancelAnimationFrame(t);
    };
  }, [o]);
}
function $e(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function Be(e) {
  const o = [], r = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (t) => {
      const c = t.tagName === "INPUT" && t.type === "hidden";
      return t.disabled || t.hidden || c ? NodeFilter.FILTER_SKIP : t.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; r.nextNode(); ) o.push(r.currentNode);
  return o;
}
function $(e) {
  const o = document.activeElement;
  return e.some((r) => r === o ? !0 : (r.focus(), document.activeElement !== o));
}
var at = ae, it = ce, ct = le, ut = de, lt = pe, dt = me, pt = Q;
export {
  dt as Action,
  pt as Close,
  lt as Description,
  at as Provider,
  ct as Root,
  ut as Title,
  le as Toast,
  me as ToastAction,
  Q as ToastClose,
  pe as ToastDescription,
  ae as ToastProvider,
  de as ToastTitle,
  ce as ToastViewport,
  it as Viewport
};
//# sourceMappingURL=index172.js.map
