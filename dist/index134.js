import { createComponent as c, mergeProps as y, memo as W, Portal as Ke } from "solid-js/web";
import { HiddenSelectBase as Ve } from "./index199.js";
import { ListboxSection as Q, ListboxItemLabel as X, ListboxItemIndicator as Y, ListboxItemDescription as Z, ListboxItem as ee, ListboxRoot as Re } from "./index198.js";
import { PopperArrow as te, Popper as oe } from "./index169.js";
import { ListKeyboardDelegate as Te } from "./index185.js";
import { createTypeSelect as ke, createListState as Ae, Selection as Ee } from "./index186.js";
import { createCollator as Be } from "./index147.js";
import { createFocusScope as _e } from "./index170.js";
import { createHideOutside as We } from "./index171.js";
import { DismissableLayer as ze } from "./index172.js";
import { createDisclosureState as He } from "./index173.js";
import { ButtonRoot as Ge } from "./index174.js";
import { FORM_CONTROL_FIELD_PROP_NAMES as $e, createFormControlField as Ne } from "./index201.js";
import { FormControlLabel as Ue } from "./index155.js";
import { createFormResetListener as je } from "./index156.js";
import { FormControlErrorMessage as re } from "./index157.js";
import { FormControlDescription as ne, useFormControlContext as le, FORM_CONTROL_PROP_NAMES as qe, createFormControl as Je, FormControlContext as Qe } from "./index158.js";
import { createRegisterId as _ } from "./index159.js";
import { Polymorphic as z } from "./index161.js";
import { __export as Xe } from "./index162.js";
import { mergeDefaultProps as L, focusWithoutScrolling as ie, createGenerateId as Ye, isFunction as se, callHandler as v } from "./index163.js";
import { splitProps as w, createMemo as O, createEffect as I, onCleanup as H, Show as G, createUniqueId as Ze, createSignal as S, on as et, createContext as tt, useContext as ot, children as rt } from "solid-js";
import nt from "./index175.js";
import lt from "./index164.js";
import { mergeRefs as $ } from "./index166.js";
import { access as D } from "./index165.js";
import { combineStyle as it } from "./index167.js";
var st = {};
Xe(st, {
  Arrow: () => te,
  Content: () => ce,
  Description: () => ne,
  ErrorMessage: () => re,
  HiddenSelect: () => ue,
  Icon: () => de,
  Item: () => ee,
  ItemDescription: () => Z,
  ItemIndicator: () => Y,
  ItemLabel: () => X,
  Label: () => pe,
  Listbox: () => fe,
  Portal: () => ge,
  Root: () => me,
  Section: () => Q,
  Select: () => ut,
  Trigger: () => ye,
  Value: () => be,
  useSelectContext: () => h
});
var ae = tt();
function h() {
  const i = ot(ae);
  if (i === void 0)
    throw new Error("[kobalte]: `useSelectContext` must be used within a `Select` component");
  return i;
}
function ce(i) {
  let o;
  const e = h(), [t, s] = w(i, ["ref", "style", "onCloseAutoFocus", "onFocusOutside"]), f = (n) => {
    e.close();
  }, a = (n) => {
    t.onFocusOutside?.(n), e.isOpen() && e.isModal() && n.preventDefault();
  };
  return We({
    isDisabled: () => !(e.isOpen() && e.isModal()),
    targets: () => o ? [o] : []
  }), nt({
    element: () => o ?? null,
    enabled: () => e.contentPresent() && e.preventScroll()
  }), _e({
    trapFocus: () => e.isOpen() && e.isModal(),
    onMountAutoFocus: (n) => {
      n.preventDefault();
    },
    onUnmountAutoFocus: (n) => {
      t.onCloseAutoFocus?.(n), n.defaultPrevented || (ie(e.triggerRef()), n.preventDefault());
    }
  }, () => o), c(G, {
    get when() {
      return e.contentPresent();
    },
    get children() {
      return c(oe.Positioner, {
        get children() {
          return c(ze, y({
            ref(n) {
              var d = $((b) => {
                e.setContentRef(b), o = b;
              }, t.ref);
              typeof d == "function" && d(n);
            },
            get disableOutsidePointerEvents() {
              return W(() => !!e.isModal())() && e.isOpen();
            },
            get excludedElements() {
              return [e.triggerRef];
            },
            get style() {
              return it({
                "--kb-select-content-transform-origin": "var(--kb-popper-content-transform-origin)",
                position: "relative"
              }, t.style);
            },
            onEscapeKeyDown: f,
            onFocusOutside: a,
            get onDismiss() {
              return e.close;
            }
          }, () => e.dataset(), s));
        }
      });
    }
  });
}
function ue(i) {
  const o = h();
  return c(Ve, y({
    get collection() {
      return o.listState().collection();
    },
    get selectionManager() {
      return o.listState().selectionManager();
    },
    get isOpen() {
      return o.isOpen();
    },
    get isMultiple() {
      return o.isMultiple();
    },
    get isVirtualized() {
      return o.isVirtualized();
    },
    focusTrigger: () => o.triggerRef()?.focus()
  }, i));
}
function de(i) {
  const o = h(), e = L({
    children: "▼"
  }, i);
  return c(z, y({
    as: "span",
    "aria-hidden": "true"
  }, () => o.dataset(), e));
}
function pe(i) {
  const o = h(), [e, t] = w(i, ["onClick"]);
  return c(Ue, y({
    as: "span",
    onClick: (f) => {
      v(f, e.onClick), o.isDisabled() || o.triggerRef()?.focus();
    }
  }, t));
}
function fe(i) {
  const o = h(), e = L({
    id: o.generateId("listbox")
  }, i), [t, s] = w(e, ["ref", "id", "onKeyDown"]);
  return I(() => H(o.registerListboxId(t.id))), c(Re, y({
    ref(a) {
      var n = $(o.setListboxRef, t.ref);
      typeof n == "function" && n(a);
    },
    get id() {
      return t.id;
    },
    get state() {
      return o.listState();
    },
    get virtualized() {
      return o.isVirtualized();
    },
    get autoFocus() {
      return o.autoFocus();
    },
    shouldSelectOnPressUp: !0,
    shouldFocusOnHover: !0,
    get shouldFocusWrap() {
      return o.shouldFocusWrap();
    },
    get disallowTypeAhead() {
      return o.disallowTypeAhead();
    },
    get "aria-labelledby"() {
      return o.listboxAriaLabelledBy();
    },
    get renderItem() {
      return o.renderItem;
    },
    get renderSection() {
      return o.renderSection;
    },
    onKeyDown: (a) => {
      v(a, t.onKeyDown), a.key === "Escape" && a.preventDefault();
    }
  }, s));
}
function ge(i) {
  const o = h();
  return c(G, {
    get when() {
      return o.contentPresent();
    },
    get children() {
      return c(Ke, i);
    }
  });
}
function at(i) {
  const o = `select-${Ze()}`, e = L({
    id: o,
    selectionMode: "single",
    disallowEmptySelection: !1,
    closeOnSelection: i.selectionMode === "single",
    allowDuplicateSelectionEvents: !0,
    gutter: 8,
    sameWidth: !0,
    modal: !1
  }, i), [t, s, f, a] = w(e, ["itemComponent", "sectionComponent", "open", "defaultOpen", "onOpenChange", "value", "defaultValue", "onChange", "placeholder", "options", "optionValue", "optionTextValue", "optionDisabled", "optionGroupChildren", "keyboardDelegate", "allowDuplicateSelectionEvents", "disallowEmptySelection", "closeOnSelection", "disallowTypeAhead", "shouldFocusWrap", "selectionBehavior", "selectionMode", "virtualized", "modal", "preventScroll", "forceMount"], ["getAnchorRect", "placement", "gutter", "shift", "flip", "slide", "overlap", "sameWidth", "fitViewport", "hideWhenDetached", "detachedPadding", "arrowPadding", "overflowPadding"], qe), [n, d] = S(), [b, g] = S(), [K, V] = S(), [M, R] = S(), [P, T] = S(), [k, l] = S(), [m, C] = S(), [he, Se] = S(!0), F = (r) => {
    const u = t.optionValue;
    return u == null ? String(r) : String(se(u) ? u(r) : r[u]);
  }, N = O(() => {
    const r = t.optionGroupChildren;
    return r == null ? t.options : t.options.flatMap((u) => u[r] ?? u);
  }), ve = O(() => N().map((r) => F(r))), U = (r) => [...r].map((u) => N().find((B) => F(B) === u)).filter((u) => u != null), x = He({
    open: () => t.open,
    defaultOpen: () => t.defaultOpen,
    onOpenChange: (r) => t.onOpenChange?.(r)
  }), p = Ae({
    selectedKeys: () => t.value != null ? t.value.map(F) : t.value,
    defaultSelectedKeys: () => t.defaultValue != null ? t.defaultValue.map(F) : t.defaultValue,
    onSelectionChange: (r) => {
      t.onChange?.(U(r)), t.closeOnSelection && A();
    },
    allowDuplicateSelectionEvents: () => D(t.allowDuplicateSelectionEvents),
    disallowEmptySelection: () => D(t.disallowEmptySelection),
    selectionBehavior: () => D(t.selectionBehavior),
    selectionMode: () => t.selectionMode,
    dataSource: () => t.options ?? [],
    getKey: () => t.optionValue,
    getTextValue: () => t.optionTextValue,
    getDisabled: () => t.optionDisabled,
    getSectionChildren: () => t.optionGroupChildren
  }), Ce = O(() => U(p.selectionManager().selectedKeys())), xe = (r) => {
    p.selectionManager().toggleSelection(F(r));
  }, {
    present: De
  } = lt({
    show: () => t.forceMount || x.isOpen(),
    element: () => P() ?? null
  }), Oe = () => {
    const r = k();
    r && ie(r);
  }, j = (r) => {
    if (t.options.length <= 0)
      return;
    Se(r), x.open();
    let u = p.selectionManager().firstSelectedKey();
    u == null && (r === "first" ? u = p.collection().getFirstKey() : r === "last" && (u = p.collection().getLastKey())), Oe(), p.selectionManager().setFocused(!0), p.selectionManager().setFocusedKey(u);
  }, A = () => {
    x.close(), p.selectionManager().setFocused(!1), p.selectionManager().setFocusedKey(void 0);
  }, we = (r) => {
    x.isOpen() ? A() : j(r);
  }, {
    formControlContext: E
  } = Je(f);
  je(M, () => {
    const r = t.defaultValue ? [...t.defaultValue].map(F) : new Ee();
    p.selectionManager().setSelectedKeys(r);
  });
  const Fe = Be({
    usage: "search",
    sensitivity: "base"
  }), Me = O(() => {
    const r = D(t.keyboardDelegate);
    return r || new Te(p.collection, void 0, Fe);
  }), Ie = (r) => t.itemComponent?.({
    item: r
  }), Le = (r) => t.sectionComponent?.({
    section: r
  });
  I(et([ve], ([r]) => {
    const B = [...p.selectionManager().selectedKeys()].filter((Pe) => r.includes(Pe));
    p.selectionManager().setSelectedKeys(B);
  }, {
    defer: !0
  }));
  const q = O(() => ({
    "data-expanded": x.isOpen() ? "" : void 0,
    "data-closed": x.isOpen() ? void 0 : ""
  })), J = {
    dataset: q,
    isOpen: x.isOpen,
    isDisabled: () => E.isDisabled() ?? !1,
    isMultiple: () => D(t.selectionMode) === "multiple",
    isVirtualized: () => t.virtualized ?? !1,
    isModal: () => t.modal ?? !1,
    preventScroll: () => t.preventScroll ?? J.isModal(),
    disallowTypeAhead: () => t.disallowTypeAhead ?? !1,
    shouldFocusWrap: () => t.shouldFocusWrap ?? !1,
    selectedOptions: Ce,
    contentPresent: De,
    autoFocus: he,
    triggerRef: M,
    listState: () => p,
    keyboardDelegate: Me,
    triggerId: n,
    valueId: b,
    listboxId: K,
    listboxAriaLabelledBy: m,
    setListboxAriaLabelledBy: C,
    setTriggerRef: R,
    setContentRef: T,
    setListboxRef: l,
    open: j,
    close: A,
    toggle: we,
    placeholder: () => t.placeholder,
    renderItem: Ie,
    renderSection: Le,
    removeOptionFromSelection: xe,
    generateId: Ye(() => D(f.id)),
    registerTriggerId: _(d),
    registerValueId: _(g),
    registerListboxId: _(V)
  };
  return c(Qe.Provider, {
    value: E,
    get children() {
      return c(ae.Provider, {
        value: J,
        get children() {
          return c(oe, y({
            anchorRef: M,
            contentRef: P
          }, s, {
            get children() {
              return c(z, y({
                as: "div",
                role: "group",
                get id() {
                  return D(f.id);
                }
              }, () => E.dataset(), q, a));
            }
          }));
        }
      });
    }
  });
}
function me(i) {
  const [o, e] = w(i, ["value", "defaultValue", "onChange", "multiple"]), t = O(() => o.value != null ? o.multiple ? o.value : [o.value] : o.value), s = O(() => o.defaultValue != null ? o.multiple ? o.defaultValue : [o.defaultValue] : o.defaultValue);
  return c(at, y({
    get value() {
      return t();
    },
    get defaultValue() {
      return s();
    },
    onChange: (a) => {
      o.multiple ? o.onChange?.(a ?? []) : o.onChange?.(a[0] ?? null);
    },
    get selectionMode() {
      return o.multiple ? "multiple" : "single";
    }
  }, e));
}
function ye(i) {
  const o = le(), e = h(), t = L({
    id: e.generateId("trigger")
  }, i), [s, f, a] = w(t, ["ref", "disabled", "onPointerDown", "onClick", "onKeyDown", "onFocus", "onBlur"], $e), n = () => e.listState().selectionManager(), d = () => e.keyboardDelegate(), b = () => s.disabled || e.isDisabled(), {
    fieldProps: g
  } = Ne(f), {
    typeSelectHandlers: K
  } = ke({
    keyboardDelegate: d,
    selectionManager: n,
    onTypeSelect: (l) => n().select(l)
  }), V = () => [e.listboxAriaLabelledBy(), e.valueId()].filter(Boolean).join(" ") || void 0, M = (l) => {
    v(l, s.onPointerDown), l.currentTarget.dataset.pointerType = l.pointerType, !b() && l.pointerType !== "touch" && l.button === 0 && (l.preventDefault(), e.toggle(!0));
  }, R = (l) => {
    v(l, s.onClick), !b() && l.currentTarget.dataset.pointerType === "touch" && e.toggle(!0);
  }, P = (l) => {
    if (v(l, s.onKeyDown), !b())
      switch (v(l, K.onKeyDown), l.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          l.stopPropagation(), l.preventDefault(), e.toggle("first");
          break;
        case "ArrowUp":
          l.stopPropagation(), l.preventDefault(), e.toggle("last");
          break;
        case "ArrowLeft": {
          if (l.preventDefault(), e.isMultiple())
            return;
          const m = n().firstSelectedKey(), C = m != null ? d().getKeyAbove?.(m) : d().getFirstKey?.();
          C != null && n().select(C);
          break;
        }
        case "ArrowRight": {
          if (l.preventDefault(), e.isMultiple())
            return;
          const m = n().firstSelectedKey(), C = m != null ? d().getKeyBelow?.(m) : d().getFirstKey?.();
          C != null && n().select(C);
          break;
        }
      }
  }, T = (l) => {
    v(l, s.onFocus), !n().isFocused() && n().setFocused(!0);
  }, k = (l) => {
    v(l, s.onBlur), !e.isOpen() && n().setFocused(!1);
  };
  return I(() => H(e.registerTriggerId(g.id()))), I(() => {
    e.setListboxAriaLabelledBy([g.ariaLabelledBy(), g.ariaLabel() && !g.ariaLabelledBy() ? g.id() : null].filter(Boolean).join(" ") || void 0);
  }), c(Ge, y({
    ref(l) {
      var m = $(e.setTriggerRef, s.ref);
      typeof m == "function" && m(l);
    },
    get id() {
      return g.id();
    },
    get disabled() {
      return b();
    },
    "aria-haspopup": "listbox",
    get "aria-expanded"() {
      return e.isOpen();
    },
    get "aria-controls"() {
      return W(() => !!e.isOpen())() ? e.listboxId() : void 0;
    },
    get "aria-label"() {
      return g.ariaLabel();
    },
    get "aria-labelledby"() {
      return V();
    },
    get "aria-describedby"() {
      return g.ariaDescribedBy();
    },
    onPointerDown: M,
    onClick: R,
    onKeyDown: P,
    onFocus: T,
    onBlur: k
  }, () => e.dataset(), () => o.dataset(), a));
}
function be(i) {
  const o = le(), e = h(), t = L({
    id: e.generateId("value")
  }, i), [s, f] = w(t, ["id", "children"]), a = () => e.listState().selectionManager(), n = () => {
    const d = a().selectedKeys();
    return d.size === 1 && d.has("") ? !0 : a().isEmpty();
  };
  return I(() => H(e.registerValueId(s.id))), c(z, y({
    as: "span",
    get id() {
      return s.id;
    },
    get "data-placeholder-shown"() {
      return n() ? "" : void 0;
    }
  }, () => o.dataset(), f, {
    get children() {
      return c(G, {
        get when() {
          return !n();
        },
        get fallback() {
          return e.placeholder();
        },
        get children() {
          return c(ct, {
            state: {
              selectedOption: () => e.selectedOptions()[0],
              selectedOptions: () => e.selectedOptions(),
              remove: (d) => e.removeOptionFromSelection(d),
              clear: () => a().clearSelection()
            },
            get children() {
              return s.children;
            }
          });
        }
      });
    }
  }));
}
function ct(i) {
  const o = rt(() => {
    const e = i.children;
    return se(e) ? e(i.state) : e;
  });
  return W(o);
}
var ut = Object.assign(me, {
  Arrow: te,
  Content: ce,
  Description: ne,
  ErrorMessage: re,
  HiddenSelect: ue,
  Icon: de,
  Item: ee,
  ItemDescription: Z,
  ItemIndicator: Y,
  ItemLabel: X,
  Label: pe,
  Listbox: fe,
  Portal: ge,
  Section: Q,
  Trigger: ye,
  Value: be
});
export {
  ut as Select,
  ce as SelectContent,
  ue as SelectHiddenSelect,
  de as SelectIcon,
  pe as SelectLabel,
  fe as SelectListbox,
  ge as SelectPortal,
  me as SelectRoot,
  ye as SelectTrigger,
  be as SelectValue,
  st as select_exports,
  h as useSelectContext
};
//# sourceMappingURL=index134.js.map
