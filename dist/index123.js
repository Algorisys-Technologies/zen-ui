import { jsxs as p, jsx as i } from "react/jsx-runtime";
import * as o from "react";
import { cn as g } from "./index197.js";
import { directionOf as U } from "./index205.js";
import "./index28.js";
import "./index110.js";
import { reasonCategories as V, filterReasons as G } from "./index124.js";
import { useLocale as J } from "./index90.js";
import { Search as W } from "./index9.js";
const N = (t) => g(
  "zen-inline-flex zen-min-h-12 zen-items-center zen-gap-1.5 zen-rounded-zen-full zen-border zen-border-solid zen-px-4 zen-text-sm zen-font-medium zen-cursor-pointer",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  t ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted"
);
function X({ reasons: t, value: b, defaultValue: S, onChange: A, label: I, searchable: j, showCategories: D, className: M, ...P }, q) {
  const r = J(), L = o.useId(), [O, T] = o.useState(S), c = b !== void 0 ? b : O, [s, h] = o.useState(), [u, $] = o.useState(""), x = o.useMemo(() => V(t), [t]), E = D ?? x.length > 1, H = j ?? t.length > 12, l = o.useMemo(() => G(t, { category: s, query: u }), [t, s, u]), z = c === void 0 || l.some((e) => e.id === c) ? void 0 : t.find((e) => e.id === c), y = (e) => {
    T(e.id), A?.(e.id, e);
  }, [B, v] = o.useState(), C = l.find((e) => e.id === B)?.id ?? l.find((e) => e.id === c)?.id ?? l[0]?.id, f = o.useRef(null), F = (e) => {
    v(e), f.current?.querySelector(`[data-reason-id="${CSS.escape(e)}"]`)?.focus();
  }, k = () => {
    const e = f.current ? [...f.current.querySelectorAll("[data-reason-id]")] : [];
    if (e.length < 2) return 1;
    const a = e[0].offsetTop, n = e.findIndex((m) => m.offsetTop !== a);
    return n < 0 ? e.length : n;
  }, K = (e) => {
    const a = l, n = a.findIndex((Q) => Q.id === C);
    if (n < 0) return;
    const m = U(f.current) === "rtl";
    let d = -1;
    if (e.key === (m ? "ArrowLeft" : "ArrowRight")) d = n + 1;
    else if (e.key === (m ? "ArrowRight" : "ArrowLeft")) d = n - 1;
    else if (e.key === "ArrowDown") d = n + k();
    else if (e.key === "ArrowUp") d = n - k();
    else if (e.key === "Home") d = 0;
    else if (e.key === "End") d = a.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(), y(a[n]);
      return;
    } else return;
    e.preventDefault(), F(a[Math.min(a.length - 1, Math.max(0, d))].id);
  }, w = [L, "list"].join("-");
  return /* @__PURE__ */ p("div", { ref: q, className: g("zen-flex zen-w-full zen-flex-col zen-gap-3", M), ...P, children: [
    H && /* @__PURE__ */ i(
      W,
      {
        size: "lg",
        value: u,
        onValueChange: $,
        placeholder: r.t("reasonCodes.search"),
        "aria-label": r.t("reasonCodes.search"),
        "aria-controls": w
      }
    ),
    E && /* @__PURE__ */ p("div", { role: "group", "aria-label": r.t("reasonCodes.categories"), className: "zen-flex zen-flex-wrap zen-gap-2", children: [
      /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          "aria-pressed": s === void 0,
          className: N(s === void 0),
          onClick: () => h(void 0),
          children: r.t("reasonCodes.all")
        }
      ),
      x.map((e) => /* @__PURE__ */ p(
        "button",
        {
          type: "button",
          "aria-pressed": s === e.id,
          className: N(s === e.id),
          onClick: () => h(s === e.id ? void 0 : e.id),
          children: [
            e.id,
            /* @__PURE__ */ i("span", { className: "zen-tabular-nums zen-opacity-80", children: e.count })
          ]
        },
        e.id
      ))
    ] }),
    /* @__PURE__ */ i(
      "div",
      {
        ref: f,
        id: w,
        role: "listbox",
        "aria-label": I ?? r.t("reasonCodes.label"),
        className: "zen-grid zen-gap-2",
        style: { gridTemplateColumns: "repeat(auto-fill, minmax(min(var(--zen-reason-min-width), 100%), 1fr))" },
        onKeyDown: K,
        children: l.map((e) => /* @__PURE__ */ p(
          "div",
          {
            role: "option",
            "data-reason-id": e.id,
            "aria-selected": c === e.id,
            tabIndex: C === e.id ? 0 : -1,
            title: e.description,
            className: g(
              "zen-flex zen-min-h-14 zen-cursor-pointer zen-select-none zen-flex-col zen-justify-center zen-gap-0.5 zen-rounded-zen-md zen-border-2 zen-border-solid zen-px-3 zen-py-2",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
              c === e.id ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted"
            ),
            onFocus: () => v(e.id),
            onClick: () => y(e),
            children: [
              e.code ? /* @__PURE__ */ i("span", { className: "zen-font-mono zen-text-xs zen-opacity-80", children: e.code }) : null,
              /* @__PURE__ */ i("span", { className: "zen-text-base zen-font-medium zen-leading-snug", children: e.label })
            ]
          },
          e.id
        ))
      }
    ),
    l.length === 0 && /* @__PURE__ */ i("p", { className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg", children: r.t("reasonCodes.none", { query: u }) }),
    z && /* @__PURE__ */ i("p", { className: "zen-m-0 zen-text-sm zen-text-zen-foreground", role: "status", children: r.t("reasonCodes.selectedHidden", {
      label: z.code ? `${z.code} ${z.label}` : z.label
    }) })
  ] });
}
const R = o.forwardRef(X);
R.displayName = "ReasonCodePicker";
const re = R;
export {
  re as ReasonCodePicker
};
//# sourceMappingURL=index123.js.map
