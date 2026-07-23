import { createComponent as d, mergeProps as h, memo as T } from "solid-js/web";
import { createToggleState as A } from "./index196.js";
import { FORM_CONTROL_FIELD_PROP_NAMES as H, createFormControlField as j } from "./index201.js";
import { FormControlLabel as G } from "./index156.js";
import { createFormResetListener as U } from "./index157.js";
import { FormControlErrorMessage as z } from "./index158.js";
import { FORM_CONTROL_PROP_NAMES as J, createFormControl as Q, FormControlContext as V, useFormControlContext as F, FormControlDescription as W } from "./index159.js";
import { Polymorphic as v } from "./index162.js";
import { __export as X } from "./index163.js";
import { mergeDefaultProps as y, createGenerateId as Y, visuallyHiddenStyles as Z, callHandler as b, isFunction as ee, EventKey as te } from "./index164.js";
import { createUniqueId as oe, splitProps as I, createSignal as x, createMemo as re, createContext as ne, createEffect as E, on as S, Show as ce, children as ae, useContext as se } from "solid-js";
import ie from "./index165.js";
import { access as w } from "./index166.js";
import { mergeRefs as P } from "./index167.js";
import { combineStyle as de } from "./index168.js";
var le = {};
X(le, {
  Checkbox: () => fe,
  Control: () => O,
  Description: () => M,
  ErrorMessage: () => L,
  Indicator: () => q,
  Input: () => B,
  Label: () => K,
  Root: () => N,
  useCheckboxContext: () => C
});
var _ = ne();
function C() {
  const t = se(_);
  if (t === void 0)
    throw new Error("[kobalte]: `useCheckboxContext` must be used within a `Checkbox` component");
  return t;
}
function O(t) {
  const o = F(), e = C(), r = y({
    id: e.generateId("control")
  }, t), [n, a] = I(r, ["onClick", "onKeyDown"]);
  return d(v, h({
    as: "div",
    onClick: (s) => {
      b(s, n.onClick), e.toggle(), e.inputRef()?.focus();
    },
    onKeyDown: (s) => {
      b(s, n.onKeyDown), s.key === te.Space && (e.toggle(), e.inputRef()?.focus());
    }
  }, () => o.dataset(), () => e.dataset(), a));
}
function M(t) {
  const o = C();
  return d(W, h(() => o.dataset(), t));
}
function L(t) {
  const o = C();
  return d(z, h(() => o.dataset(), t));
}
function q(t) {
  const o = F(), e = C(), [r, n] = x(), a = y({
    id: e.generateId("indicator")
  }, t), [u, g] = I(a, ["ref", "forceMount"]), {
    present: s
  } = ie({
    show: () => u.forceMount || e.indeterminate() || e.checked(),
    element: () => r() ?? null
  });
  return d(ce, {
    get when() {
      return s();
    },
    get children() {
      return d(v, h({
        as: "div",
        ref(k) {
          var f = P(n, u.ref);
          typeof f == "function" && f(k);
        }
      }, () => o.dataset(), () => e.dataset(), g));
    }
  });
}
function B(t) {
  let o;
  const e = F(), r = C(), n = y({
    id: r.generateId("input")
  }, t), [a, u, g] = I(n, ["ref", "style", "onChange", "onFocus", "onBlur"], H), {
    fieldProps: s
  } = j(u), [k, f] = x(!1), p = (c) => {
    if (b(c, a.onChange), c.stopPropagation(), !k()) {
      const l = c.target;
      r.setIsChecked(l.checked), l.checked = r.checked();
    }
    f(!1);
  }, m = (c) => {
    b(c, a.onFocus), r.setIsFocused(!0);
  }, R = (c) => {
    b(c, a.onBlur), r.setIsFocused(!1);
  };
  return E(S([() => r.checked(), () => r.value()], () => {
    f(!0), o?.dispatchEvent(new Event("input", {
      bubbles: !0,
      cancelable: !0
    })), o?.dispatchEvent(new Event("change", {
      bubbles: !0,
      cancelable: !0
    }));
  }, {
    defer: !0
  })), E(S([() => o, () => r.indeterminate(), () => r.checked()], ([c, l]) => {
    c && (c.indeterminate = l);
  })), d(v, h({
    as: "input",
    ref(c) {
      var l = P((i) => {
        r.setInputRef(i), o = i;
      }, a.ref);
      typeof l == "function" && l(c);
    },
    type: "checkbox",
    get id() {
      return s.id();
    },
    get name() {
      return e.name();
    },
    get value() {
      return r.value();
    },
    get checked() {
      return r.checked();
    },
    get required() {
      return e.isRequired();
    },
    get disabled() {
      return e.isDisabled();
    },
    get readonly() {
      return e.isReadOnly();
    },
    get style() {
      return de(Z, a.style);
    },
    get "aria-label"() {
      return s.ariaLabel();
    },
    get "aria-labelledby"() {
      return s.ariaLabelledBy();
    },
    get "aria-describedby"() {
      return s.ariaDescribedBy();
    },
    get "aria-invalid"() {
      return e.validationState() === "invalid" || void 0;
    },
    get "aria-required"() {
      return e.isRequired();
    },
    get "aria-disabled"() {
      return e.isDisabled();
    },
    get "aria-readonly"() {
      return e.isReadOnly();
    },
    onChange: p,
    onFocus: m,
    onBlur: R
  }, () => e.dataset(), () => r.dataset(), g));
}
function K(t) {
  const o = C();
  return d(G, h(() => o.dataset(), t));
}
function N(t) {
  let o;
  const e = `checkbox-${oe()}`, r = y({
    value: "on",
    id: e
  }, t), [n, a, u] = I(r, ["ref", "children", "value", "checked", "defaultChecked", "indeterminate", "onChange", "onPointerDown"], J), [g, s] = x(), [k, f] = x(!1), {
    formControlContext: p
  } = Q(a), m = A({
    isSelected: () => n.checked,
    defaultIsSelected: () => n.defaultChecked,
    onSelectedChange: (i) => n.onChange?.(i),
    isDisabled: () => p.isDisabled(),
    isReadOnly: () => p.isReadOnly()
  });
  U(() => o, () => m.setIsSelected(n.defaultChecked ?? !1));
  const R = (i) => {
    b(i, n.onPointerDown), k() && i.preventDefault();
  }, c = re(() => ({
    "data-checked": m.isSelected() ? "" : void 0,
    "data-indeterminate": n.indeterminate ? "" : void 0
  })), l = {
    value: () => n.value,
    dataset: c,
    checked: () => m.isSelected(),
    indeterminate: () => n.indeterminate ?? !1,
    inputRef: g,
    generateId: Y(() => w(a.id)),
    toggle: () => m.toggle(),
    setIsChecked: (i) => m.setIsSelected(i),
    setIsFocused: f,
    setInputRef: s
  };
  return d(V.Provider, {
    value: p,
    get children() {
      return d(_.Provider, {
        value: l,
        get children() {
          return d(v, h({
            as: "div",
            ref(i) {
              var D = P(($) => o = $, n.ref);
              typeof D == "function" && D(i);
            },
            role: "group",
            get id() {
              return w(a.id);
            },
            onPointerDown: R
          }, () => p.dataset(), c, u, {
            get children() {
              return d(ue, {
                state: l,
                get children() {
                  return n.children;
                }
              });
            }
          }));
        }
      });
    }
  });
}
function ue(t) {
  const o = ae(() => {
    const e = t.children;
    return ee(e) ? e(t.state) : e;
  });
  return T(o);
}
var fe = Object.assign(N, {
  Control: O,
  Description: M,
  ErrorMessage: L,
  Indicator: q,
  Input: B,
  Label: K
});
export {
  fe as Checkbox,
  O as CheckboxControl,
  M as CheckboxDescription,
  L as CheckboxErrorMessage,
  q as CheckboxIndicator,
  B as CheckboxInput,
  K as CheckboxLabel,
  N as CheckboxRoot,
  le as checkbox_exports,
  C as useCheckboxContext
};
//# sourceMappingURL=index124.js.map
