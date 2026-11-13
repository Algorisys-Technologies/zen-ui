import { jsxs as i, jsx as n, Fragment as B } from "react/jsx-runtime";
import * as k from "react";
import { Popover as R, PopoverTrigger as S, PopoverContent as Y } from "./index35.js";
import { useLocale as C } from "./index90.js";
import { cn as z } from "./index197.js";
const L = (e) => e instanceof Date ? e : new Date(e), j = (e) => {
  const o = new Date(e);
  return o.setHours(0, 0, 0, 0), o;
}, F = (e, o) => Math.round(
  (j(o).getTime() - j(e).getTime()) / 864e5
), P = (e, o, r) => {
  const t = F(e, o);
  if (t === 0) return r("notificationsInbox.today");
  if (t === 1) return r("notificationsInbox.yesterday");
  if (t < 7)
    return e.toLocaleDateString(void 0, { weekday: "long" });
  const s = e.getFullYear() === o.getFullYear();
  return e.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: s ? void 0 : "numeric"
  });
}, U = (e, o, r) => {
  const t = Math.floor((o.getTime() - e.getTime()) / 1e3);
  return t < 45 ? r("notificationsInbox.justNow") : t < 3600 ? r("notificationsInbox.minutesAgo", { count: Math.floor(t / 60) }) : t < 3600 * 24 ? r("notificationsInbox.hoursAgo", { count: Math.floor(t / 3600) }) : t < 3600 * 24 * 7 ? r("notificationsInbox.daysAgo", { count: Math.floor(t / 86400) }) : e.toLocaleDateString();
}, H = (e, o, r) => {
  const t = [];
  for (const s of e) {
    const l = P(L(s.timestamp), o, r), c = t[t.length - 1];
    c && c.label === l ? c.items.push(s) : t.push({ label: l, items: [s] });
  }
  return t;
}, O = k.forwardRef(
  ({
    notifications: e,
    unreadCount: o,
    onMarkAllRead: r,
    onItemSelect: t,
    onViewAll: s,
    emptyMessage: l,
    triggerLabel: c,
    maxHeight: d = 420,
    align: m = "end",
    open: x,
    onOpenChange: f,
    width: v = 360,
    badgeMax: b = 99,
    className: p
  }, g) => {
    const a = C(), T = l ?? a.t("notificationsInbox.youReAllCaughtUp"), y = c ?? a.t("notificationsInbox.notifications"), w = k.useMemo(() => /* @__PURE__ */ new Date(), [e]), I = k.useMemo(
      () => H(e, w, a.t),
      [e, w, a]
    ), h = o ?? e.filter((u) => !u.read).length, N = h > 0, A = h > b ? `${b}+` : String(h);
    return /* @__PURE__ */ i(R, { open: x, onOpenChange: f, children: [
      /* @__PURE__ */ n(S, { asChild: !0, children: /* @__PURE__ */ i(
        "button",
        {
          ref: g,
          type: "button",
          "aria-label": N ? a.t("notificationsInbox.unread", { label: y, count: h }) : y,
          className: z(
            "zen-relative zen-inline-flex zen-h-10 zen-w-10 zen-items-center zen-justify-center zen-rounded-zen-full",
            "zen-text-zen-foreground zen-bg-transparent",
            "hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "zen-transition-colors",
            p
          ),
          children: [
            /* @__PURE__ */ n(M, {}),
            N && /* @__PURE__ */ n(
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
                children: A
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ i(
        Y,
        {
          align: m,
          sideOffset: 8,
          className: "zen-p-0 zen-overflow-hidden",
          style: { width: v },
          children: [
            /* @__PURE__ */ i("div", { className: "zen-flex zen-items-center zen-justify-between zen-px-4 zen-py-2.5 zen-border-b zen-border-zen-border", children: [
              /* @__PURE__ */ i("h3", { className: "zen-text-sm zen-font-semibold zen-text-zen-foreground zen-m-0", children: [
                y,
                N && /* @__PURE__ */ i("span", { className: "zen-ml-1.5 zen-text-xs zen-font-normal zen-text-zen-muted-fg", children: [
                  "(",
                  h,
                  ")"
                ] })
              ] }),
              N && r && /* @__PURE__ */ n(
                "button",
                {
                  type: "button",
                  onClick: r,
                  className: z(
                    "zen-text-xs zen-font-medium zen-text-zen-primary",
                    "hover:zen-underline focus-visible:zen-outline-none focus-visible:zen-underline",
                    "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-p-0"
                  ),
                  children: a.t("notificationsInbox.markAllAsRead")
                }
              )
            ] }),
            /* @__PURE__ */ n(
              "div",
              {
                role: "list",
                "aria-label": y,
                style: { maxHeight: d, overflowY: "auto" },
                children: I.length === 0 ? /* @__PURE__ */ n(W, { message: T }) : I.map((u) => /* @__PURE__ */ i("section", { "aria-label": u.label, children: [
                  /* @__PURE__ */ n("h4", { className: "zen-px-4 zen-pt-3 zen-pb-1 zen-text-[0.65rem] zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-m-0", children: u.label }),
                  /* @__PURE__ */ n("ul", { className: "zen-list-none zen-p-0 zen-m-0", children: u.items.map((D) => /* @__PURE__ */ n(
                    E,
                    {
                      notification: D,
                      now: w,
                      onSelect: t
                    },
                    D.id
                  )) })
                ] }, u.label))
              }
            ),
            s && /* @__PURE__ */ n("div", { className: "zen-border-t zen-border-zen-border", children: /* @__PURE__ */ n(
              "button",
              {
                type: "button",
                onClick: s,
                className: z(
                  "zen-block zen-w-full zen-px-4 zen-py-2.5 zen-text-center zen-text-sm zen-font-medium zen-text-zen-primary",
                  "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
                  "zen-bg-transparent zen-border-0 zen-cursor-pointer"
                ),
                children: a.t("notificationsInbox.viewAll")
              }
            ) })
          ]
        }
      )
    ] });
  }
);
O.displayName = "NotificationsInbox";
const E = ({ notification: e, now: o, onSelect: r }) => {
  const t = C(), { title: s, description: l, timestamp: c, read: d, icon: m, actions: x, href: f } = e, v = () => r?.(e), b = !!r || !!f, p = /* @__PURE__ */ i(B, { children: [
    /* @__PURE__ */ n(
      "span",
      {
        "aria-hidden": !0,
        className: z(
          "zen-mt-1.5 zen-shrink-0 zen-flex zen-items-center zen-justify-center",
          m ? "zen-h-5 zen-w-5 zen-text-zen-muted-fg" : "zen-h-2 zen-w-2 zen-rounded-zen-full",
          !m && !d && "zen-bg-zen-primary",
          !m && d && "zen-bg-transparent"
        ),
        children: m
      }
    ),
    /* @__PURE__ */ i("div", { className: "zen-min-w-0 zen-flex-1", children: [
      /* @__PURE__ */ n(
        "div",
        {
          className: z(
            "zen-text-sm zen-leading-snug",
            d ? "zen-text-zen-muted-fg" : "zen-font-medium zen-text-zen-foreground"
          ),
          children: s
        }
      ),
      l && /* @__PURE__ */ n("div", { className: "zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg zen-leading-snug", children: l }),
      /* @__PURE__ */ i("div", { className: "zen-mt-1 zen-flex zen-items-center zen-justify-between zen-gap-2", children: [
        /* @__PURE__ */ n("span", { className: "zen-text-[0.65rem] zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: U(L(c), o, t.t) }),
        x && /* @__PURE__ */ n("div", { className: "zen-flex zen-items-center zen-gap-1.5", children: x })
      ] })
    ] })
  ] }), g = z(
    "zen-flex zen-items-start zen-gap-3 zen-px-4 zen-py-2.5 zen-text-start zen-w-full",
    "zen-border-l-2",
    d ? "zen-border-transparent" : "zen-border-zen-primary zen-bg-zen-primary-soft/30",
    b && "zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-bg-zen-muted focus-visible:zen-outline-none"
  );
  return /* @__PURE__ */ n(
    "li",
    {
      role: "listitem",
      "aria-current": d ? void 0 : "true",
      className: "zen-border-b zen-border-zen-border last:zen-border-b-0",
      children: f ? /* @__PURE__ */ n(
        "a",
        {
          href: f,
          onClick: (a) => {
            r && (a.preventDefault(), v());
          },
          className: z(g, "zen-no-underline zen-text-inherit"),
          children: p
        }
      ) : b ? /* @__PURE__ */ n(
        "button",
        {
          type: "button",
          onClick: v,
          className: z(g, "zen-bg-transparent"),
          children: p
        }
      ) : /* @__PURE__ */ n("div", { className: g, children: p })
    }
  );
}, W = ({ message: e }) => /* @__PURE__ */ i("div", { className: "zen-flex zen-flex-col zen-items-center zen-justify-center zen-px-6 zen-py-10 zen-text-center", children: [
  /* @__PURE__ */ n("span", { className: "zen-text-zen-muted-fg/60 zen-mb-2", children: /* @__PURE__ */ n(M, { size: 28 }) }),
  /* @__PURE__ */ n("p", { className: "zen-text-sm zen-text-zen-muted-fg zen-m-0", children: e })
] }), M = ({ size: e = 18 }) => /* @__PURE__ */ i(
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
  O as NotificationsInbox
};
//# sourceMappingURL=index24.js.map
