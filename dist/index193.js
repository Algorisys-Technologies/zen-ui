import { createComponent as d, mergeProps as M, memo as re, Portal as Ee, isServer as Le } from "solid-js/web";
import { Popper as fe } from "./index169.js";
import { createSelectableList as Ge } from "./index185.js";
import { createSelectableItem as me, createListState as Ue } from "./index186.js";
import { useOptionalDomCollectionContext as Ve, createDomCollection as Ne, createDomCollectionItem as _e } from "./index188.js";
import { useLocale as H } from "./index147.js";
import { createFocusScope as ze } from "./index170.js";
import { createHideOutside as $e } from "./index171.js";
import { DismissableLayer as Be } from "./index172.js";
import { createDisclosureState as he } from "./index173.js";
import { ButtonRoot as Xe } from "./index174.js";
import { createToggleState as Ye } from "./index195.js";
import { createRegisterId as B } from "./index159.js";
import { createControllableSignal as He } from "./index160.js";
import { createTagName as We } from "./index168.js";
import { Polymorphic as A } from "./index161.js";
import { splitProps as I, createMemo as j, createEffect as y, on as ve, onCleanup as T, createUniqueId as V, createContext as G, Show as X, createSignal as F, useContext as U } from "solid-js";
import { mergeDefaultProps as D, composeEventHandlers as w, createGenerateId as ie, callHandler as P, scrollIntoViewport as qe, focusWithoutScrolling as Q, contains as J, removeItemFromArray as je, isPointInPolygon as Je } from "./index163.js";
import Qe from "./index175.js";
import Ze from "./index164.js";
import { mergeRefs as N } from "./index166.js";
import { combineStyle as et } from "./index167.js";
var tt = G();
function Z() {
  return U(tt);
}
var nt = G();
function Me() {
  return U(nt);
}
var be = G();
function Ce() {
  return U(be);
}
function L() {
  const r = Ce();
  if (r === void 0)
    throw new Error("[kobalte]: `useMenuContext` must be used within a `Menu` component");
  return r;
}
var we = G();
function se() {
  const r = U(we);
  if (r === void 0)
    throw new Error("[kobalte]: `useMenuItemContext` must be used within a `Menu.Item` component");
  return r;
}
var Pe = G();
function E() {
  const r = U(Pe);
  if (r === void 0)
    throw new Error("[kobalte]: `useMenuRootContext` must be used within a `MenuRoot` component");
  return r;
}
function ae(r) {
  let o;
  const s = E(), e = L(), t = D({
    id: s.generateId(`item-${V()}`)
  }, r), [n, u] = I(t, ["ref", "textValue", "disabled", "closeOnSelect", "checked", "indeterminate", "onSelect", "onPointerMove", "onPointerLeave", "onPointerDown", "onPointerUp", "onClick", "onKeyDown", "onMouseDown", "onFocus"]), [p, c] = F(), [b, g] = F(), [h, x] = F(), S = () => e.listState().selectionManager(), v = () => u.id, K = () => S().focusedKey() === v(), k = () => {
    n.onSelect?.(), n.closeOnSelect && setTimeout(() => {
      e.close(!0);
    });
  };
  _e({
    getItem: () => ({
      ref: () => o,
      type: "item",
      key: v(),
      textValue: n.textValue ?? h()?.textContent ?? o?.textContent ?? "",
      disabled: n.disabled ?? !1
    })
  });
  const a = me({
    key: v,
    selectionManager: S,
    shouldSelectOnPressUp: !0,
    allowsDifferentPressOrigin: !0,
    disabled: () => n.disabled
  }, () => o), C = (m) => {
    P(m, n.onPointerMove), m.pointerType === "mouse" && (n.disabled ? e.onItemLeave(m) : (e.onItemEnter(m), m.defaultPrevented || (Q(m.currentTarget), e.listState().selectionManager().setFocused(!0), e.listState().selectionManager().setFocusedKey(v()))));
  }, i = (m) => {
    P(m, n.onPointerLeave), m.pointerType === "mouse" && e.onItemLeave(m);
  }, f = (m) => {
    P(m, n.onPointerUp), !n.disabled && m.button === 0 && k();
  }, O = (m) => {
    if (P(m, n.onKeyDown), !m.repeat && !n.disabled)
      switch (m.key) {
        case "Enter":
        case " ":
          k();
          break;
      }
  }, _ = j(() => {
    if (n.indeterminate)
      return "mixed";
    if (n.checked != null)
      return n.checked;
  }), W = j(() => ({
    "data-indeterminate": n.indeterminate ? "" : void 0,
    "data-checked": n.checked && !n.indeterminate ? "" : void 0,
    "data-disabled": n.disabled ? "" : void 0,
    "data-highlighted": K() ? "" : void 0
  })), z = {
    isChecked: () => n.checked,
    dataset: W,
    setLabelRef: x,
    generateId: ie(() => u.id),
    registerLabel: B(c),
    registerDescription: B(g)
  };
  return d(we.Provider, {
    value: z,
    get children() {
      return d(A, M({
        as: "div",
        ref(m) {
          var $ = N((ee) => o = ee, n.ref);
          typeof $ == "function" && $(m);
        },
        get tabIndex() {
          return a.tabIndex();
        },
        get "aria-checked"() {
          return _();
        },
        get "aria-disabled"() {
          return n.disabled;
        },
        get "aria-labelledby"() {
          return p();
        },
        get "aria-describedby"() {
          return b();
        },
        get "data-key"() {
          return a.dataKey();
        },
        get onPointerDown() {
          return w([n.onPointerDown, a.onPointerDown]);
        },
        get onPointerUp() {
          return w([f, a.onPointerUp]);
        },
        get onClick() {
          return w([n.onClick, a.onClick]);
        },
        get onKeyDown() {
          return w([O, a.onKeyDown]);
        },
        get onMouseDown() {
          return w([n.onMouseDown, a.onMouseDown]);
        },
        get onFocus() {
          return w([n.onFocus, a.onFocus]);
        },
        onPointerMove: C,
        onPointerLeave: i
      }, W, u));
    }
  });
}
function Rt(r) {
  const o = D({
    closeOnSelect: !1
  }, r), [s, e] = I(o, ["checked", "defaultChecked", "onChange", "onSelect"]), t = Ye({
    isSelected: () => s.checked,
    defaultIsSelected: () => s.defaultChecked,
    onSelectedChange: (u) => s.onChange?.(u),
    isDisabled: () => e.disabled
  });
  return d(ae, M({
    role: "menuitemcheckbox",
    get checked() {
      return t.isSelected();
    },
    onSelect: () => {
      s.onSelect?.(), t.toggle();
    }
  }, e));
}
var Y = {
  next: (r, o) => r === "ltr" ? o === "horizontal" ? "ArrowRight" : "ArrowDown" : o === "horizontal" ? "ArrowLeft" : "ArrowUp",
  previous: (r, o) => Y.next(r === "ltr" ? "rtl" : "ltr", o)
}, pe = {
  first: (r) => r === "horizontal" ? "ArrowDown" : "ArrowRight",
  last: (r) => r === "horizontal" ? "ArrowUp" : "ArrowLeft"
};
function At(r) {
  const o = E(), s = L(), e = Z(), {
    direction: t
  } = H(), n = D({
    id: o.generateId("trigger")
  }, r), [u, p] = I(n, ["ref", "id", "disabled", "onPointerDown", "onClick", "onKeyDown", "onMouseOver", "onFocus"]);
  let c = () => o.value();
  e !== void 0 && (c = () => o.value() ?? u.id, e.lastValue() === void 0 && e.setLastValue(c));
  const b = We(() => s.triggerRef(), () => "button"), g = j(() => b() === "a" && s.triggerRef()?.getAttribute("href") != null);
  y(ve(() => e?.value(), (a) => {
    g() && a === c() && s.triggerRef()?.focus();
  }));
  const h = () => {
    e !== void 0 ? s.isOpen() ? e.value() === c() && e.closeMenu() : (e.autoFocusMenu() || e.setAutoFocusMenu(!0), s.open(!1)) : s.toggle(!0);
  }, x = (a) => {
    P(a, u.onPointerDown), a.currentTarget.dataset.pointerType = a.pointerType, !u.disabled && a.pointerType !== "touch" && a.button === 0 && h();
  }, S = (a) => {
    P(a, u.onClick), u.disabled || a.currentTarget.dataset.pointerType === "touch" && h();
  }, v = (a) => {
    if (P(a, u.onKeyDown), !u.disabled) {
      if (g())
        switch (a.key) {
          case "Enter":
          case " ":
            return;
        }
      switch (a.key) {
        case "Enter":
        case " ":
        case pe.first(o.orientation()):
          a.stopPropagation(), a.preventDefault(), qe(a.currentTarget), s.open("first"), e?.setAutoFocusMenu(!0), e?.setValue(c);
          break;
        case pe.last(o.orientation()):
          a.stopPropagation(), a.preventDefault(), s.open("last");
          break;
        case Y.next(t(), o.orientation()):
          if (e === void 0) break;
          a.stopPropagation(), a.preventDefault(), e.nextMenu();
          break;
        case Y.previous(t(), o.orientation()):
          if (e === void 0) break;
          a.stopPropagation(), a.preventDefault(), e.previousMenu();
          break;
      }
    }
  }, K = (a) => {
    P(a, u.onMouseOver), s.triggerRef()?.dataset.pointerType !== "touch" && !u.disabled && e !== void 0 && e.value() !== void 0 && e.setValue(c);
  }, k = (a) => {
    P(a, u.onFocus), e !== void 0 && a.currentTarget.dataset.pointerType !== "touch" && e.setValue(c);
  };
  return y(() => T(s.registerTriggerId(u.id))), d(Xe, M({
    ref(a) {
      var C = N(s.setTriggerRef, u.ref);
      typeof C == "function" && C(a);
    },
    get "data-kb-menu-value-trigger"() {
      return o.value();
    },
    get id() {
      return u.id;
    },
    get disabled() {
      return u.disabled;
    },
    "aria-haspopup": "true",
    get "aria-expanded"() {
      return s.isOpen();
    },
    get "aria-controls"() {
      return re(() => !!s.isOpen())() ? s.contentId() : void 0;
    },
    get "data-highlighted"() {
      return c() !== void 0 && e?.value() === c() ? !0 : void 0;
    },
    get tabIndex() {
      return e !== void 0 ? e.value() === c() || e.lastValue() === c() ? 0 : -1 : void 0;
    },
    onPointerDown: x,
    onMouseOver: K,
    onClick: S,
    onKeyDown: v,
    onFocus: k,
    role: e !== void 0 ? "menuitem" : void 0
  }, () => s.dataset(), p));
}
function xe(r) {
  let o;
  const s = E(), e = L(), t = Z(), n = Me(), {
    direction: u
  } = H(), p = D({
    id: s.generateId(`content-${V()}`)
  }, r), [c, b] = I(p, ["ref", "id", "style", "onOpenAutoFocus", "onCloseAutoFocus", "onEscapeKeyDown", "onFocusOutside", "onPointerEnter", "onPointerMove", "onKeyDown", "onMouseDown", "onFocusIn", "onFocusOut"]);
  let g = 0;
  const h = () => e.parentMenuContext() == null && t === void 0 && s.isModal(), x = Ge({
    selectionManager: e.listState().selectionManager,
    collection: e.listState().collection,
    autoFocus: e.autoFocus,
    deferAutoFocus: !0,
    // ensure all menu items are mounted and collection is not empty before trying to autofocus.
    shouldFocusWrap: !0,
    disallowTypeAhead: () => !e.listState().selectionManager().isFocused(),
    orientation: () => s.orientation() === "horizontal" ? "vertical" : "horizontal"
  }, () => o);
  ze({
    trapFocus: () => h() && e.isOpen(),
    onMountAutoFocus: (i) => {
      t === void 0 && c.onOpenAutoFocus?.(i);
    },
    onUnmountAutoFocus: c.onCloseAutoFocus
  }, () => o);
  const S = (i) => {
    if (J(i.currentTarget, i.target) && (i.key === "Tab" && e.isOpen() && i.preventDefault(), t !== void 0 && i.currentTarget.getAttribute("aria-haspopup") !== "true"))
      switch (i.key) {
        case Y.next(u(), s.orientation()):
          i.stopPropagation(), i.preventDefault(), e.close(!0), t.setAutoFocusMenu(!0), t.nextMenu();
          break;
        case Y.previous(u(), s.orientation()):
          if (i.currentTarget.hasAttribute("data-closed")) break;
          i.stopPropagation(), i.preventDefault(), e.close(!0), t.setAutoFocusMenu(!0), t.previousMenu();
          break;
      }
  }, v = (i) => {
    c.onEscapeKeyDown?.(i), t?.setAutoFocusMenu(!1), e.close(!0);
  }, K = (i) => {
    c.onFocusOutside?.(i), s.isModal() && i.preventDefault();
  }, k = (i) => {
    P(i, c.onPointerEnter), e.isOpen() && (e.parentMenuContext()?.listState().selectionManager().setFocused(!1), e.parentMenuContext()?.listState().selectionManager().setFocusedKey(void 0));
  }, a = (i) => {
    if (P(i, c.onPointerMove), i.pointerType !== "mouse")
      return;
    const f = i.target, O = g !== i.clientX;
    J(i.currentTarget, f) && O && (e.setPointerDir(i.clientX > g ? "right" : "left"), g = i.clientX);
  };
  y(() => T(e.registerContentId(c.id))), T(() => e.setContentRef(void 0));
  const C = {
    ref: N((i) => {
      e.setContentRef(i), o = i;
    }, c.ref),
    role: "menu",
    get id() {
      return c.id;
    },
    get tabIndex() {
      return x.tabIndex();
    },
    get "aria-labelledby"() {
      return e.triggerId();
    },
    onKeyDown: w([c.onKeyDown, x.onKeyDown, S]),
    onMouseDown: w([c.onMouseDown, x.onMouseDown]),
    onFocusIn: w([c.onFocusIn, x.onFocusIn]),
    onFocusOut: w([c.onFocusOut, x.onFocusOut]),
    onPointerEnter: k,
    onPointerMove: a,
    get "data-orientation"() {
      return s.orientation();
    }
  };
  return d(X, {
    get when() {
      return e.contentPresent();
    },
    get children() {
      return d(X, {
        get when() {
          return n === void 0 || e.parentMenuContext() != null;
        },
        get fallback() {
          return d(A, M({
            as: "div"
          }, () => e.dataset(), C, b));
        },
        get children() {
          return d(fe.Positioner, {
            get children() {
              return d(Be, M({
                get disableOutsidePointerEvents() {
                  return re(() => !!h())() && e.isOpen();
                },
                get excludedElements() {
                  return [e.triggerRef];
                },
                bypassTopMostLayerCheck: !0,
                get style() {
                  return et({
                    "--kb-menu-content-transform-origin": "var(--kb-popper-content-transform-origin)",
                    position: "relative"
                  }, c.style);
                },
                onEscapeKeyDown: v,
                onFocusOutside: K,
                get onDismiss() {
                  return e.close;
                }
              }, () => e.dataset(), C, b));
            }
          });
        }
      });
    }
  });
}
function Et(r) {
  let o;
  const s = E(), e = L(), [t, n] = I(r, ["ref"]);
  return Qe({
    element: () => o ?? null,
    enabled: () => e.contentPresent() && s.preventScroll()
  }), d(xe, M({
    ref(u) {
      var p = N((c) => {
        o = c;
      }, t.ref);
      typeof p == "function" && p(u);
    }
  }, n));
}
var Ie = G();
function ot() {
  const r = U(Ie);
  if (r === void 0)
    throw new Error("[kobalte]: `useMenuGroupContext` must be used within a `Menu.Group` component");
  return r;
}
function rt(r) {
  const o = E(), s = D({
    id: o.generateId(`group-${V()}`)
  }, r), [e, t] = F(), n = {
    generateId: ie(() => s.id),
    registerLabelId: B(t)
  };
  return d(Ie.Provider, {
    value: n,
    get children() {
      return d(A, M({
        as: "div",
        role: "group",
        get "aria-labelledby"() {
          return e();
        }
      }, s));
    }
  });
}
function Lt(r) {
  const o = ot(), s = D({
    id: o.generateId("label")
  }, r), [e, t] = I(s, ["id"]);
  return y(() => T(o.registerLabelId(e.id))), d(A, M({
    as: "span",
    get id() {
      return e.id;
    },
    "aria-hidden": "true"
  }, t));
}
function Gt(r) {
  const o = L(), s = D({
    children: "▼"
  }, r);
  return d(A, M({
    as: "span",
    "aria-hidden": "true"
  }, () => o.dataset(), s));
}
function Ut(r) {
  return d(ae, M({
    role: "menuitem",
    closeOnSelect: !0
  }, r));
}
function Vt(r) {
  const o = se(), s = D({
    id: o.generateId("description")
  }, r), [e, t] = I(s, ["id"]);
  return y(() => T(o.registerDescription(e.id))), d(A, M({
    as: "div",
    get id() {
      return e.id;
    }
  }, () => o.dataset(), t));
}
function Nt(r) {
  const o = se(), s = D({
    id: o.generateId("indicator")
  }, r), [e, t] = I(s, ["forceMount"]);
  return d(X, {
    get when() {
      return e.forceMount || o.isChecked();
    },
    get children() {
      return d(A, M({
        as: "div"
      }, () => o.dataset(), t));
    }
  });
}
function _t(r) {
  const o = se(), s = D({
    id: o.generateId("label")
  }, r), [e, t] = I(s, ["ref", "id"]);
  return y(() => T(o.registerLabel(e.id))), d(A, M({
    as: "div",
    ref(n) {
      var u = N(o.setLabelRef, e.ref);
      typeof u == "function" && u(n);
    },
    get id() {
      return e.id;
    }
  }, () => o.dataset(), t));
}
function zt(r) {
  const o = L();
  return d(X, {
    get when() {
      return o.contentPresent();
    },
    get children() {
      return d(Ee, r);
    }
  });
}
var De = G();
function it() {
  const r = U(De);
  if (r === void 0)
    throw new Error("[kobalte]: `useMenuRadioGroupContext` must be used within a `Menu.RadioGroup` component");
  return r;
}
function $t(r) {
  const s = E().generateId(`radiogroup-${V()}`), e = D({
    id: s
  }, r), [t, n] = I(e, ["value", "defaultValue", "onChange", "disabled"]), [u, p] = He({
    value: () => t.value,
    defaultValue: () => t.defaultValue,
    onChange: (b) => t.onChange?.(b)
  }), c = {
    isDisabled: () => t.disabled,
    isSelectedValue: (b) => b === u(),
    setSelectedValue: (b) => p(b)
  };
  return d(De.Provider, {
    value: c,
    get children() {
      return d(rt, n);
    }
  });
}
function Bt(r) {
  const o = it(), s = D({
    closeOnSelect: !1
  }, r), [e, t] = I(s, ["value", "onSelect"]);
  return d(ae, M({
    role: "menuitemradio",
    get checked() {
      return o.isSelectedValue(e.value);
    },
    onSelect: () => {
      e.onSelect?.(), o.setSelectedValue(e.value);
    }
  }, t));
}
function st(r, o, s) {
  const e = r.split("-")[0], t = s.getBoundingClientRect(), n = [], u = o.clientX, p = o.clientY;
  switch (e) {
    case "top":
      n.push([u, p + 5]), n.push([t.left, t.bottom]), n.push([t.left, t.top]), n.push([t.right, t.top]), n.push([t.right, t.bottom]);
      break;
    case "right":
      n.push([u - 5, p]), n.push([t.left, t.top]), n.push([t.right, t.top]), n.push([t.right, t.bottom]), n.push([t.left, t.bottom]);
      break;
    case "bottom":
      n.push([u, p - 5]), n.push([t.right, t.top]), n.push([t.right, t.bottom]), n.push([t.left, t.bottom]), n.push([t.left, t.top]);
      break;
    case "left":
      n.push([u + 5, p]), n.push([t.right, t.bottom]), n.push([t.left, t.bottom]), n.push([t.left, t.top]), n.push([t.right, t.top]);
      break;
  }
  return n;
}
function at(r, o) {
  return o ? Je([r.clientX, r.clientY], o) : !1;
}
function ye(r) {
  const o = E(), s = Ve(), e = Ce(), t = Z(), n = Me(), u = D({
    placement: o.orientation() === "horizontal" ? "bottom-start" : "right-start"
  }, r), [p, c] = I(u, ["open", "defaultOpen", "onOpenChange"]);
  let b = 0, g = null, h = "right";
  const [x, S] = F(), [v, K] = F(), [k, a] = F(), [C, i] = F(), [f, O] = F(!0), [_, W] = F(c.placement), [z, m] = F([]), [$, ee] = F([]), {
    DomCollectionProvider: Se
  } = Ne({
    items: $,
    onItemsChange: ee
  }), R = he({
    open: () => p.open,
    defaultOpen: () => p.defaultOpen,
    onOpenChange: (l) => p.onOpenChange?.(l)
  }), {
    present: ke
  } = Ze({
    show: () => o.forceMount() || R.isOpen(),
    element: () => C() ?? null
  }), te = Ue({
    selectionMode: "none",
    dataSource: $
  }), ue = (l) => {
    O(l), R.open();
  }, ce = (l = !1) => {
    R.close(), l && e && e.close(!0);
  }, Oe = (l) => {
    O(l), R.toggle();
  }, le = () => {
    const l = C();
    l && (Q(l), te.selectionManager().setFocused(!0), te.selectionManager().setFocusedKey(void 0));
  }, de = () => {
    n != null ? setTimeout(() => le()) : le();
  }, Fe = (l) => {
    m((oe) => [...oe, l]);
    const q = e?.registerNestedMenu(l);
    return () => {
      m((oe) => je(oe, l)), q?.();
    };
  }, ne = (l) => h === g?.side && at(l, g?.area), Te = (l) => {
    ne(l) && l.preventDefault();
  }, Ke = (l) => {
    ne(l) || de();
  }, Re = (l) => {
    ne(l) && l.preventDefault();
  };
  $e({
    isDisabled: () => !(e == null && R.isOpen() && o.isModal()),
    targets: () => [C(), ...z()].filter(Boolean)
  }), y(() => {
    const l = C();
    if (!l || !e)
      return;
    const q = e.registerNestedMenu(l);
    T(() => {
      q();
    });
  }), y(() => {
    e === void 0 && t?.registerMenu(o.value(), [C(), ...z()]);
  }), y(() => {
    e !== void 0 || t === void 0 || (t.value() === o.value() ? (k()?.focus(), t.autoFocusMenu() && ue(!0)) : ce());
  }), y(() => {
    e !== void 0 || t === void 0 || R.isOpen() && t.setValue(o.value());
  }), T(() => {
    e === void 0 && t?.unregisterMenu(o.value());
  });
  const Ae = {
    dataset: j(() => ({
      "data-expanded": R.isOpen() ? "" : void 0,
      "data-closed": R.isOpen() ? void 0 : ""
    })),
    isOpen: R.isOpen,
    contentPresent: ke,
    nestedMenus: z,
    currentPlacement: _,
    pointerGraceTimeoutId: () => b,
    autoFocus: f,
    listState: () => te,
    parentMenuContext: () => e,
    triggerRef: k,
    contentRef: C,
    triggerId: x,
    contentId: v,
    setTriggerRef: a,
    setContentRef: i,
    open: ue,
    close: ce,
    toggle: Oe,
    focusContent: de,
    onItemEnter: Te,
    onItemLeave: Ke,
    onTriggerLeave: Re,
    setPointerDir: (l) => h = l,
    setPointerGraceTimeoutId: (l) => b = l,
    setPointerGraceIntent: (l) => g = l,
    registerNestedMenu: Fe,
    registerItemToParentDomCollection: s?.registerItem,
    registerTriggerId: B(S),
    registerContentId: B(K)
  };
  return d(Se, {
    get children() {
      return d(be.Provider, {
        value: Ae,
        get children() {
          return d(X, {
            when: n === void 0,
            get fallback() {
              return c.children;
            },
            get children() {
              return d(fe, M({
                anchorRef: k,
                contentRef: C,
                onCurrentPlacementChange: W
              }, c));
            }
          });
        }
      });
    }
  });
}
function Xt(r) {
  const {
    direction: o
  } = H();
  return d(ye, M({
    get placement() {
      return o() === "rtl" ? "left-start" : "right-start";
    },
    flip: !0
  }, r));
}
var ut = {
  close: (r, o) => r === "ltr" ? [o === "horizontal" ? "ArrowLeft" : "ArrowUp"] : [o === "horizontal" ? "ArrowRight" : "ArrowDown"]
};
function Yt(r) {
  const o = L(), s = E(), [e, t] = I(r, ["onFocusOutside", "onKeyDown"]), {
    direction: n
  } = H();
  return d(xe, M({
    onOpenAutoFocus: (g) => {
      g.preventDefault();
    },
    onCloseAutoFocus: (g) => {
      g.preventDefault();
    },
    onFocusOutside: (g) => {
      e.onFocusOutside?.(g);
      const h = g.target;
      J(o.triggerRef(), h) || o.close();
    },
    onKeyDown: (g) => {
      P(g, e.onKeyDown);
      const h = J(g.currentTarget, g.target), x = ut.close(n(), s.orientation()).includes(g.key), S = o.parentMenuContext() != null;
      h && x && S && (o.close(), Q(o.triggerRef()));
    }
  }, t));
}
var ge = ["Enter", " "], ct = {
  open: (r, o) => r === "ltr" ? [...ge, o === "horizontal" ? "ArrowRight" : "ArrowDown"] : [...ge, o === "horizontal" ? "ArrowLeft" : "ArrowUp"]
};
function Ht(r) {
  let o;
  const s = E(), e = L(), t = D({
    id: s.generateId(`sub-trigger-${V()}`)
  }, r), [n, u] = I(t, ["ref", "id", "textValue", "disabled", "onPointerMove", "onPointerLeave", "onPointerDown", "onPointerUp", "onClick", "onKeyDown", "onMouseDown", "onFocus"]);
  let p = null;
  const c = () => {
    Le || (p && window.clearTimeout(p), p = null);
  }, {
    direction: b
  } = H(), g = () => n.id, h = () => {
    const i = e.parentMenuContext();
    if (i == null)
      throw new Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");
    return i.listState().selectionManager();
  }, x = () => e.listState().collection(), S = () => h().focusedKey() === g(), v = me({
    key: g,
    selectionManager: h,
    shouldSelectOnPressUp: !0,
    allowsDifferentPressOrigin: !0,
    disabled: () => n.disabled
  }, () => o), K = (i) => {
    P(i, n.onClick), !e.isOpen() && !n.disabled && e.open(!0);
  }, k = (i) => {
    if (P(i, n.onPointerMove), i.pointerType !== "mouse")
      return;
    const f = e.parentMenuContext();
    if (f?.onItemEnter(i), !i.defaultPrevented) {
      if (n.disabled) {
        f?.onItemLeave(i);
        return;
      }
      !e.isOpen() && !p && (e.parentMenuContext()?.setPointerGraceIntent(null), p = window.setTimeout(() => {
        e.open(!1), c();
      }, 100)), f?.onItemEnter(i), i.defaultPrevented || (e.listState().selectionManager().isFocused() && (e.listState().selectionManager().setFocused(!1), e.listState().selectionManager().setFocusedKey(void 0)), Q(i.currentTarget), f?.listState().selectionManager().setFocused(!0), f?.listState().selectionManager().setFocusedKey(g()));
    }
  }, a = (i) => {
    if (P(i, n.onPointerLeave), i.pointerType !== "mouse")
      return;
    c();
    const f = e.parentMenuContext(), O = e.contentRef();
    if (O) {
      f?.setPointerGraceIntent({
        area: st(e.currentPlacement(), i, O),
        // Safe because sub menu always open "left" or "right".
        side: e.currentPlacement().split("-")[0]
      }), window.clearTimeout(f?.pointerGraceTimeoutId());
      const _ = window.setTimeout(() => {
        f?.setPointerGraceIntent(null);
      }, 300);
      f?.setPointerGraceTimeoutId(_);
    } else {
      if (f?.onTriggerLeave(i), i.defaultPrevented)
        return;
      f?.setPointerGraceIntent(null);
    }
    f?.onItemLeave(i);
  }, C = (i) => {
    P(i, n.onKeyDown), !i.repeat && (n.disabled || ct.open(b(), s.orientation()).includes(i.key) && (i.stopPropagation(), i.preventDefault(), h().setFocused(!1), h().setFocusedKey(void 0), e.isOpen() || e.open("first"), e.focusContent(), e.listState().selectionManager().setFocused(!0), e.listState().selectionManager().setFocusedKey(x().getFirstKey())));
  };
  return y(() => {
    if (e.registerItemToParentDomCollection == null)
      throw new Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");
    const i = e.registerItemToParentDomCollection({
      ref: () => o,
      type: "item",
      key: g(),
      textValue: n.textValue ?? o?.textContent ?? "",
      disabled: n.disabled ?? !1
    });
    T(i);
  }), y(ve(() => e.parentMenuContext()?.pointerGraceTimeoutId(), (i) => {
    T(() => {
      window.clearTimeout(i), e.parentMenuContext()?.setPointerGraceIntent(null);
    });
  })), y(() => T(e.registerTriggerId(n.id))), T(() => {
    c();
  }), d(A, M({
    as: "div",
    ref(i) {
      var f = N((O) => {
        e.setTriggerRef(O), o = O;
      }, n.ref);
      typeof f == "function" && f(i);
    },
    get id() {
      return n.id;
    },
    role: "menuitem",
    get tabIndex() {
      return v.tabIndex();
    },
    "aria-haspopup": "true",
    get "aria-expanded"() {
      return e.isOpen();
    },
    get "aria-controls"() {
      return re(() => !!e.isOpen())() ? e.contentId() : void 0;
    },
    get "aria-disabled"() {
      return n.disabled;
    },
    get "data-key"() {
      return v.dataKey();
    },
    get "data-highlighted"() {
      return S() ? "" : void 0;
    },
    get "data-disabled"() {
      return n.disabled ? "" : void 0;
    },
    get onPointerDown() {
      return w([n.onPointerDown, v.onPointerDown]);
    },
    get onPointerUp() {
      return w([n.onPointerUp, v.onPointerUp]);
    },
    get onClick() {
      return w([K, v.onClick]);
    },
    get onKeyDown() {
      return w([C, v.onKeyDown]);
    },
    get onMouseDown() {
      return w([n.onMouseDown, v.onMouseDown]);
    },
    get onFocus() {
      return w([n.onFocus, v.onFocus]);
    },
    onPointerMove: k,
    onPointerLeave: a
  }, () => e.dataset(), u));
}
function Wt(r) {
  const o = Z(), s = `menu-${V()}`, e = D({
    id: s,
    modal: !0
  }, r), [t, n] = I(e, ["id", "modal", "preventScroll", "forceMount", "open", "defaultOpen", "onOpenChange", "value", "orientation"]), u = he({
    open: () => t.open,
    defaultOpen: () => t.defaultOpen,
    onOpenChange: (c) => t.onOpenChange?.(c)
  }), p = {
    isModal: () => t.modal ?? !0,
    preventScroll: () => t.preventScroll ?? p.isModal(),
    forceMount: () => t.forceMount ?? !1,
    generateId: ie(() => t.id),
    value: () => t.value,
    orientation: () => t.orientation ?? o?.orientation() ?? "horizontal"
  };
  return d(Pe.Provider, {
    value: p,
    get children() {
      return d(ye, M({
        get open() {
          return u.isOpen();
        },
        get onOpenChange() {
          return u.setIsOpen;
        }
      }, n));
    }
  });
}
export {
  Rt as MenuCheckboxItem,
  Et as MenuContent,
  rt as MenuGroup,
  Lt as MenuGroupLabel,
  Gt as MenuIcon,
  Ut as MenuItem,
  Vt as MenuItemDescription,
  Nt as MenuItemIndicator,
  _t as MenuItemLabel,
  zt as MenuPortal,
  $t as MenuRadioGroup,
  Bt as MenuRadioItem,
  Wt as MenuRoot,
  Xt as MenuSub,
  Yt as MenuSubContent,
  Ht as MenuSubTrigger,
  At as MenuTrigger,
  tt as MenubarContext,
  nt as NavigationMenuContext,
  L as useMenuContext,
  E as useMenuRootContext,
  Ce as useOptionalMenuContext
};
//# sourceMappingURL=index193.js.map
