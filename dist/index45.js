import { jsxs as t, jsx as n } from "react/jsx-runtime";
import * as r from "react";
import { Button as B } from "./index65.js";
import { Icon as p } from "./index57.js";
import { DropdownMenu as I, DropdownMenuTrigger as L, DropdownMenuContent as E, DropdownMenuSeparator as G, DropdownMenuItem as P } from "./index67.js";
import { cn as V } from "./index145.js";
const $ = r.forwardRef(
  ({ actions: o, overflowLabel: C = "More actions", size: h = "sm", className: D, children: z, ...S }, s) => {
    const b = r.useRef(null), v = r.useRef(null), g = r.useRef(null), w = r.useRef(null), [R, k] = r.useState(o.length), f = r.useMemo(() => o.filter((e) => e.overflow === "never"), [o]), i = r.useMemo(() => o.filter((e) => e.overflow !== "never"), [o]);
    r.useLayoutEffect(() => {
      const e = b.current;
      if (!e || typeof ResizeObserver > "u") return;
      const c = () => {
        const M = g.current;
        if (!M) return;
        const N = Array.from(M.children).map((l) => l.offsetWidth), u = 8, T = f.reduce(
          (l, d) => l + (N[o.indexOf(d)] ?? 0) + u,
          0
        ), F = (w.current?.offsetWidth ?? 36) + u, j = v.current?.offsetWidth ?? 0;
        let W = e.offsetWidth - j - T, m = 0;
        for (const l of i) {
          const d = (N[o.indexOf(l)] ?? 0) + u, A = m < i.length - 1;
          if (W - d < (A ? F : 0)) break;
          W -= d, m++;
        }
        k(m);
      };
      c();
      const y = new ResizeObserver(c);
      return y.observe(e), () => y.disconnect();
    }, [o, f, i]);
    const O = i.slice(0, R), x = i.slice(R), a = (e, c) => /* @__PURE__ */ n(
      B,
      {
        type: "button",
        size: h,
        variant: e.variant ?? "ghost",
        color: e.color,
        disabled: e.disabled,
        onClick: e.onSelect,
        iconLeft: e.icon ? /* @__PURE__ */ n(p, { name: e.icon, size: 14 }) : void 0,
        children: e.label
      },
      c ?? e.id
    );
    return /* @__PURE__ */ t(
      "div",
      {
        ref: (e) => {
          b.current = e, typeof s == "function" ? s(e) : s && (s.current = e);
        },
        role: "toolbar",
        className: V(
          "zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden",
          D
        ),
        ...S,
        children: [
          z ? /* @__PURE__ */ n("div", { ref: v, className: "zen-flex zen-min-w-0 zen-items-center zen-gap-2", children: z }) : null,
          /* @__PURE__ */ t("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
            f.map((e) => /* @__PURE__ */ t(r.Fragment, { children: [
              e.separatorBefore ? /* @__PURE__ */ n("span", { className: "zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border" }) : null,
              a(e)
            ] }, e.id)),
            O.map((e) => /* @__PURE__ */ t(r.Fragment, { children: [
              e.separatorBefore ? /* @__PURE__ */ n("span", { className: "zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border" }) : null,
              a(e)
            ] }, e.id)),
            x.length > 0 ? /* @__PURE__ */ n("div", { ref: w, children: /* @__PURE__ */ t(I, { children: [
              /* @__PURE__ */ n(L, { asChild: !0, children: /* @__PURE__ */ n(B, { type: "button", size: h, variant: "ghost", "aria-label": C, children: /* @__PURE__ */ n(p, { name: "more", size: 16 }) }) }),
              /* @__PURE__ */ n(E, { align: "end", children: x.map((e) => /* @__PURE__ */ t(r.Fragment, { children: [
                e.separatorBefore ? /* @__PURE__ */ n(G, {}) : null,
                /* @__PURE__ */ t(P, { disabled: e.disabled, onSelect: e.onSelect, children: [
                  e.icon ? /* @__PURE__ */ n(p, { name: e.icon, size: 14, className: "zen-mr-2" }) : null,
                  e.label
                ] })
              ] }, e.id)) })
            ] }) }) : null
          ] }),
          /* @__PURE__ */ n(
            "div",
            {
              ref: g,
              "aria-hidden": !0,
              className: "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0",
              style: { visibility: "hidden" },
              children: o.map((e) => a(e, `measure-${e.id}`))
            }
          )
        ]
      }
    );
  }
);
$.displayName = "Toolbar";
export {
  $ as Toolbar
};
//# sourceMappingURL=index45.js.map
