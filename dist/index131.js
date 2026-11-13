import { jsxs as l, jsx as t, Fragment as ee } from "react/jsx-runtime";
import * as z from "react";
import { stepRunnerState as I, canCompleteStep as ne } from "./index132.js";
import { useLocale as te } from "./index90.js";
import { Button as g } from "./index71.js";
import { Icon as k } from "./index63.js";
import { MeasurementInput as se } from "./index129.js";
import { cn as m } from "./index197.js";
const D = {
  done: "stepRunner.status.done",
  skipped: "stepRunner.status.skipped",
  issue: "stepRunner.status.issue",
  current: "stepRunner.status.current",
  locked: "stepRunner.status.locked",
  open: "stepRunner.status.open"
}, re = {
  checklist: "stepRunner.blockedChecklist",
  "measurement-missing": "stepRunner.blockedMeasurementMissing",
  "measurement-fail": "stepRunner.blockedMeasurementFail"
}, O = (s, a, f) => s[f] ?? { checked: a[f]?.checked ?? [], value: a[f]?.value ?? null }, oe = ({ status: s, n: a }) => /* @__PURE__ */ t(
  "span",
  {
    "aria-hidden": "true",
    className: m(
      "zen-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-full zen-border-2 zen-border-solid zen-text-sm zen-font-semibold",
      s === "done" && "zen-border-zen-success zen-bg-zen-success zen-text-zen-success-fg",
      s === "skipped" && "zen-border-zen-border zen-bg-zen-muted zen-text-zen-muted-fg",
      s === "issue" && "zen-border-zen-error zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
      s === "current" && "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg",
      (s === "locked" || s === "open") && "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg"
    ),
    children: s === "done" ? /* @__PURE__ */ t(k, { name: "check", size: 16 }) : s === "issue" ? /* @__PURE__ */ t(k, { name: "warn", size: 16 }) : a
  }
), ie = z.forwardRef(
  ({
    steps: s,
    records: a,
    defaultRecords: f,
    onRecordsChange: M,
    onStepComplete: j,
    onReportIssue: q,
    onComplete: K,
    sequential: T,
    allowFailedMeasurement: _,
    label: A,
    className: B,
    ...E
  }, F) => {
    const i = te(), N = z.useId(), [L, P] = z.useState(() => f ?? {}), p = a ?? L, v = T ?? !0, c = z.useMemo(() => I(s, p, { sequential: v }), [s, p, v]), S = (n) => c.items.find((r) => r.id === n)?.status ?? "locked", [Y, h] = z.useState(), d = Y ?? c.current ?? void 0, e = s.find((n) => n.id === d), y = s.findIndex((n) => n.id === d), [$, U] = z.useState({}), u = (n) => O($, p, n), C = (n, r) => U((o) => ({ ...o, [n]: { ...O(o, p, n), ...r } })), w = (n, r) => {
      const o = { ...p, [n]: r };
      return P(o), M?.(o), h(void 0), I(s, o, { sequential: v }).complete && K?.(o), o;
    }, [G, H] = z.useState(""), [J, Q] = z.useState(d);
    d !== J && (Q(d), H(
      e ? `${i.t("stepRunner.stepOf", { n: y + 1, total: c.total })}: ${e.title}` : i.t("stepRunner.allDone", { total: c.total })
    ));
    const b = S(d ?? ""), R = b === "current" || b === "issue" || b === "open", x = e ? ne(e, u(e.id), { allowFailedMeasurement: _ }) : { ok: !1, reason: null }, V = () => {
      if (!e || !x.ok) return;
      const n = u(e.id), r = { status: "done", checked: n.checked, value: n.value, at: Date.now() };
      w(e.id, r), j?.(e, r);
    }, W = () => {
      e?.optional && w(e.id, { status: "skipped", at: Date.now() });
    }, X = () => {
      if (!e) return;
      const n = u(e.id);
      w(e.id, { status: "issue", checked: n.checked, value: n.value, at: Date.now() }), h(e.id), q?.(e);
    };
    return /* @__PURE__ */ l(
      "div",
      {
        ref: F,
        className: m(
          "zen-grid zen-w-full zen-gap-6 zen-grid-cols-[minmax(0,1fr)] md:zen-grid-cols-[var(--zen-step-rail-width)_minmax(0,1fr)]",
          B
        ),
        ...E,
        children: [
          /* @__PURE__ */ t("nav", { "aria-label": A ?? i.t("stepRunner.steps"), children: /* @__PURE__ */ t("ol", { className: "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0", children: s.map((n, r) => {
            const o = S(n.id);
            return /* @__PURE__ */ t("li", { children: /* @__PURE__ */ l(
              "button",
              {
                type: "button",
                disabled: o === "locked",
                "aria-current": c.current === n.id ? "step" : void 0,
                "aria-pressed": d === n.id,
                className: m(
                  "zen-flex zen-min-h-12 zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border-0 zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-start zen-cursor-pointer",
                  "hover:zen-bg-zen-muted disabled:zen-cursor-not-allowed disabled:hover:zen-bg-transparent",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  d === n.id && "zen-bg-zen-muted"
                ),
                onClick: () => h(n.id === c.current ? void 0 : n.id),
                children: [
                  /* @__PURE__ */ t(oe, { status: o, n: r + 1 }),
                  /* @__PURE__ */ l("span", { className: "zen-flex zen-min-w-0 zen-flex-col", children: [
                    /* @__PURE__ */ t("span", { className: m("zen-text-sm zen-font-medium", o === "locked" ? "zen-text-zen-muted-fg" : "zen-text-zen-foreground"), children: n.title }),
                    /* @__PURE__ */ t("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: i.t(D[o]) })
                  ] })
                ]
              }
            ) }, n.id);
          }) }) }),
          /* @__PURE__ */ l("section", { className: "zen-flex zen-min-w-0 zen-flex-col zen-gap-4", children: [
            /* @__PURE__ */ t("span", { className: "zen-sr-only", "aria-live": "polite", children: G }),
            e ? /* @__PURE__ */ l(ee, { children: [
              /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-col zen-gap-1", children: [
                /* @__PURE__ */ l("span", { className: "zen-text-sm zen-text-zen-muted-fg", children: [
                  i.t("stepRunner.stepOf", { n: y + 1, total: c.total }),
                  " · ",
                  i.t(D[b])
                ] }),
                /* @__PURE__ */ t("h3", { className: "zen-m-0 zen-text-2xl zen-font-semibold zen-text-zen-foreground", children: e.title })
              ] }),
              b === "issue" ? /* @__PURE__ */ t("p", { className: "zen-m-0 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-error zen-bg-zen-error-soft zen-px-4 zen-py-3 zen-text-sm zen-font-medium zen-text-zen-error-soft-fg", children: i.t("stepRunner.issueReported") }) : null,
              e.instructions ? /* @__PURE__ */ t("div", { className: "zen-text-base zen-leading-relaxed zen-text-zen-foreground", children: e.instructions }) : null,
              e.checklist?.length ? /* @__PURE__ */ t("ul", { className: "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", children: e.checklist.map((n) => {
                const r = u(e.id).checked.includes(n.id);
                return /* @__PURE__ */ t("li", { children: /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    role: "checkbox",
                    "aria-checked": r,
                    disabled: !R,
                    className: m(
                      "zen-flex zen-min-h-12 zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border-2 zen-border-solid zen-px-3 zen-text-start zen-text-base zen-cursor-pointer",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                      "disabled:zen-cursor-default",
                      r ? "zen-border-zen-success zen-bg-zen-success-soft zen-text-zen-foreground" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground"
                    ),
                    onClick: () => {
                      const o = u(e.id).checked;
                      C(e.id, { checked: r ? o.filter((Z) => Z !== n.id) : [...o, n.id] });
                    },
                    children: [
                      /* @__PURE__ */ t(
                        "span",
                        {
                          "aria-hidden": "true",
                          className: m(
                            "zen-flex zen-h-6 zen-w-6 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-2 zen-border-solid",
                            r ? "zen-border-zen-success zen-bg-zen-success zen-text-zen-success-fg" : "zen-border-zen-border"
                          ),
                          children: r ? /* @__PURE__ */ t(k, { name: "check", size: 16 }) : null
                        }
                      ),
                      n.label
                    ]
                  }
                ) }, n.id);
              }) }) : null,
              e.measure ? (
                // Keyed by step: one field per step, so text that is not a
                // number yet (and so never reached the record) cannot follow
                // the operator to the next step's reading.
                /* @__PURE__ */ t(
                  se,
                  {
                    label: e.measure.label ?? e.title,
                    unit: e.measure.unit,
                    spec: e.measure.spec,
                    disabled: !R,
                    value: u(e.id).value,
                    onChange: (n) => C(e.id, { value: n })
                  },
                  e.id
                )
              ) : null,
              R ? /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
                /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-wrap zen-gap-3", children: [
                  /* @__PURE__ */ t(g, { size: "xl", disabled: !x.ok, "aria-describedby": N, onClick: V, children: i.t("stepRunner.complete") }),
                  e.optional ? /* @__PURE__ */ t(g, { size: "xl", variant: "outline", onClick: W, children: i.t("stepRunner.skip") }) : null,
                  /* @__PURE__ */ t(g, { size: "xl", variant: "outline", color: "error", onClick: X, children: i.t("stepRunner.reportIssue") })
                ] }),
                /* @__PURE__ */ t("p", { id: N, className: "zen-m-0 zen-min-h-5 zen-text-sm zen-text-zen-muted-fg", children: x.reason ? i.t(re[x.reason]) : "" })
              ] }) : c.current && c.current !== e.id ? /* @__PURE__ */ t(g, { className: "zen-self-start", variant: "outline", size: "xl", onClick: () => h(void 0), children: i.t("stepRunner.goToCurrent") }) : null
            ] }) : /* @__PURE__ */ l("p", { className: "zen-m-0 zen-flex zen-items-center zen-gap-2 zen-text-lg zen-font-semibold zen-text-zen-success-soft-fg", children: [
              /* @__PURE__ */ t(k, { name: "check-circle", size: 24 }),
              i.t("stepRunner.allDone", { total: c.total })
            ] })
          ] })
        ]
      }
    );
  }
);
ie.displayName = "StepRunner";
export {
  ie as StepRunner
};
//# sourceMappingURL=index131.js.map
