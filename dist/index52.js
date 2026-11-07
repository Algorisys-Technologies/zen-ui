import { jsx as e, jsxs as l } from "react/jsx-runtime";
import * as s from "react";
import { Button as i } from "./index71.js";
import { Icon as r } from "./index63.js";
import { Input as ee } from "./index4.js";
import { Avatar as ne, AvatarImage as ae, AvatarFallback as le } from "./index45.js";
import { DropdownMenu as C, DropdownMenuTrigger as I, DropdownMenuContent as M, DropdownMenuItem as se, DropdownMenuLabel as Re, DropdownMenuSeparator as te } from "./index73.js";
import { useLocale as ke } from "./index90.js";
import { cn as Ce } from "./index160.js";
const Ie = 640, re = (u) => u.trim().split(/\s+/).slice(0, 2).map((m) => m[0]?.toUpperCase() ?? "").join(""), Me = s.forwardRef(
  ({
    logo: u,
    primaryTitle: m,
    secondaryTitle: W,
    menuItems: w,
    searchable: D = !1,
    search: d,
    onSearch: ce,
    searchPlaceholder: ie,
    notificationCount: z,
    onNotificationsClick: A,
    profile: a,
    items: q,
    onLogoClick: F,
    overflowLabel: oe,
    className: de,
    children: ze,
    "aria-label": he,
    ...ue
  }, me) => {
    const o = ke(), f = ie ?? o.t("shellbar.search"), fe = oe ?? o.t("shellbar.moreActions"), O = s.useRef(null), L = s.useRef(null), E = s.useRef(null), P = s.useRef(null), j = s.useRef(null), B = s.useRef(null), g = s.useId(), [N, H] = s.useState(""), [h, pe] = s.useState(!1), [V, S] = s.useState(!1), c = s.useMemo(() => q ?? [], [q]), [$, be] = s.useState(c.length), y = s.useMemo(
      () => c.filter((n) => n.overflow === "never"),
      [c]
    ), p = s.useMemo(
      () => c.filter((n) => n.overflow !== "never"),
      [c]
    );
    s.useLayoutEffect(() => {
      const n = O.current;
      if (!n || typeof ResizeObserver > "u") return;
      const t = () => {
        const Q = P.current;
        if (!Q) return;
        const X = n.offsetWidth;
        pe(X < Ie);
        const Y = Array.from(Q.children).map((b) => b.offsetWidth), v = 8, xe = L.current?.offsetWidth ?? 0, we = E.current?.offsetWidth ?? 0, Ne = (j.current?.offsetWidth ?? 32) + v, Se = y.reduce(
          (b, x) => b + (Y[c.indexOf(x)] ?? 0) + v,
          0
        );
        let Z = X - xe - we - Se - v, k = 0;
        for (const b of p) {
          const x = (Y[c.indexOf(b)] ?? 0) + v, ye = k < p.length - 1;
          if (Z - x < (ye ? Ne : 0)) break;
          Z -= x, k++;
        }
        be(k);
      };
      t();
      const J = new ResizeObserver(t);
      return J.observe(n), () => J.disconnect();
    }, [c, y, p, h]), s.useEffect(() => {
      h || S(!1);
    }, [h]);
    const ge = p.slice(0, $), U = p.slice($), _ = (n) => {
      n.preventDefault(), ce?.(N);
    }, G = () => {
      S(!1), queueMicrotask(() => B.current?.focus());
    }, R = (n, t) => /* @__PURE__ */ e(
      i,
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
      t ?? n.id
    ), K = (n) => n.map((t) => /* @__PURE__ */ l(s.Fragment, { children: [
      t.separatorBefore ? /* @__PURE__ */ e(te, {}) : null,
      /* @__PURE__ */ l(se, { disabled: t.disabled, onSelect: t.onSelect, children: [
        t.icon ? /* @__PURE__ */ e(r, { name: t.icon, size: 14, className: "zen-mr-2" }) : null,
        t.label
      ] })
    ] }, t.id)), T = /* @__PURE__ */ l("span", { className: "zen-flex zen-min-w-0 zen-flex-col zen-items-start zen-leading-tight", children: [
      m ? /* @__PURE__ */ e("span", { className: "zen-truncate zen-text-sm zen-font-semibold zen-text-zen-foreground", children: m }) : null,
      W ? /* @__PURE__ */ e("span", { className: "zen-truncate zen-text-xs zen-text-zen-muted-fg", children: W }) : null
    ] }), ve = /* @__PURE__ */ l("form", { role: "search", className: "zen-relative zen-flex zen-items-center", onSubmit: _, children: [
      /* @__PURE__ */ e("label", { htmlFor: g, className: "zen-sr-only", children: f }),
      /* @__PURE__ */ e(
        r,
        {
          name: "search",
          size: 14,
          className: "zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
        }
      ),
      /* @__PURE__ */ e(
        ee,
        {
          id: g,
          type: "search",
          value: N,
          placeholder: f,
          onChange: (n) => H(n.target.value),
          className: "zen-h-8 zen-w-48 zen-pl-7"
        }
      )
    ] });
    return /* @__PURE__ */ e(
      "header",
      {
        ref: me,
        "aria-label": he ?? m ?? o.t("shellbar.applicationHeader"),
        className: Ce(
          "zen-w-full zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-3",
          de
        ),
        ...ue,
        children: /* @__PURE__ */ l(
          "div",
          {
            ref: O,
            className: "zen-relative zen-flex zen-h-14 zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden",
            children: [
              /* @__PURE__ */ l(
                "div",
                {
                  ref: L,
                  className: "zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2",
                  children: [
                    u ? F ? /* @__PURE__ */ e(
                      i,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "square",
                        "aria-label": o.t("shellbar.home"),
                        onClick: F,
                        children: u
                      }
                    ) : /* @__PURE__ */ e("span", { className: "zen-flex zen-shrink-0 zen-items-center", children: u }) : null,
                    w && w.length > 0 ? /* @__PURE__ */ l(C, { children: [
                      /* @__PURE__ */ e(I, { asChild: !0, children: /* @__PURE__ */ e(
                        i,
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
                      /* @__PURE__ */ e(M, { align: "start", children: K(w) })
                    ] }) : T,
                    ze
                  ]
                }
              ),
              /* @__PURE__ */ l("div", { className: "zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: [
                /* @__PURE__ */ l("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
                  y.map((n) => R(n)),
                  ge.map((n) => R(n)),
                  U.length > 0 ? /* @__PURE__ */ e("div", { ref: j, children: /* @__PURE__ */ l(C, { children: [
                    /* @__PURE__ */ e(I, { asChild: !0, children: /* @__PURE__ */ e(
                      i,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "square",
                        "aria-label": fe,
                        children: /* @__PURE__ */ e(r, { name: "more", size: 16 })
                      }
                    ) }),
                    /* @__PURE__ */ e(M, { align: "end", children: U.map((n) => /* @__PURE__ */ l(se, { disabled: n.disabled, onSelect: n.onSelect, children: [
                      /* @__PURE__ */ e(r, { name: n.icon, size: 14, className: "zen-mr-2" }),
                      n.label
                    ] }, n.id)) })
                  ] }) }) : null
                ] }),
                /* @__PURE__ */ l("div", { ref: E, className: "zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: [
                  d !== void 0 ? /* @__PURE__ */ e("div", { className: "zen-flex zen-min-w-0 zen-items-center", "data-shellbar-search": "", children: typeof d == "function" ? d({ compact: h }) : d }) : null,
                  D && d === void 0 ? h ? /* @__PURE__ */ e(
                    i,
                    {
                      ref: B,
                      type: "button",
                      variant: "ghost",
                      color: "neutral",
                      size: "sm",
                      shape: "square",
                      "aria-label": f,
                      "aria-expanded": V,
                      onClick: () => S((n) => !n),
                      children: /* @__PURE__ */ e(r, { name: "search", size: 16 })
                    }
                  ) : ve : null,
                  z !== void 0 || A ? /* @__PURE__ */ l("span", { className: "zen-relative zen-flex zen-shrink-0", children: [
                    /* @__PURE__ */ e(
                      i,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "square",
                        "aria-label": z ? o.t("shellbar.notificationsUnread", { count: z }) : o.t("shellbar.notifications"),
                        onClick: A,
                        children: /* @__PURE__ */ e(r, { name: "bell", size: 16 })
                      }
                    ),
                    z ? /* @__PURE__ */ e(
                      "span",
                      {
                        "aria-hidden": "true",
                        className: "zen-pointer-events-none zen-absolute -zen-end-1 -zen-top-1 zen-flex zen-h-4 zen-min-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-error zen-px-1 zen-text-xs zen-font-semibold zen-leading-none zen-text-zen-error-fg",
                        children: z > 99 ? "99+" : z
                      }
                    ) : null
                  ] }) : null,
                  a ? a.menu || a.menuItems && a.menuItems.length > 0 ? /* @__PURE__ */ l(C, { children: [
                    /* @__PURE__ */ e(I, { asChild: !0, children: /* @__PURE__ */ e(
                      i,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "circle",
                        "aria-label": a.name,
                        children: /* @__PURE__ */ l(ne, { size: "sm", children: [
                          a.image ? /* @__PURE__ */ e(ae, { src: a.image, alt: "" }) : null,
                          /* @__PURE__ */ e(le, { children: a.initials ?? re(a.name) })
                        ] })
                      }
                    ) }),
                    /* @__PURE__ */ l(M, { align: "end", children: [
                      /* @__PURE__ */ e(Re, { children: a.name }),
                      /* @__PURE__ */ e(te, {}),
                      a.menu ? a.menu() : K(a.menuItems ?? [])
                    ] })
                  ] }) : /* @__PURE__ */ e(
                    i,
                    {
                      type: "button",
                      variant: "ghost",
                      color: "neutral",
                      size: "sm",
                      shape: "circle",
                      "aria-label": a.name,
                      onClick: a.onClick,
                      children: /* @__PURE__ */ l(ne, { size: "sm", children: [
                        a.image ? /* @__PURE__ */ e(ae, { src: a.image, alt: "" }) : null,
                        /* @__PURE__ */ e(le, { children: a.initials ?? re(a.name) })
                      ] })
                    }
                  ) : null
                ] })
              ] }),
              D && d === void 0 && h && V ? /* @__PURE__ */ l(
                "div",
                {
                  className: "zen-absolute zen-inset-0 zen-z-10 zen-flex zen-items-center zen-gap-2 zen-bg-zen-background",
                  onKeyDown: (n) => {
                    n.key === "Escape" && (n.stopPropagation(), G());
                  },
                  children: [
                    /* @__PURE__ */ l(
                      "form",
                      {
                        role: "search",
                        className: "zen-relative zen-flex zen-flex-1 zen-items-center",
                        onSubmit: _,
                        children: [
                          /* @__PURE__ */ e("label", { htmlFor: `${g}-collapsed`, className: "zen-sr-only", children: f }),
                          /* @__PURE__ */ e(
                            r,
                            {
                              name: "search",
                              size: 14,
                              className: "zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
                            }
                          ),
                          /* @__PURE__ */ e(
                            ee,
                            {
                              id: `${g}-collapsed`,
                              type: "search",
                              autoFocus: !0,
                              value: N,
                              placeholder: f,
                              onChange: (n) => H(n.target.value),
                              className: "zen-h-8 zen-w-full zen-pl-7"
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ e(
                      i,
                      {
                        type: "button",
                        variant: "ghost",
                        color: "neutral",
                        size: "sm",
                        shape: "square",
                        "aria-label": o.t("shellbar.closeSearch"),
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
                  ref: P,
                  "aria-hidden": "true",
                  className: "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0",
                  style: { visibility: "hidden" },
                  children: c.map((n) => R(n, `measure-${n.id}`))
                }
              )
            ]
          }
        )
      }
    );
  }
);
Me.displayName = "ShellBar";
export {
  Me as ShellBar
};
//# sourceMappingURL=index52.js.map
