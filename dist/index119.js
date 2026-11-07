import { jsxs as o, jsx as e } from "react/jsx-runtime";
import * as g from "react";
import { Badge as u } from "./index64.js";
import { useLocale as b } from "./index90.js";
import { cn as f } from "./index160.js";
const v = {
  live: "success",
  left: "neutral",
  connecting: "warning"
}, p = {
  info: "info",
  warning: "warning",
  error: "error"
}, N = ({ flags: n, max: a = 2, className: c }) => {
  if (n.length === 0) return null;
  const r = n.slice(0, a), s = n.length - r.length;
  return /* @__PURE__ */ o(
    "div",
    {
      className: f(
        "zen-pointer-events-none zen-absolute zen-inset-x-0 zen-bottom-0 zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-p-1.5",
        "zen-bg-gradient-to-t zen-from-black/70 zen-to-transparent",
        c
      ),
      children: [
        r.map((l) => /* @__PURE__ */ e(u, { variant: "solid", color: p[l.level ?? "warning"], children: l.label }, l.id)),
        s > 0 ? /* @__PURE__ */ o(u, { variant: "soft", color: "neutral", children: [
          "+",
          s,
          " more"
        ] }) : null
      ]
    }
  );
}, w = ({
  stream: n,
  poster: a,
  muted: c,
  label: r
}) => {
  const s = b(), l = g.useRef(null);
  return g.useEffect(() => {
    const i = l.current;
    i && i.srcObject !== (n ?? null) && (i.srcObject = n ?? null);
  }, [n]), n ? /* @__PURE__ */ e(
    "video",
    {
      ref: l,
      autoPlay: !0,
      playsInline: !0,
      muted: c ?? !0,
      "aria-label": r,
      className: "zen-h-full zen-w-full zen-bg-black zen-object-cover"
    }
  ) : /* @__PURE__ */ e("div", { className: "zen-flex zen-h-full zen-w-full zen-items-center zen-justify-center zen-bg-zen-muted", children: a ? /* @__PURE__ */ e("img", { src: a, alt: "", className: "zen-h-full zen-w-full zen-object-cover" }) : /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: s.t("proctor.noVideo") }) });
}, R = ({
  participants: n,
  minTileWidth: a = "14rem",
  max: c,
  onSelect: r,
  renderActions: s,
  emptyMessage: l,
  className: i
}) => {
  const z = b(), m = c ? n.slice(0, c) : n, h = n.length - m.length;
  return n.length === 0 ? /* @__PURE__ */ e("p", { className: "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: l ?? z.t("proctor.nobodyIsConnected") }) : /* @__PURE__ */ o("div", { className: f("zen-flex zen-w-full zen-flex-col zen-gap-2", i), children: [
    /* @__PURE__ */ e(
      "ul",
      {
        className: "zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0",
        style: { gridTemplateColumns: `repeat(auto-fill, minmax(${a}, 1fr))` },
        children: m.map((t) => {
          const d = t.flags ?? [];
          return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ o(
            r ? "button" : "div",
            {
              ...r ? { type: "button", onClick: () => r(t) } : {},
              className: f(
                "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-start",
                r && "zen-cursor-pointer hover:zen-border-zen-primary focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                /* A tile with an error flag gets a border, not just a chip —
                   it must be findable while scanning thirty of them. */
                d.some((x) => x.level === "error") && "zen-border-zen-error"
              ),
              children: [
                /* @__PURE__ */ o("div", { className: "zen-relative zen-aspect-video zen-w-full", children: [
                  /* @__PURE__ */ e(
                    w,
                    {
                      stream: t.stream,
                      poster: t.poster,
                      muted: t.muted,
                      label: typeof t.name == "string" ? z.t("proctor.nameVideo", { name: t.name }) : z.t("proctor.candidateVideo")
                    }
                  ),
                  /* @__PURE__ */ e("span", { className: "zen-absolute zen-start-1 zen-top-1", children: /* @__PURE__ */ e(u, { variant: "solid", color: v[t.status ?? "live"], children: t.status ?? "live" }) }),
                  /* @__PURE__ */ e(N, { flags: d })
                ] }),
                /* @__PURE__ */ o("div", { className: "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5", children: [
                  /* @__PURE__ */ o("span", { className: "zen-min-w-0 zen-flex-1", children: [
                    /* @__PURE__ */ e("span", { className: "zen-block zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: t.name }),
                    t.detail ? /* @__PURE__ */ e("span", { className: "zen-block zen-truncate zen-text-xs zen-text-zen-muted-fg", children: t.detail }) : null
                  ] }),
                  d.length > 0 ? /* @__PURE__ */ o("span", { className: "zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-error", children: [
                    d.length,
                    /* @__PURE__ */ e("span", { className: "zen-sr-only", children: z.t("proctor.flagsRaised") })
                  ] }) : null,
                  s ? /* @__PURE__ */ e("span", { className: "zen-shrink-0", children: s(t) }) : null
                ] })
              ]
            }
          ) }, t.id);
        })
      }
    ),
    h > 0 ? /* @__PURE__ */ e("p", { className: "zen-m-0 zen-text-xs zen-text-zen-muted-fg", children: z.t("proctor.showing", { shown: m.length, total: n.length, hidden: h }) }) : null
  ] });
};
export {
  N as ProctorFlagOverlay,
  R as ProctorStreamGrid
};
//# sourceMappingURL=index119.js.map
