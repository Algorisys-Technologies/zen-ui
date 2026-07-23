import { createComponent as f, Portal as ke, mergeProps as C, memo as te } from "solid-js/web";
import { HiddenSelectBase as Te } from "./index199.js";
import { ListboxRoot as Be } from "./index198.js";
import { getItemCount as he } from "./index200.js";
import { Popper as ye } from "./index172.js";
import { ListKeyboardDelegate as _e } from "./index190.js";
import { createListState as We, Selection as ze, createSelectableCollection as $e } from "./index185.js";
import { createFilter as Ge } from "./index147.js";
import { createFocusScope as Ne } from "./index173.js";
import { createHideOutside as qe } from "./index174.js";
import { DismissableLayer as He } from "./index175.js";
import { announce as Q } from "./index181.js";
import { createDisclosureState as Ue } from "./index176.js";
import { FORM_CONTROL_FIELD_PROP_NAMES as Xe, createFormControlField as Ye } from "./index201.js";
import { createFormResetListener as je } from "./index157.js";
import { useFormControlContext as oe, FORM_CONTROL_PROP_NAMES as Je, createFormControl as Qe, FormControlContext as Ze } from "./index159.js";
import { createRegisterId as et } from "./index160.js";
import { createControllableSignal as tt } from "./index161.js";
import { Polymorphic as B } from "./index162.js";
import { Show as Ce, splitProps as A, createEffect as M, onCleanup as ot, createUniqueId as nt, createSignal as y, createMemo as v, on as Z, createContext as st, useContext as rt, children as lt } from "solid-js";
import { mergeDefaultProps as _, focusWithoutScrolling as Se, isAppleDevice as ee, createGenerateId as it, callHandler as x, contains as Oe, isFunction as L } from "./index164.js";
import at from "./index178.js";
import ct from "./index165.js";
import { mergeRefs as W } from "./index167.js";
import { access as K } from "./index166.js";
import { combineStyle as ut } from "./index168.js";
var ve = st();
function F() {
  const i = rt(ve);
  if (i === void 0)
    throw new Error("[kobalte]: `useComboboxContext` must be used within a `Combobox` component");
  return i;
}
function _t(i) {
  let r;
  const n = F(), [o, t] = A(i, ["ref", "style", "onCloseAutoFocus", "onFocusOutside"]), d = () => {
    n.resetInputValue(n.listState().selectionManager().selectedKeys()), n.close(), setTimeout(() => {
      n.close();
    });
  }, g = (c) => {
    o.onFocusOutside?.(c), n.isOpen() && n.isModal() && c.preventDefault();
  };
  return qe({
    isDisabled: () => !(n.isOpen() && n.isModal()),
    targets: () => {
      const c = [];
      r && c.push(r);
      const m = n.controlRef();
      return m && c.push(m), c;
    }
  }), at({
    element: () => r ?? null,
    enabled: () => n.contentPresent() && n.preventScroll()
  }), Ne({
    trapFocus: () => n.isOpen() && n.isModal(),
    onMountAutoFocus: (c) => {
      c.preventDefault();
    },
    onUnmountAutoFocus: (c) => {
      o.onCloseAutoFocus?.(c), c.defaultPrevented || (Se(n.inputRef()), c.preventDefault());
    }
  }, () => r), f(Ce, {
    get when() {
      return n.contentPresent();
    },
    get children() {
      return f(ye.Positioner, {
        get children() {
          return f(He, C({
            ref(c) {
              var m = W((O) => {
                n.setContentRef(O), r = O;
              }, o.ref);
              typeof m == "function" && m(c);
            },
            get disableOutsidePointerEvents() {
              return te(() => !!n.isModal())() && n.isOpen();
            },
            get excludedElements() {
              return [n.controlRef];
            },
            get style() {
              return ut({
                "--kb-combobox-content-transform-origin": "var(--kb-popper-content-transform-origin)",
                position: "relative"
              }, o.style);
            },
            onFocusOutside: g,
            onDismiss: d
          }, () => n.dataset(), t));
        }
      });
    }
  });
}
function Wt(i) {
  let r;
  const n = oe(), o = F(), t = _({
    id: o.generateId("input")
  }, i), [d, g, c] = A(t, ["ref", "disabled", "onClick", "onInput", "onKeyDown", "onFocus", "onBlur", "onTouchEnd"], Xe), m = () => o.listState().collection(), O = () => o.listState().selectionManager(), I = () => d.disabled || o.isDisabled() || n.isDisabled(), {
    fieldProps: w
  } = Ye(g), D = (l) => {
    x(l, d.onClick), o.triggerMode() === "focus" && !o.isOpen() && o.open(!1, "focus");
  }, z = (l) => {
    if (x(l, d.onInput), n.isReadOnly() || I())
      return;
    const p = l.target;
    o.setInputValue(p.value), p.value = o.inputValue() ?? "", o.isOpen() ? m().getSize() <= 0 && !o.allowsEmptyCollection() && o.close() : (m().getSize() > 0 || o.allowsEmptyCollection()) && o.open(!1, "input");
  }, $ = (l) => {
    if (x(l, d.onKeyDown), !(n.isReadOnly() || I()))
      switch (o.isOpen() && x(l, o.onInputKeyDown), l.key) {
        case "Enter":
          if (o.isOpen()) {
            l.preventDefault();
            const p = O().focusedKey();
            p != null && O().select(p);
          }
          break;
        case "Tab":
          o.isOpen() && (o.close(), o.resetInputValue(o.listState().selectionManager().selectedKeys()));
          break;
        case "Escape":
          o.isOpen() ? (o.close(), o.resetInputValue(o.listState().selectionManager().selectedKeys())) : o.setInputValue("");
          break;
        case "ArrowDown":
          o.isOpen() || o.open(l.altKey ? !1 : "first", "manual");
          break;
        case "ArrowUp":
          o.isOpen() ? l.altKey && (o.close(), o.resetInputValue(o.listState().selectionManager().selectedKeys())) : o.open("last", "manual");
          break;
        case "ArrowLeft":
        case "ArrowRight":
          O().setFocusedKey(void 0);
          break;
        case "Backspace":
          if (o.removeOnBackspace() && O().selectionMode() === "multiple" && o.inputValue() === "") {
            const p = [...O().selectedKeys()].pop() ?? "";
            O().toggleSelection(p);
          }
          break;
      }
  }, G = (l) => {
    x(l, d.onFocus), !o.isInputFocused() && o.setIsInputFocused(!0);
  }, V = (l) => {
    x(l, d.onBlur), !(Oe(o.controlRef(), l.relatedTarget) || Oe(o.contentRef(), l.relatedTarget)) && o.setIsInputFocused(!1);
  };
  let E = 0;
  return f(B, C({
    as: "input",
    ref(l) {
      var p = W((S) => {
        o.setInputRef(S), r = S;
      }, d.ref);
      typeof p == "function" && p(l);
    },
    get id() {
      return w.id();
    },
    get value() {
      return o.inputValue();
    },
    get required() {
      return n.isRequired();
    },
    get disabled() {
      return n.isDisabled();
    },
    get readonly() {
      return n.isReadOnly();
    },
    get placeholder() {
      return o.placeholder();
    },
    type: "text",
    role: "combobox",
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: "false",
    "aria-haspopup": "listbox",
    "aria-autocomplete": "list",
    get "aria-expanded"() {
      return o.isOpen();
    },
    get "aria-controls"() {
      return te(() => !!o.isOpen())() ? o.listboxId() : void 0;
    },
    get "aria-activedescendant"() {
      return o.activeDescendant();
    },
    get "aria-label"() {
      return w.ariaLabel();
    },
    get "aria-labelledby"() {
      return w.ariaLabelledBy();
    },
    get "aria-describedby"() {
      return w.ariaDescribedBy();
    },
    get "aria-invalid"() {
      return n.validationState() === "invalid" || void 0;
    },
    get "aria-required"() {
      return n.isRequired() || void 0;
    },
    get "aria-disabled"() {
      return n.isDisabled() || void 0;
    },
    get "aria-readonly"() {
      return n.isReadOnly() || void 0;
    },
    onClick: D,
    onInput: z,
    onKeyDown: $,
    onFocus: G,
    onBlur: V,
    onTouchEnd: (l) => {
      if (x(l, d.onTouchEnd), !r || n.isReadOnly() || I())
        return;
      if (l.timeStamp - E < 500) {
        l.preventDefault(), r.focus();
        return;
      }
      const p = l.target.getBoundingClientRect(), S = l.changedTouches[0], P = Math.ceil(p.left + 0.5 * p.width), q = Math.ceil(p.top + 0.5 * p.height);
      S.clientX === P && S.clientY === q && (l.preventDefault(), r.focus(), o.toggle(!1, "manual"), E = l.timeStamp);
    }
  }, () => o.dataset(), () => n.dataset(), c));
}
function zt(i) {
  const r = oe(), n = F(), o = _({
    id: n.generateId("listbox")
  }, i), [t, d] = A(o, ["ref"]), g = () => r.getAriaLabelledBy(d.id, n.listboxAriaLabel(), void 0);
  return M(() => ot(n.registerListboxId(d.id))), f(Be, C({
    ref(c) {
      var m = W(n.setListboxRef, t.ref);
      typeof m == "function" && m(c);
    },
    get state() {
      return n.listState();
    },
    get autoFocus() {
      return n.autoFocus();
    },
    shouldUseVirtualFocus: !0,
    shouldSelectOnPressUp: !0,
    shouldFocusOnHover: !0,
    get "aria-label"() {
      return n.listboxAriaLabel();
    },
    get "aria-labelledby"() {
      return g();
    },
    get renderItem() {
      return n.renderItem;
    },
    get renderSection() {
      return n.renderSection;
    },
    get virtualized() {
      return n.isVirtualized();
    }
  }, d));
}
function $t(i) {
  const r = F();
  return f(Ce, {
    get when() {
      return r.contentPresent();
    },
    get children() {
      return f(ke, i);
    }
  });
}
function Gt(i) {
  const r = oe(), n = F(), [o, t] = A(i, ["ref", "children"]), d = () => n.listState().selectionManager();
  return f(B, C({
    as: "div",
    ref(g) {
      var c = W(n.setControlRef, o.ref);
      typeof c == "function" && c(g);
    }
  }, () => n.dataset(), () => r.dataset(), t, {
    get children() {
      return f(dt, {
        state: {
          selectedOptions: () => n.selectedOptions(),
          remove: (g) => n.removeOptionFromSelection(g),
          clear: () => d().clearSelection()
        },
        get children() {
          return o.children;
        }
      });
    }
  }));
}
function dt(i) {
  const r = lt(() => {
    const n = i.children;
    return L(n) ? n(i.state) : n;
  });
  return te(r);
}
function Nt(i) {
  const r = F();
  return f(Te, C({
    get collection() {
      return r.listState().collection();
    },
    get selectionManager() {
      return r.listState().selectionManager();
    },
    get isOpen() {
      return r.isOpen();
    },
    get isMultiple() {
      return r.isMultiple();
    },
    get isVirtualized() {
      return r.isVirtualized();
    },
    focusTrigger: () => r.inputRef()?.focus()
  }, i));
}
function qt(i) {
  const r = F(), n = _({
    children: "▼"
  }, i);
  return f(B, C({
    as: "span",
    "aria-hidden": "true"
  }, () => r.dataset(), n));
}
var pt = {
  // Annouce option to screen readers on focus.
  focusAnnouncement: (i, r) => `${i}${r ? ", selected" : ""}`,
  // Annouce the number of options available to screen readers on open.
  countAnnouncement: (i) => {
    if (i === 1)
      return "one option available";
  },
  // Annouce the selection of an option to screen readers.
  selectedAnnouncement: (i) => `${i}, selected`,
  // `aria-label` of Combobox.Trigger.
  triggerLabel: "Show suggestions",
  // `aria-label` of Combobox.Listbox.
  listboxLabel: "Suggestions"
};
function Ht(i) {
  const r = `combobox-${nt()}`, n = Ge({
    sensitivity: "base"
  }), o = _({
    id: r,
    selectionMode: "single",
    allowsEmptyCollection: !1,
    disallowEmptySelection: !1,
    allowDuplicateSelectionEvents: !0,
    closeOnSelection: i.selectionMode === "single",
    removeOnBackspace: !0,
    gutter: 8,
    sameWidth: !0,
    modal: !1,
    defaultFilter: "contains",
    triggerMode: "input",
    translations: pt
  }, i), [t, d, g, c] = A(o, ["noResetInputOnBlur", "translations", "itemComponent", "sectionComponent", "open", "defaultOpen", "onOpenChange", "onInputChange", "value", "defaultValue", "onChange", "triggerMode", "placeholder", "options", "optionValue", "optionTextValue", "optionLabel", "optionDisabled", "optionGroupChildren", "keyboardDelegate", "allowDuplicateSelectionEvents", "disallowEmptySelection", "defaultFilter", "shouldFocusWrap", "allowsEmptyCollection", "closeOnSelection", "removeOnBackspace", "selectionBehavior", "selectionMode", "virtualized", "modal", "preventScroll", "forceMount"], ["getAnchorRect", "placement", "gutter", "shift", "flip", "slide", "overlap", "sameWidth", "fitViewport", "hideWhenDetached", "detachedPadding", "arrowPadding", "overflowPadding"], Je), [m, O] = y(), [I, w] = y(), [D, z] = y(), [$, G] = y(), [V, E] = y(), [N, l] = y(), [p, S] = y(!1), [P, q] = y(!1), [H, ne] = y(!1), [xe, se] = y(t.options), h = Ue({
    open: () => t.open,
    defaultOpen: () => t.defaultOpen,
    onOpenChange: (e) => t.onOpenChange?.(e, ie)
  }), [U, X] = tt({
    defaultValue: () => "",
    onChange: (e) => {
      t.onInputChange?.(e), e === "" && t.selectionMode === "single" && !a.selectionManager().isEmpty() && t.value === void 0 && a.selectionManager().setSelectedKeys([]), a.selectionManager().setFocusedKey(void 0);
    }
  }), R = (e) => {
    const s = t.optionValue;
    return s == null ? String(e) : String(L(s) ? s(e) : e[s]);
  }, Me = (e) => {
    const s = t.optionLabel;
    return s == null ? String(e) : String(L(s) ? s(e) : e[s]);
  }, Fe = (e) => {
    const s = t.optionTextValue;
    return s == null ? String(e) : String(L(s) ? s(e) : e[s]);
  }, re = v(() => {
    const e = t.optionGroupChildren;
    return e == null ? t.options : t.options.flatMap((s) => s[e] ?? s);
  }), le = (e) => {
    const s = U() ?? "";
    if (L(t.defaultFilter))
      return t.defaultFilter?.(e, s);
    const u = Fe(e);
    switch (t.defaultFilter) {
      case "startsWith":
        return n.startsWith(u, s);
      case "endsWith":
        return n.endsWith(u, s);
      case "contains":
        return n.contains(u, s);
    }
  }, Y = v(() => {
    const e = t.optionGroupChildren;
    if (e == null)
      return t.options.filter(le);
    const s = [];
    for (const u of t.options) {
      const b = u[e].filter(le);
      b.length !== 0 && s.push({
        ...u,
        [e]: b
      });
    }
    return s;
  }), Ie = v(() => h.isOpen() ? H() ? t.options : Y() : xe());
  let ie = "focus";
  const ae = (e) => [...e].map((s) => re().find((u) => R(u) === s)).filter((s) => s != null), a = We({
    selectedKeys: () => t.value != null ? t.value.map(R) : t.value,
    defaultSelectedKeys: () => t.defaultValue != null ? t.defaultValue.map(R) : t.defaultValue,
    onSelectionChange: (e) => {
      t.onChange?.(ae(e)), t.closeOnSelection && h.isOpen() && e.size > 0 && (k(), setTimeout(k));
      const s = D();
      s && (s.setSelectionRange(s.value.length, s.value.length), Se(s));
    },
    allowDuplicateSelectionEvents: () => K(t.allowDuplicateSelectionEvents),
    disallowEmptySelection: () => t.disallowEmptySelection,
    selectionBehavior: () => K(t.selectionBehavior),
    selectionMode: () => t.selectionMode,
    dataSource: Ie,
    getKey: () => t.optionValue,
    getTextValue: () => t.optionTextValue,
    getDisabled: () => t.optionDisabled,
    getSectionChildren: () => t.optionGroupChildren
  }), we = v(() => ae(a.selectionManager().selectedKeys())), De = (e) => {
    a.selectionManager().toggleSelection(R(e));
  }, {
    present: Re
  } = ct({
    show: () => t.forceMount || h.isOpen(),
    element: () => V() ?? null
  }), j = (e, s) => {
    if (t.triggerMode === "manual" && s !== "manual" || !(ne(s === "manual") ? t.options.length > 0 : Y().length > 0) && !t.allowsEmptyCollection)
      return;
    ie = s, S(e), h.open();
    let T = a.selectionManager().firstSelectedKey();
    T == null && (e === "first" ? T = a.collection().getFirstKey() : e === "last" && (T = a.collection().getLastKey())), a.selectionManager().setFocused(!0), a.selectionManager().setFocusedKey(T);
  }, k = () => {
    h.close(), a.selectionManager().setFocused(!1), a.selectionManager().setFocusedKey(void 0);
  }, Ke = (e, s) => {
    h.isOpen() ? k() : j(e, s);
  }, {
    formControlContext: J
  } = Qe(g);
  je(D, () => {
    const e = t.defaultValue ? [...t.defaultValue].map(R) : new ze();
    a.selectionManager().setSelectedKeys(e);
  });
  const ce = v(() => {
    const e = K(t.keyboardDelegate);
    return e || new _e(a.collection, N, void 0);
  }), Ve = $e({
    selectionManager: () => a.selectionManager(),
    keyboardDelegate: ce,
    disallowTypeAhead: !0,
    disallowEmptySelection: !0,
    shouldFocusWrap: () => t.shouldFocusWrap,
    // Prevent item scroll behavior from being applied here, handled in the Listbox component.
    isVirtualized: !0
  }, D), Le = (e) => {
    e && t.triggerMode === "focus" && j(!1, "focus"), q(e), a.selectionManager().setFocused(e);
  }, Ae = v(() => {
    const e = a.selectionManager().focusedKey();
    if (e)
      return N()?.querySelector(`[data-key="${e}"]`)?.id;
  }), ue = (e) => {
    if (t.selectionMode === "single") {
      const s = [...e][0], u = re().find((b) => R(b) === s);
      if (t.noResetInputOnBlur && !u) return;
      X(u ? Me(u) : "");
    } else {
      if (t.noResetInputOnBlur) return;
      X("");
    }
  }, Ee = (e) => t.itemComponent?.({
    item: e
  }), Pe = (e) => t.sectionComponent?.({
    section: e
  });
  M(Z([Y, H], (e, s) => {
    if (h.isOpen() && s != null) {
      const u = s[0], b = s[1];
      se(b ? t.options : u);
    } else {
      const u = e[0], b = e[1];
      se(b ? t.options : u);
    }
  })), M(Z(U, () => {
    H() && ne(!1);
  })), M(Z(() => a.selectionManager().selectedKeys(), ue));
  let de = "";
  M(() => {
    const e = a.selectionManager().focusedKey() ?? "", s = a.collection().getItem(e);
    if (ee() && s != null && e !== de) {
      const u = a.selectionManager().isSelected(e), b = t.translations?.focusAnnouncement(s?.textValue || "", u) ?? "";
      Q(b);
    }
    e && (de = e);
  });
  let pe = he(a.collection()), fe = h.isOpen();
  M(() => {
    const e = he(a.collection()), s = h.isOpen(), u = s !== fe && (a.selectionManager().focusedKey() == null || ee());
    if (s && (u || e !== pe)) {
      const b = t.translations?.countAnnouncement(e) ?? "";
      Q(b);
    }
    pe = e, fe = s;
  });
  let ge = "";
  M(() => {
    const e = [...a.selectionManager().selectedKeys()].pop() ?? "", s = a.collection().getItem(e);
    if (ee() && P() && s && e !== ge) {
      const u = t.translations?.selectedAnnouncement(s?.textValue || "") ?? "";
      Q(u);
    }
    e && (ge = e);
  });
  const me = v(() => ({
    "data-expanded": h.isOpen() ? "" : void 0,
    "data-closed": h.isOpen() ? void 0 : ""
  })), be = {
    dataset: me,
    isOpen: h.isOpen,
    isDisabled: () => J.isDisabled() ?? !1,
    isMultiple: () => K(t.selectionMode) === "multiple",
    isVirtualized: () => t.virtualized ?? !1,
    isModal: () => t.modal ?? !1,
    preventScroll: () => t.preventScroll ?? be.isModal(),
    allowsEmptyCollection: () => t.allowsEmptyCollection ?? !1,
    shouldFocusWrap: () => t.shouldFocusWrap ?? !1,
    removeOnBackspace: () => t.removeOnBackspace ?? !0,
    selectedOptions: we,
    isInputFocused: P,
    contentPresent: Re,
    autoFocus: p,
    inputValue: U,
    triggerMode: () => t.triggerMode,
    activeDescendant: Ae,
    controlRef: I,
    inputRef: D,
    triggerRef: $,
    contentRef: V,
    listState: () => a,
    keyboardDelegate: ce,
    listboxId: m,
    triggerAriaLabel: () => t.translations?.triggerLabel,
    listboxAriaLabel: () => t.translations?.listboxLabel,
    setIsInputFocused: Le,
    resetInputValue: ue,
    setInputValue: X,
    setControlRef: w,
    setInputRef: z,
    setTriggerRef: G,
    setContentRef: E,
    setListboxRef: l,
    open: j,
    close: k,
    toggle: Ke,
    placeholder: () => t.placeholder,
    renderItem: Ee,
    renderSection: Pe,
    removeOptionFromSelection: De,
    onInputKeyDown: (e) => Ve.onKeyDown(e),
    generateId: it(() => K(g.id)),
    registerListboxId: et(O)
  };
  return f(Ze.Provider, {
    value: J,
    get children() {
      return f(ve.Provider, {
        value: be,
        get children() {
          return f(ye, C({
            anchorRef: I,
            contentRef: V
          }, d, {
            get children() {
              return f(B, C({
                as: "div",
                role: "group",
                get id() {
                  return K(g.id);
                }
              }, () => J.dataset(), me, c));
            }
          }));
        }
      });
    }
  });
}
export {
  Ht as ComboboxBase,
  _t as ComboboxContent,
  Gt as ComboboxControl,
  Nt as ComboboxHiddenSelect,
  qt as ComboboxIcon,
  Wt as ComboboxInput,
  zt as ComboboxListbox,
  $t as ComboboxPortal,
  F as useComboboxContext
};
//# sourceMappingURL=index197.js.map
