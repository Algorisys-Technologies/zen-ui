import { jsx as n, jsxs as f, Fragment as F } from "react/jsx-runtime";
import * as u from "react";
import { cn as r } from "./index197.js";
import "./index28.js";
import "./index110.js";
import { parseSnapshot as S, isKeyed as j, computeDiff as C } from "./index168.js";
import { useLocale as V } from "./index90.js";
const J = {
  added: "zen-text-zen-success",
  removed: "zen-text-zen-muted-fg",
  changed: "zen-text-zen-foreground",
  unchanged: "zen-text-zen-muted-fg"
}, L = (t) => t === null ? /* @__PURE__ */ n("span", { className: "zen-italic", children: "null" }) : typeof t == "string" ? t : typeof t == "number" || typeof t == "boolean" || typeof t == "bigint" ? String(t) : t instanceof Date ? t.toISOString() : JSON.stringify(t), x = () => {
  const t = V();
  return /* @__PURE__ */ f(F, { children: [
    /* @__PURE__ */ n("span", { "aria-hidden": !0, className: "zen-text-zen-muted-fg", children: "—" }),
    /* @__PURE__ */ n("span", { className: "zen-sr-only", children: t.t("diffView.notSet") })
  ] });
}, v = ({
  before: t,
  after: m,
  parse: o,
  keys: h,
  labels: g,
  changedOnly: b,
  format: y,
  headings: z,
  density: M,
  emptyMessage: A,
  className: N
}) => {
  const d = V(), i = u.useMemo(
    () => typeof t == "string" && o ? o(t) : S(t),
    [t, o]
  ), s = u.useMemo(
    () => typeof m == "string" && o ? o(m) : S(m),
    [m, o]
  ), l = u.useMemo(() => {
    const e = [i, s].filter((c) => c !== void 0);
    return e.length > 0 && e.every(j);
  }, [i, s]), w = u.useMemo(
    () => l ? C(
      i,
      s,
      { keys: h, labels: g, changedOnly: b }
    ) : [],
    [l, i, s, h, g, b]
  ), a = r("zen-align-top", M === "compact" ? "zen-px-2 zen-py-1" : "zen-px-3 zen-py-2"), k = (e, c) => y ? y(e, c) : L(e);
  if (l ? w.length === 0 : i === void 0 && s === void 0)
    return /* @__PURE__ */ n("p", { className: "zen-m-0 zen-py-3 zen-text-sm zen-text-zen-muted-fg", children: A ?? d.t("diffView.noChanges") });
  if (!l) {
    const e = (c, p, D) => /* @__PURE__ */ f("div", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1", children: [
      /* @__PURE__ */ n("span", { className: "zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: c }),
      p === void 0 ? /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-sm", children: /* @__PURE__ */ n(x, {}) }) : /* @__PURE__ */ n(
        "pre",
        {
          className: r(
            "zen-m-0 zen-max-h-64 zen-overflow-auto zen-whitespace-pre-wrap zen-break-words zen-rounded-zen-sm zen-bg-zen-muted zen-p-2 zen-text-xs",
            D
          ),
          children: typeof p == "string" ? p : JSON.stringify(p, null, 2)
        }
      )
    ] });
    return /* @__PURE__ */ f("div", { className: r("zen-flex zen-w-full zen-flex-wrap zen-gap-4", N), children: [
      e(z?.before ?? d.t("diffView.before"), i, "zen-text-zen-muted-fg"),
      e(z?.after ?? d.t("diffView.after"), s, "zen-text-zen-foreground")
    ] });
  }
  return (
    /* Its own scroller: a long value must not widen the page, and a diff dropped
       into a Timeline slot has no width of its own to give. */
    /* @__PURE__ */ n(
      "div",
      {
        className: r(
          "zen-w-full zen-overflow-x-auto zen-rounded-zen-md zen-border zen-border-zen-border",
          N
        ),
        children: /* @__PURE__ */ f("table", { className: "zen-w-full zen-border-collapse zen-text-start zen-text-sm", children: [
          /* @__PURE__ */ n("thead", { children: /* @__PURE__ */ n("tr", { className: "zen-border-b zen-border-zen-border zen-bg-zen-muted", children: [z?.key ?? d.t("diffView.field"), z?.before ?? d.t("diffView.before"), z?.after ?? d.t("diffView.after")].map(
            (e) => /* @__PURE__ */ n(
              "th",
              {
                scope: "col",
                className: r(a, "zen-text-start zen-font-medium zen-text-zen-muted-fg"),
                children: e
              },
              e
            )
          ) }) }),
          /* @__PURE__ */ n("tbody", { children: w.map((e) => /* @__PURE__ */ f("tr", { className: "zen-border-b zen-border-zen-border last:zen-border-b-0", children: [
            /* @__PURE__ */ n(
              "th",
              {
                scope: "row",
                className: r(a, "zen-text-start zen-font-medium zen-text-zen-foreground"),
                children: e.label
              }
            ),
            /* @__PURE__ */ n("td", { className: r(a, "zen-text-zen-muted-fg"), children: e.kind === "added" ? /* @__PURE__ */ n(x, {}) : (
              /* Struck through rather than merely dimmed: the signal has to
                 survive greyscale. */
              /* @__PURE__ */ n("span", { className: e.kind === "unchanged" ? void 0 : "zen-line-through", children: k(e.before, e.key) })
            ) }),
            /* @__PURE__ */ n("td", { className: r(a, J[e.kind]), children: e.kind === "removed" ? /* @__PURE__ */ n(x, {}) : k(e.after, e.key) })
          ] }, e.key)) })
        ] })
      }
    )
  );
};
export {
  v as DiffView
};
//# sourceMappingURL=index167.js.map
