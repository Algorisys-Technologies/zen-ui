import { jsx as z, jsxs as ee } from "react/jsx-runtime";
import * as o from "react";
import { currencyPrecision as ne, formatAmount as te, formatNumber as D, parseNumber as re, roundTo as C, editText as oe } from "./index162.js";
import { useLocale as P } from "./index90.js";
import { cn as le } from "./index160.js";
const N = o.forwardRef(
  ({
    value: e,
    defaultValue: a,
    onValueChange: s,
    onInvalidInput: r,
    locale: n,
    min: l,
    max: u,
    shorthand: j,
    placeholder: q,
    invalid: F,
    disabled: R,
    readOnly: B,
    id: L,
    name: Q,
    "aria-label": K,
    "aria-labelledby": M,
    width: U,
    className: V,
    precision: p,
    allowNegative: G,
    display: H,
    adornment: i,
    hint: J,
    currency: O
  }, y) => {
    const I = o.useId(), [W, X] = o.useState(a ?? null), c = e !== void 0 ? e : W, [b, T] = o.useState(!1), [x, h] = o.useState(""), [d, f] = o.useState(null), $ = o.useRef(null), Y = (t) => {
      $.current = t, typeof y == "function" ? y(t) : y && (y.current = t);
    }, k = o.useRef(b);
    k.current = b;
    const E = o.useRef(!0);
    o.useEffect(() => {
      if (E.current) {
        E.current = !1;
        return;
      }
      k.current || f(null);
    }, [c]);
    const g = o.useRef(!1);
    o.useLayoutEffect(() => {
      g.current && (g.current = !1, $.current?.select());
    });
    const Z = b || d !== null ? x : c == null ? "" : H(c), v = () => oe(c, { locale: n, precision: p }), _ = (t) => (G || t >= 0) && (l === void 0 || t >= l) && (u === void 0 || t <= u), S = () => {
      const t = x, m = re(t, { locale: n, shorthand: j ?? !0, currency: O });
      if (m === "invalid" || m !== null && !_(C(m, p))) {
        f(t), r?.(t);
        return;
      }
      f(null);
      const w = m === null ? null : C(m, p);
      w !== c && (e === void 0 && X(w), s?.(w));
    }, A = i ? /* @__PURE__ */ z("span", { className: "zen-shrink-0 zen-text-sm zen-text-zen-muted-fg", "aria-hidden": "true", children: i.text }) : null;
    return /* @__PURE__ */ ee(
      "div",
      {
        className: le(
          "zen-flex zen-h-zen-control zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          d !== null || F ? "zen-border-zen-error" : "zen-border-zen-border",
          R && "zen-cursor-not-allowed zen-opacity-50",
          V
        ),
        style: { width: U ?? "100%" },
        children: [
          i?.before ? A : null,
          /* @__PURE__ */ z(
            "input",
            {
              ref: Y,
              id: L,
              name: Q,
              type: "text",
              inputMode: "decimal",
              autoComplete: "off",
              spellCheck: !1,
              value: Z,
              placeholder: q,
              disabled: R,
              readOnly: B,
              "aria-label": K,
              "aria-labelledby": M,
              "aria-describedby": I,
              "aria-invalid": d !== null || F ? "true" : void 0,
              onFocus: () => {
                d === null && h(v()), T(!0), g.current = !0;
              },
              onChange: (t) => {
                h(t.currentTarget.value), f(null);
              },
              onBlur: () => {
                T(!1), S();
              },
              onKeyDown: (t) => {
                t.key === "Enter" ? S() : t.key === "Escape" && (x !== v() || d !== null) && (t.preventDefault(), f(null), h(v()));
              },
              className: "zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-end zen-text-sm zen-tabular-nums zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
            }
          ),
          i && !i.before ? A : null,
          /* @__PURE__ */ z("span", { id: I, className: "zen-sr-only", children: J })
        ]
      }
    );
  }
);
N.displayName = "NumberText";
function ae(e, a) {
  try {
    const s = new Intl.NumberFormat(a, { style: "currency", currency: e }).formatToParts(1), r = s.findIndex((l) => l.type === "currency"), n = s.findIndex((l) => l.type === "integer");
    return { text: s[r].value, before: r < n };
  } catch {
    return { text: e, before: !1 };
  }
}
function se(e, a) {
  try {
    return new Intl.DisplayNames(a ? [a] : void 0, { type: "currency" }).of(e) ?? e;
  } catch {
    return e;
  }
}
const ue = o.forwardRef((e, a) => {
  const s = P(), r = e.locale ?? s.locale, n = e.currency ?? s.currency, l = e.precision ?? (n ? ne(n) : 2);
  return /* @__PURE__ */ z(
    N,
    {
      ...e,
      ref: a,
      locale: r,
      precision: l,
      currency: n,
      display: (u) => n ? te(u, n, { locale: r, display: "none", precision: l }) : D(u, { locale: r, precision: l }),
      adornment: n ? ae(n, r) : null,
      hint: `${n ? `${s.t("amountField.inCurrency", { currency: se(n, r) })} ` : ""}${s.t("amountField.shorthand")}`
    }
  );
});
ue.displayName = "AmountField";
const ce = o.forwardRef(({ unit: e, ...a }, s) => {
  const r = P(), n = a.locale ?? r.locale, l = a.precision ?? 0;
  return /* @__PURE__ */ z(
    N,
    {
      ...a,
      ref: s,
      locale: n,
      precision: l,
      display: (u) => D(u, { locale: n, precision: l }),
      adornment: e ? { text: e, before: !1 } : null,
      hint: `${e ? `${r.t("quantityField.inUnit", { unit: e })} ` : ""}${r.t("quantityField.shorthand")}`
    }
  );
});
ce.displayName = "QuantityField";
export {
  ue as AmountField,
  ce as QuantityField
};
//# sourceMappingURL=index12.js.map
