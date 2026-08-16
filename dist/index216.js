import * as o from "react";
import { composeEventHandlers as v } from "./index191.js";
import { createCollection as ze } from "./index217.js";
import { useComposedRefs as x } from "./index192.js";
import { createContextScope as Ze } from "./index193.js";
import { useDirection as $e } from "./index173.js";
import { DismissableLayer as qe } from "./index194.js";
import { useFocusGuards as Je } from "./index195.js";
import { FocusScope as Qe } from "./index196.js";
import { useId as fe } from "./index197.js";
import { Root as me, Anchor as et, createPopperScope as he, Content as tt, Arrow as nt } from "./index198.js";
import { Portal as ot } from "./index199.js";
import { Presence as j } from "./index200.js";
import { Primitive as D, dispatchDiscreteCustomEvent as rt } from "./index201.js";
import { createRovingFocusGroupScope as Me, Item as ct, Root as at } from "./index213.js";
import { createSlot as st } from "./index152.js";
import { useCallbackRef as J } from "./index207.js";
import { hideOthers as ut } from "./index203.js";
import it from "./index204.js";
import { jsx as s } from "react/jsx-runtime";
var q = ["Enter", " "], lt = ["ArrowDown", "PageUp", "Home"], ve = ["ArrowUp", "PageDown", "End"], dt = [...lt, ...ve], ft = {
  ltr: [...q, "ArrowRight"],
  rtl: [...q, "ArrowLeft"]
}, pt = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"]
}, N = "Menu", [O, mt, ht] = ze(N), [w, nn] = Ze(N, [
  ht,
  he,
  Me
]), L = he(), Ce = Me(), [ge, S] = w(N), [Mt, F] = w(N), _e = (e) => {
  const { __scopeMenu: n, open: t = !1, children: r, dir: u, onOpenChange: c, modal: d = !0 } = e, m = L(n), [p, f] = o.useState(null), M = o.useRef(!1), a = J(c), l = $e(u);
  return o.useEffect(() => {
    const h = () => {
      M.current = !0, document.addEventListener("pointerdown", C, { capture: !0, once: !0 }), document.addEventListener("pointermove", C, { capture: !0, once: !0 });
    }, C = () => M.current = !1;
    return document.addEventListener("keydown", h, { capture: !0 }), () => {
      document.removeEventListener("keydown", h, { capture: !0 }), document.removeEventListener("pointerdown", C, { capture: !0 }), document.removeEventListener("pointermove", C, { capture: !0 });
    };
  }, []), o.useEffect(() => {
    if (!t)
      return;
    const h = () => a(!1);
    return window.addEventListener("blur", h), () => window.removeEventListener("blur", h);
  }, [t, a]), /* @__PURE__ */ s(me, { ...m, children: /* @__PURE__ */ s(
    ge,
    {
      scope: n,
      open: t,
      onOpenChange: a,
      content: p,
      onContentChange: f,
      children: /* @__PURE__ */ s(
        Mt,
        {
          scope: n,
          onClose: o.useCallback(() => a(!1), [a]),
          isUsingKeyboardRef: M,
          dir: l,
          modal: d,
          children: r
        }
      )
    }
  ) });
};
_e.displayName = N;
var vt = "MenuAnchor", Q = o.forwardRef(
  (e, n) => {
    const { __scopeMenu: t, ...r } = e, u = L(t);
    return /* @__PURE__ */ s(et, { ...u, ...r, ref: n });
  }
);
Q.displayName = vt;
var ee = "MenuPortal", [Ct, Re] = w(ee, {
  forceMount: void 0
}), Se = (e) => {
  const { __scopeMenu: n, forceMount: t, children: r, container: u } = e, c = S(ee, n);
  return /* @__PURE__ */ s(Ct, { scope: n, forceMount: t, children: /* @__PURE__ */ s(j, { present: t || c.open, children: /* @__PURE__ */ s(ot, { asChild: !0, container: u, children: r }) }) });
};
Se.displayName = ee;
var _ = "MenuContent", [gt, te] = w(_), Ee = o.forwardRef(
  (e, n) => {
    const t = Re(_, e.__scopeMenu), { forceMount: r = t.forceMount, ...u } = e, c = S(_, e.__scopeMenu), d = F(_, e.__scopeMenu);
    return /* @__PURE__ */ s(O.Provider, { scope: e.__scopeMenu, children: /* @__PURE__ */ s(j, { present: r || c.open, children: /* @__PURE__ */ s(O.Slot, { scope: e.__scopeMenu, children: d.modal ? /* @__PURE__ */ s(_t, { ...u, ref: n }) : /* @__PURE__ */ s(Rt, { ...u, ref: n }) }) }) });
  }
), _t = o.forwardRef(
  (e, n) => {
    const t = S(_, e.__scopeMenu), r = o.useRef(null), u = x(n, r);
    return o.useEffect(() => {
      const c = r.current;
      if (c) return ut(c);
    }, []), /* @__PURE__ */ s(
      ne,
      {
        ...e,
        ref: u,
        trapFocus: t.open,
        disableOutsidePointerEvents: t.open,
        disableOutsideScroll: !0,
        onFocusOutside: v(
          e.onFocusOutside,
          (c) => c.preventDefault(),
          { checkForDefaultPrevented: !1 }
        ),
        onDismiss: () => t.onOpenChange(!1)
      }
    );
  }
), Rt = o.forwardRef((e, n) => {
  const t = S(_, e.__scopeMenu);
  return /* @__PURE__ */ s(
    ne,
    {
      ...e,
      ref: n,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      disableOutsideScroll: !1,
      onDismiss: () => t.onOpenChange(!1)
    }
  );
}), St = st("MenuContent.ScrollLock"), ne = o.forwardRef(
  (e, n) => {
    const {
      __scopeMenu: t,
      loop: r = !1,
      trapFocus: u,
      onOpenAutoFocus: c,
      onCloseAutoFocus: d,
      disableOutsidePointerEvents: m,
      onEntryFocus: p,
      onEscapeKeyDown: f,
      onPointerDownOutside: M,
      onFocusOutside: a,
      onInteractOutside: l,
      onDismiss: h,
      disableOutsideScroll: C,
      ...R
    } = e, K = S(_, t), P = F(_, t), G = L(t), Be = Ce(t), se = mt(t), [Ve, ue] = o.useState(null), U = o.useRef(null), Ye = x(n, U, K.onContentChange), B = o.useRef(0), V = o.useRef(""), Xe = o.useRef(0), W = o.useRef(null), ie = o.useRef("right"), z = o.useRef(0), je = C ? it : o.Fragment, He = C ? { as: St, allowPinchZoom: !0 } : void 0, We = (i) => {
      const y = V.current + i, E = se().filter((g) => !g.disabled), b = document.activeElement, Z = E.find((g) => g.ref.current === b)?.textValue, $ = E.map((g) => g.textValue), le = Dt($, y, Z), T = E.find((g) => g.textValue === le)?.ref.current;
      (function g(de) {
        V.current = de, window.clearTimeout(B.current), de !== "" && (B.current = window.setTimeout(() => g(""), 1e3));
      })(y), T && setTimeout(() => T.focus());
    };
    o.useEffect(() => () => window.clearTimeout(B.current), []), Je();
    const I = o.useCallback((i) => ie.current === W.current?.side && Lt(i, W.current?.area), []);
    return /* @__PURE__ */ s(
      gt,
      {
        scope: t,
        searchRef: V,
        onItemEnter: o.useCallback(
          (i) => {
            I(i) && i.preventDefault();
          },
          [I]
        ),
        onItemLeave: o.useCallback(
          (i) => {
            I(i) || (U.current?.focus(), ue(null));
          },
          [I]
        ),
        onTriggerLeave: o.useCallback(
          (i) => {
            I(i) && i.preventDefault();
          },
          [I]
        ),
        pointerGraceTimerRef: Xe,
        onPointerGraceIntentChange: o.useCallback((i) => {
          W.current = i;
        }, []),
        children: /* @__PURE__ */ s(je, { ...He, children: /* @__PURE__ */ s(
          Qe,
          {
            asChild: !0,
            trapped: u,
            onMountAutoFocus: v(c, (i) => {
              i.preventDefault(), U.current?.focus({ preventScroll: !0 });
            }),
            onUnmountAutoFocus: d,
            children: /* @__PURE__ */ s(
              qe,
              {
                asChild: !0,
                disableOutsidePointerEvents: m,
                onEscapeKeyDown: f,
                onPointerDownOutside: M,
                onFocusOutside: a,
                onInteractOutside: l,
                onDismiss: h,
                children: /* @__PURE__ */ s(
                  at,
                  {
                    asChild: !0,
                    ...Be,
                    dir: P.dir,
                    orientation: "vertical",
                    loop: r,
                    currentTabStopId: Ve,
                    onCurrentTabStopIdChange: ue,
                    onEntryFocus: v(p, (i) => {
                      P.isUsingKeyboardRef.current || i.preventDefault();
                    }),
                    preventScrollOnEntryFocus: !0,
                    children: /* @__PURE__ */ s(
                      tt,
                      {
                        role: "menu",
                        "aria-orientation": "vertical",
                        "data-state": Ue(K.open),
                        "data-radix-menu-content": "",
                        dir: P.dir,
                        ...G,
                        ...R,
                        ref: Ye,
                        style: { outline: "none", ...R.style },
                        onKeyDown: v(R.onKeyDown, (i) => {
                          const E = i.target.closest("[data-radix-menu-content]") === i.currentTarget, b = i.ctrlKey || i.altKey || i.metaKey, Z = i.key.length === 1;
                          E && (i.key === "Tab" && i.preventDefault(), !b && Z && We(i.key));
                          const $ = U.current;
                          if (i.target !== $ || !dt.includes(i.key)) return;
                          i.preventDefault();
                          const T = se().filter((g) => !g.disabled).map((g) => g.ref.current);
                          ve.includes(i.key) && T.reverse(), Ot(T);
                        }),
                        onBlur: v(e.onBlur, (i) => {
                          i.currentTarget.contains(i.target) || (window.clearTimeout(B.current), V.current = "");
                        }),
                        onPointerMove: v(
                          e.onPointerMove,
                          k((i) => {
                            const y = i.target, E = z.current !== i.clientX;
                            if (i.currentTarget.contains(y) && E) {
                              const b = i.clientX > z.current ? "right" : "left";
                              ie.current = b, z.current = i.clientX;
                            }
                          })
                        )
                      }
                    )
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
Ee.displayName = _;
var Et = "MenuGroup", oe = o.forwardRef(
  (e, n) => {
    const { __scopeMenu: t, ...r } = e;
    return /* @__PURE__ */ s(D.div, { role: "group", ...r, ref: n });
  }
);
oe.displayName = Et;
var wt = "MenuLabel", we = o.forwardRef(
  (e, n) => {
    const { __scopeMenu: t, ...r } = e;
    return /* @__PURE__ */ s(D.div, { ...r, ref: n });
  }
);
we.displayName = wt;
var Y = "MenuItem", pe = "menu.itemSelect", H = o.forwardRef(
  (e, n) => {
    const { disabled: t = !1, onSelect: r, ...u } = e, c = o.useRef(null), d = F(Y, e.__scopeMenu), m = te(Y, e.__scopeMenu), p = x(n, c), f = o.useRef(!1), M = () => {
      const a = c.current;
      if (!t && a) {
        const l = new CustomEvent(pe, { bubbles: !0, cancelable: !0 });
        a.addEventListener(pe, (h) => r?.(h), { once: !0 }), rt(a, l), l.defaultPrevented ? f.current = !1 : d.onClose();
      }
    };
    return /* @__PURE__ */ s(
      Pe,
      {
        ...u,
        ref: p,
        disabled: t,
        onClick: v(e.onClick, M),
        onPointerDown: (a) => {
          e.onPointerDown?.(a), f.current = !0;
        },
        onPointerUp: v(e.onPointerUp, (a) => {
          f.current || a.currentTarget?.click();
        }),
        onKeyDown: v(e.onKeyDown, (a) => {
          t || a.target !== a.currentTarget || m.searchRef.current !== "" && a.key === " " || q.includes(a.key) && (a.currentTarget.click(), a.preventDefault());
        })
      }
    );
  }
);
H.displayName = Y;
var Pe = o.forwardRef(
  (e, n) => {
    const { __scopeMenu: t, disabled: r = !1, textValue: u, ...c } = e, d = te(Y, t), m = Ce(t), p = o.useRef(null), f = x(n, p), [M, a] = o.useState(!1), [l, h] = o.useState("");
    return o.useEffect(() => {
      const C = p.current;
      C && h((C.textContent ?? "").trim());
    }, [c.children]), /* @__PURE__ */ s(
      O.ItemSlot,
      {
        scope: t,
        disabled: r,
        textValue: u ?? l,
        children: /* @__PURE__ */ s(ct, { asChild: !0, ...m, focusable: !r, children: /* @__PURE__ */ s(
          D.div,
          {
            role: "menuitem",
            "data-highlighted": M ? "" : void 0,
            "aria-disabled": r || void 0,
            "data-disabled": r ? "" : void 0,
            ...c,
            ref: f,
            onPointerMove: v(
              e.onPointerMove,
              k((C) => {
                r ? d.onItemLeave(C) : (d.onItemEnter(C), C.defaultPrevented || C.currentTarget.focus({ preventScroll: !0 }));
              })
            ),
            onPointerLeave: v(
              e.onPointerLeave,
              k((C) => d.onItemLeave(C))
            ),
            onFocus: v(e.onFocus, () => a(!0)),
            onBlur: v(e.onBlur, () => a(!1))
          }
        ) })
      }
    );
  }
), Pt = "MenuCheckboxItem", Ie = o.forwardRef(
  (e, n) => {
    const { checked: t = !1, onCheckedChange: r, ...u } = e;
    return /* @__PURE__ */ s(Ae, { scope: e.__scopeMenu, checked: t, children: /* @__PURE__ */ s(
      H,
      {
        role: "menuitemcheckbox",
        "aria-checked": X(t) ? "mixed" : t,
        ...u,
        ref: n,
        "data-state": ae(t),
        onSelect: v(
          u.onSelect,
          () => r?.(X(t) ? !0 : !t),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
Ie.displayName = Pt;
var ye = "MenuRadioGroup", [It, yt] = w(
  ye,
  { value: void 0, onValueChange: () => {
  } }
), xe = o.forwardRef(
  (e, n) => {
    const { value: t, onValueChange: r, ...u } = e, c = J(r);
    return /* @__PURE__ */ s(It, { scope: e.__scopeMenu, value: t, onValueChange: c, children: /* @__PURE__ */ s(oe, { ...u, ref: n }) });
  }
);
xe.displayName = ye;
var be = "MenuRadioItem", Te = o.forwardRef(
  (e, n) => {
    const { value: t, ...r } = e, u = yt(be, e.__scopeMenu), c = t === u.value;
    return /* @__PURE__ */ s(Ae, { scope: e.__scopeMenu, checked: c, children: /* @__PURE__ */ s(
      H,
      {
        role: "menuitemradio",
        "aria-checked": c,
        ...r,
        ref: n,
        "data-state": ae(c),
        onSelect: v(
          r.onSelect,
          () => u.onValueChange?.(t),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
Te.displayName = be;
var re = "MenuItemIndicator", [Ae, xt] = w(
  re,
  { checked: !1 }
), Oe = o.forwardRef(
  (e, n) => {
    const { __scopeMenu: t, forceMount: r, ...u } = e, c = xt(re, t);
    return /* @__PURE__ */ s(
      j,
      {
        present: r || X(c.checked) || c.checked === !0,
        children: /* @__PURE__ */ s(
          D.span,
          {
            ...u,
            ref: n,
            "data-state": ae(c.checked)
          }
        )
      }
    );
  }
);
Oe.displayName = re;
var bt = "MenuSeparator", ke = o.forwardRef(
  (e, n) => {
    const { __scopeMenu: t, ...r } = e;
    return /* @__PURE__ */ s(
      D.div,
      {
        role: "separator",
        "aria-orientation": "horizontal",
        ...r,
        ref: n
      }
    );
  }
);
ke.displayName = bt;
var Tt = "MenuArrow", De = o.forwardRef(
  (e, n) => {
    const { __scopeMenu: t, ...r } = e, u = L(t);
    return /* @__PURE__ */ s(nt, { ...u, ...r, ref: n });
  }
);
De.displayName = Tt;
var ce = "MenuSub", [At, Ne] = w(ce), Le = (e) => {
  const { __scopeMenu: n, children: t, open: r = !1, onOpenChange: u } = e, c = S(ce, n), d = L(n), [m, p] = o.useState(null), [f, M] = o.useState(null), a = J(u);
  return o.useEffect(() => (c.open === !1 && a(!1), () => a(!1)), [c.open, a]), /* @__PURE__ */ s(me, { ...d, children: /* @__PURE__ */ s(
    ge,
    {
      scope: n,
      open: r,
      onOpenChange: a,
      content: f,
      onContentChange: M,
      children: /* @__PURE__ */ s(
        At,
        {
          scope: n,
          contentId: fe(),
          triggerId: fe(),
          trigger: m,
          onTriggerChange: p,
          children: t
        }
      )
    }
  ) });
};
Le.displayName = ce;
var A = "MenuSubTrigger", Fe = o.forwardRef(
  (e, n) => {
    const t = S(A, e.__scopeMenu), r = F(A, e.__scopeMenu), u = Ne(A, e.__scopeMenu), c = te(A, e.__scopeMenu), d = o.useRef(null), { pointerGraceTimerRef: m, onPointerGraceIntentChange: p } = c, f = { __scopeMenu: e.__scopeMenu }, M = o.useCallback(() => {
      d.current && window.clearTimeout(d.current), d.current = null;
    }, []);
    o.useEffect(() => M, [M]), o.useEffect(() => {
      const l = m.current;
      return () => {
        window.clearTimeout(l), p(null);
      };
    }, [m, p]);
    const a = x(n, u.onTriggerChange);
    return /* @__PURE__ */ s(Q, { asChild: !0, ...f, children: /* @__PURE__ */ s(
      Pe,
      {
        id: u.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": t.open,
        "aria-controls": t.open ? u.contentId : void 0,
        "data-state": Ue(t.open),
        ...e,
        ref: a,
        onClick: (l) => {
          e.onClick?.(l), !(e.disabled || l.defaultPrevented) && (l.currentTarget.focus(), t.open || t.onOpenChange(!0));
        },
        onPointerMove: v(
          e.onPointerMove,
          k((l) => {
            c.onItemEnter(l), !l.defaultPrevented && !e.disabled && !t.open && !d.current && (c.onPointerGraceIntentChange(null), d.current = window.setTimeout(() => {
              t.onOpenChange(!0), M();
            }, 100));
          })
        ),
        onPointerLeave: v(
          e.onPointerLeave,
          k((l) => {
            M();
            const h = t.content?.getBoundingClientRect();
            if (h) {
              const C = t.content?.dataset.side, R = C === "right", K = R ? -5 : 5, P = h[R ? "left" : "right"], G = h[R ? "right" : "left"];
              c.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: l.clientX + K, y: l.clientY },
                  { x: P, y: h.top },
                  { x: G, y: h.top },
                  { x: G, y: h.bottom },
                  { x: P, y: h.bottom }
                ],
                side: C
              }), window.clearTimeout(m.current), m.current = window.setTimeout(
                () => c.onPointerGraceIntentChange(null),
                300
              );
            } else {
              if (c.onTriggerLeave(l), l.defaultPrevented) return;
              c.onPointerGraceIntentChange(null);
            }
          })
        ),
        onKeyDown: v(e.onKeyDown, (l) => {
          e.disabled || l.target !== l.currentTarget || c.searchRef.current !== "" && l.key === " " || ft[r.dir].includes(l.key) && (t.onOpenChange(!0), t.content?.focus(), l.preventDefault());
        })
      }
    ) });
  }
);
Fe.displayName = A;
var Ke = "MenuSubContent", Ge = o.forwardRef(
  (e, n) => {
    const t = Re(_, e.__scopeMenu), { forceMount: r = t.forceMount, align: u = "start", ...c } = e, d = S(_, e.__scopeMenu), m = F(_, e.__scopeMenu), p = Ne(Ke, e.__scopeMenu), f = o.useRef(null), M = x(n, f);
    return /* @__PURE__ */ s(O.Provider, { scope: e.__scopeMenu, children: /* @__PURE__ */ s(j, { present: r || d.open, children: /* @__PURE__ */ s(O.Slot, { scope: e.__scopeMenu, children: /* @__PURE__ */ s(
      ne,
      {
        id: p.contentId,
        "aria-labelledby": p.triggerId,
        ...c,
        ref: M,
        align: u,
        side: m.dir === "rtl" ? "left" : "right",
        disableOutsidePointerEvents: !1,
        disableOutsideScroll: !1,
        trapFocus: !1,
        onOpenAutoFocus: (a) => {
          m.isUsingKeyboardRef.current && f.current?.focus(), a.preventDefault();
        },
        onCloseAutoFocus: (a) => a.preventDefault(),
        onFocusOutside: v(e.onFocusOutside, (a) => {
          a.target !== p.trigger && d.onOpenChange(!1);
        }),
        onEscapeKeyDown: v(e.onEscapeKeyDown, (a) => {
          m.onClose(), a.preventDefault();
        }),
        onKeyDown: v(e.onKeyDown, (a) => {
          const l = a.currentTarget.contains(a.target), h = pt[m.dir].includes(a.key);
          l && h && (d.onOpenChange(!1), p.trigger?.focus(), a.preventDefault());
        })
      }
    ) }) }) });
  }
);
Ge.displayName = Ke;
function Ue(e) {
  return e ? "open" : "closed";
}
function X(e) {
  return e === "indeterminate";
}
function ae(e) {
  return X(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
function Ot(e) {
  const n = document.activeElement;
  for (const t of e)
    if (t === n || (t.focus(), document.activeElement !== n)) return;
}
function kt(e, n) {
  return e.map((t, r) => e[(n + r) % e.length]);
}
function Dt(e, n, t) {
  const u = n.length > 1 && Array.from(n).every((f) => f === n[0]) ? n[0] : n, c = t ? e.indexOf(t) : -1;
  let d = kt(e, Math.max(c, 0));
  u.length === 1 && (d = d.filter((f) => f !== t));
  const p = d.find(
    (f) => f.toLowerCase().startsWith(u.toLowerCase())
  );
  return p !== t ? p : void 0;
}
function Nt(e, n) {
  const { x: t, y: r } = e;
  let u = !1;
  for (let c = 0, d = n.length - 1; c < n.length; d = c++) {
    const m = n[c], p = n[d], f = m.x, M = m.y, a = p.x, l = p.y;
    M > r != l > r && t < (a - f) * (r - M) / (l - M) + f && (u = !u);
  }
  return u;
}
function Lt(e, n) {
  if (!n) return !1;
  const t = { x: e.clientX, y: e.clientY };
  return Nt(t, n);
}
function k(e) {
  return (n) => n.pointerType === "mouse" ? e(n) : void 0;
}
var on = _e, rn = Q, cn = Se, an = Ee, sn = oe, un = we, ln = H, dn = Ie, fn = xe, pn = Te, mn = Oe, hn = ke, Mn = De, vn = Le, Cn = Fe, gn = Ge;
export {
  rn as Anchor,
  Mn as Arrow,
  dn as CheckboxItem,
  an as Content,
  sn as Group,
  ln as Item,
  mn as ItemIndicator,
  un as Label,
  _e as Menu,
  Q as MenuAnchor,
  De as MenuArrow,
  Ie as MenuCheckboxItem,
  Ee as MenuContent,
  oe as MenuGroup,
  H as MenuItem,
  Oe as MenuItemIndicator,
  we as MenuLabel,
  Se as MenuPortal,
  xe as MenuRadioGroup,
  Te as MenuRadioItem,
  ke as MenuSeparator,
  Le as MenuSub,
  Ge as MenuSubContent,
  Fe as MenuSubTrigger,
  cn as Portal,
  fn as RadioGroup,
  pn as RadioItem,
  on as Root,
  hn as Separator,
  vn as Sub,
  gn as SubContent,
  Cn as SubTrigger,
  nn as createMenuScope
};
//# sourceMappingURL=index216.js.map
