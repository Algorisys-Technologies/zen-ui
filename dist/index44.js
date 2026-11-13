import { jsx as a } from "react/jsx-runtime";
import * as o from "react";
import { cn as R } from "./index197.js";
import { arrowStep as W } from "./index205.js";
import "./index28.js";
import "./index110.js";
/* empty css         */
import { useLocale as _ } from "./index90.js";
const E = o.createContext(null);
function q() {
  const t = o.useContext(E);
  if (!t)
    throw new Error("InputOTP subcomponents must be used within <InputOTP>");
  return t;
}
function H(t) {
  return t.replace(/\D/g, "");
}
function K(t, u, l) {
  const m = l ? l(t) : t;
  return H(m).slice(0, u);
}
const J = (t) => t === 6 ? [3, 3] : t === 4 ? [4] : t === 5 ? [5] : [t];
function Q(t, u, l) {
  const m = u ?? J(t), z = [];
  let n = 0;
  return m.forEach((b, P) => {
    P > 0 && z.push(/* @__PURE__ */ a(o.Fragment, { children: l }, `sep-${P}`));
    const f = Array.from({ length: b }, (I, r) => /* @__PURE__ */ a(j, { index: n + r }, n + r));
    z.push(/* @__PURE__ */ a($, { children: f }, `grp-${P}`)), n += b;
  }), z;
}
const X = o.forwardRef(
  ({
    value: t,
    defaultValue: u = "",
    onValueChange: l,
    onChange: m,
    onComplete: z,
    maxLength: n = 6,
    groupSizes: b,
    separator: P = /* @__PURE__ */ a(A, {}),
    children: f,
    className: I,
    containerClassName: r,
    disabled: i,
    pasteTransformer: v,
    borderColor: D,
    focusBorderColor: h,
    slotClassName: y,
    style: O,
    ...T
  }, F) => {
    const [M, k] = o.useState(u), g = t !== void 0, S = g ? t : M, C = o.useRef([]), N = l ?? m, w = o.useCallback(
      (d) => {
        const s = H(d).slice(0, n);
        g || k(s), N?.(s), s.length === n && z?.(s);
      },
      [g, n, N, z]
    ), e = o.useCallback((d) => {
      const s = C.current[d];
      s && (s.focus(), s.select());
    }, []), c = o.useCallback(
      (d) => {
        const s = K(d, n, v);
        s && (w(s), e(Math.min(s.length, n) - 1));
      },
      [e, n, v, w]
    ), p = o.useCallback(
      (d) => {
        if (i) return;
        const s = d.clipboardData.getData("text");
        if (!s) return;
        const V = K(s, n, v);
        V && (d.preventDefault(), d.stopPropagation(), c(V));
      },
      [c, i, n, v]
    );
    o.useImperativeHandle(F, () => C.current[0]);
    const G = o.useMemo(
      () => ({
        ...D && { "--zen-otp-slot-border": D },
        ...h && { "--zen-otp-slot-focus-border": h }
      }),
      [D, h]
    ), B = o.useMemo(
      () => ({
        value: S,
        maxLength: n,
        disabled: i,
        inputRefs: C,
        updateValue: w,
        focusInput: e,
        applyDigits: c,
        pasteTransformer: v,
        slotClassName: y
      }),
      [
        S,
        n,
        i,
        w,
        e,
        c,
        v,
        y
      ]
    ), U = f ?? Q(n, b, P);
    return /* @__PURE__ */ a(E.Provider, { value: B, children: /* @__PURE__ */ a(
      "div",
      {
        className: R(
          "zen-flex zen-items-center zen-gap-2 has-[:disabled]:zen-opacity-50",
          r,
          I
        ),
        style: { ...G, ...O },
        onPasteCapture: p,
        ...T,
        children: U
      }
    ) });
  }
);
X.displayName = "InputOTP";
const $ = o.forwardRef(({ className: t, ...u }, l) => /* @__PURE__ */ a("div", { ref: l, className: R("zen-flex zen-items-center zen-gap-2", t), ...u }));
$.displayName = "InputOTPGroup";
const Y = R(
  "zen-otp-slot zen-h-11 zen-w-11 zen-rounded-zen-md zen-bg-zen-background zen-p-0",
  "zen-text-center zen-text-base zen-font-medium zen-text-zen-foreground zen-tabular-nums",
  "zen-transition-colors",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50"
), j = o.forwardRef(
  ({
    index: t,
    className: u,
    disabled: l,
    onChange: m,
    onKeyDown: z,
    onPaste: n,
    onFocus: b,
    ...P
  }, f) => {
    const I = _(), {
      value: r,
      maxLength: i,
      disabled: v,
      inputRefs: D,
      updateValue: h,
      focusInput: y,
      applyDigits: O,
      pasteTransformer: T,
      slotClassName: F
    } = q(), M = v || l, k = r[t] ?? "", g = o.useCallback(
      (e) => {
        D.current[t] = e, typeof f == "function" ? f(e) : f && (f.current = e);
      },
      [t, D, f]
    ), S = (e) => {
      m?.(e);
      const c = e.target.value, p = K(c, i, T);
      if (p.length > 1) {
        O(p);
        return;
      }
      if (!p) {
        h(r.slice(0, t) + r.slice(t + 1));
        return;
      }
      const G = (r.slice(0, t) + p + r.slice(t + 1)).slice(
        0,
        i
      );
      h(G), t < i - 1 && y(t + 1);
    }, C = (e) => {
      if (z?.(e), e.defaultPrevented) return;
      if (e.key === "Backspace") {
        if (e.preventDefault(), k) {
          h(r.slice(0, t) + r.slice(t + 1));
          return;
        }
        if (t > 0) {
          const p = t - 1;
          h(r.slice(0, p) + r.slice(p + 1)), y(p);
        }
        return;
      }
      const c = W(e.key, e.currentTarget);
      if (c === -1 && t > 0) {
        e.preventDefault(), y(t - 1);
        return;
      }
      c === 1 && t < i - 1 && (e.preventDefault(), y(t + 1));
    }, N = (e) => {
      if (n?.(e), e.defaultPrevented) return;
      const c = e.clipboardData.getData("text");
      c && (e.preventDefault(), O(c));
    }, w = (e) => {
      b?.(e), e.target.select();
    };
    return /* @__PURE__ */ a(
      "input",
      {
        ref: g,
        type: "text",
        inputMode: "numeric",
        autoComplete: t === 0 ? "one-time-code" : "off",
        "aria-label": I.t("otp.digit", { n: t + 1, count: i }),
        disabled: M,
        value: k,
        className: R(Y, F, u),
        onChange: S,
        onKeyDown: C,
        onPaste: N,
        onFocus: w,
        ...P
      }
    );
  }
);
j.displayName = "InputOTPSlot";
const A = o.forwardRef(({ ...t }, u) => /* @__PURE__ */ a("div", { ref: u, role: "separator", ...t, children: /* @__PURE__ */ a(Z, {}) }));
A.displayName = "InputOTPSeparator";
const Z = () => /* @__PURE__ */ a("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": !0, children: /* @__PURE__ */ a("line", { x1: "6", y1: "12", x2: "18", y2: "12" }) });
export {
  X as InputOTP,
  $ as InputOTPGroup,
  A as InputOTPSeparator,
  j as InputOTPSlot
};
//# sourceMappingURL=index44.js.map
