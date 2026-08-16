import { jsxs as l, jsx as r } from "react/jsx-runtime";
import * as i from "react";
import { Popover as P, PopoverTrigger as M, PopoverContent as R } from "./index32.js";
import { Icon as u } from "./index57.js";
import { cn as d } from "./index145.js";
const m = [
  { type: "error", icon: "error", label: "Error", plural: "Errors", text: "zen-text-zen-error", soft: "zen-bg-zen-error-soft" },
  { type: "warning", icon: "warn", label: "Warning", plural: "Warnings", text: "zen-text-zen-warning", soft: "zen-bg-zen-warning-soft" },
  { type: "success", icon: "check-circle", label: "Success", plural: "Successes", text: "zen-text-zen-success", soft: "zen-bg-zen-success-soft" },
  { type: "info", icon: "info", label: "Information", plural: "Information", text: "zen-text-zen-info", soft: "zen-bg-zen-info-soft" }
], p = (n) => m.find((t) => t.type === n), T = (n) => {
  const t = document.getElementById(n);
  t && (t.scrollIntoView({ block: "center", behavior: "smooth" }), t.tabIndex < 0 && !t.hasAttribute("tabindex") && (t.setAttribute("tabindex", "-1"), t.addEventListener("blur", () => t.removeAttribute("tabindex"), { once: !0 })), t.focus({ preventScroll: !0 }));
}, $ = i.forwardRef(
  ({
    messages: n,
    onMessageSelect: t,
    disableNavigation: c = !1,
    emptyMessage: N = "No messages",
    maxBodyHeight: w = 320,
    triggerLabel: k,
    className: C
  }, I) => {
    const [E, g] = i.useState(!1), [o, f] = i.useState("all"), a = i.useMemo(() => {
      const e = { error: 0, warning: 0, success: 0, info: 0 };
      for (const s of n) e[s.type]++;
      return e;
    }, [n]), z = m.find((e) => a[e.type] > 0), x = m.filter((e) => a[e.type] > 0), h = i.useMemo(
      () => o === "all" ? n : n.filter((e) => e.type === o),
      [n, o]
    );
    i.useEffect(() => {
      o !== "all" && a[o] === 0 && f("all");
    }, [a, o]);
    const A = k ?? (n.length === 0 ? "No messages" : `${n.length} message${n.length === 1 ? "" : "s"}` + (z ? `, most severe: ${p(z.type).label.toLowerCase()}` : "")), b = i.useRef(null), S = (e) => {
      t?.(e), !c && e.targetId && (b.current = e.targetId, g(!1));
    }, F = (e) => {
      const s = b.current;
      b.current = null, s && (e.preventDefault(), T(s));
    };
    return /* @__PURE__ */ l(P, { open: E, onOpenChange: g, children: [
      /* @__PURE__ */ r(M, { asChild: !0, children: /* @__PURE__ */ l(
        "button",
        {
          ref: I,
          type: "button",
          "aria-label": A,
          className: d(
            "zen-inline-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border",
            "zen-bg-zen-background zen-px-3 zen-py-1.5 zen-text-sm zen-cursor-pointer",
            "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            C
          ),
          children: [
            /* @__PURE__ */ r(
              u,
              {
                name: z ? p(z.type).icon : "info",
                size: 16,
                className: z ? p(z.type).text : "zen-text-zen-muted-fg"
              }
            ),
            /* @__PURE__ */ r("span", { className: "zen-font-medium", children: n.length })
          ]
        }
      ) }),
      /* @__PURE__ */ l(
        R,
        {
          align: "start",
          className: "zen-w-80 zen-p-0",
          onCloseAutoFocus: F,
          children: [
            x.length > 1 ? /* @__PURE__ */ l(
              "div",
              {
                role: "group",
                "aria-label": "Filter by severity",
                className: "zen-flex zen-flex-wrap zen-gap-1 zen-border-b zen-border-zen-border zen-p-2",
                children: [
                  /* @__PURE__ */ l(v, { active: o === "all", onClick: () => f("all"), children: [
                    "All ",
                    n.length
                  ] }),
                  x.map((e) => /* @__PURE__ */ l(
                    v,
                    {
                      active: o === e.type,
                      onClick: () => f(e.type),
                      children: [
                        /* @__PURE__ */ r(u, { name: e.icon, size: 12, className: e.text }),
                        a[e.type]
                      ]
                    },
                    e.type
                  ))
                ]
              }
            ) : null,
            /* @__PURE__ */ r("div", { className: "zen-overflow-y-auto", style: { maxHeight: w }, children: h.length === 0 ? /* @__PURE__ */ r("p", { className: "zen-m-0 zen-px-4 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: N }) : /* @__PURE__ */ r("ul", { className: "zen-m-0 zen-list-none zen-p-0", children: h.map((e) => {
              const s = p(e.type), y = !c && !!e.targetId;
              return /* @__PURE__ */ r("li", { className: "zen-border-b zen-border-zen-border last:zen-border-b-0", children: /* @__PURE__ */ l(
                "button",
                {
                  type: "button",
                  onClick: () => S(e),
                  className: d(
                    "zen-flex zen-w-full zen-items-start zen-gap-2.5 zen-border-0 zen-bg-transparent",
                    "zen-px-4 zen-py-2.5 zen-text-start zen-text-sm",
                    "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
                    y ? "zen-cursor-pointer hover:zen-bg-zen-muted" : "zen-cursor-default"
                  ),
                  children: [
                    /* @__PURE__ */ r(u, { name: s.icon, size: 16, className: d("zen-mt-0.5 zen-shrink-0", s.text) }),
                    /* @__PURE__ */ l("span", { className: "zen-min-w-0 zen-flex-1", children: [
                      /* @__PURE__ */ r("span", { className: "zen-block zen-font-medium zen-text-zen-foreground", children: e.title }),
                      e.subtitle ? /* @__PURE__ */ r("span", { className: "zen-block zen-text-xs zen-text-zen-muted-fg", children: e.subtitle }) : null,
                      e.description ? /* @__PURE__ */ r("span", { className: "zen-mt-1 zen-block zen-text-xs zen-leading-relaxed zen-text-zen-muted-fg", children: e.description }) : null
                    ] }),
                    y ? /* @__PURE__ */ r(
                      u,
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
$.displayName = "MessagePopover";
const v = ({
  active: n,
  onClick: t,
  children: c
}) => /* @__PURE__ */ r(
  "button",
  {
    type: "button",
    "aria-pressed": n,
    onClick: t,
    className: d(
      "zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-px-2 zen-py-0.5",
      "zen-text-xs zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      n ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg hover:zen-bg-zen-muted"
    ),
    children: c
  }
);
export {
  $ as MessagePopover
};
//# sourceMappingURL=index80.js.map
