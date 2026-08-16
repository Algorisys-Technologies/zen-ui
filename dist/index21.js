import { jsxs as o, jsx as n, Fragment as T } from "react/jsx-runtime";
import * as N from "react";
import { Popover as Y, PopoverTrigger as $, PopoverContent as B } from "./index32.js";
import { cn as z } from "./index145.js";
const j = (e) => e instanceof Date ? e : new Date(e), D = (e) => {
  const r = new Date(e);
  return r.setHours(0, 0, 0, 0), r;
}, S = (e, r) => Math.round(
  (D(r).getTime() - D(e).getTime()) / 864e5
), F = (e, r) => {
  const t = S(e, r);
  if (t === 0) return "Today";
  if (t === 1) return "Yesterday";
  if (t < 7)
    return e.toLocaleDateString(void 0, { weekday: "long" });
  const i = e.getFullYear() === r.getFullYear();
  return e.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: i ? void 0 : "numeric"
  });
}, I = (e, r) => {
  const t = Math.floor((r.getTime() - e.getTime()) / 1e3);
  return t < 45 ? "just now" : t < 3600 ? `${Math.floor(t / 60)}m ago` : t < 3600 * 24 ? `${Math.floor(t / 3600)}h ago` : t < 3600 * 24 * 7 ? `${Math.floor(t / 86400)}d ago` : e.toLocaleDateString();
}, L = (e, r) => {
  const t = [];
  for (const i of e) {
    const a = F(j(i.timestamp), r), l = t[t.length - 1];
    l && l.label === a ? l.items.push(i) : t.push({ label: a, items: [i] });
  }
  return t;
}, P = N.forwardRef(
  ({
    notifications: e,
    unreadCount: r,
    onMarkAllRead: t,
    onItemSelect: i,
    onViewAll: a,
    emptyMessage: l = "You're all caught up.",
    triggerLabel: s = "Notifications",
    maxHeight: c = 420,
    align: h = "end",
    open: u,
    onOpenChange: b,
    width: g = 360,
    badgeMax: d = 99,
    className: f
  }, v) => {
    const y = N.useMemo(() => /* @__PURE__ */ new Date(), [e]), w = N.useMemo(
      () => L(e, y),
      [e, y]
    ), p = r ?? e.filter((m) => !m.read).length, x = p > 0, M = p > d ? `${d}+` : String(p);
    return /* @__PURE__ */ o(Y, { open: u, onOpenChange: b, children: [
      /* @__PURE__ */ n($, { asChild: !0, children: /* @__PURE__ */ o(
        "button",
        {
          ref: v,
          type: "button",
          "aria-label": x ? `${s}, ${p} unread` : s,
          className: z(
            "zen-relative zen-inline-flex zen-h-10 zen-w-10 zen-items-center zen-justify-center zen-rounded-zen-full",
            "zen-text-zen-foreground zen-bg-transparent",
            "hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "zen-transition-colors",
            f
          ),
          children: [
            /* @__PURE__ */ n(C, {}),
            x && /* @__PURE__ */ n(
              "span",
              {
                "aria-hidden": !0,
                className: z(
                  "zen-absolute -zen-top-0.5 -zen-end-0.5 zen-inline-flex zen-items-center zen-justify-center",
                  "zen-min-w-[1.25rem] zen-h-5 zen-px-1 zen-rounded-zen-full",
                  "zen-text-[0.65rem] zen-font-semibold zen-leading-none",
                  "zen-bg-zen-error zen-text-zen-error-fg",
                  "zen-ring-2 zen-ring-zen-background"
                ),
                children: M
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ o(
        B,
        {
          align: h,
          sideOffset: 8,
          className: "zen-p-0 zen-overflow-hidden",
          style: { width: g },
          children: [
            /* @__PURE__ */ o("div", { className: "zen-flex zen-items-center zen-justify-between zen-px-4 zen-py-2.5 zen-border-b zen-border-zen-border", children: [
              /* @__PURE__ */ o("h3", { className: "zen-text-sm zen-font-semibold zen-text-zen-foreground zen-m-0", children: [
                s,
                x && /* @__PURE__ */ o("span", { className: "zen-ml-1.5 zen-text-xs zen-font-normal zen-text-zen-muted-fg", children: [
                  "(",
                  p,
                  ")"
                ] })
              ] }),
              x && t && /* @__PURE__ */ n(
                "button",
                {
                  type: "button",
                  onClick: t,
                  className: z(
                    "zen-text-xs zen-font-medium zen-text-zen-primary",
                    "hover:zen-underline focus-visible:zen-outline-none focus-visible:zen-underline",
                    "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-p-0"
                  ),
                  children: "Mark all as read"
                }
              )
            ] }),
            /* @__PURE__ */ n(
              "div",
              {
                role: "list",
                "aria-label": s,
                style: { maxHeight: c, overflowY: "auto" },
                children: w.length === 0 ? /* @__PURE__ */ n(O, { message: l }) : w.map((m) => /* @__PURE__ */ o("section", { "aria-label": m.label, children: [
                  /* @__PURE__ */ n("h4", { className: "zen-px-4 zen-pt-3 zen-pb-1 zen-text-[0.65rem] zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-m-0", children: m.label }),
                  /* @__PURE__ */ n("ul", { className: "zen-list-none zen-p-0 zen-m-0", children: m.items.map((k) => /* @__PURE__ */ n(
                    H,
                    {
                      notification: k,
                      now: y,
                      onSelect: i
                    },
                    k.id
                  )) })
                ] }, m.label))
              }
            ),
            a && /* @__PURE__ */ n("div", { className: "zen-border-t zen-border-zen-border", children: /* @__PURE__ */ n(
              "button",
              {
                type: "button",
                onClick: a,
                className: z(
                  "zen-block zen-w-full zen-px-4 zen-py-2.5 zen-text-center zen-text-sm zen-font-medium zen-text-zen-primary",
                  "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
                  "zen-bg-transparent zen-border-0 zen-cursor-pointer"
                ),
                children: "View all"
              }
            ) })
          ]
        }
      )
    ] });
  }
);
P.displayName = "NotificationsInbox";
const H = ({ notification: e, now: r, onSelect: t }) => {
  const { title: i, description: a, timestamp: l, read: s, icon: c, actions: h, href: u } = e, b = () => t?.(e), g = !!t || !!u, d = /* @__PURE__ */ o(T, { children: [
    /* @__PURE__ */ n(
      "span",
      {
        "aria-hidden": !0,
        className: z(
          "zen-mt-1.5 zen-shrink-0 zen-flex zen-items-center zen-justify-center",
          c ? "zen-h-5 zen-w-5 zen-text-zen-muted-fg" : "zen-h-2 zen-w-2 zen-rounded-zen-full",
          !c && !s && "zen-bg-zen-primary",
          !c && s && "zen-bg-transparent"
        ),
        children: c
      }
    ),
    /* @__PURE__ */ o("div", { className: "zen-min-w-0 zen-flex-1", children: [
      /* @__PURE__ */ n(
        "div",
        {
          className: z(
            "zen-text-sm zen-leading-snug",
            s ? "zen-text-zen-muted-fg" : "zen-font-medium zen-text-zen-foreground"
          ),
          children: i
        }
      ),
      a && /* @__PURE__ */ n("div", { className: "zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg zen-leading-snug", children: a }),
      /* @__PURE__ */ o("div", { className: "zen-mt-1 zen-flex zen-items-center zen-justify-between zen-gap-2", children: [
        /* @__PURE__ */ n("span", { className: "zen-text-[0.65rem] zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: I(j(l), r) }),
        h && /* @__PURE__ */ n("div", { className: "zen-flex zen-items-center zen-gap-1.5", children: h })
      ] })
    ] })
  ] }), f = z(
    "zen-flex zen-items-start zen-gap-3 zen-px-4 zen-py-2.5 zen-text-start zen-w-full",
    "zen-border-l-2",
    s ? "zen-border-transparent" : "zen-border-zen-primary zen-bg-zen-primary-soft/30",
    g && "zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-bg-zen-muted focus-visible:zen-outline-none"
  );
  return /* @__PURE__ */ n(
    "li",
    {
      role: "listitem",
      "aria-current": s ? void 0 : "true",
      className: "zen-border-b zen-border-zen-border last:zen-border-b-0",
      children: u ? /* @__PURE__ */ n(
        "a",
        {
          href: u,
          onClick: (v) => {
            t && (v.preventDefault(), b());
          },
          className: z(f, "zen-no-underline zen-text-inherit"),
          children: d
        }
      ) : g ? /* @__PURE__ */ n(
        "button",
        {
          type: "button",
          onClick: b,
          className: z(f, "zen-bg-transparent"),
          children: d
        }
      ) : /* @__PURE__ */ n("div", { className: f, children: d })
    }
  );
}, O = ({ message: e }) => /* @__PURE__ */ o("div", { className: "zen-flex zen-flex-col zen-items-center zen-justify-center zen-px-6 zen-py-10 zen-text-center", children: [
  /* @__PURE__ */ n("span", { className: "zen-text-zen-muted-fg/60 zen-mb-2", children: /* @__PURE__ */ n(C, { size: 28 }) }),
  /* @__PURE__ */ n("p", { className: "zen-text-sm zen-text-zen-muted-fg zen-m-0", children: e })
] }), C = ({ size: e = 18 }) => /* @__PURE__ */ o(
  "svg",
  {
    width: e,
    height: e,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": !0,
    children: [
      /* @__PURE__ */ n("path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
      /* @__PURE__ */ n("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })
    ]
  }
);
export {
  P as NotificationsInbox
};
//# sourceMappingURL=index21.js.map
