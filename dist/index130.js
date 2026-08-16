import { jsxs as N, jsx as f } from "react/jsx-runtime";
import * as v from "react";
import { cn as d } from "./index145.js";
const b = "dots";
function j({
  page: i,
  pageCount: e,
  siblingCount: s = 1,
  boundaryCount: n = 1
}) {
  return v.useMemo(() => {
    const r = (z, t) => Array.from({ length: Math.max(t - z + 1, 0) }, (c, M) => z + M), l = n * 2 + s * 2 + 3;
    if (e <= l) return r(1, e);
    const h = r(1, n), a = r(e - n + 1, e), m = Math.max(
      Math.min(i - s, e - n - s * 2 - 1),
      n + 2
    ), o = Math.min(
      Math.max(i + s, n + s * 2 + 2),
      a.length > 0 ? a[0] - 2 : e - 1
    );
    return [
      ...h,
      m > n + 2 ? b : n + 1,
      ...r(m, o),
      o < e - n - 1 ? b : e - n,
      ...a
    ];
  }, [i, e, s, n]);
}
const x = "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-text-sm zen-transition-colors focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-pointer-events-none disabled:zen-opacity-50", w = v.forwardRef(
  ({
    page: i,
    pageCount: e,
    onPageChange: s,
    siblingCount: n = 1,
    boundaryCount: r = 1,
    hidePrevNext: l = !1,
    className: h,
    ...a
  }, m) => {
    const o = j({ page: i, pageCount: e, siblingCount: n, boundaryCount: r }), z = (t) => {
      const c = Math.min(Math.max(t, 1), e);
      c !== i && s(c);
    };
    return e <= 1 ? null : /* @__PURE__ */ N(
      "nav",
      {
        ref: m,
        "aria-label": "pagination",
        className: d("zen-flex zen-items-center zen-gap-1", h),
        ...a,
        children: [
          !l && /* @__PURE__ */ f(
            "button",
            {
              type: "button",
              className: d(x, "hover:zen-bg-zen-muted"),
              onClick: () => z(i - 1),
              disabled: i <= 1,
              "aria-label": "Go to previous page",
              children: "‹"
            }
          ),
          o.map(
            (t, c) => t === b ? /* @__PURE__ */ f(
              "span",
              {
                "aria-hidden": "true",
                className: "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-px-1 zen-text-zen-muted-fg",
                children: "…"
              },
              `dots-${c}`
            ) : /* @__PURE__ */ f(
              "button",
              {
                type: "button",
                "aria-current": t === i ? "page" : void 0,
                className: d(
                  x,
                  t === i ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg" : "hover:zen-bg-zen-muted"
                ),
                onClick: () => z(t),
                children: t
              },
              t
            )
          ),
          !l && /* @__PURE__ */ f(
            "button",
            {
              type: "button",
              className: d(x, "hover:zen-bg-zen-muted"),
              onClick: () => z(i + 1),
              disabled: i >= e,
              "aria-label": "Go to next page",
              children: "›"
            }
          )
        ]
      }
    );
  }
);
w.displayName = "Pagination";
export {
  w as Pagination,
  j as usePaginationRange
};
//# sourceMappingURL=index130.js.map
