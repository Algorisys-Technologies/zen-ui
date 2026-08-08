import * as i from "react";
import { composeEventHandlers as N } from "./index194.js";
import { useComposedRefs as C } from "./index192.js";
import { createContextScope as D } from "./index195.js";
import { Primitive as G } from "./index203.js";
import { Root as J, createRovingFocusGroupScope as x, Item as Q } from "./index212.js";
import { useControllableState as Z } from "./index204.js";
import { useDirection as $ } from "./index171.js";
import { useSize as ee } from "./index213.js";
import { usePrevious as oe } from "./index214.js";
import { Presence as re } from "./index202.js";
import { jsx as d, jsxs as F, Fragment as L } from "react/jsx-runtime";
var S = "Radio", [te, O] = D(S), [ne, P] = te(S);
function q(r) {
  const {
    __scopeRadio: t,
    checked: o = !1,
    children: n,
    disabled: e,
    form: a,
    name: s,
    onCheck: l,
    required: u,
    value: f = "on",
    // @ts-expect-error
    internal_do_not_use_render: p
  } = r, [c, m] = i.useState(null), [R, b] = i.useState(null), _ = i.useRef(!1), I = c ? !!a || !!c.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    !0
  ), v = {
    checked: o,
    disabled: e,
    required: u,
    name: s,
    form: a,
    value: f,
    control: c,
    setControl: m,
    hasConsumerStoppedPropagationRef: _,
    isFormControl: I,
    bubbleInput: R,
    setBubbleInput: b,
    onCheck: () => l?.()
  };
  return /* @__PURE__ */ d(ne, { scope: t, ...v, children: se(p) ? p(v) : n });
}
var U = "RadioTrigger", A = i.forwardRef(
  ({ __scopeRadio: r, onClick: t, ...o }, n) => {
    const {
      checked: e,
      disabled: a,
      value: s,
      setControl: l,
      onCheck: u,
      hasConsumerStoppedPropagationRef: f,
      isFormControl: p,
      bubbleInput: c
    } = P(U, r), m = C(n, l);
    return /* @__PURE__ */ d(
      G.button,
      {
        type: "button",
        role: "radio",
        "aria-checked": e,
        "data-state": H(e),
        "data-disabled": a ? "" : void 0,
        disabled: a,
        value: s,
        ...o,
        ref: m,
        onClick: N(t, (R) => {
          e || u(), c && p && (f.current = R.isPropagationStopped(), f.current || R.stopPropagation());
        })
      }
    );
  }
);
A.displayName = U;
var ae = i.forwardRef(
  (r, t) => {
    const { __scopeRadio: o, name: n, checked: e, required: a, disabled: s, value: l, onCheck: u, form: f, ...p } = r;
    return /* @__PURE__ */ d(
      q,
      {
        __scopeRadio: o,
        checked: e,
        disabled: s,
        required: a,
        onCheck: u,
        name: n,
        form: f,
        value: l,
        internal_do_not_use_render: ({ isFormControl: c }) => /* @__PURE__ */ F(L, { children: [
          /* @__PURE__ */ d(
            A,
            {
              ...p,
              ref: t,
              __scopeRadio: o
            }
          ),
          c && /* @__PURE__ */ d(
            T,
            {
              __scopeRadio: o
            }
          )
        ] })
      }
    );
  }
);
ae.displayName = S;
var V = "RadioIndicator", K = i.forwardRef(
  (r, t) => {
    const { __scopeRadio: o, forceMount: n, ...e } = r, a = P(V, o);
    return /* @__PURE__ */ d(re, { present: n || a.checked, children: /* @__PURE__ */ d(
      G.span,
      {
        "data-state": H(a.checked),
        "data-disabled": a.disabled ? "" : void 0,
        ...e,
        ref: t
      }
    ) });
  }
);
K.displayName = V;
var j = "RadioBubbleInput", T = i.forwardRef(
  ({ __scopeRadio: r, ...t }, o) => {
    const {
      control: n,
      checked: e,
      required: a,
      disabled: s,
      name: l,
      value: u,
      form: f,
      bubbleInput: p,
      setBubbleInput: c,
      hasConsumerStoppedPropagationRef: m
    } = P(j, r), R = C(o, c), b = oe(e), _ = ee(n);
    i.useEffect(() => {
      const v = p;
      if (!v) return;
      const h = window.HTMLInputElement.prototype, g = Object.getOwnPropertyDescriptor(
        h,
        "checked"
      ).set, w = !m.current;
      if (b !== e && g) {
        const E = new Event("click", { bubbles: w });
        g.call(v, e), v.dispatchEvent(E);
      }
    }, [p, b, e, m]);
    const I = i.useRef(e);
    return /* @__PURE__ */ d(
      G.input,
      {
        type: "radio",
        "aria-hidden": !0,
        defaultChecked: I.current,
        required: a,
        disabled: s,
        name: l,
        value: u,
        form: f,
        ...t,
        tabIndex: -1,
        ref: R,
        style: {
          ...t.style,
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
T.displayName = j;
function se(r) {
  return typeof r == "function";
}
function H(r) {
  return r ? "checked" : "unchecked";
}
var ie = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], k = "RadioGroup", [de] = D(k, [
  x,
  O
]), z = x(), y = O(), [ce, ue] = de(k), pe = i.forwardRef(
  (r, t) => {
    const {
      __scopeRadioGroup: o,
      name: n,
      form: e,
      defaultValue: a,
      value: s,
      required: l = !1,
      disabled: u = !1,
      orientation: f,
      dir: p,
      loop: c = !0,
      onValueChange: m,
      ...R
    } = r, b = z(o), _ = $(p), [I, v] = Z({
      prop: s,
      defaultProp: a ?? null,
      onChange: m,
      caller: k
    }), [h, M] = i.useState(null), g = C(t, M), w = i.useRef(I);
    return i.useEffect(() => {
      const E = e ? h?.ownerDocument.getElementById(e) : h?.closest("form");
      if (E instanceof HTMLFormElement) {
        const B = () => v(w.current);
        return E.addEventListener("reset", B), () => E.removeEventListener("reset", B);
      }
    }, [h, e, v]), /* @__PURE__ */ d(
      ce,
      {
        scope: o,
        name: n,
        form: e,
        required: l,
        disabled: u,
        value: I,
        onValueChange: v,
        children: /* @__PURE__ */ d(
          J,
          {
            asChild: !0,
            ...b,
            orientation: f,
            dir: _,
            loop: c,
            children: /* @__PURE__ */ d(
              G.div,
              {
                role: "radiogroup",
                "aria-required": l,
                "aria-orientation": f,
                "data-disabled": u ? "" : void 0,
                dir: _,
                ...R,
                ref: g
              }
            )
          }
        )
      }
    );
  }
);
pe.displayName = k;
var le = "RadioGroupItem", fe = "RadioGroupItemProvider", W = "RadioGroupItemTrigger", me = "RadioGroupItemBubbleInput";
function Re(r) {
  const {
    __scopeRadioGroup: t,
    value: o,
    disabled: n,
    children: e,
    // @ts-expect-error
    internal_do_not_use_render: a
  } = r, s = ue(fe, t), l = y(t), u = s.disabled || n;
  return /* @__PURE__ */ d(
    q,
    {
      ...l,
      checked: s.value === o,
      disabled: u,
      required: s.required,
      name: s.name,
      form: s.form,
      value: o,
      onCheck: () => s.onValueChange(o),
      internal_do_not_use_render: a,
      children: e
    }
  );
}
var X = i.forwardRef((r, t) => {
  const { __scopeRadioGroup: o, ...n } = r, e = z(o), a = y(o), { checked: s, disabled: l } = P(W, a.__scopeRadio), u = i.useRef(null), f = C(t, u), p = i.useRef(!1);
  return i.useEffect(() => {
    const c = (R) => {
      ie.includes(R.key) && (p.current = !0);
    }, m = () => p.current = !1;
    return document.addEventListener("keydown", c), document.addEventListener("keyup", m), () => {
      document.removeEventListener("keydown", c), document.removeEventListener("keyup", m);
    };
  }, []), /* @__PURE__ */ d(
    Q,
    {
      asChild: !0,
      ...e,
      focusable: !l,
      active: s,
      children: /* @__PURE__ */ d(
        A,
        {
          ...a,
          ...n,
          ref: f,
          onKeyDown: N(n.onKeyDown, (c) => {
            c.key === "Enter" && c.preventDefault();
          }),
          onFocus: N(n.onFocus, () => {
            p.current && u.current?.click();
          })
        }
      )
    }
  );
});
X.displayName = W;
var ve = i.forwardRef(
  (r, t) => {
    const { __scopeRadioGroup: o, value: n, disabled: e, ...a } = r;
    return /* @__PURE__ */ d(
      Re,
      {
        __scopeRadioGroup: o,
        value: n,
        disabled: e,
        internal_do_not_use_render: ({ isFormControl: s }) => /* @__PURE__ */ F(L, { children: [
          /* @__PURE__ */ d(
            X,
            {
              ...a,
              ref: t,
              __scopeRadioGroup: o
            }
          ),
          s && /* @__PURE__ */ d(
            Y,
            {
              __scopeRadioGroup: o
            }
          )
        ] })
      }
    );
  }
);
ve.displayName = le;
var Y = i.forwardRef((r, t) => {
  const { __scopeRadioGroup: o, ...n } = r, e = y(o);
  return /* @__PURE__ */ d(T, { ...e, ...n, ref: t });
});
Y.displayName = me;
var be = "RadioGroupIndicator", _e = i.forwardRef(
  (r, t) => {
    const { __scopeRadioGroup: o, ...n } = r, e = y(o);
    return /* @__PURE__ */ d(K, { ...e, ...n, ref: t });
  }
);
_e.displayName = be;
export {
  _e as Indicator,
  ve as Item,
  pe as RadioGroup,
  _e as RadioGroupIndicator,
  ve as RadioGroupItem,
  pe as Root,
  Y as unstable_ItemBubbleInput,
  Re as unstable_ItemProvider,
  X as unstable_ItemTrigger,
  Y as unstable_RadioGroupItemBubbleInput,
  Re as unstable_RadioGroupItemProvider,
  X as unstable_RadioGroupItemTrigger
};
//# sourceMappingURL=index153.js.map
