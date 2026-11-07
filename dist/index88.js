import { jsxs as i, jsx as t } from "react/jsx-runtime";
import * as a from "react";
import { Popover as R, PopoverTrigger as T, PopoverContent as j } from "./index35.js";
import { Icon as p } from "./index63.js";
import { useLocale as B } from "./index90.js";
import { cn as f } from "./index160.js";
const g = [
  { type: "error", icon: "error", label: "messagePopover.severity.error", text: "zen-text-zen-error", soft: "zen-bg-zen-error-soft" },
  { type: "warning", icon: "warn", label: "messagePopover.severity.warning", text: "zen-text-zen-warning", soft: "zen-bg-zen-warning-soft" },
  { type: "success", icon: "check-circle", label: "messagePopover.severity.success", text: "zen-text-zen-success", soft: "zen-bg-zen-success-soft" },
  { type: "info", icon: "info", label: "messagePopover.severity.info", text: "zen-text-zen-info", soft: "zen-bg-zen-info-soft" }
], d = (n) => g.find((r) => r.type === n), L = (n) => {
  const r = document.getElementById(n);
  r && (r.scrollIntoView({ block: "center", behavior: "smooth" }), r.tabIndex < 0 && !r.hasAttribute("tabindex") && (r.setAttribute("tabindex", "-1"), r.addEventListener("blur", () => r.removeAttribute("tabindex"), { once: !0 })), r.focus({ preventScroll: !0 }));
}, O = a.forwardRef(
  ({
    messages: n,
    onMessageSelect: r,
    disableNavigation: u = !1,
    emptyMessage: P,
    maxBodyHeight: w = 320,
    triggerLabel: k,
    className: C
  }, M) => {
    const o = B(), I = P ?? o.t("messagePopover.noMessages"), [S, x] = a.useState(!1), [s, m] = a.useState("all"), z = a.useMemo(() => {
      const e = { error: 0, warning: 0, success: 0, info: 0 };
      for (const l of n) e[l.type]++;
      return e;
    }, [n]), c = g.find((e) => z[e.type] > 0), v = g.filter((e) => z[e.type] > 0), h = a.useMemo(
      () => s === "all" ? n : n.filter((e) => e.type === s),
      [n, s]
    );
    a.useEffect(() => {
      s !== "all" && z[s] === 0 && m("all");
    }, [z, s]);
    const A = k ?? (n.length === 0 ? o.t("messagePopover.noMessages") : c ? o.t("messagePopover.countMostSevere", {
      messages: o.t("messagePopover.count", { count: n.length }),
      severity: o.t(d(c.type).label)
    }) : o.t("messagePopover.count", { count: n.length })), b = a.useRef(null), E = (e) => {
      r?.(e), !u && e.targetId && (b.current = e.targetId, x(!1));
    }, F = (e) => {
      const l = b.current;
      b.current = null, l && (e.preventDefault(), L(l));
    };
    return /* @__PURE__ */ i(R, { open: S, onOpenChange: x, children: [
      /* @__PURE__ */ t(T, { asChild: !0, children: /* @__PURE__ */ i(
        "button",
        {
          ref: M,
          type: "button",
          "aria-label": A,
          className: f(
            "zen-inline-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border",
            "zen-bg-zen-background zen-px-3 zen-py-1.5 zen-text-sm zen-cursor-pointer",
            "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            C
          ),
          children: [
            /* @__PURE__ */ t(
              p,
              {
                name: c ? d(c.type).icon : "info",
                size: 16,
                className: c ? d(c.type).text : "zen-text-zen-muted-fg"
              }
            ),
            /* @__PURE__ */ t("span", { className: "zen-font-medium", children: n.length })
          ]
        }
      ) }),
      /* @__PURE__ */ i(
        j,
        {
          align: "start",
          className: "zen-w-80 zen-p-0",
          onCloseAutoFocus: F,
          children: [
            v.length > 1 ? /* @__PURE__ */ i(
              "div",
              {
                role: "group",
                "aria-label": o.t("messagePopover.filterBySeverity"),
                className: "zen-flex zen-flex-wrap zen-gap-1 zen-border-b zen-border-zen-border zen-p-2",
                children: [
                  /* @__PURE__ */ t(N, { active: s === "all", onClick: () => m("all"), children: o.t("messagePopover.all", { count: n.length }) }),
                  v.map((e) => /* @__PURE__ */ i(
                    N,
                    {
                      active: s === e.type,
                      onClick: () => m(e.type),
                      children: [
                        /* @__PURE__ */ t(p, { name: e.icon, size: 12, className: e.text }),
                        z[e.type]
                      ]
                    },
                    e.type
                  ))
                ]
              }
            ) : null,
            /* @__PURE__ */ t("div", { className: "zen-overflow-y-auto", style: { maxHeight: w }, children: h.length === 0 ? /* @__PURE__ */ t("p", { className: "zen-m-0 zen-px-4 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: I }) : /* @__PURE__ */ t("ul", { className: "zen-m-0 zen-list-none zen-p-0", children: h.map((e) => {
              const l = d(e.type), y = !u && !!e.targetId;
              return /* @__PURE__ */ t("li", { className: "zen-border-b zen-border-zen-border last:zen-border-b-0", children: /* @__PURE__ */ i(
                "button",
                {
                  type: "button",
                  onClick: () => E(e),
                  className: f(
                    "zen-flex zen-w-full zen-items-start zen-gap-2.5 zen-border-0 zen-bg-transparent",
                    "zen-px-4 zen-py-2.5 zen-text-start zen-text-sm",
                    "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
                    y ? "zen-cursor-pointer hover:zen-bg-zen-muted" : "zen-cursor-default"
                  ),
                  children: [
                    /* @__PURE__ */ t(p, { name: l.icon, size: 16, className: f("zen-mt-0.5 zen-shrink-0", l.text) }),
                    /* @__PURE__ */ i("span", { className: "zen-min-w-0 zen-flex-1", children: [
                      /* @__PURE__ */ t("span", { className: "zen-block zen-font-medium zen-text-zen-foreground", children: e.title }),
                      e.subtitle ? /* @__PURE__ */ t("span", { className: "zen-block zen-text-xs zen-text-zen-muted-fg", children: e.subtitle }) : null,
                      e.description ? /* @__PURE__ */ t("span", { className: "zen-mt-1 zen-block zen-text-xs zen-leading-relaxed zen-text-zen-muted-fg", children: e.description }) : null
                    ] }),
                    y ? /* @__PURE__ */ t(
                      p,
                      {
                        name: "chevron-right",
                        size: 14,
                        className: "zen-mt-0.5 zen-shrink-0 zen-text-zen-muted-fg"
                      }
                    ) : null
                  ]
                }
              ) }, e.id);
            }) }) })
          ]
        }
      )
    ] });
  }
);
O.displayName = "MessagePopover";
const N = ({
  active: n,
  onClick: r,
  children: u
}) => /* @__PURE__ */ t(
  "button",
  {
    type: "button",
    "aria-pressed": n,
    onClick: r,
    className: f(
      "zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-px-2 zen-py-0.5",
      "zen-text-xs zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      n ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg hover:zen-bg-zen-muted"
    ),
    children: u
  }
);
export {
  O as MessagePopover
};
//# sourceMappingURL=index88.js.map
