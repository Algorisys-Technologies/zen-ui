import { jsxs as p, jsx as i } from "react/jsx-runtime";
import * as m from "react";
import { parseNumber as j } from "./index199.js";
import { judgeMeasurement as k, measurementScale as _ } from "./index130.js";
import { useLocale as q } from "./index90.js";
import { Icon as J } from "./index63.js";
import { cn as g } from "./index197.js";
const Q = {
  pass: "measurement.pass",
  "warn-low": "measurement.warnLow",
  "warn-high": "measurement.warnHigh",
  "fail-low": "measurement.failLow",
  "fail-high": "measurement.failHigh"
}, W = (r) => Math.max(
  0,
  ...[r.nominal, r.lower, r.upper, r.warnLower, r.warnUpper].filter((c) => typeof c == "number").map((c) => (String(c).split(".")[1] ?? "").length)
), X = m.forwardRef(
  ({ spec: r, label: c, unit: v, precision: L, value: l, defaultValue: C, onChange: E, disabled: U, className: V, ...A }, H) => {
    const a = q(), w = m.useId(), S = `${w}-spec`, M = `${w}-verdict`, $ = L ?? W(r), d = (e, t = $) => new Intl.NumberFormat(a.locale, { minimumFractionDigits: t, maximumFractionDigits: t }).format(e), b = (e) => new Intl.NumberFormat(a.locale, { minimumFractionDigits: $, maximumFractionDigits: 12, useGrouping: !1 }).format(e), [h, F] = m.useState(() => {
      const e = l ?? C;
      return e == null ? "" : b(e);
    }), N = j(h, { locale: a.locale }), u = typeof N == "number" ? N : null, [K, B] = m.useState(l);
    l !== K && (B(l), l !== void 0 && l !== u && F(l === null ? "" : b(l)));
    const x = N === "invalid", z = m.useMemo(() => k(u, r), [u, r]), n = m.useMemo(() => _(r, u), [r, u]), [G, O] = m.useState(""), T = (() => {
      if (x) return a.t("measurement.invalid");
      if (!z.verdict) return "";
      const e = z.verdict === "pass" ? "pass" : `${z.verdict}-${z.side}`;
      return a.t(Q[e]);
    })(), o = x ? "fail" : z.verdict, f = (e) => v ? `${e} ${v}` : e, P = (() => {
      const { nominal: e, lower: t, upper: s } = r;
      return e !== void 0 && t !== void 0 && s !== void 0 && Math.abs(e - t - (s - e)) < 1e-9 ? f(a.t("measurement.specTolerance", { nominal: d(e), tolerance: d(s - e) })) : t !== void 0 && s !== void 0 ? f(a.t("measurement.specRange", { lower: d(t), upper: d(s) })) : t !== void 0 ? f(a.t("measurement.specMin", { lower: d(t) })) : s !== void 0 ? f(a.t("measurement.specMax", { upper: d(s) })) : "";
    })(), Y = (e) => {
      const t = e.currentTarget.value;
      F(t);
      const s = j(t, { locale: a.locale });
      s !== "invalid" && E?.(s, k(s, r));
    }, D = () => {
      O(
        u === null ? x ? `${c}: ${a.t("measurement.invalid")}` : "" : a.t("measurement.announce", { label: c, value: f(b(u)), verdict: T })
      );
    }, y = m.useRef(h), I = (e) => e === null ? void 0 : `${e * 100}%`, R = (e, t, s) => /* @__PURE__ */ i(
      "span",
      {
        className: g("zen-absolute zen-inset-y-0", s),
        style: { insetInlineStart: I(e ?? 0), width: `${((t ?? 1) - (e ?? 0)) * 100}%` }
      }
    );
    return /* @__PURE__ */ p("div", { ref: H, className: g("zen-flex zen-w-full zen-flex-col zen-gap-1.5", V), ...A, children: [
      /* @__PURE__ */ i("label", { htmlFor: w, className: "zen-text-sm zen-font-medium zen-text-zen-foreground", children: c }),
      /* @__PURE__ */ p("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ i(
          "input",
          {
            id: w,
            type: "text",
            inputMode: "decimal",
            autoComplete: "off",
            disabled: U,
            value: h,
            "aria-invalid": o === "fail" ? !0 : void 0,
            "aria-describedby": [S, M].join(" "),
            className: g(
              "zen-h-12 zen-w-40 zen-rounded-zen-md zen-border-2 zen-border-solid zen-bg-zen-background zen-px-3 zen-text-end zen-font-mono zen-text-lg zen-tabular-nums",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
              "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
              o === "fail" ? "zen-border-zen-error" : o === "warn" ? "zen-border-zen-warning-soft-fg" : o === "pass" ? "zen-border-zen-success" : "zen-border-zen-border"
            ),
            onChange: Y,
            onFocus: (e) => {
              y.current = e.currentTarget.value;
            },
            onBlur: (e) => {
              e.currentTarget.value !== y.current && D();
            },
            onKeyDown: (e) => {
              e.key === "Enter" && (y.current = e.currentTarget.value, D());
            }
          }
        ),
        v ? /* @__PURE__ */ i("span", { className: "zen-text-base zen-text-zen-foreground", children: v }) : null,
        /* @__PURE__ */ p(
          "span",
          {
            id: M,
            className: g(
              "zen-ms-2 zen-inline-flex zen-items-center zen-gap-1.5 zen-text-sm zen-font-semibold",
              o === "fail" ? "zen-text-zen-error" : o === "warn" ? "zen-text-zen-warning-soft-fg" : "zen-text-zen-success-soft-fg"
            ),
            children: [
              o ? /* @__PURE__ */ i(J, { name: o === "pass" ? "check-circle" : o === "warn" ? "warn" : "x-circle", size: 18 }) : null,
              T,
              n.offScale && !x ? /* @__PURE__ */ p("span", { className: "zen-font-normal zen-text-zen-muted-fg", children: [
                " (",
                a.t("measurement.offScale"),
                ")"
              ] }) : null
            ]
          }
        )
      ] }),
      /* @__PURE__ */ i("span", { id: S, className: "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: P }),
      n.max > n.min ? /* @__PURE__ */ p("div", { className: "zen-relative zen-mt-1 zen-h-3 zen-w-full zen-max-w-md zen-overflow-visible zen-rounded-zen-sm zen-bg-zen-error-soft", "aria-hidden": "true", children: [
        R(n.lower, n.upper, "zen-bg-zen-warning-soft"),
        R(n.warnLower ?? n.lower, n.warnUpper ?? n.upper, "zen-bg-zen-success-soft"),
        n.nominal !== null ? /* @__PURE__ */ i("span", { className: "zen-absolute zen-inset-y-0 zen-w-px zen-bg-zen-muted-fg", style: { insetInlineStart: I(n.nominal) } }) : null,
        n.value !== null ? /* @__PURE__ */ i(
          "span",
          {
            "data-part": "marker",
            "data-off-scale": n.offScale ? "" : void 0,
            className: g(
              "zen-absolute -zen-inset-y-1 zen-w-1 -zen-translate-x-1/2 zen-rounded-zen-full rtl:zen-translate-x-1/2",
              // Error red, else foreground: a yellow marker on the yellow
              // warning band would be the one reading nobody can see.
              o === "fail" ? "zen-bg-zen-error" : "zen-bg-zen-foreground"
            ),
            style: { insetInlineStart: I(n.value) }
          }
        ) : null
      ] }) : null,
      /* @__PURE__ */ i("span", { className: "zen-sr-only", "aria-live": "polite", children: G })
    ] });
  }
);
X.displayName = "MeasurementInput";
export {
  X as MeasurementInput
};
//# sourceMappingURL=index129.js.map
