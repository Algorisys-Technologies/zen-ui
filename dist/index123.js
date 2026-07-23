import { createComponent as i, mergeProps as f, memo as K } from "solid-js/web";
import { createToggleState as N } from "./index196.js";
import { FORM_CONTROL_FIELD_PROP_NAMES as $, createFormControlField as A } from "./index201.js";
import { FormControlLabel as H } from "./index156.js";
import { createFormResetListener as j } from "./index157.js";
import { FormControlErrorMessage as G } from "./index158.js";
import { FORM_CONTROL_PROP_NAMES as U, createFormControl as z, FormControlContext as J, useFormControlContext as v, FormControlDescription as Q } from "./index159.js";
import { Polymorphic as p } from "./index162.js";
import { __export as V } from "./index163.js";
import { mergeDefaultProps as C, createGenerateId as W, callHandler as h, isFunction as X, EventKey as Y, visuallyHiddenStyles as Z } from "./index164.js";
import { createUniqueId as ee, splitProps as S, createSignal as F, createMemo as te, createContext as oe, children as re, useContext as ne } from "solid-js";
import { access as R } from "./index166.js";
import { mergeRefs as I } from "./index167.js";
import { combineStyle as ce } from "./index168.js";
var ie = {};
V(ie, {
  Control: () => D,
  Description: () => O,
  ErrorMessage: () => _,
  Input: () => L,
  Label: () => E,
  Root: () => M,
  Switch: () => ae,
  Thumb: () => B,
  useSwitchContext: () => m
});
var P = oe();
function m() {
  const o = ne(P);
  if (o === void 0)
    throw new Error("[kobalte]: `useSwitchContext` must be used within a `Switch` component");
  return o;
}
function D(o) {
  const t = v(), e = m(), a = C({
    id: e.generateId("control")
  }, o), [r, d] = S(a, ["onClick", "onKeyDown"]);
  return i(p, f({
    as: "div",
    onClick: (u) => {
      h(u, r.onClick), e.toggle(), e.inputRef()?.focus();
    },
    onKeyDown: (u) => {
      h(u, r.onKeyDown), u.key === Y.Space && (e.toggle(), e.inputRef()?.focus());
    }
  }, () => t.dataset(), () => e.dataset(), d));
}
function O(o) {
  const t = m();
  return i(Q, f(() => t.dataset(), o));
}
function _(o) {
  const t = m();
  return i(G, f(() => t.dataset(), o));
}
function L(o) {
  const t = v(), e = m(), a = C({
    id: e.generateId("input")
  }, o), [r, d, g] = S(a, ["ref", "style", "onChange", "onFocus", "onBlur"], $), {
    fieldProps: l
  } = A(d);
  return i(p, f({
    as: "input",
    ref(n) {
      var c = I(e.setInputRef, r.ref);
      typeof c == "function" && c(n);
    },
    type: "checkbox",
    role: "switch",
    get id() {
      return l.id();
    },
    get name() {
      return t.name();
    },
    get value() {
      return e.value();
    },
    get checked() {
      return e.checked();
    },
    get required() {
      return t.isRequired();
    },
    get disabled() {
      return t.isDisabled();
    },
    get readonly() {
      return t.isReadOnly();
    },
    get style() {
      return ce({
        ...Z
      }, r.style);
    },
    get "aria-checked"() {
      return e.checked();
    },
    get "aria-label"() {
      return l.ariaLabel();
    },
    get "aria-labelledby"() {
      return l.ariaLabelledBy();
    },
    get "aria-describedby"() {
      return l.ariaDescribedBy();
    },
    get "aria-invalid"() {
      return t.validationState() === "invalid" || void 0;
    },
    get "aria-required"() {
      return t.isRequired() || void 0;
    },
    get "aria-disabled"() {
      return t.isDisabled() || void 0;
    },
    get "aria-readonly"() {
      return t.isReadOnly() || void 0;
    },
    onChange: (n) => {
      h(n, r.onChange), n.stopPropagation();
      const c = n.target;
      e.setIsChecked(c.checked), c.checked = e.checked();
    },
    onFocus: (n) => {
      h(n, r.onFocus), e.setIsFocused(!0);
    },
    onBlur: (n) => {
      h(n, r.onBlur), e.setIsFocused(!1);
    }
  }, () => t.dataset(), () => e.dataset(), g));
}
function E(o) {
  const t = m();
  return i(H, f(() => t.dataset(), o));
}
function M(o) {
  let t;
  const e = `switch-${ee()}`, a = C({
    value: "on",
    id: e
  }, o), [r, d, g] = S(a, ["ref", "children", "value", "checked", "defaultChecked", "onChange", "onPointerDown"], U), [l, u] = F(), [b, w] = F(!1), {
    formControlContext: n
  } = z(d), c = N({
    isSelected: () => r.checked,
    defaultIsSelected: () => r.defaultChecked,
    onSelectedChange: (s) => r.onChange?.(s),
    isDisabled: () => n.isDisabled(),
    isReadOnly: () => n.isReadOnly()
  });
  j(() => t, () => c.setIsSelected(r.defaultChecked ?? !1));
  const T = (s) => {
    h(s, r.onPointerDown), b() && s.preventDefault();
  }, y = te(() => ({
    "data-checked": c.isSelected() ? "" : void 0
  })), x = {
    value: () => r.value,
    dataset: y,
    checked: () => c.isSelected(),
    inputRef: l,
    generateId: W(() => R(d.id)),
    toggle: () => c.toggle(),
    setIsChecked: (s) => c.setIsSelected(s),
    setIsFocused: w,
    setInputRef: u
  };
  return i(J.Provider, {
    value: n,
    get children() {
      return i(P.Provider, {
        value: x,
        get children() {
          return i(p, f({
            as: "div",
            ref(s) {
              var k = I((q) => t = q, r.ref);
              typeof k == "function" && k(s);
            },
            role: "group",
            get id() {
              return R(d.id);
            },
            onPointerDown: T
          }, () => n.dataset(), y, g, {
            get children() {
              return i(se, {
                state: x,
                get children() {
                  return r.children;
                }
              });
            }
          }));
        }
      });
    }
  });
}
function se(o) {
  const t = re(() => {
    const e = o.children;
    return X(e) ? e(o.state) : e;
  });
  return K(t);
}
function B(o) {
  const t = v(), e = m(), a = C({
    id: e.generateId("thumb")
  }, o);
  return i(p, f({
    as: "div"
  }, () => t.dataset(), () => e.dataset(), a));
}
var ae = Object.assign(M, {
  Control: D,
  Description: O,
  ErrorMessage: _,
  Input: L,
  Label: E,
  Thumb: B
});
export {
  ae as Switch,
  D as SwitchControl,
  O as SwitchDescription,
  _ as SwitchErrorMessage,
  L as SwitchInput,
  E as SwitchLabel,
  M as SwitchRoot,
  B as SwitchThumb,
  ie as switch_exports,
  m as useSwitchContext
};
//# sourceMappingURL=index123.js.map
