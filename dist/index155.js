import * as t from "react";
import * as be from "react-dom";
import { clamp as _e } from "./index211.js";
import { composeEventHandlers as _ } from "./index194.js";
import { createCollection as Xe } from "./index209.js";
import { useComposedRefs as F } from "./index192.js";
import { createContextScope as Ze } from "./index195.js";
import { useDirection as $e } from "./index171.js";
import { DismissableLayer as Je } from "./index196.js";
import { useFocusGuards as Qe } from "./index197.js";
import { FocusScope as et } from "./index198.js";
import { useId as Ie } from "./index199.js";
import { Root as tt, Anchor as ot, createPopperScope as Ne, Content as nt, Arrow as rt } from "./index200.js";
import { Portal as st } from "./index201.js";
import { Presence as lt } from "./index202.js";
import { Primitive as M } from "./index203.js";
import { createSlot as ct } from "./index150.js";
import { useCallbackRef as Te } from "./index207.js";
import { useControllableState as Ee } from "./index204.js";
import { useLayoutEffect as j } from "./index208.js";
import { usePrevious as it } from "./index214.js";
import { VISUALLY_HIDDEN_STYLES as at } from "./index210.js";
import { hideOthers as dt } from "./index205.js";
import ut from "./index206.js";
import { jsx as d, jsxs as ue, Fragment as Pe } from "react/jsx-runtime";
var pt = [" ", "Enter", "ArrowUp", "ArrowDown"], ft = [" ", "Enter"], ne = "Select", [pe, fe, mt] = Xe(ne), [re] = Ze(ne, [
  mt,
  Ne
]), me = Ne(), [ht, X] = re(ne), [vt, gt] = re(ne), St = "SelectProvider";
function Me(o) {
  const {
    __scopeSelect: s,
    children: e,
    open: c,
    defaultOpen: n,
    onOpenChange: p,
    value: r,
    defaultValue: l,
    onValueChange: i,
    dir: f,
    name: S,
    autoComplete: C,
    disabled: I,
    required: T,
    form: w,
    // @ts-expect-error internal render prop used by `Select` to compose its default parts
    internal_do_not_use_render: a
  } = o, g = me(s), [v, h] = t.useState(null), [u, O] = t.useState(null), [E, $] = t.useState(!1), A = $e(f), [k, se] = Ee({
    prop: c,
    defaultProp: n ?? !1,
    onChange: p,
    caller: ne
  }), [J, D] = Ee({
    prop: r,
    defaultProp: l,
    onChange: i,
    caller: ne
  }), U = t.useRef(null), Q = t.useRef(J);
  t.useEffect(() => {
    const b = w ? v?.ownerDocument.getElementById(w) : v?.form;
    if (b instanceof HTMLFormElement) {
      const H = () => D(Q.current);
      return b.addEventListener("reset", H), () => b.removeEventListener("reset", H);
    }
  }, [w, v, D]);
  const G = v ? !!w || !!v.closest("form") : !0, [V, W] = t.useState(/* @__PURE__ */ new Set()), z = Ie(), Y = Array.from(V).map((b) => b.props.value).join(";"), B = t.useCallback((b) => {
    W((H) => new Set(H).add(b));
  }, []), le = t.useCallback((b) => {
    W((H) => {
      const K = new Set(H);
      return K.delete(b), K;
    });
  }, []), ee = {
    required: T,
    trigger: v,
    onTriggerChange: h,
    valueNode: u,
    onValueNodeChange: O,
    valueNodeHasChildren: E,
    onValueNodeHasChildrenChange: $,
    contentId: z,
    value: J,
    onValueChange: D,
    open: k,
    onOpenChange: se,
    dir: A,
    triggerPointerDownPosRef: U,
    disabled: I,
    name: S,
    autoComplete: C,
    form: w,
    nativeOptions: V,
    nativeSelectKey: Y,
    isFormControl: G
  };
  return /* @__PURE__ */ d(tt, { ...g, children: /* @__PURE__ */ d(ht, { scope: s, ...ee, children: /* @__PURE__ */ d(pe.Provider, { scope: s, children: /* @__PURE__ */ d(
    vt,
    {
      scope: s,
      onNativeOptionAdd: B,
      onNativeOptionRemove: le,
      children: jt(a) ? a(ee) : e
    }
  ) }) }) });
}
Me.displayName = St;
var wt = (o) => {
  const { __scopeSelect: s, children: e, ...c } = o;
  return /* @__PURE__ */ d(
    Me,
    {
      __scopeSelect: s,
      ...c,
      internal_do_not_use_render: ({ isFormControl: n }) => /* @__PURE__ */ ue(Pe, { children: [
        e,
        n ? /* @__PURE__ */ d(
          Ye,
          {
            __scopeSelect: s
          }
        ) : null
      ] })
    }
  );
};
wt.displayName = ne;
var Oe = "SelectTrigger", Ct = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, disabled: c = !1, ...n } = o, p = me(e), r = X(Oe, e), l = r.disabled || c, i = F(s, r.onTriggerChange), f = fe(e), S = t.useRef("touch"), [C, I, T] = je((a) => {
      const g = f().filter((u) => !u.disabled), v = g.find((u) => u.value === r.value), h = qe(g, a, v);
      h !== void 0 && r.onValueChange(h.value);
    }), w = (a) => {
      l || (r.onOpenChange(!0), T()), a && (r.triggerPointerDownPosRef.current = {
        x: Math.round(a.pageX),
        y: Math.round(a.pageY)
      });
    };
    return /* @__PURE__ */ d(ot, { asChild: !0, ...p, children: /* @__PURE__ */ d(
      M.button,
      {
        type: "button",
        role: "combobox",
        "aria-controls": r.open ? r.contentId : void 0,
        "aria-expanded": r.open,
        "aria-required": r.required,
        "aria-autocomplete": "none",
        dir: r.dir,
        "data-state": r.open ? "open" : "closed",
        disabled: l,
        "data-disabled": l ? "" : void 0,
        "data-placeholder": he(r.value) ? "" : void 0,
        ...n,
        ref: i,
        onClick: _(n.onClick, (a) => {
          a.currentTarget.focus(), S.current !== "mouse" && w(a);
        }),
        onPointerDown: _(n.onPointerDown, (a) => {
          S.current = a.pointerType;
          const g = a.target;
          g.hasPointerCapture(a.pointerId) && g.releasePointerCapture(a.pointerId), a.button === 0 && a.ctrlKey === !1 && a.pointerType === "mouse" && (w(a), a.preventDefault());
        }),
        onKeyDown: _(n.onKeyDown, (a) => {
          const g = C.current !== "";
          !(a.ctrlKey || a.altKey || a.metaKey) && a.key.length === 1 && I(a.key), !(g && a.key === " ") && pt.includes(a.key) && (w(), a.preventDefault());
        })
      }
    ) });
  }
);
Ct.displayName = Oe;
var Ae = "SelectValue", xt = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, className: c, style: n, children: p, placeholder: r = "", ...l } = o, i = X(Ae, e), { onValueNodeHasChildrenChange: f } = i, S = p !== void 0, C = F(s, i.onValueNodeChange);
    j(() => {
      f(S);
    }, [f, S]);
    const I = he(i.value);
    return /* @__PURE__ */ d(
      M.span,
      {
        ...l,
        asChild: I ? !1 : l.asChild,
        ref: C,
        style: { pointerEvents: "none" },
        children: /* @__PURE__ */ d(t.Fragment, { children: I ? r : p }, I ? "placeholder" : "value")
      }
    );
  }
);
xt.displayName = Ae;
var yt = "SelectIcon", It = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, children: c, ...n } = o;
    return /* @__PURE__ */ d(M.span, { "aria-hidden": !0, ...n, ref: s, children: c || "▼" });
  }
);
It.displayName = yt;
var De = "SelectPortal", [Tt, Pt] = re(De, {
  forceMount: void 0
}), Rt = (o) => {
  const { __scopeSelect: s, forceMount: e, ...c } = o;
  return /* @__PURE__ */ d(Tt, { scope: o.__scopeSelect, forceMount: e, children: /* @__PURE__ */ d(st, { asChild: !0, ...c }) });
};
Rt.displayName = De;
var q = "SelectContent", _t = t.forwardRef(
  (o, s) => {
    const e = Pt(q, o.__scopeSelect), { forceMount: c = e.forceMount, ...n } = o, p = X(q, o.__scopeSelect), [r, l] = t.useState();
    return j(() => {
      l(new DocumentFragment());
    }, []), /* @__PURE__ */ d(lt, { present: c || p.open, children: ({ present: i }) => i ? /* @__PURE__ */ d(Ve, { ...n, ref: s }) : /* @__PURE__ */ d(Le, { ...n, fragment: r }) });
  }
);
_t.displayName = q;
var Le = t.forwardRef((o, s) => {
  const { __scopeSelect: e, children: c, fragment: n } = o;
  return n ? be.createPortal(
    /* @__PURE__ */ d(ke, { scope: e, children: /* @__PURE__ */ d(pe.Slot, { scope: e, children: /* @__PURE__ */ d("div", { ref: s, children: c }) }) }),
    n
  ) : null;
});
Le.displayName = "SelectContentFragment";
var L = 10, [ke, Z] = re(q), Et = "SelectContentImpl", bt = ct("SelectContent.RemoveScroll"), Ve = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e } = o, {
      position: c = "item-aligned",
      onCloseAutoFocus: n,
      onEscapeKeyDown: p,
      onPointerDownOutside: r,
      //
      // PopperContent props
      side: l,
      sideOffset: i,
      align: f,
      alignOffset: S,
      arrowPadding: C,
      collisionBoundary: I,
      collisionPadding: T,
      sticky: w,
      hideWhenDetached: a,
      avoidCollisions: g,
      //
      ...v
    } = o, h = X(q, e), [u, O] = t.useState(null), [E, $] = t.useState(null), A = F(s, O), [k, se] = t.useState(null), [J, D] = t.useState(
      null
    ), U = fe(e), [Q, G] = t.useState(!1), V = t.useRef(!1);
    t.useEffect(() => {
      if (u) return dt(u);
    }, [u]), Qe();
    const W = t.useCallback(
      (m) => {
        const [P, ...N] = U().map((R) => R.ref.current), [x] = N.slice(-1), y = document.activeElement;
        for (const R of m)
          if (R === y || (R?.scrollIntoView({ block: "nearest" }), R === P && E && (E.scrollTop = 0), R === x && E && (E.scrollTop = E.scrollHeight), R?.focus(), document.activeElement !== y)) return;
      },
      [U, E]
    ), z = t.useCallback(
      () => W([k, u]),
      [W, k, u]
    );
    t.useEffect(() => {
      Q && z();
    }, [Q, z]);
    const { onOpenChange: Y, triggerPointerDownPosRef: B } = h;
    t.useEffect(() => {
      if (u) {
        let m = { x: 0, y: 0 };
        const P = (x) => {
          m = {
            x: Math.abs(Math.round(x.pageX) - (B.current?.x ?? 0)),
            y: Math.abs(Math.round(x.pageY) - (B.current?.y ?? 0))
          };
        }, N = (x) => {
          m.x <= 10 && m.y <= 10 ? x.preventDefault() : x.composedPath().includes(u) || Y(!1), document.removeEventListener("pointermove", P), B.current = null;
        };
        return B.current !== null && (document.addEventListener("pointermove", P), document.addEventListener("pointerup", N, { capture: !0, once: !0 })), () => {
          document.removeEventListener("pointermove", P), document.removeEventListener("pointerup", N, { capture: !0 });
        };
      }
    }, [u, Y, B]), t.useEffect(() => {
      const m = () => Y(!1);
      return window.addEventListener("blur", m), window.addEventListener("resize", m), () => {
        window.removeEventListener("blur", m), window.removeEventListener("resize", m);
      };
    }, [Y]);
    const [le, ee] = je((m) => {
      const P = U().filter((y) => !y.disabled), N = P.find((y) => y.ref.current === document.activeElement), x = qe(P, m, N);
      x && setTimeout(() => x.ref.current?.focus());
    }), b = t.useCallback(
      (m, P, N) => {
        const x = !V.current && !N;
        (h.value !== void 0 && h.value === P || x) && (se(m), x && (V.current = !0));
      },
      [h.value]
    ), H = t.useCallback(() => u?.focus(), [u]), K = t.useCallback(
      (m, P, N) => {
        const x = !V.current && !N;
        (h.value !== void 0 && h.value === P || x) && D(m);
      },
      [h.value]
    ), ae = c === "popper" ? we : Be, ce = ae === we ? {
      side: l,
      sideOffset: i,
      align: f,
      alignOffset: S,
      arrowPadding: C,
      collisionBoundary: I,
      collisionPadding: T,
      sticky: w,
      hideWhenDetached: a,
      avoidCollisions: g
    } : {};
    return /* @__PURE__ */ d(
      ke,
      {
        scope: e,
        content: u,
        viewport: E,
        onViewportChange: $,
        itemRefCallback: b,
        selectedItem: k,
        onItemLeave: H,
        itemTextRefCallback: K,
        focusSelectedItem: z,
        selectedItemText: J,
        position: c,
        isPositioned: Q,
        searchRef: le,
        children: /* @__PURE__ */ d(ut, { as: bt, allowPinchZoom: !0, children: /* @__PURE__ */ d(
          et,
          {
            asChild: !0,
            trapped: h.open,
            onMountAutoFocus: (m) => {
              m.preventDefault();
            },
            onUnmountAutoFocus: _(n, (m) => {
              h.trigger?.focus({ preventScroll: !0 }), m.preventDefault();
            }),
            children: /* @__PURE__ */ d(
              Je,
              {
                asChild: !0,
                disableOutsidePointerEvents: !0,
                onEscapeKeyDown: p,
                onPointerDownOutside: r,
                onFocusOutside: (m) => m.preventDefault(),
                onDismiss: () => h.onOpenChange(!1),
                children: /* @__PURE__ */ d(
                  ae,
                  {
                    role: "listbox",
                    id: h.contentId,
                    "data-state": h.open ? "open" : "closed",
                    dir: h.dir,
                    onContextMenu: (m) => m.preventDefault(),
                    ...v,
                    ...ce,
                    onPlaced: () => G(!0),
                    ref: A,
                    style: {
                      // flex layout so we can place the scroll buttons properly
                      display: "flex",
                      flexDirection: "column",
                      // reset the outline by default as the content MAY get focused
                      outline: "none",
                      ...v.style
                    },
                    onKeyDown: _(v.onKeyDown, (m) => {
                      const P = m.ctrlKey || m.altKey || m.metaKey;
                      if (m.key === "Tab" && m.preventDefault(), !P && m.key.length === 1 && ee(m.key), ["ArrowUp", "ArrowDown", "Home", "End"].includes(m.key)) {
                        let x = U().filter((y) => !y.disabled).map((y) => y.ref.current);
                        if (["ArrowUp", "End"].includes(m.key) && (x = x.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(m.key)) {
                          const y = m.target, R = x.indexOf(y);
                          x = x.slice(R + 1);
                        }
                        setTimeout(() => W(x)), m.preventDefault();
                      }
                    })
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
Ve.displayName = Et;
var Nt = "SelectItemAlignedPosition", Be = t.forwardRef((o, s) => {
  const { __scopeSelect: e, onPlaced: c, ...n } = o, p = X(q, e), r = Z(q, e), [l, i] = t.useState(null), [f, S] = t.useState(null), C = F(s, S), I = fe(e), T = t.useRef(!1), w = t.useRef(!0), { viewport: a, selectedItem: g, selectedItemText: v, focusSelectedItem: h } = r, u = t.useCallback(() => {
    if (p.trigger && p.valueNode && l && f && a && g && v) {
      const A = p.trigger.getBoundingClientRect(), k = f.getBoundingClientRect(), se = p.valueNode.getBoundingClientRect(), J = v.getBoundingClientRect();
      if (p.dir !== "rtl") {
        const y = J.left - k.left, R = se.left - y, te = A.left - R, oe = A.width + te, ve = Math.max(oe, k.width), ge = window.innerWidth - L, Se = _e(R, [
          L,
          // Prevents the content from going off the starting edge of the
          // viewport. It may still go off the ending edge, but this can be
          // controlled by the user since they may want to manage overflow in a
          // specific way.
          // https://github.com/radix-ui/primitives/issues/2049
          Math.max(L, ge - ve)
        ]);
        l.style.minWidth = oe + "px", l.style.left = Se + "px";
      } else {
        const y = k.right - J.right, R = window.innerWidth - se.right - y, te = window.innerWidth - A.right - R, oe = A.width + te, ve = Math.max(oe, k.width), ge = window.innerWidth - L, Se = _e(R, [
          L,
          Math.max(L, ge - ve)
        ]);
        l.style.minWidth = oe + "px", l.style.right = Se + "px";
      }
      const D = I(), U = window.innerHeight - L * 2, Q = a.scrollHeight, G = window.getComputedStyle(f), V = parseInt(G.borderTopWidth, 10), W = parseInt(G.paddingTop, 10), z = parseInt(G.borderBottomWidth, 10), Y = parseInt(G.paddingBottom, 10), B = V + W + Q + Y + z, le = Math.min(g.offsetHeight * 5, B), ee = window.getComputedStyle(a), b = parseInt(ee.paddingTop, 10), H = parseInt(ee.paddingBottom, 10), K = A.top + A.height / 2 - L, ae = U - K, ce = g.offsetHeight / 2, m = g.offsetTop + ce, P = V + W + m, N = B - P;
      if (P <= K) {
        const y = D.length > 0 && g === D[D.length - 1].ref.current;
        l.style.bottom = "0px";
        const R = f.clientHeight - a.offsetTop - a.offsetHeight, te = Math.max(
          ae,
          ce + // viewport might have padding bottom, include it to avoid a scrollable viewport
          (y ? H : 0) + R + z
        ), oe = P + te;
        l.style.height = oe + "px";
      } else {
        const y = D.length > 0 && g === D[0].ref.current;
        l.style.top = "0px";
        const te = Math.max(
          K,
          V + a.offsetTop + // viewport might have padding top, include it to avoid a scrollable viewport
          (y ? b : 0) + ce
        ) + N;
        l.style.height = te + "px", a.scrollTop = P - K + a.offsetTop;
      }
      l.style.margin = `${L}px 0`, l.style.minHeight = le + "px", l.style.maxHeight = U + "px", c?.(), requestAnimationFrame(() => T.current = !0);
    }
  }, [
    I,
    p.trigger,
    p.valueNode,
    l,
    f,
    a,
    g,
    v,
    p.dir,
    c
  ]);
  j(() => u(), [u]);
  const [O, E] = t.useState();
  j(() => {
    f && E(window.getComputedStyle(f).zIndex);
  }, [f]);
  const $ = t.useCallback(
    (A) => {
      A && w.current === !0 && (u(), h?.(), w.current = !1);
    },
    [u, h]
  );
  return /* @__PURE__ */ d(
    Ot,
    {
      scope: e,
      contentWrapper: l,
      shouldExpandOnScrollRef: T,
      onScrollButtonChange: $,
      children: /* @__PURE__ */ d(
        "div",
        {
          ref: i,
          style: {
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            zIndex: O
          },
          children: /* @__PURE__ */ d(
            M.div,
            {
              ...n,
              ref: C,
              style: {
                // When we get the height of the content, it includes borders. If we were to set
                // the height without having `boxSizing: 'border-box'` it would be too big.
                boxSizing: "border-box",
                // We need to ensure the content doesn't get taller than the wrapper
                maxHeight: "100%",
                ...n.style
              }
            }
          )
        }
      )
    }
  );
});
Be.displayName = Nt;
var Mt = "SelectPopperPosition", we = t.forwardRef((o, s) => {
  const {
    __scopeSelect: e,
    align: c = "start",
    collisionPadding: n = L,
    ...p
  } = o, r = me(e);
  return /* @__PURE__ */ d(
    nt,
    {
      ...r,
      ...p,
      ref: s,
      align: c,
      collisionPadding: n,
      style: {
        // Ensure border-box for floating-ui calculations
        boxSizing: "border-box",
        ...p.style,
        "--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-select-content-available-width": "var(--radix-popper-available-width)",
        "--radix-select-content-available-height": "var(--radix-popper-available-height)",
        "--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
      }
    }
  );
});
we.displayName = Mt;
var [Ot, Re] = re(q, {}), Ce = "SelectViewport", At = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, nonce: c, ...n } = o, p = Z(Ce, e), r = Re(Ce, e), l = F(s, p.onViewportChange), i = t.useRef(0);
    return /* @__PURE__ */ ue(Pe, { children: [
      /* @__PURE__ */ d(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}"
          },
          nonce: c
        }
      ),
      /* @__PURE__ */ d(pe.Slot, { scope: e, children: /* @__PURE__ */ d(
        M.div,
        {
          "data-radix-select-viewport": "",
          role: "presentation",
          ...n,
          ref: l,
          style: {
            // we use position: 'relative' here on the `viewport` so that when we call
            // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
            // (independent of the scrollUpButton).
            position: "relative",
            flex: 1,
            // Viewport should only be scrollable in the vertical direction.
            // This won't work in vertical writing modes, so we'll need to
            // revisit this if/when that is supported
            // https://developer.chrome.com/blog/vertical-form-controls
            overflow: "hidden auto",
            ...n.style
          },
          onScroll: _(n.onScroll, (f) => {
            const S = f.currentTarget, { contentWrapper: C, shouldExpandOnScrollRef: I } = r;
            if (I?.current && C) {
              const T = Math.abs(i.current - S.scrollTop);
              if (T > 0) {
                const w = window.innerHeight - L * 2, a = parseFloat(C.style.minHeight), g = parseFloat(C.style.height), v = Math.max(a, g);
                if (v < w) {
                  const h = v + T, u = Math.min(w, h), O = h - u;
                  C.style.height = u + "px", C.style.bottom === "0px" && (S.scrollTop = O > 0 ? O : 0, C.style.justifyContent = "flex-end");
                }
              }
            }
            i.current = S.scrollTop;
          })
        }
      ) })
    ] });
  }
);
At.displayName = Ce;
var He = "SelectGroup", [Dt, Lt] = re(He), kt = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, ...c } = o, n = Ie();
    return /* @__PURE__ */ d(Dt, { scope: e, id: n, children: /* @__PURE__ */ d(M.div, { role: "group", "aria-labelledby": n, ...c, ref: s }) });
  }
);
kt.displayName = He;
var Fe = "SelectLabel", Vt = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, ...c } = o, n = Lt(Fe, e);
    return /* @__PURE__ */ d(M.div, { id: n.id, ...c, ref: s });
  }
);
Vt.displayName = Fe;
var de = "SelectItem", [Bt, Ue] = re(de), Ht = t.forwardRef(
  (o, s) => {
    const {
      __scopeSelect: e,
      value: c,
      disabled: n = !1,
      textValue: p,
      ...r
    } = o, l = X(de, e), i = Z(de, e), f = l.value === c, [S, C] = t.useState(p ?? ""), [I, T] = t.useState(!1), w = Te(
      (u) => i.itemRefCallback?.(u, c, n)
    ), a = F(s, w), g = Ie(), v = t.useRef("touch"), h = () => {
      n || (l.onValueChange(c), l.onOpenChange(!1));
    };
    return /* @__PURE__ */ d(
      Bt,
      {
        scope: e,
        value: c,
        disabled: n,
        textId: g,
        isSelected: f,
        onItemTextChange: t.useCallback((u) => {
          C((O) => O || (u?.textContent ?? "").trim());
        }, []),
        children: /* @__PURE__ */ d(
          pe.ItemSlot,
          {
            scope: e,
            value: c,
            disabled: n,
            textValue: S,
            children: /* @__PURE__ */ d(
              M.div,
              {
                role: "option",
                "aria-labelledby": g,
                "data-highlighted": I ? "" : void 0,
                "aria-selected": f && I,
                "data-state": f ? "checked" : "unchecked",
                "aria-disabled": n || void 0,
                "data-disabled": n ? "" : void 0,
                tabIndex: n ? void 0 : -1,
                ...r,
                ref: a,
                onFocus: _(r.onFocus, () => T(!0)),
                onBlur: _(r.onBlur, () => T(!1)),
                onClick: _(r.onClick, () => {
                  v.current !== "mouse" && h();
                }),
                onPointerUp: _(r.onPointerUp, () => {
                  v.current === "mouse" && h();
                }),
                onPointerDown: _(r.onPointerDown, (u) => {
                  v.current = u.pointerType;
                }),
                onPointerMove: _(r.onPointerMove, (u) => {
                  v.current = u.pointerType, n ? i.onItemLeave?.() : v.current === "mouse" && u.currentTarget.focus({ preventScroll: !0 });
                }),
                onPointerLeave: _(r.onPointerLeave, (u) => {
                  u.currentTarget === document.activeElement && i.onItemLeave?.();
                }),
                onKeyDown: _(r.onKeyDown, (u) => {
                  n || u.target !== u.currentTarget || i.searchRef?.current !== "" && u.key === " " || (ft.includes(u.key) && h(), u.key === " " && u.preventDefault());
                })
              }
            )
          }
        )
      }
    );
  }
);
Ht.displayName = de;
var ie = "SelectItemText", Ft = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, className: c, style: n, ...p } = o, r = X(ie, e), l = Z(ie, e), i = Ue(ie, e), f = gt(ie, e), [S, C] = t.useState(null), I = Te(
      (h) => l.itemTextRefCallback?.(h, i.value, i.disabled)
    ), T = F(
      s,
      C,
      i.onItemTextChange,
      I
    ), w = S?.textContent, a = t.useMemo(
      () => /* @__PURE__ */ d("option", { value: i.value, disabled: i.disabled, children: w }, i.value),
      [i.disabled, i.value, w]
    ), { onNativeOptionAdd: g, onNativeOptionRemove: v } = f;
    return j(() => (g(a), () => v(a)), [g, v, a]), /* @__PURE__ */ ue(Pe, { children: [
      /* @__PURE__ */ d(M.span, { id: i.textId, ...p, ref: T }),
      i.isSelected && r.valueNode && !r.valueNodeHasChildren && !he(r.value) ? be.createPortal(p.children, r.valueNode) : null
    ] });
  }
);
Ft.displayName = ie;
var We = "SelectItemIndicator", Ut = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, ...c } = o;
    return Ue(We, e).isSelected ? /* @__PURE__ */ d(M.span, { "aria-hidden": !0, ...c, ref: s }) : null;
  }
);
Ut.displayName = We;
var xe = "SelectScrollUpButton", Wt = t.forwardRef((o, s) => {
  const e = Z(xe, o.__scopeSelect), c = Re(xe, o.__scopeSelect), [n, p] = t.useState(!1), r = F(s, c.onScrollButtonChange);
  return j(() => {
    if (e.viewport && e.isPositioned) {
      let l = function() {
        const f = i.scrollTop > 0;
        p(f);
      };
      const i = e.viewport;
      return l(), i.addEventListener("scroll", l), () => i.removeEventListener("scroll", l);
    }
  }, [e.viewport, e.isPositioned]), n ? /* @__PURE__ */ d(
    Ke,
    {
      ...o,
      ref: r,
      onAutoScroll: () => {
        const { viewport: l, selectedItem: i } = e;
        l && i && (l.scrollTop = l.scrollTop - i.offsetHeight);
      }
    }
  ) : null;
});
Wt.displayName = xe;
var ye = "SelectScrollDownButton", Kt = t.forwardRef((o, s) => {
  const e = Z(ye, o.__scopeSelect), c = Re(ye, o.__scopeSelect), [n, p] = t.useState(!1), r = F(s, c.onScrollButtonChange);
  return j(() => {
    if (e.viewport && e.isPositioned) {
      let l = function() {
        const f = i.scrollHeight - i.clientHeight, S = Math.ceil(i.scrollTop) < f;
        p(S);
      };
      const i = e.viewport;
      return l(), i.addEventListener("scroll", l), () => i.removeEventListener("scroll", l);
    }
  }, [e.viewport, e.isPositioned]), n ? /* @__PURE__ */ d(
    Ke,
    {
      ...o,
      ref: r,
      onAutoScroll: () => {
        const { viewport: l, selectedItem: i } = e;
        l && i && (l.scrollTop = l.scrollTop + i.offsetHeight);
      }
    }
  ) : null;
});
Kt.displayName = ye;
var Ke = t.forwardRef((o, s) => {
  const { __scopeSelect: e, onAutoScroll: c, ...n } = o, p = Z("SelectScrollButton", e), r = t.useRef(null), l = fe(e), i = t.useCallback(() => {
    r.current !== null && (window.clearInterval(r.current), r.current = null);
  }, []);
  return t.useEffect(() => () => i(), [i]), j(() => {
    l().find((S) => S.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
  }, [l]), /* @__PURE__ */ d(
    M.div,
    {
      "aria-hidden": !0,
      ...n,
      ref: s,
      style: { flexShrink: 0, ...n.style },
      onPointerDown: _(n.onPointerDown, () => {
        r.current === null && (r.current = window.setInterval(c, 50));
      }),
      onPointerMove: _(n.onPointerMove, () => {
        p.onItemLeave?.(), r.current === null && (r.current = window.setInterval(c, 50));
      }),
      onPointerLeave: _(n.onPointerLeave, () => {
        i();
      })
    }
  );
}), Gt = "SelectSeparator", zt = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, ...c } = o;
    return /* @__PURE__ */ d(M.div, { "aria-hidden": !0, ...c, ref: s });
  }
);
zt.displayName = Gt;
var Ge = "SelectArrow", Yt = t.forwardRef(
  (o, s) => {
    const { __scopeSelect: e, ...c } = o, n = me(e);
    return Z(Ge, e).position === "popper" ? /* @__PURE__ */ d(rt, { ...n, ...c, ref: s }) : null;
  }
);
Yt.displayName = Ge;
var ze = "SelectBubbleInput", Ye = t.forwardRef(
  ({ __scopeSelect: o, ...s }, e) => {
    const c = X(ze, o), { value: n, onValueChange: p, required: r, disabled: l, name: i, autoComplete: f, form: S } = c, { nativeOptions: C, nativeSelectKey: I } = c, T = t.useRef(null), w = F(e, T), a = n ?? "", g = it(a), v = Array.from(C).some(
      (h) => (h.props.value ?? "") === ""
    );
    return t.useEffect(() => {
      const h = T.current;
      if (!h) return;
      const u = window.HTMLSelectElement.prototype, E = Object.getOwnPropertyDescriptor(
        u,
        "value"
      ).set;
      if (g !== a && E) {
        const $ = new Event("change", { bubbles: !0 });
        E.call(h, a), h.dispatchEvent($);
      }
    }, [g, a]), /* @__PURE__ */ ue(
      M.select,
      {
        "aria-hidden": !0,
        required: r,
        tabIndex: -1,
        name: i,
        autoComplete: f,
        disabled: l,
        form: S,
        onChange: (h) => p(h.target.value),
        ...s,
        style: { ...at, ...s.style },
        ref: w,
        defaultValue: a,
        children: [
          he(n) && !v ? /* @__PURE__ */ d("option", { value: "" }) : null,
          Array.from(C)
        ]
      },
      I
    );
  }
);
Ye.displayName = ze;
function jt(o) {
  return typeof o == "function";
}
function he(o) {
  return o === "" || o === void 0;
}
function je(o) {
  const s = Te(o), e = t.useRef(""), c = t.useRef(0), n = t.useCallback(
    (r) => {
      const l = e.current + r;
      s(l), (function i(f) {
        e.current = f, window.clearTimeout(c.current), f !== "" && (c.current = window.setTimeout(() => i(""), 1e3));
      })(l);
    },
    [s]
  ), p = t.useCallback(() => {
    e.current = "", window.clearTimeout(c.current);
  }, []);
  return t.useEffect(() => () => window.clearTimeout(c.current), []), [e, n, p];
}
function qe(o, s, e) {
  const n = s.length > 1 && Array.from(s).every((f) => f === s[0]) ? s[0] : s, p = e ? o.indexOf(e) : -1;
  let r = qt(o, Math.max(p, 0));
  n.length === 1 && (r = r.filter((f) => f !== e));
  const i = r.find(
    (f) => f.textValue.toLowerCase().startsWith(n.toLowerCase())
  );
  return i !== e ? i : void 0;
}
function qt(o, s) {
  return o.map((e, c) => o[(s + c) % o.length]);
}
export {
  Yt as Arrow,
  _t as Content,
  kt as Group,
  It as Icon,
  Ht as Item,
  Ut as ItemIndicator,
  Ft as ItemText,
  Vt as Label,
  Rt as Portal,
  wt as Root,
  Kt as ScrollDownButton,
  Wt as ScrollUpButton,
  wt as Select,
  Yt as SelectArrow,
  _t as SelectContent,
  kt as SelectGroup,
  It as SelectIcon,
  Ht as SelectItem,
  Ut as SelectItemIndicator,
  Ft as SelectItemText,
  Vt as SelectLabel,
  Rt as SelectPortal,
  Kt as SelectScrollDownButton,
  Wt as SelectScrollUpButton,
  zt as SelectSeparator,
  Ct as SelectTrigger,
  xt as SelectValue,
  At as SelectViewport,
  zt as Separator,
  Ct as Trigger,
  xt as Value,
  At as Viewport,
  Ye as unstable_BubbleInput,
  Me as unstable_Provider,
  Ye as unstable_SelectBubbleInput,
  Me as unstable_SelectProvider
};
//# sourceMappingURL=index155.js.map
