import { jsxs as t, jsx as n } from "react/jsx-runtime";
import * as r from "react";
import { Button as B } from "./index71.js";
import { Icon as p } from "./index63.js";
import { DropdownMenu as E, DropdownMenuTrigger as G, DropdownMenuContent as P, DropdownMenuSeparator as V, DropdownMenuItem as $ } from "./index73.js";
import { useLocale as q } from "./index90.js";
import { cn as H } from "./index160.js";
const J = r.forwardRef(
  ({ actions: o, overflowLabel: C, size: h = "sm", className: D, children: z, ...L }, s) => {
    const S = q(), k = C ?? S.t("toolbar.moreActions"), b = r.useRef(null), v = r.useRef(null), g = r.useRef(null), w = r.useRef(null), [R, O] = r.useState(o.length), f = r.useMemo(() => o.filter((e) => e.overflow === "never"), [o]), l = r.useMemo(() => o.filter((e) => e.overflow !== "never"), [o]);
    r.useLayoutEffect(() => {
      const e = b.current;
      if (!e || typeof ResizeObserver > "u") return;
      const c = () => {
        const N = g.current;
        if (!N) return;
        const M = Array.from(N.children).map((i) => i.offsetWidth), u = 8, A = f.reduce(
          (i, d) => i + (M[o.indexOf(d)] ?? 0) + u,
          0
        ), F = (w.current?.offsetWidth ?? 36) + u, j = v.current?.offsetWidth ?? 0;
        let W = e.offsetWidth - j - A, m = 0;
        for (const i of l) {
          const d = (M[o.indexOf(i)] ?? 0) + u, I = m < l.length - 1;
          if (W - d < (I ? F : 0)) break;
          W -= d, m++;
        }
        O(m);
      };
      c();
      const y = new ResizeObserver(c);
      return y.observe(e), () => y.disconnect();
    }, [o, f, l]);
    const T = l.slice(0, R), x = l.slice(R), a = (e, c) => /* @__PURE__ */ n(
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
        className: H(
          "zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden",
          D
        ),
        ...L,
        children: [
          z ? /* @__PURE__ */ n("div", { ref: v, className: "zen-flex zen-min-w-0 zen-items-center zen-gap-2", children: z }) : null,
          /* @__PURE__ */ t("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
            f.map((e) => /* @__PURE__ */ t(r.Fragment, { children: [
              e.separatorBefore ? /* @__PURE__ */ n("span", { className: "zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border" }) : null,
              a(e)
            ] }, e.id)),
            T.map((e) => /* @__PURE__ */ t(r.Fragment, { children: [
              e.separatorBefore ? /* @__PURE__ */ n("span", { className: "zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border" }) : null,
              a(e)
            ] }, e.id)),
            x.length > 0 ? /* @__PURE__ */ n("div", { ref: w, children: /* @__PURE__ */ t(E, { children: [
              /* @__PURE__ */ n(G, { asChild: !0, children: /* @__PURE__ */ n(B, { type: "button", size: h, variant: "ghost", "aria-label": k, children: /* @__PURE__ */ n(p, { name: "more", size: 16 }) }) }),
              /* @__PURE__ */ n(P, { align: "end", children: x.map((e) => /* @__PURE__ */ t(r.Fragment, { children: [
                e.separatorBefore ? /* @__PURE__ */ n(V, {}) : null,
                /* @__PURE__ */ t($, { disabled: e.disabled, onSelect: e.onSelect, children: [
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
J.displayName = "Toolbar";
export {
  J as Toolbar
};
//# sourceMappingURL=index48.js.map
