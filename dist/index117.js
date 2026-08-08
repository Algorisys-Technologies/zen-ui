import { jsx as n, jsxs as i, Fragment as M } from "react/jsx-runtime";
import * as p from "react";
import { cn as r } from "./index143.js";
import "./index24.js";
import "./index98.js";
import { parseSnapshot as S, isKeyed as D, computeDiff as j } from "./index118.js";
const B = {
  added: "zen-text-zen-success",
  removed: "zen-text-zen-muted-fg",
  changed: "zen-text-zen-foreground",
  unchanged: "zen-text-zen-muted-fg"
}, J = (t) => t === null ? /* @__PURE__ */ n("span", { className: "zen-italic", children: "null" }) : typeof t == "string" ? t : typeof t == "number" || typeof t == "boolean" || typeof t == "bigint" ? String(t) : t instanceof Date ? t.toISOString() : JSON.stringify(t), u = () => /* @__PURE__ */ i(M, { children: [
  /* @__PURE__ */ n("span", { "aria-hidden": !0, className: "zen-text-zen-muted-fg", children: "—" }),
  /* @__PURE__ */ n("span", { className: "zen-sr-only", children: "not set" })
] }), T = ({
  before: t,
  after: m,
  parse: o,
  keys: x,
  labels: h,
  changedOnly: g,
  format: b,
  headings: z,
  density: w,
  emptyMessage: A,
  className: y
}) => {
  const s = p.useMemo(
    () => typeof t == "string" && o ? o(t) : S(t),
    [t, o]
  ), d = p.useMemo(
    () => typeof m == "string" && o ? o(m) : S(m),
    [m, o]
  ), l = p.useMemo(() => {
    const e = [s, d].filter((c) => c !== void 0);
    return e.length > 0 && e.every(D);
  }, [s, d]), N = p.useMemo(
    () => l ? j(
      s,
      d,
      { keys: x, labels: h, changedOnly: g }
    ) : [],
    [l, s, d, x, h, g]
  ), a = r("zen-align-top", w === "compact" ? "zen-px-2 zen-py-1" : "zen-px-3 zen-py-2"), k = (e, c) => b ? b(e, c) : J(e);
  if (l ? N.length === 0 : s === void 0 && d === void 0)
    return /* @__PURE__ */ n("p", { className: "zen-m-0 zen-py-3 zen-text-sm zen-text-zen-muted-fg", children: A ?? "No changes" });
  if (!l) {
    const e = (c, f, F) => /* @__PURE__ */ i("div", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1", children: [
      /* @__PURE__ */ n("span", { className: "zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: c }),
      f === void 0 ? /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-sm", children: /* @__PURE__ */ n(u, {}) }) : /* @__PURE__ */ n(
        "pre",
        {
          className: r(
            "zen-m-0 zen-max-h-64 zen-overflow-auto zen-whitespace-pre-wrap zen-break-words zen-rounded-zen-sm zen-bg-zen-muted zen-p-2 zen-text-xs",
            F
          ),
          children: typeof f == "string" ? f : JSON.stringify(f, null, 2)
        }
      )
    ] });
    return /* @__PURE__ */ i("div", { className: r("zen-flex zen-w-full zen-flex-wrap zen-gap-4", y), children: [
      e(z?.before ?? "Before", s, "zen-text-zen-muted-fg"),
      e(z?.after ?? "After", d, "zen-text-zen-foreground")
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
          y
        ),
        children: /* @__PURE__ */ i("table", { className: "zen-w-full zen-border-collapse zen-text-start zen-text-sm", children: [
          /* @__PURE__ */ n("thead", { children: /* @__PURE__ */ n("tr", { className: "zen-border-b zen-border-zen-border zen-bg-zen-muted", children: [z?.key ?? "Field", z?.before ?? "Before", z?.after ?? "After"].map(
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
          /* @__PURE__ */ n("tbody", { children: N.map((e) => /* @__PURE__ */ i("tr", { className: "zen-border-b zen-border-zen-border last:zen-border-b-0", children: [
            /* @__PURE__ */ n(
              "th",
              {
                scope: "row",
                className: r(a, "zen-text-start zen-font-medium zen-text-zen-foreground"),
                children: e.label
              }
            ),
            /* @__PURE__ */ n("td", { className: r(a, "zen-text-zen-muted-fg"), children: e.kind === "added" ? /* @__PURE__ */ n(u, {}) : (
              /* Struck through rather than merely dimmed: the signal has to
                 survive greyscale. */
              /* @__PURE__ */ n("span", { className: e.kind === "unchanged" ? void 0 : "zen-line-through", children: k(e.before, e.key) })
            ) }),
            /* @__PURE__ */ n("td", { className: r(a, B[e.kind]), children: e.kind === "removed" ? /* @__PURE__ */ n(u, {}) : k(e.after, e.key) })
          ] }, e.key)) })
        ] })
      }
    )
  );
};
export {
  T as DiffView
};
//# sourceMappingURL=index117.js.map
