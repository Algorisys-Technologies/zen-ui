import { createComponent as u, mergeProps as m } from "solid-js/web";
import { FormControlLabel as te } from "./index156.js";
import { createFormResetListener as re } from "./index172.js";
import { FormControlErrorMessage as O } from "./index157.js";
import { FormControlDescription as q, FORM_CONTROL_PROP_NAMES as oe, createFormControl as ne, FormControlContext as ae, useFormControlContext as $ } from "./index158.js";
import { createRegisterId as F } from "./index173.js";
import { createControllableSignal as ie } from "./index174.js";
import { Polymorphic as I } from "./index175.js";
import { __export as se } from "./index159.js";
import { mergeDefaultProps as v, createGenerateId as le, callHandler as D, EventKey as de, visuallyHiddenStyles as ue } from "./index160.js";
import { createUniqueId as K, splitProps as G, createContext as A, createEffect as w, onCleanup as L, createSignal as g, on as ce, Show as pe, createMemo as S, useContext as j } from "solid-js";
import fe from "./index177.js";
import { access as M } from "./index178.js";
import { mergeRefs as E } from "./index161.js";
import { combineStyle as me } from "./index179.js";
var be = {};
se(be, {
  Description: () => q,
  ErrorMessage: () => O,
  Item: () => T,
  ItemControl: () => U,
  ItemDescription: () => z,
  ItemIndicator: () => J,
  ItemInput: () => Q,
  ItemLabel: () => W,
  Label: () => X,
  RadioGroup: () => ge,
  Root: () => Y,
  useRadioGroupContext: () => V
});
var H = A();
function V() {
  const r = j(H);
  if (r === void 0)
    throw new Error("[kobalte]: `useRadioGroupContext` must be used within a `RadioGroup` component");
  return r;
}
var N = A();
function P() {
  const r = j(N);
  if (r === void 0)
    throw new Error("[kobalte]: `useRadioGroupItemContext` must be used within a `RadioGroup.Item` component");
  return r;
}
function T(r) {
  const e = $(), n = V(), t = `${e.generateId("item")}-${K()}`, i = v({
    id: t
  }, r), [o, l] = G(i, ["value", "disabled", "onPointerDown"]), [d, f] = g(), [a, C] = g(), [y, x] = g(), [R, s] = g(), [c, p] = g(!1), h = S(() => n.isDefaultValue(o.value)), b = S(() => n.isSelectedValue(o.value)), B = S(() => o.disabled || e.isDisabled() || !1), Z = (_) => {
    D(_, o.onPointerDown), c() && _.preventDefault();
  }, k = S(() => ({
    ...e.dataset(),
    "data-disabled": B() ? "" : void 0,
    "data-checked": b() ? "" : void 0
  })), ee = {
    value: () => o.value,
    dataset: k,
    isDefault: h,
    isSelected: b,
    isDisabled: B,
    inputId: d,
    labelId: a,
    descriptionId: y,
    inputRef: R,
    select: () => n.setSelectedValue(o.value),
    generateId: le(() => l.id),
    registerInput: F(f),
    registerLabel: F(C),
    registerDescription: F(x),
    setIsFocused: p,
    setInputRef: s
  };
  return u(N.Provider, {
    value: ee,
    get children() {
      return u(I, m({
        as: "div",
        role: "group",
        onPointerDown: Z
      }, k, l));
    }
  });
}
function U(r) {
  const e = P(), n = v({
    id: e.generateId("control")
  }, r), [t, i] = G(n, ["onClick", "onKeyDown"]);
  return u(I, m({
    as: "div",
    onClick: (d) => {
      D(d, t.onClick), e.select(), e.inputRef()?.focus();
    },
    onKeyDown: (d) => {
      D(d, t.onKeyDown), d.key === de.Space && (e.select(), e.inputRef()?.focus());
    }
  }, () => e.dataset(), i));
}
function z(r) {
  const e = P(), n = v({
    id: e.generateId("description")
  }, r);
  return w(() => L(e.registerDescription(n.id))), u(I, m({
    as: "div"
  }, () => e.dataset(), n));
}
function J(r) {
  const e = P(), n = v({
    id: e.generateId("indicator")
  }, r), [t, i] = G(n, ["ref", "forceMount"]), [o, l] = g(), {
    present: d
  } = fe({
    show: () => t.forceMount || e.isSelected(),
    element: () => o() ?? null
  });
  return u(pe, {
    get when() {
      return d();
    },
    get children() {
      return u(I, m({
        as: "div",
        ref(f) {
          var a = E(l, t.ref);
          typeof a == "function" && a(f);
        }
      }, () => e.dataset(), i));
    }
  });
}
function Q(r) {
  const e = $(), n = V(), t = P(), i = v({
    id: t.generateId("input")
  }, r), [o, l] = G(i, ["ref", "style", "aria-labelledby", "aria-describedby", "onChange", "onFocus", "onBlur"]), d = () => [
    o["aria-labelledby"],
    t.labelId(),
    // If there is both an aria-label and aria-labelledby, add the input itself has an aria-labelledby
    o["aria-labelledby"] != null && l["aria-label"] != null ? l.id : void 0
  ].filter(Boolean).join(" ") || void 0, f = () => [o["aria-describedby"], t.descriptionId(), n.ariaDescribedBy()].filter(Boolean).join(" ") || void 0, [a, C] = g(!1), y = (s) => {
    if (D(s, o.onChange), s.stopPropagation(), !a()) {
      n.setSelectedValue(t.value());
      const c = s.target;
      c.checked = t.isSelected();
    }
    C(!1);
  }, x = (s) => {
    D(s, o.onFocus), t.setIsFocused(!0);
  }, R = (s) => {
    D(s, o.onBlur), t.setIsFocused(!1);
  };
  return w(ce([() => t.isSelected(), () => t.value()], (s) => {
    if (!s[0] && s[1] === t.value()) return;
    C(!0);
    const c = t.inputRef();
    c?.dispatchEvent(new Event("input", {
      bubbles: !0,
      cancelable: !0
    })), c?.dispatchEvent(new Event("change", {
      bubbles: !0,
      cancelable: !0
    }));
  }, {
    defer: !0
  })), w(() => L(t.registerInput(l.id))), u(I, m({
    as: "input",
    ref(s) {
      var c = E(t.setInputRef, o.ref);
      typeof c == "function" && c(s);
    },
    type: "radio",
    get name() {
      return e.name();
    },
    get value() {
      return t.value();
    },
    get checked() {
      return t.isSelected();
    },
    get required() {
      return e.isRequired();
    },
    get disabled() {
      return t.isDisabled();
    },
    get readonly() {
      return e.isReadOnly();
    },
    get style() {
      return me({
        ...ue
      }, o.style);
    },
    get "aria-labelledby"() {
      return d();
    },
    get "aria-describedby"() {
      return f();
    },
    onChange: y,
    onFocus: x,
    onBlur: R
  }, () => t.dataset(), l));
}
function W(r) {
  const e = P(), n = v({
    id: e.generateId("label")
  }, r);
  return w(() => L(e.registerLabel(n.id))), u(I, m({
    as: "label",
    get for() {
      return e.inputId();
    }
  }, () => e.dataset(), n));
}
function X(r) {
  return u(te, m({
    as: "span"
  }, r));
}
function Y(r) {
  let e;
  const n = `radiogroup-${K()}`, t = v({
    id: n,
    orientation: "vertical"
  }, r), [i, o, l] = G(t, ["ref", "value", "defaultValue", "onChange", "orientation", "aria-labelledby", "aria-describedby"], oe), [d, f] = ie({
    value: () => i.value,
    defaultValue: () => i.defaultValue,
    onChange: (p) => i.onChange?.(p)
  }), {
    formControlContext: a
  } = ne(o);
  re(() => e, () => f(i.defaultValue ?? ""));
  const C = () => a.getAriaLabelledBy(M(o.id), l["aria-label"], i["aria-labelledby"]), y = () => a.getAriaDescribedBy(i["aria-describedby"]), x = (p) => p === r.defaultValue, R = (p) => p === d(), c = {
    ariaDescribedBy: y,
    isDefaultValue: x,
    isSelectedValue: R,
    setSelectedValue: (p) => {
      if (!(a.isReadOnly() || a.isDisabled()) && (f(p), e))
        for (const h of e.querySelectorAll("[type='radio']")) {
          const b = h;
          b.checked = R(b.value);
        }
    }
  };
  return u(ae.Provider, {
    value: a,
    get children() {
      return u(H.Provider, {
        value: c,
        get children() {
          return u(I, m({
            as: "div",
            ref(p) {
              var h = E((b) => e = b, i.ref);
              typeof h == "function" && h(p);
            },
            role: "radiogroup",
            get id() {
              return M(o.id);
            },
            get "aria-invalid"() {
              return a.validationState() === "invalid" || void 0;
            },
            get "aria-required"() {
              return a.isRequired() || void 0;
            },
            get "aria-disabled"() {
              return a.isDisabled() || void 0;
            },
            get "aria-readonly"() {
              return a.isReadOnly() || void 0;
            },
            get "aria-orientation"() {
              return i.orientation;
            },
            get "aria-labelledby"() {
              return C();
            },
            get "aria-describedby"() {
              return y();
            }
          }, () => a.dataset(), l));
        }
      });
    }
  });
}
var ge = Object.assign(Y, {
  Description: q,
  ErrorMessage: O,
  Item: T,
  ItemControl: U,
  ItemDescription: z,
  ItemIndicator: J,
  ItemInput: Q,
  ItemLabel: W,
  Label: X
});
export {
  ge as RadioGroup,
  T as RadioGroupItem,
  U as RadioGroupItemControl,
  z as RadioGroupItemDescription,
  J as RadioGroupItemIndicator,
  Q as RadioGroupItemInput,
  W as RadioGroupItemLabel,
  X as RadioGroupLabel,
  Y as RadioGroupRoot,
  be as radio_group_exports,
  V as useRadioGroupContext,
  P as useRadioGroupItemContext
};
//# sourceMappingURL=index117.js.map
