import * as n from "react";
import { composeEventHandlers as H } from "./index194.js";
import { useComposedRefs as I } from "./index192.js";
import { createContextScope as L } from "./index195.js";
import { useControllableState as A } from "./index204.js";
import { usePrevious as j } from "./index214.js";
import { useSize as U } from "./index213.js";
import { Primitive as R } from "./index203.js";
import { jsx as S, jsxs as z, Fragment as D } from "react/jsx-runtime";
var k = "Switch", [G] = L(k), [O, P] = G(k);
function W(t) {
  const {
    __scopeSwitch: s,
    checked: o,
    children: u,
    defaultChecked: e,
    disabled: r,
    form: p,
    name: f,
    onCheckedChange: d,
    required: h,
    value: m = "on",
    // @ts-expect-error
    internal_do_not_use_render: c
  } = t, [l, w] = A({
    prop: o,
    defaultProp: e ?? !1,
    onChange: d,
    caller: k
  }), [b, v] = n.useState(null), [C, a] = n.useState(null), i = n.useRef(!1), _ = b ? !!p || !!b.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    !0
  ), g = {
    checked: l,
    setChecked: w,
    disabled: r,
    control: b,
    setControl: v,
    name: f,
    form: p,
    value: m,
    hasConsumerStoppedPropagationRef: i,
    required: h,
    defaultChecked: e,
    isFormControl: _,
    bubbleInput: C,
    setBubbleInput: a
  };
  return /* @__PURE__ */ S(O, { scope: s, ...g, children: K(c) ? c(g) : u });
}
var y = "SwitchTrigger", T = n.forwardRef(
  ({ __scopeSwitch: t, onClick: s, ...o }, u) => {
    const {
      control: e,
      form: r,
      value: p,
      disabled: f,
      checked: d,
      required: h,
      setControl: m,
      setChecked: c,
      hasConsumerStoppedPropagationRef: l,
      isFormControl: w,
      bubbleInput: b
    } = P(y, t), v = I(u, m), C = n.useRef(d);
    return n.useEffect(() => {
      const a = r ? e?.ownerDocument.getElementById(r) : e?.form;
      if (a instanceof HTMLFormElement) {
        const i = () => c(C.current);
        return a.addEventListener("reset", i), () => a.removeEventListener("reset", i);
      }
    }, [e, r, c]), /* @__PURE__ */ S(
      R.button,
      {
        type: "button",
        role: "switch",
        "aria-checked": d,
        "aria-required": h,
        "data-state": M(d),
        "data-disabled": f ? "" : void 0,
        disabled: f,
        value: p,
        ...o,
        ref: v,
        onClick: H(s, (a) => {
          c((i) => !i), b && w && (l.current = a.isPropagationStopped(), l.current || a.stopPropagation());
        })
      }
    );
  }
);
T.displayName = y;
var X = n.forwardRef(
  (t, s) => {
    const {
      __scopeSwitch: o,
      name: u,
      checked: e,
      defaultChecked: r,
      required: p,
      disabled: f,
      value: d,
      onCheckedChange: h,
      form: m,
      ...c
    } = t;
    return /* @__PURE__ */ S(
      W,
      {
        __scopeSwitch: o,
        checked: e,
        defaultChecked: r,
        disabled: f,
        required: p,
        onCheckedChange: h,
        name: u,
        form: m,
        value: d,
        internal_do_not_use_render: ({ isFormControl: l }) => /* @__PURE__ */ z(D, { children: [
          /* @__PURE__ */ S(
            T,
            {
              ...c,
              ref: s,
              __scopeSwitch: o
            }
          ),
          l && /* @__PURE__ */ S(
            N,
            {
              __scopeSwitch: o
            }
          )
        ] })
      }
    );
  }
);
X.displayName = k;
var B = "SwitchThumb", J = n.forwardRef(
  (t, s) => {
    const { __scopeSwitch: o, ...u } = t, e = P(B, o);
    return /* @__PURE__ */ S(
      R.span,
      {
        "data-state": M(e.checked),
        "data-disabled": e.disabled ? "" : void 0,
        ...u,
        ref: s
      }
    );
  }
);
J.displayName = B;
var x = "SwitchBubbleInput", N = n.forwardRef(
  ({ __scopeSwitch: t, ...s }, o) => {
    const {
      control: u,
      hasConsumerStoppedPropagationRef: e,
      checked: r,
      defaultChecked: p,
      required: f,
      disabled: d,
      name: h,
      value: m,
      form: c,
      bubbleInput: l,
      setBubbleInput: w
    } = P(x, t), b = I(o, w), v = j(r), C = U(u);
    n.useEffect(() => {
      const i = l;
      if (!i) return;
      const _ = window.HTMLInputElement.prototype, E = Object.getOwnPropertyDescriptor(
        _,
        "checked"
      ).set, F = !e.current;
      if (v !== r && E) {
        const q = new Event("click", { bubbles: F });
        E.call(i, r), i.dispatchEvent(q);
      }
    }, [l, v, r, e]);
    const a = n.useRef(r);
    return /* @__PURE__ */ S(
      R.input,
      {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: p ?? a.current,
        required: f,
        disabled: d,
        name: h,
        value: m,
        form: c,
        ...s,
        tabIndex: -1,
        ref: b,
        style: {
          ...s.style,
          ...C,
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
N.displayName = x;
function K(t) {
  return typeof t == "function";
}
function M(t) {
  return t ? "checked" : "unchecked";
}
export {
  X as Root,
  X as Switch,
  J as SwitchThumb,
  J as Thumb,
  N as unstable_BubbleInput,
  W as unstable_Provider,
  N as unstable_SwitchBubbleInput,
  W as unstable_SwitchProvider,
  T as unstable_SwitchTrigger,
  T as unstable_Trigger
};
//# sourceMappingURL=index154.js.map
