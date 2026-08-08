import * as s from "react";
import { useComposedRefs as B } from "./index192.js";
import { createContextScope as L } from "./index195.js";
import { composeEventHandlers as S } from "./index194.js";
import { useControllableState as O } from "./index204.js";
import { usePrevious as j } from "./index214.js";
import { useSize as H } from "./index213.js";
import { Presence as z } from "./index202.js";
import { Primitive as P } from "./index203.js";
import { jsx as b, jsxs as G, Fragment as K } from "react/jsx-runtime";
var g = "Checkbox", [U] = L(g), [X, E] = U(g);
function J(t) {
  const {
    __scopeCheckbox: a,
    checked: c,
    children: u,
    defaultChecked: r,
    disabled: e,
    form: p,
    name: f,
    onCheckedChange: i,
    required: m,
    value: C = "on",
    // @ts-expect-error
    internal_do_not_use_render: d
  } = t, [l, v] = O({
    prop: c,
    defaultProp: r ?? !1,
    onChange: i,
    caller: g
  }), [k, x] = s.useState(null), [_, o] = s.useState(null), n = s.useRef(!1), I = k ? !!p || !!k.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    !0
  ), R = {
    checked: l,
    disabled: e,
    setChecked: v,
    control: k,
    setControl: x,
    name: f,
    form: p,
    value: C,
    hasConsumerStoppedPropagationRef: n,
    required: m,
    defaultChecked: h(r) ? !1 : r,
    isFormControl: I,
    bubbleInput: _,
    setBubbleInput: o
  };
  return /* @__PURE__ */ b(
    X,
    {
      scope: a,
      ...R,
      children: W(d) ? d(R) : u
    }
  );
}
var N = "CheckboxTrigger", w = s.forwardRef(
  ({ __scopeCheckbox: t, onKeyDown: a, onClick: c, ...u }, r) => {
    const {
      control: e,
      value: p,
      disabled: f,
      checked: i,
      required: m,
      setControl: C,
      setChecked: d,
      hasConsumerStoppedPropagationRef: l,
      isFormControl: v,
      bubbleInput: k
    } = E(N, t), x = B(r, C), _ = s.useRef(i);
    return s.useEffect(() => {
      const o = e?.form;
      if (o) {
        const n = () => d(_.current);
        return o.addEventListener("reset", n), () => o.removeEventListener("reset", n);
      }
    }, [e, d]), /* @__PURE__ */ b(
      P.button,
      {
        type: "button",
        role: "checkbox",
        "aria-checked": h(i) ? "mixed" : i,
        "aria-required": m,
        "data-state": A(i),
        "data-disabled": f ? "" : void 0,
        disabled: f,
        value: p,
        ...u,
        ref: x,
        onKeyDown: S(a, (o) => {
          o.key === "Enter" && o.preventDefault();
        }),
        onClick: S(c, (o) => {
          d((n) => h(n) ? !0 : !n), k && v && (l.current = o.isPropagationStopped(), l.current || o.stopPropagation());
        })
      }
    );
  }
);
w.displayName = N;
var Q = s.forwardRef(
  (t, a) => {
    const {
      __scopeCheckbox: c,
      name: u,
      checked: r,
      defaultChecked: e,
      required: p,
      disabled: f,
      value: i,
      onCheckedChange: m,
      form: C,
      ...d
    } = t;
    return /* @__PURE__ */ b(
      J,
      {
        __scopeCheckbox: c,
        checked: r,
        defaultChecked: e,
        disabled: f,
        required: p,
        onCheckedChange: m,
        name: u,
        form: C,
        value: i,
        internal_do_not_use_render: ({ isFormControl: l }) => /* @__PURE__ */ G(K, { children: [
          /* @__PURE__ */ b(
            w,
            {
              ...d,
              ref: a,
              __scopeCheckbox: c
            }
          ),
          l && /* @__PURE__ */ b(
            q,
            {
              __scopeCheckbox: c
            }
          )
        ] })
      }
    );
  }
);
Q.displayName = g;
var T = "CheckboxIndicator", V = s.forwardRef(
  (t, a) => {
    const { __scopeCheckbox: c, forceMount: u, ...r } = t, e = E(T, c);
    return /* @__PURE__ */ b(
      z,
      {
        present: u || h(e.checked) || e.checked === !0,
        children: /* @__PURE__ */ b(
          P.span,
          {
            "data-state": A(e.checked),
            "data-disabled": e.disabled ? "" : void 0,
            ...r,
            ref: a,
            style: { pointerEvents: "none", ...t.style }
          }
        )
      }
    );
  }
);
V.displayName = T;
var M = "CheckboxBubbleInput", q = s.forwardRef(
  ({ __scopeCheckbox: t, ...a }, c) => {
    const {
      control: u,
      hasConsumerStoppedPropagationRef: r,
      checked: e,
      defaultChecked: p,
      required: f,
      disabled: i,
      name: m,
      value: C,
      form: d,
      bubbleInput: l,
      setBubbleInput: v
    } = E(M, t), k = B(c, v), x = j(e), _ = H(u);
    s.useEffect(() => {
      const n = l;
      if (!n) return;
      const I = window.HTMLInputElement.prototype, y = Object.getOwnPropertyDescriptor(
        I,
        "checked"
      ).set, D = !r.current;
      if (x !== e && y) {
        const F = new Event("click", { bubbles: D });
        n.indeterminate = h(e), y.call(n, h(e) ? !1 : e), n.dispatchEvent(F);
      }
    }, [l, x, e, r]);
    const o = s.useRef(h(e) ? !1 : e);
    return /* @__PURE__ */ b(
      P.input,
      {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: p ?? o.current,
        required: f,
        disabled: i,
        name: m,
        value: C,
        form: d,
        ...a,
        tabIndex: -1,
        ref: k,
        style: {
          ...a.style,
          ..._,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
q.displayName = M;
function W(t) {
  return typeof t == "function";
}
function h(t) {
  return t === "indeterminate";
}
function A(t) {
  return h(t) ? "indeterminate" : t ? "checked" : "unchecked";
}
export {
  Q as Checkbox,
  V as CheckboxIndicator,
  V as Indicator,
  Q as Root,
  q as unstable_BubbleInput,
  q as unstable_CheckboxBubbleInput,
  J as unstable_CheckboxProvider,
  w as unstable_CheckboxTrigger,
  J as unstable_Provider,
  w as unstable_Trigger
};
//# sourceMappingURL=index152.js.map
