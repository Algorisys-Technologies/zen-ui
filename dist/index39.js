import { jsx as R } from "react/jsx-runtime";
import * as m from "react";
import { applyMask as a, extractRaw as n, maskSkeleton as g, isMaskComplete as h, maskSlotCount as S } from "./index157.js";
import { Input as k } from "./index4.js";
import { cn as w } from "./index143.js";
const D = m.forwardRef(
  ({
    mask: e,
    rules: o,
    placeholderChar: d = "_",
    value: c,
    defaultValue: l,
    onValueChange: s,
    placeholder: y,
    onKeyDown: M,
    className: x,
    ...u
  }, v) => {
    const [C, I] = m.useState(
      () => a(n(l ?? "", e, o), e, o)
    ), p = c !== void 0, i = p ? a(n(c, e, o), e, o) : C, r = (t) => {
      const f = a(t, e, o);
      p || I(f), s?.(f, t, h(t, e, o));
    }, K = (t) => r(n(t, e, o));
    return /* @__PURE__ */ R(
      k,
      {
        ref: v,
        type: "text",
        inputMode: N(e, o),
        value: i,
        onChange: (t) => K(t.target.value),
        onKeyDown: (t) => {
          M?.(t), !t.defaultPrevented && t.key === "Backspace" && !t.altKey && !t.ctrlKey && !t.metaKey && (t.preventDefault(), r(n(i, e, o).slice(0, -1)));
        },
        placeholder: y ?? g(e, d, o),
        autoComplete: "off",
        className: w(x),
        ...u
      }
    );
  }
);
D.displayName = "MaskInput";
const N = (e, o) => S(e, o) > 0 && n("a".repeat(64), e, o).length === 0 ? "numeric" : "text";
export {
  D as MaskInput
};
//# sourceMappingURL=index39.js.map
