import { jsx as n, jsxs as z } from "react/jsx-runtime";
import * as o from "react";
import { Icon as u } from "./index56.js";
import { cn as i } from "./index143.js";
const p = {
  default: "zen-bg-zen-muted-fg",
  info: "zen-bg-zen-info",
  success: "zen-bg-zen-success",
  warning: "zen-bg-zen-warning",
  error: "zen-bg-zen-error"
}, f = {
  default: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error"
}, g = ({ item: t }) => {
  const [l, c] = o.useState(!!t.defaultOpen), s = t.open ?? l, r = t.collapseLabel === void 0 ? "Details" : typeof t.collapseLabel == "function" ? t.collapseLabel(s) : t.collapseLabel;
  return t.collapsible ? /* @__PURE__ */ z(
    "details",
    {
      className: "zen-mt-1",
      open: s,
      onToggle: (a) => {
        const e = a.currentTarget.open;
        e !== s && (c(e), t.onOpenChange?.(e));
      },
      children: [
        /* @__PURE__ */ z("summary", { className: "zen-inline-flex zen-cursor-pointer zen-list-none zen-items-center zen-gap-1 zen-rounded-zen-sm zen-text-xs zen-font-medium zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", children: [
          /* @__PURE__ */ n(
            u,
            {
              name: "chevron-down",
              size: 14,
              className: i("zen-transition-transform", s ? void 0 : "-zen-rotate-90 rtl:zen-rotate-90")
            }
          ),
          r
        ] }),
        /* @__PURE__ */ n("div", { className: "zen-mt-2", children: t.children })
      ]
    }
  ) : /* @__PURE__ */ n("div", { className: "zen-mt-1", children: t.children });
}, N = ({ items: t, density: l, emptyMessage: c, className: s }) => {
  const r = o.useMemo(
    () => (t ?? []).map((e, m, d) => ({
      item: e,
      startsGroup: !!e.group && e.group !== d[m - 1]?.group,
      isLast: m === d.length - 1
    })),
    [t]
  ), a = l === "compact";
  return r.length === 0 ? /* @__PURE__ */ n("p", { className: "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: c ?? "Nothing yet" }) : /* @__PURE__ */ n("ol", { className: i("zen-m-0 zen-list-none zen-p-0", s), children: r.map((e) => /* @__PURE__ */ z(o.Fragment, { children: [
    e.startsGroup && /* Not an <li>: a heading is not one of the events, and putting it
    in the list would inflate the count a screen reader announces. */
    /* @__PURE__ */ n("p", { className: "zen-mb-2 zen-mt-4 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg first:zen-mt-0", children: e.item.group }),
    /* @__PURE__ */ z("li", { className: i("zen-relative zen-ps-8", a ? "zen-pb-3" : "zen-pb-6"), children: [
      !e.isLast && /* @__PURE__ */ n(
        "span",
        {
          "aria-hidden": "true",
          className: "zen-absolute zen-top-2 zen-bottom-0 zen-start-[7px] zen-w-px zen-bg-zen-border"
        }
      ),
      e.item.icon ? /* @__PURE__ */ n(
        "span",
        {
          "aria-hidden": "true",
          className: i(
            "zen-absolute zen-start-0 zen-top-0.5 zen-flex zen-h-4 zen-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-background",
            f[e.item.state ?? "default"]
          ),
          children: /* @__PURE__ */ n(u, { name: e.item.icon, size: 14 })
        }
      ) : /* @__PURE__ */ n(
        "span",
        {
          "aria-hidden": "true",
          className: i(
            "zen-absolute zen-start-1 zen-top-1.5 zen-h-2 zen-w-2 zen-rounded-zen-full",
            p[e.item.state ?? "default"]
          )
        }
      ),
      /* @__PURE__ */ z("div", { className: "zen-flex zen-flex-col zen-gap-0.5", children: [
        /* @__PURE__ */ z("div", { className: "zen-flex zen-flex-wrap zen-items-baseline zen-gap-x-2", children: [
          /* @__PURE__ */ n("span", { className: "zen-text-sm zen-font-medium zen-text-zen-foreground", children: e.item.title }),
          e.item.timestamp && /* @__PURE__ */ n("time", { dateTime: e.item.dateTime, className: "zen-text-xs zen-text-zen-muted-fg", children: e.item.timestamp })
        ] }),
        !a && e.item.description && /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-sm zen-leading-relaxed zen-text-zen-muted-fg", children: e.item.description }),
        !a && e.item.children && /* @__PURE__ */ n(g, { item: e.item })
      ] })
    ] })
  ] }, e.item.id)) });
};
export {
  N as Timeline
};
//# sourceMappingURL=index121.js.map
