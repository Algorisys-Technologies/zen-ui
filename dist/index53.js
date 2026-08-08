import { jsxs as z, jsx as u } from "react/jsx-runtime";
import * as t from "react";
import { cn as I } from "./index143.js";
import { arrowStep as Y } from "./index148.js";
import "./index24.js";
import "./index98.js";
const Z = () => typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, _ = t.forwardRef(
  ({
    sections: i,
    selectedSectionId: a,
    defaultSelectedSectionId: h,
    onSelectedSectionChange: H,
    header: D,
    title: R,
    showAnchorBar: g = !0,
    anchorBarLabel: K = "Object page sections",
    className: P,
    children: k,
    ...V
  }, q) => {
    const v = t.useRef(null), L = t.useRef(null), m = t.useRef(/* @__PURE__ */ new Map()), b = i[0]?.id, [G, j] = t.useState(
      h ?? b
    ), $ = a ?? G, y = t.useRef(
      a ?? h ?? b
    ), N = t.useRef(!1), E = t.useRef(null), A = t.useRef(H);
    t.useEffect(() => {
      A.current = H;
    });
    const w = t.useCallback((e) => {
      j(e), A.current?.(e);
    }, []), [l, O] = t.useState(0);
    t.useLayoutEffect(() => {
      const e = L.current;
      if (!e) {
        O(0);
        return;
      }
      if (O(e.offsetHeight), typeof ResizeObserver > "u") return;
      const n = new ResizeObserver(() => O(e.offsetHeight));
      return n.observe(e), () => n.disconnect();
    }, [g]);
    const [J, Q] = t.useState(0), M = i[i.length - 1]?.id;
    t.useLayoutEffect(() => {
      const e = v.current, n = M ? m.current.get(M) : void 0;
      if (!e || !n) return;
      const o = () => Q(Math.max(0, e.clientHeight - n.offsetHeight - l));
      if (o(), typeof ResizeObserver > "u") return;
      const r = new ResizeObserver(o);
      return r.observe(e), r.observe(n), () => r.disconnect();
    }, [M, l, i]), t.useEffect(() => {
      const e = v.current;
      if (!e || typeof IntersectionObserver > "u") return;
      const n = i.map((s) => m.current.get(s.id)).filter((s) => !!s);
      if (!n.length) return;
      const o = /* @__PURE__ */ new Set(), r = new IntersectionObserver(
        (s) => {
          for (const f of s) {
            const d = f.target.dataset.sectionId;
            d && (f.isIntersecting ? o.add(d) : o.delete(d));
          }
          if (N.current) return;
          const c = i.find((f) => o.has(f.id))?.id;
          !c || c === y.current || (y.current = c, w(c));
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
      return n.forEach((s) => r.observe(s)), E.current = () => {
        n.forEach((s) => {
          r.unobserve(s), r.observe(s);
        });
      }, () => {
        E.current = null, r.disconnect();
      };
    }, [i, l, w]);
    const p = t.useCallback(
      (e, { animate: n, notify: o }) => {
        const r = m.current.get(e), s = v.current;
        if (!r || !s) return;
        y.current = e, o ? w(e) : j(e), N.current = !0;
        let c = 0;
        const f = () => {
          s.removeEventListener("scroll", d), window.clearTimeout(c), N.current = !1, E.current?.();
        }, d = () => {
          window.clearTimeout(c), c = window.setTimeout(f, 120);
        };
        s.addEventListener("scroll", d), c = window.setTimeout(f, 1e3), r.scrollIntoView({
          block: "start",
          behavior: n && !Z() ? "smooth" : "auto"
        });
      },
      [w]
    ), C = t.useRef(!1);
    t.useEffect(() => {
      if (C.current || g && l === 0) return;
      C.current = !0;
      const e = a ?? h;
      !e || e === b || p(e, { animate: !1, notify: !1 });
    }, [l, g, a, h, b, p]), t.useEffect(() => {
      a !== void 0 && a !== y.current && p(a, { animate: !0, notify: !1 });
    }, [a, p]);
    const [U, F] = t.useState(null), W = U ?? $ ?? b, T = t.useRef(/* @__PURE__ */ new Map()), x = (e) => {
      F(e), T.current.get(e)?.focus();
    }, X = (e, n) => {
      const o = i.length - 1, r = Y(e.key, e.currentTarget);
      r === 1 ? (e.preventDefault(), x(i[n === o ? 0 : n + 1].id)) : r === -1 ? (e.preventDefault(), x(i[n === 0 ? o : n - 1].id)) : e.key === "Home" ? (e.preventDefault(), x(i[0].id)) : e.key === "End" && (e.preventDefault(), x(i[o].id));
    };
    return /* @__PURE__ */ z(
      "div",
      {
        ref: q,
        className: I(
          "zen-flex zen-h-full zen-flex-col zen-overflow-hidden zen-bg-zen-background zen-text-zen-foreground",
          P
        ),
        ...V,
        children: [
          R || k ? /* @__PURE__ */ z("div", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-3 zen-border-b zen-border-zen-border zen-px-6 zen-py-3", children: [
            R ? /* @__PURE__ */ u("h2", { className: "zen-m-0 zen-min-w-0 zen-truncate zen-text-base zen-font-semibold", children: R }) : null,
            k ? /* @__PURE__ */ u("div", { className: "zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: k }) : null
          ] }) : null,
          /* @__PURE__ */ z("div", { ref: v, className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto", children: [
            D ? /* @__PURE__ */ u("div", { className: "zen-border-b zen-border-zen-border zen-px-6 zen-py-4", children: D }) : null,
            g ? /* @__PURE__ */ u(
              "nav",
              {
                ref: L,
                "aria-label": K,
                className: "zen-sticky zen-top-0 zen-z-10 zen-flex zen-h-11 zen-items-stretch zen-gap-1 zen-overflow-x-auto zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-4",
                children: i.map((e, n) => {
                  const o = $ === e.id;
                  return /* @__PURE__ */ z(
                    "button",
                    {
                      ref: (r) => {
                        r ? T.current.set(e.id, r) : T.current.delete(e.id);
                      },
                      type: "button",
                      "data-anchor-id": e.id,
                      "aria-current": o ? "true" : void 0,
                      tabIndex: W === e.id ? 0 : -1,
                      onFocus: () => F(e.id),
                      onKeyDown: (r) => X(r, n),
                      onClick: () => p(e.id, { animate: !0, notify: !0 }),
                      className: I(
                        "zen-relative zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-whitespace-nowrap zen-border-0 zen-bg-transparent zen-px-3 zen-text-sm zen-transition-colors",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring",
                        o ? "zen-font-semibold zen-text-zen-primary" : "zen-text-zen-muted-fg hover:zen-text-zen-foreground"
                      ),
                      children: [
                        e.title,
                        o ? /* @__PURE__ */ u(
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
            i.map((e) => /* @__PURE__ */ z(
              "section",
              {
                id: e.id,
                "data-section-id": e.id,
                "aria-labelledby": `${e.id}-title`,
                ref: (n) => {
                  n ? m.current.set(e.id, n) : m.current.delete(e.id);
                },
                style: { scrollMarginTop: l },
                className: "zen-border-b zen-border-zen-border zen-px-6 zen-py-5",
                children: [
                  /* @__PURE__ */ u(
                    "h3",
                    {
                      id: `${e.id}-title`,
                      className: "zen-m-0 zen-mb-3 zen-text-sm zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg",
                      children: e.title
                    }
                  ),
                  e.content,
                  e.subSections?.map((n) => /* @__PURE__ */ z(
                    "section",
                    {
                      id: n.id,
                      "aria-labelledby": `${n.id}-title`,
                      className: "zen-mt-4 zen-border-t zen-border-zen-border zen-pt-4 first:zen-mt-0 first:zen-border-t-0 first:zen-pt-0",
                      children: [
                        /* @__PURE__ */ u("h4", { id: `${n.id}-title`, className: "zen-m-0 zen-mb-2 zen-text-sm zen-font-semibold", children: n.title }),
                        n.content
                      ]
                    },
                    n.id
                  ))
                ]
              },
              e.id
            )),
            /* @__PURE__ */ u("div", { "aria-hidden": "true", style: { height: J } })
          ] })
        ]
      }
    );
  }
);
_.displayName = "ObjectPageLayout";
export {
  _ as ObjectPageLayout
};
//# sourceMappingURL=index53.js.map
