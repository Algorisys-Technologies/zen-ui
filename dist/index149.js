import { jsxs as l, jsx as r } from "react/jsx-runtime";
import * as s from "react";
import { routingLayout as le, canAddLink as Y, effectiveLinks as ce } from "./index150.js";
import { cn as T } from "./index197.js";
import { observeDocumentDirection as ze } from "./index205.js";
import "./index28.js";
import "./index110.js";
import { useLocale as de } from "./index90.js";
import { NativeSelect as ue } from "./index7.js";
import { Button as me } from "./index71.js";
import { Icon as F } from "./index63.js";
const fe = {
  done: "routing.status.done",
  active: "routing.status.active",
  pending: "routing.status.pending",
  blocked: "routing.status.blocked",
  skipped: "routing.status.skipped"
}, pe = {
  done: "zen-border-zen-success zen-bg-zen-success-soft",
  active: "zen-border-zen-primary zen-bg-zen-primary-soft",
  pending: "zen-border-zen-border zen-bg-zen-background",
  blocked: "zen-border-zen-error zen-bg-zen-error-soft",
  skipped: "zen-border-dashed zen-border-zen-border zen-bg-zen-muted"
}, ge = s.forwardRef(
  ({ steps: d, links: A, onLinksChange: C, selected: B, onSelect: _, label: K, className: P, ...X }, Z) => {
    const o = de(), $ = s.useId().replace(/[^A-Za-z0-9_-]/g, ""), D = C !== void 0, c = s.useMemo(() => le(d, A), [d, A]), [J, Q] = s.useState(B), z = B ?? J, V = (e) => {
      Q(e), _?.(e);
    }, u = (e) => d.find((n) => n.id === e)?.label ?? e, R = (e) => c.links.filter((n) => n.to === e).map((n) => n.from), O = (e) => c.links.filter((n) => n.from === e).map((n) => n.to), q = (e) => o.t(fe[e.status ?? "pending"]), w = () => ce(d, A).links, ee = (e, n) => C?.(w().filter((t) => !(t.from === e && t.to === n))), M = z ? d.filter((e) => Y(d, w(), e.id, z).ok) : [], [x, I] = s.useState(""), ne = () => {
      !z || !x || !Y(d, w(), x, z).ok || (C?.([...w(), { from: x, to: z }]), I(""));
    }, te = s.useMemo(() => {
      const e = /* @__PURE__ */ new Map();
      return c.layers.forEach((n, t) => n.forEach((i) => e.set(i.id, t))), c.links.filter((n) => Math.abs((e.get(n.to) ?? 0) - (e.get(n.from) ?? 0)) > 1).length;
    }, [c]), N = s.useRef(null), [re, oe] = s.useState([]), [W, ie] = s.useState({ w: 0, h: 0 }), G = s.useRef(c);
    G.current = c;
    const v = s.useCallback(() => {
      const e = N.current;
      if (!e) return;
      const n = G.current, t = e.getBoundingClientRect(), i = (a) => e.querySelector(`[data-step="${CSS.escape(a)}"]`)?.getBoundingClientRect(), k = [], E = /* @__PURE__ */ new Map();
      n.layers.forEach((a, f) => a.forEach((p) => E.set(p.id, f)));
      let se = 0;
      for (const a of n.links) {
        const f = i(a.from), p = i(a.to);
        if (!f || !p) continue;
        const L = f.left < p.left, ae = L ? 1 : -1, g = (L ? f.right : f.left) - t.left, h = (L ? p.left - 6 : p.right + 6) - t.left, y = f.top + f.height / 2 - t.top, j = p.top + p.height / 2 - t.top;
        if (Math.abs((E.get(a.to) ?? 0) - (E.get(a.from) ?? 0)) <= 1) {
          const U = (g + h) / 2;
          k.push({ key: [a.from, a.to].join(">"), d: ["M", g, y, "C", U, y, U, j, h, j].join(" ") });
          continue;
        }
        const S = 6 + 6 * se++, b = 18 * ae;
        k.push({
          key: [a.from, a.to].join(">"),
          d: ["M", g, y, "C", g + b, y, g + b, S, g + 2 * b, S, "L", h - 2 * b, S, "C", h - b, S, h - b, j, h, j].join(" ")
        });
      }
      ie({ w: e.scrollWidth, h: e.scrollHeight }), oe(k);
    }, []);
    s.useEffect(() => {
      const e = new ResizeObserver(() => v());
      N.current && e.observe(N.current);
      let n = 0;
      const t = ze(() => {
        cancelAnimationFrame(n), n = requestAnimationFrame(v);
      });
      return () => {
        e.disconnect(), t(), cancelAnimationFrame(n);
      };
    }, [v]), s.useEffect(() => {
      const e = requestAnimationFrame(v);
      return () => cancelAnimationFrame(e);
    }, [c, v]);
    const H = [$, "arrow"].join("-"), m = z !== void 0 && d.some((e) => e.id === z) ? z : void 0;
    return /* @__PURE__ */ l("div", { ref: Z, className: T("zen-flex zen-w-full zen-flex-col zen-gap-3", P), ...X, children: [
      c.implicit && /* @__PURE__ */ r("p", { className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg", children: o.t("routing.implicit") }),
      /* @__PURE__ */ r("div", { className: "zen-w-full zen-overflow-x-auto", children: /* @__PURE__ */ l(
        "div",
        {
          ref: N,
          role: "group",
          "aria-label": K ?? o.t("routing.label"),
          className: T("zen-relative zen-flex zen-w-max zen-min-w-full zen-items-stretch zen-gap-14 zen-p-1", te > 0 && "zen-pt-10"),
          children: [
            /* @__PURE__ */ l("svg", { className: "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0", width: W.w, height: W.h, "aria-hidden": "true", children: [
              /* @__PURE__ */ r("defs", { children: /* @__PURE__ */ r("marker", { id: H, viewBox: "0 0 10 10", refX: "1", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse", children: /* @__PURE__ */ r("path", { d: "M0 0 L10 5 L0 10 z", fill: "var(--zen-color-muted-fg)" }) }) }),
              re.map((e) => /* @__PURE__ */ r(
                "path",
                {
                  d: e.d,
                  fill: "none",
                  stroke: "var(--zen-color-muted-fg)",
                  strokeWidth: "1.5",
                  strokeDasharray: c.implicit ? "5 4" : void 0,
                  markerEnd: ["url(#", H, ")"].join("")
                },
                e.key
              ))
            ] }),
            c.layers.map((e, n) => /* @__PURE__ */ r("div", { className: "zen-relative zen-flex zen-w-44 zen-shrink-0 zen-flex-col zen-justify-center zen-gap-3", children: e.map((t) => {
              const i = d.find((k) => k.id === t.id);
              return /* @__PURE__ */ l(
                "button",
                {
                  type: "button",
                  "data-step": t.id,
                  "aria-pressed": z === t.id,
                  "aria-label": o.t("routing.step", {
                    name: i.label,
                    status: q(i),
                    after: R(t.id).map(u).join(", ") || o.t("routing.none"),
                    then: O(t.id).map(u).join(", ") || o.t("routing.none")
                  }),
                  className: T(
                    "zen-relative zen-z-10 zen-flex zen-min-h-12 zen-w-full zen-flex-col zen-items-start zen-gap-0.5 zen-rounded-zen-md zen-border zen-border-solid zen-px-3 zen-py-2 zen-text-start zen-text-zen-foreground zen-cursor-pointer",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                    pe[i.status ?? "pending"],
                    z === t.id && "zen-ring-2 zen-ring-zen-foreground"
                  ),
                  onClick: () => V(z === t.id ? void 0 : t.id),
                  children: [
                    /* @__PURE__ */ r("span", { className: "zen-text-sm zen-font-semibold", children: i.label }),
                    /* @__PURE__ */ l("span", { className: "zen-flex zen-items-center zen-gap-1 zen-text-xs", children: [
                      i.status === "done" && /* @__PURE__ */ r(F, { name: "check", size: 12 }),
                      i.status === "blocked" && /* @__PURE__ */ r(F, { name: "warn", size: 12 }),
                      i.detail ?? q(i)
                    ] })
                  ]
                },
                t.id
              );
            }) }, n))
          ]
        }
      ) }),
      m !== void 0 && /* @__PURE__ */ l(
        "section",
        {
          className: "zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-zen-card",
          "aria-label": u(m),
          children: [
            /* @__PURE__ */ r("h4", { className: "zen-m-0 zen-text-base zen-font-semibold zen-text-zen-foreground", children: u(m) }),
            /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-col zen-gap-1.5", children: [
              /* @__PURE__ */ r("span", { className: "zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: o.t("routing.runsAfter") }),
              R(m).length ? /* @__PURE__ */ r("ul", { className: "zen-m-0 zen-flex zen-list-none zen-flex-wrap zen-gap-2 zen-p-0", children: R(m).map((e) => /* @__PURE__ */ l(
                "li",
                {
                  className: "zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-border-solid zen-border-zen-border zen-py-0.5 zen-ps-3 zen-pe-1 zen-text-sm",
                  children: [
                    u(e),
                    D && /* @__PURE__ */ r(
                      "button",
                      {
                        type: "button",
                        "aria-label": o.t("routing.remove", { step: u(m), after: u(e) }),
                        className: "zen-inline-flex zen-h-7 zen-w-7 zen-items-center zen-justify-center zen-rounded-zen-full zen-border-0 zen-bg-transparent zen-text-zen-muted-fg zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                        onClick: () => ee(e, m),
                        children: /* @__PURE__ */ r(F, { name: "x", size: 14 })
                      }
                    )
                  ]
                },
                e
              )) }) : /* @__PURE__ */ r("span", { className: "zen-text-sm", children: o.t("routing.start") })
            ] }),
            D && /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-wrap zen-items-end zen-gap-2", children: [
              /* @__PURE__ */ l("label", { className: "zen-flex zen-flex-col zen-gap-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: [
                o.t("routing.addAfter"),
                /* @__PURE__ */ l(
                  ue,
                  {
                    className: "zen-min-w-48",
                    value: x,
                    disabled: M.length === 0,
                    onChange: (e) => I(e.currentTarget.value),
                    children: [
                      /* @__PURE__ */ r("option", { value: "", children: M.length ? o.t("routing.choose") : o.t("routing.noCandidates") }),
                      M.map((e) => /* @__PURE__ */ r("option", { value: e.id, children: e.label }, e.id))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ r(me, { variant: "outline", disabled: !x, onClick: ne, children: o.t("routing.add") })
            ] }),
            /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-col zen-gap-1.5", children: [
              /* @__PURE__ */ r("span", { className: "zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: o.t("routing.then") }),
              /* @__PURE__ */ r("span", { className: "zen-text-sm zen-text-zen-foreground", children: O(m).map(u).join(", ") || o.t("routing.end") })
            ] })
          ]
        }
      )
    ] });
  }
);
ge.displayName = "RoutingGraph";
export {
  ge as RoutingGraph
};
//# sourceMappingURL=index149.js.map
