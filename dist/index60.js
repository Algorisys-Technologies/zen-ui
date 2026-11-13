import { jsxs as m, jsx as u } from "react/jsx-runtime";
import * as t from "react";
import { cn as K } from "./index197.js";
import { arrowStep as te } from "./index205.js";
import "./index28.js";
import "./index110.js";
import { useLocale as re } from "./index90.js";
const C = (r) => `h${Math.min(Math.max(r, 1), 6)}`, oe = (r, c, z) => {
  const h = parseFloat(getComputedStyle(c).scrollMarginTop) || 0, v = c.getBoundingClientRect().top - r.getBoundingClientRect().top + r.scrollTop - h;
  r.scrollTo({ top: v, behavior: z });
}, ie = () => typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, se = t.forwardRef(
  ({
    sections: r,
    selectedSectionId: c,
    defaultSelectedSectionId: z,
    onSelectedSectionChange: h,
    header: v,
    title: k,
    showAnchorBar: y = !0,
    anchorBarLabel: S,
    headingLevel: N = 2,
    className: I,
    children: E,
    ...W
  }, q) => {
    const G = re(), J = S ?? G.t("objectPage.objectPageSections"), Q = C(N), U = C(N + 1), V = C(N + 2), x = t.useRef(null), D = t.useRef(null), b = t.useRef(/* @__PURE__ */ new Map()), p = r[0]?.id, [X, $] = t.useState(
      z ?? p
    ), P = c ?? X, w = t.useRef(
      c ?? z ?? p
    ), M = t.useRef(!1), O = t.useRef(null), A = t.useRef(h);
    t.useEffect(() => {
      A.current = h;
    });
    const R = t.useCallback((e) => {
      $(e), A.current?.(e);
    }, []), [l, j] = t.useState(0);
    t.useLayoutEffect(() => {
      const e = D.current;
      if (!e) {
        j(0);
        return;
      }
      if (j(e.offsetHeight), typeof ResizeObserver > "u") return;
      const n = new ResizeObserver(() => j(e.offsetHeight));
      return n.observe(e), () => n.disconnect();
    }, [y]);
    const [Y, Z] = t.useState(0), H = r[r.length - 1]?.id;
    t.useLayoutEffect(() => {
      const e = x.current, n = H ? b.current.get(H) : void 0;
      if (!e || !n) return;
      const i = () => Z(Math.max(0, e.clientHeight - n.offsetHeight - l));
      if (i(), typeof ResizeObserver > "u") return;
      const o = new ResizeObserver(i);
      return o.observe(e), o.observe(n), () => o.disconnect();
    }, [H, l, r]), t.useEffect(() => {
      const e = x.current;
      if (!e || typeof IntersectionObserver > "u") return;
      const n = r.map((s) => b.current.get(s.id)).filter((s) => !!s);
      if (!n.length) return;
      const i = /* @__PURE__ */ new Set(), o = new IntersectionObserver(
        (s) => {
          for (const f of s) {
            const d = f.target.dataset.sectionId;
            d && (f.isIntersecting ? i.add(d) : i.delete(d));
          }
          if (M.current) return;
          const a = r.find((f) => i.has(f.id))?.id;
          !a || a === w.current || (w.current = a, R(a));
        },
        {
          root: e,
          // The extra pixel is the difference between "at the bottom, the last
          // section is current" and "at the bottom, the second-to-last section
          // is current by a rounding error": at max scroll the last section's
          // top lands exactly on the line, which leaves its predecessor's bottom
          // edge exactly there too. Nudging the line down a pixel decides it.
          rootMargin: `-${l + 1}px 0px 0px 0px`,
          threshold: 0
        }
      );
      return n.forEach((s) => o.observe(s)), O.current = () => {
        n.forEach((s) => {
          o.unobserve(s), o.observe(s);
        });
      }, () => {
        O.current = null, o.disconnect();
      };
    }, [r, l, R]);
    const g = t.useCallback(
      (e, { animate: n, notify: i }) => {
        const o = b.current.get(e), s = x.current;
        if (!o || !s) return;
        w.current = e, i ? R(e) : $(e), M.current = !0;
        let a = 0;
        const f = () => {
          s.removeEventListener("scroll", d), window.clearTimeout(a), M.current = !1, O.current?.();
        }, d = () => {
          window.clearTimeout(a), a = window.setTimeout(f, 120);
        };
        s.addEventListener("scroll", d), a = window.setTimeout(f, 1e3), oe(s, o, n && !ie() ? "smooth" : "auto");
      },
      [R]
    ), F = t.useRef(!1);
    t.useEffect(() => {
      if (F.current || y && l === 0) return;
      F.current = !0;
      const e = c ?? z;
      !e || e === p || g(e, { animate: !1, notify: !1 });
    }, [l, y, c, z, p, g]), t.useEffect(() => {
      c !== void 0 && c !== w.current && g(c, { animate: !0, notify: !1 });
    }, [c, g]);
    const [_, B] = t.useState(null), ee = _ ?? P ?? p, L = t.useRef(/* @__PURE__ */ new Map()), T = (e) => {
      B(e), L.current.get(e)?.focus();
    }, ne = (e, n) => {
      const i = r.length - 1, o = te(e.key, e.currentTarget);
      o === 1 ? (e.preventDefault(), T(r[n === i ? 0 : n + 1].id)) : o === -1 ? (e.preventDefault(), T(r[n === 0 ? i : n - 1].id)) : e.key === "Home" ? (e.preventDefault(), T(r[0].id)) : e.key === "End" && (e.preventDefault(), T(r[i].id));
    };
    return /* @__PURE__ */ m(
      "div",
      {
        ref: q,
        className: K(
          "zen-flex zen-h-full zen-flex-col zen-overflow-hidden zen-bg-zen-background zen-text-zen-foreground",
          I
        ),
        ...W,
        children: [
          k || E ? /* @__PURE__ */ m("div", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-3 zen-border-b zen-border-zen-border zen-px-zen-section-x zen-py-zen-bar-y", children: [
            k ? /* @__PURE__ */ u(Q, { className: "zen-m-0 zen-min-w-0 zen-truncate zen-text-base zen-font-semibold", children: k }) : null,
            E ? /* @__PURE__ */ u("div", { className: "zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: E }) : null
          ] }) : null,
          /* @__PURE__ */ m(
            "div",
            {
              ref: x,
              className: "zen-relative zen-min-h-0 zen-flex-1 zen-overflow-y-auto",
              style: { scrollPaddingTop: l },
              children: [
                v ? /* @__PURE__ */ u("div", { className: "zen-border-b zen-border-zen-border zen-px-zen-section-x zen-py-4", children: v }) : null,
                y ? /* @__PURE__ */ u(
                  "nav",
                  {
                    ref: D,
                    "aria-label": J,
                    className: "zen-sticky zen-top-0 zen-z-10 zen-flex zen-h-zen-anchor-bar zen-items-stretch zen-gap-1 zen-overflow-x-auto zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-4",
                    children: r.map((e, n) => {
                      const i = P === e.id;
                      return /* @__PURE__ */ m(
                        "button",
                        {
                          ref: (o) => {
                            o ? L.current.set(e.id, o) : L.current.delete(e.id);
                          },
                          type: "button",
                          "data-anchor-id": e.id,
                          "aria-current": i ? "true" : void 0,
                          tabIndex: ee === e.id ? 0 : -1,
                          onFocus: () => B(e.id),
                          onKeyDown: (o) => ne(o, n),
                          onClick: () => g(e.id, { animate: !0, notify: !0 }),
                          className: K(
                            "zen-relative zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-whitespace-nowrap zen-border-0 zen-bg-transparent zen-px-3 zen-text-sm zen-transition-colors",
                            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring",
                            i ? "zen-font-semibold zen-text-zen-primary" : "zen-text-zen-muted-fg hover:zen-text-zen-foreground"
                          ),
                          children: [
                            e.title,
                            i ? /* @__PURE__ */ u(
                              "span",
                              {
                                "aria-hidden": "true",
                                className: "zen-absolute zen-inset-x-2 zen-bottom-0 zen-h-0.5 zen-rounded-zen-full zen-bg-zen-primary"
                              }
                            ) : null
                          ]
                        },
                        e.id
                      );
                    })
                  }
                ) : null,
                r.map((e) => /* @__PURE__ */ m(
                  "section",
                  {
                    id: e.id,
                    "data-section-id": e.id,
                    "aria-labelledby": `${e.id}-title`,
                    ref: (n) => {
                      n ? b.current.set(e.id, n) : b.current.delete(e.id);
                    },
                    style: { scrollMarginTop: l },
                    className: "zen-border-b zen-border-zen-border zen-px-zen-section-x zen-py-zen-section-y",
                    children: [
                      /* @__PURE__ */ u(
                        U,
                        {
                          id: `${e.id}-title`,
                          className: "zen-m-0 zen-mb-3 zen-[font-size:var(--zen-object-page-section-title-size)] zen-[line-height:var(--zen-line-height-sm)] zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg",
                          children: e.title
                        }
                      ),
                      e.content,
                      e.subSections?.map((n) => /* @__PURE__ */ m(
                        "section",
                        {
                          id: n.id,
                          "aria-labelledby": `${n.id}-title`,
                          className: "zen-mt-4 zen-border-t zen-border-zen-border zen-pt-4 first:zen-mt-0 first:zen-border-t-0 first:zen-pt-0",
                          children: [
                            /* @__PURE__ */ u(V, { id: `${n.id}-title`, className: "zen-m-0 zen-mb-2 zen-text-sm zen-font-semibold", children: n.title }),
                            n.content
                          ]
                        },
                        n.id
                      ))
                    ]
                  },
                  e.id
                )),
                /* @__PURE__ */ u("div", { "aria-hidden": "true", style: { height: Y } })
              ]
            }
          )
        ]
      }
    );
  }
);
se.displayName = "ObjectPageLayout";
export {
  se as ObjectPageLayout
};
//# sourceMappingURL=index60.js.map
