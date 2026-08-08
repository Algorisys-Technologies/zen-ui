import { jsx as e, jsxs as s } from "react/jsx-runtime";
import * as a from "react";
import { Button as c } from "./index64.js";
import { Icon as r } from "./index56.js";
import { Input as Z } from "./index4.js";
import { Avatar as P, AvatarImage as ee, AvatarFallback as ne } from "./index41.js";
import { DropdownMenu as R, DropdownMenuTrigger as k, DropdownMenuContent as C, DropdownMenuItem as se, DropdownMenuLabel as we, DropdownMenuSeparator as ae } from "./index66.js";
import { cn as Ne } from "./index143.js";
const Se = 640, te = (d) => d.trim().split(/\s+/).slice(0, 2).map((z) => z[0]?.toUpperCase() ?? "").join(""), ye = a.forwardRef(
  ({
    logo: d,
    primaryTitle: z,
    secondaryTitle: M,
    menuItems: v,
    searchable: I = !1,
    onSearch: le,
    searchPlaceholder: u = "Search",
    notificationCount: o,
    onNotificationsClick: W,
    profile: t,
    items: D,
    onLogoClick: A,
    overflowLabel: re = "More actions",
    className: ie,
    children: ce,
    "aria-label": oe,
    ...de
  }, ze) => {
    const q = a.useRef(null), F = a.useRef(null), O = a.useRef(null), E = a.useRef(null), j = a.useRef(null), B = a.useRef(null), p = a.useId(), [x, $] = a.useState(""), [h, ue] = a.useState(!1), [H, w] = a.useState(!1), i = a.useMemo(() => D ?? [], [D]), [L, he] = a.useState(i.length), N = a.useMemo(
      () => i.filter((n) => n.overflow === "never"),
      [i]
    ), m = a.useMemo(
      () => i.filter((n) => n.overflow !== "never"),
      [i]
    );
    a.useLayoutEffect(() => {
      const n = q.current;
      if (!n || typeof ResizeObserver > "u") return;
      const l = () => {
        const J = E.current;
        if (!J) return;
        const Q = n.offsetWidth;
        ue(Q < Se);
        const X = Array.from(J.children).map((f) => f.offsetWidth), b = 8, pe = F.current?.offsetWidth ?? 0, be = O.current?.offsetWidth ?? 0, ge = (j.current?.offsetWidth ?? 32) + b, ve = N.reduce(
          (f, g) => f + (X[i.indexOf(g)] ?? 0) + b,
          0
        );
        let Y = Q - pe - be - ve - b, y = 0;
        for (const f of m) {
          const g = (X[i.indexOf(f)] ?? 0) + b, xe = y < m.length - 1;
          if (Y - g < (xe ? ge : 0)) break;
          Y -= g, y++;
        }
        he(y);
      };
      l();
      const U = new ResizeObserver(l);
      return U.observe(n), () => U.disconnect();
    }, [i, N, m, h]), a.useEffect(() => {
      h || w(!1);
    }, [h]);
    const me = m.slice(0, L), V = m.slice(L), _ = (n) => {
      n.preventDefault(), le?.(x);
    }, G = () => {
      w(!1), queueMicrotask(() => B.current?.focus());
    }, S = (n, l) => /* @__PURE__ */ e(
      c,
      {
        type: "button",
        variant: "ghost",
        color: "neutral",
        size: "sm",
        shape: "square",
        "aria-label": n.label,
        disabled: n.disabled,
        onClick: n.onSelect,
        children: /* @__PURE__ */ e(r, { name: n.icon, size: 16 })
      },
      l ?? n.id
    ), K = (n) => n.map((l) => /* @__PURE__ */ s(a.Fragment, { children: [
      l.separatorBefore ? /* @__PURE__ */ e(ae, {}) : null,
      /* @__PURE__ */ s(se, { disabled: l.disabled, onSelect: l.onSelect, children: [
        l.icon ? /* @__PURE__ */ e(r, { name: l.icon, size: 14, className: "zen-mr-2" }) : null,
        l.label
      ] })
    ] }, l.id)), T = /* @__PURE__ */ s("span", { className: "zen-flex zen-min-w-0 zen-flex-col zen-items-start zen-leading-tight", children: [
      z ? /* @__PURE__ */ e("span", { className: "zen-truncate zen-text-sm zen-font-semibold zen-text-zen-foreground", children: z }) : null,
      M ? /* @__PURE__ */ e("span", { className: "zen-truncate zen-text-xs zen-text-zen-muted-fg", children: M }) : null
    ] }), fe = /* @__PURE__ */ s("form", { role: "search", className: "zen-relative zen-flex zen-items-center", onSubmit: _, children: [
      /* @__PURE__ */ e("label", { htmlFor: p, className: "zen-sr-only", children: u }),
      /* @__PURE__ */ e(
        r,
        {
          name: "search",
          size: 14,
          className: "zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
        }
      ),
      /* @__PURE__ */ e(
        Z,
        {
          id: p,
          type: "search",
          value: x,
          placeholder: u,
          onChange: (n) => $(n.target.value),
          className: "zen-h-8 zen-w-48 zen-pl-7"
        }
      )
    ] });
    return /* @__PURE__ */ e(
      "header",
      {
        ref: ze,
        "aria-label": oe ?? z ?? "Application header",
        className: Ne(
          "zen-w-full zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-3",
          ie
        ),
        ...de,
        children: /* @__PURE__ */ s(
          "div",
          {
            ref: q,
            className: "zen-relative zen-flex zen-h-14 zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden",
            children: [
              /* @__PURE__ */ s(
                "div",
                {
                  ref: F,
                  className: "zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2",
                  children: [
                    d ? A ? /* @__PURE__ */ e(
                      c,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "square",
                        "aria-label": "Home",
                        onClick: A,
                        children: d
                      }
                    ) : /* @__PURE__ */ e("span", { className: "zen-flex zen-shrink-0 zen-items-center", children: d }) : null,
                    v && v.length > 0 ? /* @__PURE__ */ s(R, { children: [
                      /* @__PURE__ */ e(k, { asChild: !0, children: /* @__PURE__ */ e(
                        c,
                        {
                          type: "button",
                          variant: "ghost",
                          color: "neutral",
                          size: "sm",
                          className: "zen-min-w-0 zen-px-2",
                          iconRight: /* @__PURE__ */ e(r, { name: "chevron-down", size: 14 }),
                          children: T
                        }
                      ) }),
                      /* @__PURE__ */ e(C, { align: "start", children: K(v) })
                    ] }) : T,
                    ce
                  ]
                }
              ),
              /* @__PURE__ */ s("div", { className: "zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: [
                /* @__PURE__ */ s("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
                  N.map((n) => S(n)),
                  me.map((n) => S(n)),
                  V.length > 0 ? /* @__PURE__ */ e("div", { ref: j, children: /* @__PURE__ */ s(R, { children: [
                    /* @__PURE__ */ e(k, { asChild: !0, children: /* @__PURE__ */ e(
                      c,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "square",
                        "aria-label": re,
                        children: /* @__PURE__ */ e(r, { name: "more", size: 16 })
                      }
                    ) }),
                    /* @__PURE__ */ e(C, { align: "end", children: V.map((n) => /* @__PURE__ */ s(se, { disabled: n.disabled, onSelect: n.onSelect, children: [
                      /* @__PURE__ */ e(r, { name: n.icon, size: 14, className: "zen-mr-2" }),
                      n.label
                    ] }, n.id)) })
                  ] }) }) : null
                ] }),
                /* @__PURE__ */ s("div", { ref: O, className: "zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: [
                  I ? h ? /* @__PURE__ */ e(
                    c,
                    {
                      ref: B,
                      type: "button",
                      variant: "ghost",
                      color: "neutral",
                      size: "sm",
                      shape: "square",
                      "aria-label": u,
                      "aria-expanded": H,
                      onClick: () => w((n) => !n),
                      children: /* @__PURE__ */ e(r, { name: "search", size: 16 })
                    }
                  ) : fe : null,
                  o !== void 0 || W ? /* @__PURE__ */ s("span", { className: "zen-relative zen-flex zen-shrink-0", children: [
                    /* @__PURE__ */ e(
                      c,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "square",
                        "aria-label": o ? `Notifications, ${o} unread` : "Notifications",
                        onClick: W,
                        children: /* @__PURE__ */ e(r, { name: "bell", size: 16 })
                      }
                    ),
                    o ? /* @__PURE__ */ e(
                      "span",
                      {
                        "aria-hidden": "true",
                        className: "zen-pointer-events-none zen-absolute -zen-end-1 -zen-top-1 zen-flex zen-h-4 zen-min-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-error zen-px-1 zen-text-xs zen-font-semibold zen-leading-none zen-text-zen-error-fg",
                        children: o > 99 ? "99+" : o
                      }
                    ) : null
                  ] }) : null,
                  t ? t.menuItems && t.menuItems.length > 0 ? /* @__PURE__ */ s(R, { children: [
                    /* @__PURE__ */ e(k, { asChild: !0, children: /* @__PURE__ */ e(
                      c,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "circle",
                        "aria-label": t.name,
                        children: /* @__PURE__ */ s(P, { size: "sm", children: [
                          t.image ? /* @__PURE__ */ e(ee, { src: t.image, alt: "" }) : null,
                          /* @__PURE__ */ e(ne, { children: t.initials ?? te(t.name) })
                        ] })
                      }
                    ) }),
                    /* @__PURE__ */ s(C, { align: "end", children: [
                      /* @__PURE__ */ e(we, { children: t.name }),
                      /* @__PURE__ */ e(ae, {}),
                      K(t.menuItems)
                    ] })
                  ] }) : /* @__PURE__ */ e(
                    c,
                    {
                      type: "button",
                      variant: "ghost",
                      color: "neutral",
                      size: "sm",
                      shape: "circle",
                      "aria-label": t.name,
                      onClick: t.onClick,
                      children: /* @__PURE__ */ s(P, { size: "sm", children: [
                        t.image ? /* @__PURE__ */ e(ee, { src: t.image, alt: "" }) : null,
                        /* @__PURE__ */ e(ne, { children: t.initials ?? te(t.name) })
                      ] })
                    }
                  ) : null
                ] })
              ] }),
              I && h && H ? /* @__PURE__ */ s(
                "div",
                {
                  className: "zen-absolute zen-inset-0 zen-z-10 zen-flex zen-items-center zen-gap-2 zen-bg-zen-background",
                  onKeyDown: (n) => {
                    n.key === "Escape" && (n.stopPropagation(), G());
                  },
                  children: [
                    /* @__PURE__ */ s(
                      "form",
                      {
                        role: "search",
                        className: "zen-relative zen-flex zen-flex-1 zen-items-center",
                        onSubmit: _,
                        children: [
                          /* @__PURE__ */ e("label", { htmlFor: `${p}-collapsed`, className: "zen-sr-only", children: u }),
                          /* @__PURE__ */ e(
                            r,
                            {
                              name: "search",
                              size: 14,
                              className: "zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
                            }
                          ),
                          /* @__PURE__ */ e(
                            Z,
                            {
                              id: `${p}-collapsed`,
                              type: "search",
                              autoFocus: !0,
                              value: x,
                              placeholder: u,
                              onChange: (n) => $(n.target.value),
                              className: "zen-h-8 zen-w-full zen-pl-7"
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ e(
                      c,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "square",
                        "aria-label": "Close search",
                        onClick: G,
                        children: /* @__PURE__ */ e(r, { name: "x", size: 16 })
                      }
                    )
                  ]
                }
              ) : null,
              /* @__PURE__ */ e(
                "div",
                {
                  ref: E,
                  "aria-hidden": "true",
                  className: "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0",
                  style: { visibility: "hidden" },
                  children: i.map((n) => S(n, `measure-${n.id}`))
                }
              )
            ]
          }
        )
      }
    );
  }
);
ye.displayName = "ShellBar";
export {
  ye as ShellBar
};
//# sourceMappingURL=index46.js.map
