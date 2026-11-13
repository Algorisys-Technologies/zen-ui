import { jsxs as a, jsx as n } from "react/jsx-runtime";
import * as i from "react";
import { autoMap as A, validateMapping as v } from "./index146.js";
import { useLocale as B } from "./index90.js";
import { NativeSelect as H } from "./index7.js";
import { Icon as K } from "./index63.js";
import { cn as N } from "./index197.js";
const w = {
  required: "columnMapper.cell.required",
  number: "columnMapper.cell.number",
  date: "columnMapper.cell.date"
}, Y = i.forwardRef(
  ({ rows: m, fields: z, mapping: y, defaultMapping: k, onChange: I, previewRows: R, className: j, ...q }, C) => {
    const t = B(), E = i.useId(), u = m[0] ?? [], [b] = i.useState(() => A(m[0] ?? [], z)), [O, L] = i.useState(() => k ?? b), p = y ?? O, o = i.useMemo(
      () => v(p, z, m, { locale: t.locale }),
      [p, z, m, t.locale]
    ), h = (e) => z.find((r) => r.id === e), S = (e) => o.cellErrors.filter((r) => r.column === e).length, F = (e, r) => {
      const l = { ...p };
      r ? l[e] = r : delete l[e], L(l), I?.(l, v(l, z, m, { locale: t.locale }));
    }, g = m.slice(1, 1 + (R ?? 5)), x = u.filter((e) => p[e]), T = (e, r) => o.cellErrors.find((l) => l.row === e && l.column === r), d = (e) => new Intl.NumberFormat(t.locale).format(e);
    return /* @__PURE__ */ a("div", { ref: C, className: N("zen-flex zen-w-full zen-flex-col zen-gap-4", j), ...q, children: [
      /* @__PURE__ */ a("div", { className: "zen-flex zen-flex-col zen-gap-1", role: "status", children: [
        /* @__PURE__ */ a("p", { className: "zen-m-0 zen-flex zen-items-center zen-gap-2 zen-text-sm zen-font-medium zen-tabular-nums zen-text-zen-foreground", children: [
          o.ok && /* @__PURE__ */ n(K, { name: "check-circle", size: 16, className: "zen-text-zen-success-soft-fg" }),
          t.t("columnMapper.summary", {
            mapped: d(x.length),
            columns: d(u.length),
            valid: d(o.validRows),
            rows: d(o.totalRows)
          }),
          o.ok && /* @__PURE__ */ a("span", { className: "zen-text-zen-success-soft-fg", children: [
            "·",
            " ",
            t.t("columnMapper.ready")
          ] })
        ] }),
        o.missing.map((e) => /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error", children: t.t("columnMapper.missing", { label: h(e)?.label ?? e }) }, e)),
        o.duplicates.map((e) => /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error", children: t.t("columnMapper.duplicate", { label: h(e)?.label ?? e }) }, e))
      ] }),
      /* @__PURE__ */ n("div", { className: "zen-w-full zen-overflow-x-auto", children: /* @__PURE__ */ a("table", { className: "zen-w-full zen-border-collapse zen-text-sm", children: [
        /* @__PURE__ */ n("caption", { className: "zen-sr-only", children: t.t("columnMapper.label") }),
        /* @__PURE__ */ n("thead", { children: /* @__PURE__ */ a("tr", { className: "zen-text-start zen-text-zen-muted-fg", children: [
          /* @__PURE__ */ n("th", { scope: "col", className: "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium", children: t.t("columnMapper.column") }),
          /* @__PURE__ */ n("th", { scope: "col", className: "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium", children: t.t("columnMapper.sample") }),
          /* @__PURE__ */ n("th", { scope: "col", className: "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium", children: t.t("columnMapper.mapsTo") }),
          /* @__PURE__ */ n("th", { scope: "col", className: "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium", children: t.t("columnMapper.status") })
        ] }) }),
        /* @__PURE__ */ n("tbody", { children: u.map((e, r) => {
          const l = p[e] ?? "", c = [E, r].join("-"), f = !!l && o.duplicates.includes(l), M = S(e);
          return /* @__PURE__ */ a(
            "tr",
            {
              className: "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border",
              "data-mapped": l ? "" : void 0,
              children: [
                /* @__PURE__ */ n("th", { scope: "row", className: "zen-px-2 zen-py-2 zen-text-start zen-font-medium zen-text-zen-foreground", children: /* @__PURE__ */ n("label", { htmlFor: c, children: e }) }),
                /* @__PURE__ */ n("td", { className: "zen-max-w-xs zen-truncate zen-px-2 zen-py-2 zen-font-mono zen-text-xs zen-text-zen-foreground", children: m.slice(1, 3).map((s) => s[r] ?? "").filter(Boolean).join(" · ") }),
                /* @__PURE__ */ n("td", { className: "zen-px-2 zen-py-2", children: /* @__PURE__ */ a(
                  H,
                  {
                    id: c,
                    value: l,
                    "aria-invalid": f ? !0 : void 0,
                    className: N("zen-w-full zen-min-w-40", f && "zen-border-zen-error"),
                    onChange: (s) => F(e, s.currentTarget.value),
                    children: [
                      /* @__PURE__ */ n("option", { value: "", children: t.t("columnMapper.ignore") }),
                      z.map((s) => /* @__PURE__ */ n("option", { value: s.id, children: s.required ? t.t("columnMapper.required", { label: s.label }) : s.label }, s.id))
                    ]
                  }
                ) }),
                /* @__PURE__ */ n("td", { className: "zen-whitespace-nowrap zen-px-2 zen-py-2", children: l ? M !== 0 ? /* @__PURE__ */ n("span", { className: "zen-font-medium zen-text-zen-error", children: t.t("columnMapper.problems", { count: M }) }) : /* @__PURE__ */ n("span", { className: "zen-text-zen-success-soft-fg", children: b[e] === l ? t.t("columnMapper.auto") : t.t("columnMapper.manual") }) : /* @__PURE__ */ n("span", { className: "zen-text-zen-muted-fg", children: t.t("columnMapper.ignored") }) })
              ]
            },
            c
          );
        }) })
      ] }) }),
      x.length > 0 && /* @__PURE__ */ a("div", { className: "zen-flex zen-flex-col zen-gap-1.5", children: [
        /* @__PURE__ */ a("p", { className: "zen-m-0 zen-text-sm zen-font-medium zen-text-zen-foreground", children: [
          t.t("columnMapper.preview"),
          " ",
          /* @__PURE__ */ n("span", { className: "zen-font-normal zen-text-zen-muted-fg", children: t.t("columnMapper.previewOf", { shown: d(g.length), rows: d(o.totalRows) }) })
        ] }),
        /* @__PURE__ */ n("div", { className: "zen-w-full zen-overflow-x-auto", children: /* @__PURE__ */ a("table", { className: "zen-w-full zen-border-collapse zen-text-sm", children: [
          /* @__PURE__ */ n("thead", { children: /* @__PURE__ */ n("tr", { children: x.map((e) => /* @__PURE__ */ n("th", { scope: "col", className: "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-muted-fg", children: h(p[e])?.label ?? p[e] }, e)) }) }),
          /* @__PURE__ */ n("tbody", { children: g.map((e, r) => /* @__PURE__ */ n("tr", { className: "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border", children: x.map((l) => {
            const c = T(r + 1, l), f = e[u.indexOf(l)] ?? "";
            return /* @__PURE__ */ a(
              "td",
              {
                "data-error": c?.kind,
                title: c ? t.t(w[c.kind]) : void 0,
                className: N(
                  "zen-px-2 zen-py-1.5 zen-tabular-nums",
                  c ? "zen-bg-zen-error-soft zen-text-zen-error-soft-fg" : "zen-text-zen-foreground"
                ),
                children: [
                  f || "—",
                  c && /* @__PURE__ */ a("span", { className: "zen-sr-only", children: [
                    ", ",
                    t.t(w[c.kind])
                  ] })
                ]
              },
              l
            );
          }) }, r)) })
        ] }) })
      ] })
    ] });
  }
);
Y.displayName = "ColumnMapper";
export {
  Y as ColumnMapper
};
//# sourceMappingURL=index145.js.map
