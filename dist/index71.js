import { createComponent as d, template as b, insert as C, effect as L, className as _, style as B, spread as D, mergeProps as P, use as E } from "solid-js/web";
import { mergeProps as F, createSignal as G, createContext as K, Show as T, splitProps as y, createMemo as M, For as I, useContext as R } from "solid-js";
import { cn as z } from "./index106.js";
import { arrowStep as A } from "./index115.js";
import "./index25.js";
/* empty css         */
var w = /* @__PURE__ */ b("<div>"), N = /* @__PURE__ */ b("<input>"), U = /* @__PURE__ */ b('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round aria-hidden><line x1=6 y1=12 x2=18 y2=12>');
const S = K();
function j() {
  const n = R(S);
  if (!n)
    throw new Error("InputOTP subcomponents must be used within <InputOTP>");
  return n;
}
function O(n) {
  return n.replace(/\D/g, "");
}
function q(n, e, l) {
  const t = l ? l(n) : n;
  return O(t).slice(0, e);
}
const H = (n) => n === 6 ? [3, 3] : n === 4 ? [4] : n === 5 ? [5] : [n], ae = (n) => {
  const e = F({
    maxLength: 6,
    defaultValue: ""
  }, n), l = () => e.value !== void 0, [t, u] = G(e.defaultValue), f = () => l() ? e.value : t(), g = () => e.maxLength, m = [], x = (s, r) => {
    m[s] = r;
  }, o = (s) => {
    const r = m[s];
    r && (r.focus(), r.select());
  }, a = (s) => (e.onValueChange ?? e.onChange)?.(s), c = (s) => {
    const r = O(s).slice(0, g());
    l() || u(r), a(r), r.length === g() && e.onComplete?.(r);
  }, i = (s) => q(s, g(), e.pasteTransformer), p = (s) => {
    const r = i(s);
    r && (c(r), o(Math.min(r.length, g()) - 1));
  }, v = (s) => {
    if (e.disabled) return;
    const r = s.clipboardData?.getData("text");
    if (!r) return;
    const h = i(r);
    h && (s.preventDefault(), s.stopPropagation(), p(h));
  }, $ = () => ({
    ...e.borderColor ? {
      "--zen-otp-slot-border": e.borderColor
    } : {},
    ...e.focusBorderColor ? {
      "--zen-otp-slot-focus-border": e.focusBorderColor
    } : {}
  }), k = {
    value: f,
    maxLength: g,
    disabled: () => e.disabled,
    slotClass: () => e.slotClass,
    setRef: x,
    updateValue: c,
    focusInput: o,
    applyDigits: p,
    sanitize: i
  };
  return d(S.Provider, {
    value: k,
    get children() {
      var s = w();
      return s.addEventListener("paste", v), C(s, d(T, {
        get when() {
          return e.children;
        },
        get fallback() {
          return d(J, {
            get maxLength() {
              return g();
            },
            get groupSizes() {
              return e.groupSizes;
            },
            get separator() {
              return e.separator;
            }
          });
        },
        get children() {
          return e.children;
        }
      })), L((r) => {
        var h = z("zen-flex zen-items-center zen-gap-2 has-[:disabled]:zen-opacity-50", e.containerClass, e.class), V = $();
        return h !== r.e && _(s, r.e = h), r.t = B(s, V, r.t), r;
      }, {
        e: void 0,
        t: void 0
      }), s;
    }
  });
}, J = (n) => {
  const e = M(() => {
    const l = n.groupSizes ?? H(n.maxLength), t = [];
    let u = 0;
    for (const f of l)
      t.push({
        start: u,
        size: f
      }), u += f;
    return t;
  });
  return d(I, {
    get each() {
      return e();
    },
    children: (l, t) => [d(T, {
      get when() {
        return t() > 0;
      },
      get children() {
        return n.separator ?? d(Y, {});
      }
    }), d(Q, {
      get children() {
        return d(I, {
          get each() {
            return Array.from({
              length: l.size
            }, (u, f) => l.start + f);
          },
          children: (u) => d(X, {
            index: u
          })
        });
      }
    })]
  });
}, Q = (n) => {
  const [e, l] = y(n, ["class", "children"]);
  return (() => {
    var t = w();
    return D(t, P(l, {
      get class() {
        return z("zen-flex zen-items-center zen-gap-2", e.class);
      }
    }), !1, !0), C(t, () => e.children), t;
  })();
}, W = z("zen-otp-slot zen-h-11 zen-w-11 zen-rounded-zen-md zen-bg-zen-background zen-p-0", "zen-text-center zen-text-base zen-font-medium zen-text-zen-foreground zen-tabular-nums", "zen-transition-colors", "disabled:zen-cursor-not-allowed disabled:zen-opacity-50"), X = (n) => {
  const [e, l] = y(n, ["index", "class", "disabled"]), t = j(), u = () => t.value()[e.index] ?? "", f = () => t.disabled() || e.disabled, g = (o) => {
    const a = t.sanitize(o.currentTarget.value), c = t.value(), i = e.index, p = t.maxLength();
    if (a.length > 1) {
      t.applyDigits(a);
      return;
    }
    if (!a) {
      t.updateValue(c.slice(0, i) + c.slice(i + 1));
      return;
    }
    const v = (c.slice(0, i) + a + c.slice(i + 1)).slice(0, p);
    t.updateValue(v), i < p - 1 && t.focusInput(i + 1);
  }, m = (o) => {
    const a = t.value(), c = e.index;
    if (o.key === "Backspace") {
      if (o.preventDefault(), u()) {
        t.updateValue(a.slice(0, c) + a.slice(c + 1));
        return;
      }
      if (c > 0) {
        const p = c - 1;
        t.updateValue(a.slice(0, p) + a.slice(p + 1)), t.focusInput(p);
      }
      return;
    }
    const i = A(o.key, o.currentTarget);
    if (i === -1 && c > 0) {
      o.preventDefault(), t.focusInput(c - 1);
      return;
    }
    i === 1 && c < t.maxLength() - 1 && (o.preventDefault(), t.focusInput(c + 1));
  }, x = (o) => {
    const a = o.clipboardData?.getData("text");
    a && (o.preventDefault(), t.applyDigits(a));
  };
  return (() => {
    var o = N();
    return E((a) => t.setRef(e.index, a), o), D(o, P(l, {
      type: "text",
      inputmode: "numeric",
      get autocomplete() {
        return e.index === 0 ? "one-time-code" : "off";
      },
      get "aria-label"() {
        return `Digit ${e.index + 1} of ${t.maxLength()}`;
      },
      get disabled() {
        return f();
      },
      get value() {
        return u();
      },
      get class() {
        return z(W, t.slotClass(), e.class);
      },
      onInput: g,
      onKeyDown: m,
      onPaste: x,
      onFocus: (a) => a.currentTarget.select()
    }), !1, !1), o;
  })();
}, Y = (n) => {
  const [e, l] = y(n, ["class"]);
  return (() => {
    var t = w();
    return D(t, P(l, {
      role: "separator",
      get class() {
        return e.class;
      }
    }), !1, !0), C(t, d(Z, {})), t;
  })();
}, Z = () => U();
export {
  ae as InputOTP,
  Q as InputOTPGroup,
  Y as InputOTPSeparator,
  X as InputOTPSlot
};
//# sourceMappingURL=index71.js.map
