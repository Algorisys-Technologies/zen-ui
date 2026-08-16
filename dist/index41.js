import { jsx as u } from "react/jsx-runtime";
import * as o from "react";
import { cn as S } from "./index145.js";
import { arrowStep as W } from "./index150.js";
import "./index25.js";
import "./index100.js";
/* empty css         */
const K = o.createContext(null);
function _() {
  const t = o.useContext(K);
  if (!t)
    throw new Error("InputOTP subcomponents must be used within <InputOTP>");
  return t;
}
function V(t) {
  return t.replace(/\D/g, "");
}
function $(t, l, i) {
  const y = i ? i(t) : t;
  return V(y).slice(0, l);
}
const q = (t) => t === 6 ? [3, 3] : t === 4 ? [4] : t === 5 ? [5] : [t];
function J(t, l, i) {
  const y = l ?? q(t), v = [];
  let n = 0;
  return y.forEach((D, m) => {
    m > 0 && v.push(/* @__PURE__ */ u(o.Fragment, { children: i }, `sep-${m}`));
    const f = Array.from({ length: D }, (a, p) => /* @__PURE__ */ u(H, { index: n + p }, n + p));
    v.push(/* @__PURE__ */ u(E, { children: f }, `grp-${m}`)), n += D;
  }), v;
}
const Q = o.forwardRef(
  ({
    value: t,
    defaultValue: l = "",
    onValueChange: i,
    onChange: y,
    onComplete: v,
    maxLength: n = 6,
    groupSizes: D,
    separator: m = /* @__PURE__ */ u(j, {}),
    children: f,
    className: a,
    containerClassName: p,
    disabled: b,
    pasteTransformer: d,
    borderColor: h,
    focusBorderColor: P,
    slotClassName: w,
    style: N,
    ...R
  }, T) => {
    const [I, F] = o.useState(l), g = t !== void 0, O = g ? t : I, C = o.useRef([]), k = i ?? y, e = o.useCallback(
      (z) => {
        const s = V(z).slice(0, n);
        g || F(s), k?.(s), s.length === n && v?.(s);
      },
      [g, n, k, v]
    ), c = o.useCallback((z) => {
      const s = C.current[z];
      s && (s.focus(), s.select());
    }, []), r = o.useCallback(
      (z) => {
        const s = $(z, n, d);
        s && (e(s), c(Math.min(s.length, n) - 1));
      },
      [c, n, d, e]
    ), M = o.useCallback(
      (z) => {
        if (b) return;
        const s = z.clipboardData.getData("text");
        if (!s) return;
        const G = $(s, n, d);
        G && (z.preventDefault(), z.stopPropagation(), r(G));
      },
      [r, b, n, d]
    );
    o.useImperativeHandle(T, () => C.current[0]);
    const A = o.useMemo(
      () => ({
        ...h && { "--zen-otp-slot-border": h },
        ...P && { "--zen-otp-slot-focus-border": P }
      }),
      [h, P]
    ), B = o.useMemo(
      () => ({
        value: O,
        maxLength: n,
        disabled: b,
        inputRefs: C,
        updateValue: e,
        focusInput: c,
        applyDigits: r,
        pasteTransformer: d,
        slotClassName: w
      }),
      [
        O,
        n,
        b,
        e,
        c,
        r,
        d,
        w
      ]
    ), U = f ?? J(n, D, m);
    return /* @__PURE__ */ u(K.Provider, { value: B, children: /* @__PURE__ */ u(
      "div",
      {
        className: S(
          "zen-flex zen-items-center zen-gap-2 has-[:disabled]:zen-opacity-50",
          p,
          a
        ),
        style: { ...A, ...N },
        onPasteCapture: M,
        ...R,
        children: U
      }
    ) });
  }
);
Q.displayName = "InputOTP";
const E = o.forwardRef(({ className: t, ...l }, i) => /* @__PURE__ */ u("div", { ref: i, className: S("zen-flex zen-items-center zen-gap-2", t), ...l }));
E.displayName = "InputOTPGroup";
const X = S(
  "zen-otp-slot zen-h-11 zen-w-11 zen-rounded-zen-md zen-bg-zen-background zen-p-0",
  "zen-text-center zen-text-base zen-font-medium zen-text-zen-foreground zen-tabular-nums",
  "zen-transition-colors",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50"
), H = o.forwardRef(
  ({
    index: t,
    className: l,
    disabled: i,
    onChange: y,
    onKeyDown: v,
    onPaste: n,
    onFocus: D,
    ...m
  }, f) => {
    const {
      value: a,
      maxLength: p,
      disabled: b,
      inputRefs: d,
      updateValue: h,
      focusInput: P,
      applyDigits: w,
      pasteTransformer: N,
      slotClassName: R
    } = _(), T = b || i, I = a[t] ?? "", F = o.useCallback(
      (e) => {
        d.current[t] = e, typeof f == "function" ? f(e) : f && (f.current = e);
      },
      [t, d, f]
    ), g = (e) => {
      y?.(e);
      const c = e.target.value, r = $(c, p, N);
      if (r.length > 1) {
        w(r);
        return;
      }
      if (!r) {
        h(a.slice(0, t) + a.slice(t + 1));
        return;
      }
      const M = (a.slice(0, t) + r + a.slice(t + 1)).slice(
        0,
        p
      );
      h(M), t < p - 1 && P(t + 1);
    }, O = (e) => {
      if (v?.(e), e.defaultPrevented) return;
      if (e.key === "Backspace") {
        if (e.preventDefault(), I) {
          h(a.slice(0, t) + a.slice(t + 1));
          return;
        }
        if (t > 0) {
          const r = t - 1;
          h(a.slice(0, r) + a.slice(r + 1)), P(r);
        }
        return;
      }
      const c = W(e.key, e.currentTarget);
      if (c === -1 && t > 0) {
        e.preventDefault(), P(t - 1);
        return;
      }
      c === 1 && t < p - 1 && (e.preventDefault(), P(t + 1));
    }, C = (e) => {
      if (n?.(e), e.defaultPrevented) return;
      const c = e.clipboardData.getData("text");
      c && (e.preventDefault(), w(c));
    }, k = (e) => {
      D?.(e), e.target.select();
    };
    return /* @__PURE__ */ u(
      "input",
      {
        ref: F,
        type: "text",
        inputMode: "numeric",
        autoComplete: t === 0 ? "one-time-code" : "off",
        "aria-label": `Digit ${t + 1} of ${p}`,
        disabled: T,
        value: I,
        className: S(X, R, l),
        onChange: g,
        onKeyDown: O,
        onPaste: C,
        onFocus: k,
        ...m
      }
    );
  }
);
H.displayName = "InputOTPSlot";
const j = o.forwardRef(({ ...t }, l) => /* @__PURE__ */ u("div", { ref: l, role: "separator", ...t, children: /* @__PURE__ */ u(Y, {}) }));
j.displayName = "InputOTPSeparator";
const Y = () => /* @__PURE__ */ u("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": !0, children: /* @__PURE__ */ u("line", { x1: "6", y1: "12", x2: "18", y2: "12" }) });
export {
  Q as InputOTP,
  E as InputOTPGroup,
  j as InputOTPSeparator,
  H as InputOTPSlot
};
//# sourceMappingURL=index41.js.map
