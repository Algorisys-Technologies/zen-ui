import { jsxs as s, jsx as e } from "react/jsx-runtime";
import * as f from "react";
import { Badge as d } from "./index58.js";
import { cn as u } from "./index145.js";
const b = {
  live: "success",
  left: "neutral",
  connecting: "warning"
}, x = {
  info: "info",
  warning: "warning",
  error: "error"
}, v = ({ flags: n, max: a = 2, className: i }) => {
  if (n.length === 0) return null;
  const t = n.slice(0, a), o = n.length - t.length;
  return /* @__PURE__ */ s(
    "div",
    {
      className: u(
        "zen-pointer-events-none zen-absolute zen-inset-x-0 zen-bottom-0 zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-p-1.5",
        "zen-bg-gradient-to-t zen-from-black/70 zen-to-transparent",
        i
      ),
      children: [
        t.map((r) => /* @__PURE__ */ e(d, { variant: "solid", color: x[r.level ?? "warning"], children: r.label }, r.id)),
        o > 0 ? /* @__PURE__ */ s(d, { variant: "soft", color: "neutral", children: [
          "+",
          o,
          " more"
        ] }) : null
      ]
    }
  );
}, N = ({
  stream: n,
  poster: a,
  muted: i,
  label: t
}) => {
  const o = f.useRef(null);
  return f.useEffect(() => {
    const r = o.current;
    r && r.srcObject !== (n ?? null) && (r.srcObject = n ?? null);
  }, [n]), n ? /* @__PURE__ */ e(
    "video",
    {
      ref: o,
      autoPlay: !0,
      playsInline: !0,
      muted: i ?? !0,
      "aria-label": t,
      className: "zen-h-full zen-w-full zen-bg-black zen-object-cover"
    }
  ) : /* @__PURE__ */ e("div", { className: "zen-flex zen-h-full zen-w-full zen-items-center zen-justify-center zen-bg-zen-muted", children: a ? /* @__PURE__ */ e("img", { src: a, alt: "", className: "zen-h-full zen-w-full zen-object-cover" }) : /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: "No video" }) });
}, j = ({
  participants: n,
  minTileWidth: a = "14rem",
  max: i,
  onSelect: t,
  renderActions: o,
  emptyMessage: r,
  className: h
}) => {
  const c = i ? n.slice(0, i) : n, m = n.length - c.length;
  return n.length === 0 ? /* @__PURE__ */ e("p", { className: "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: r ?? "Nobody is connected." }) : /* @__PURE__ */ s("div", { className: u("zen-flex zen-w-full zen-flex-col zen-gap-2", h), children: [
    /* @__PURE__ */ e(
      "ul",
      {
        className: "zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0",
        style: { gridTemplateColumns: `repeat(auto-fill, minmax(${a}, 1fr))` },
        children: c.map((l) => {
          const z = l.flags ?? [];
          return /* @__PURE__ */ e("li", { children: /* @__PURE__ */ s(
            t ? "button" : "div",
            {
              ...t ? { type: "button", onClick: () => t(l) } : {},
              className: u(
                "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-start",
                t && "zen-cursor-pointer hover:zen-border-zen-primary focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                /* A tile with an error flag gets a border, not just a chip —
                   it must be findable while scanning thirty of them. */
                z.some((g) => g.level === "error") && "zen-border-zen-error"
              ),
              children: [
                /* @__PURE__ */ s("div", { className: "zen-relative zen-aspect-video zen-w-full", children: [
                  /* @__PURE__ */ e(
                    N,
                    {
                      stream: l.stream,
                      poster: l.poster,
                      muted: l.muted,
                      label: typeof l.name == "string" ? `${l.name} video` : "Candidate video"
                    }
                  ),
                  /* @__PURE__ */ e("span", { className: "zen-absolute zen-start-1 zen-top-1", children: /* @__PURE__ */ e(d, { variant: "solid", color: b[l.status ?? "live"], children: l.status ?? "live" }) }),
                  /* @__PURE__ */ e(v, { flags: z })
                ] }),
                /* @__PURE__ */ s("div", { className: "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5", children: [
                  /* @__PURE__ */ s("span", { className: "zen-min-w-0 zen-flex-1", children: [
                    /* @__PURE__ */ e("span", { className: "zen-block zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: l.name }),
                    l.detail ? /* @__PURE__ */ e("span", { className: "zen-block zen-truncate zen-text-xs zen-text-zen-muted-fg", children: l.detail }) : null
                  ] }),
                  z.length > 0 ? /* @__PURE__ */ s("span", { className: "zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-error", children: [
                    z.length,
                    /* @__PURE__ */ e("span", { className: "zen-sr-only", children: " flags raised" })
                  ] }) : null,
                  o ? /* @__PURE__ */ e("span", { className: "zen-shrink-0", children: o(l) }) : null
                ] })
              ]
            }
          ) }, l.id);
        })
      }
    ),
    m > 0 ? /* @__PURE__ */ s("p", { className: "zen-m-0 zen-text-xs zen-text-zen-muted-fg", children: [
      "Showing ",
      c.length,
      " of ",
      n.length,
      ". ",
      m,
      " not rendered."
    ] }) : null
  ] });
};
export {
  v as ProctorFlagOverlay,
  j as ProctorStreamGrid
};
//# sourceMappingURL=index109.js.map
