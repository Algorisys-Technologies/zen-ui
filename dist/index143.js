import { jsxs as N, jsx as d } from "react/jsx-runtime";
import * as M from "react";
import { useLocale as j } from "./index90.js";
import { cn as h } from "./index160.js";
const v = "dots";
function p({
  page: i,
  pageCount: e,
  siblingCount: s = 1,
  boundaryCount: n = 1
}) {
  return M.useMemo(() => {
    const r = (f, l) => Array.from({ length: Math.max(l - f + 1, 0) }, (t, c) => f + c), o = n * 2 + s * 2 + 3;
    if (e <= o) return r(1, e);
    const x = r(1, n), z = r(e - n + 1, e), m = Math.max(
      Math.min(i - s, e - n - s * 2 - 1),
      n + 2
    ), a = Math.min(
      Math.max(i + s, n + s * 2 + 2),
      z.length > 0 ? z[0] - 2 : e - 1
    );
    return [
      ...x,
      m > n + 2 ? v : n + 1,
      ...r(m, a),
      a < e - n - 1 ? v : e - n,
      ...z
    ];
  }, [i, e, s, n]);
}
const b = "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-text-sm zen-transition-colors focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-pointer-events-none disabled:zen-opacity-50", w = M.forwardRef(
  ({
    page: i,
    pageCount: e,
    onPageChange: s,
    siblingCount: n = 1,
    boundaryCount: r = 1,
    hidePrevNext: o = !1,
    className: x,
    ...z
  }, m) => {
    const a = j(), f = p({ page: i, pageCount: e, siblingCount: n, boundaryCount: r }), l = (t) => {
      const c = Math.min(Math.max(t, 1), e);
      c !== i && s(c);
    };
    return e <= 1 ? null : /* @__PURE__ */ N(
      "nav",
      {
        ref: m,
        "aria-label": a.t("pagination.label"),
        className: h("zen-flex zen-items-center zen-gap-1", x),
        ...z,
        children: [
          !o && /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: h(b, "hover:zen-bg-zen-muted"),
              onClick: () => l(i - 1),
              disabled: i <= 1,
              "aria-label": a.t("pagination.previous"),
              children: "‹"
            }
          ),
          f.map(
            (t, c) => t === v ? /* @__PURE__ */ d(
              "span",
              {
                "aria-hidden": "true",
                className: "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-px-1 zen-text-zen-muted-fg",
                children: "…"
              },
              `dots-${c}`
            ) : /* @__PURE__ */ d(
              "button",
              {
                type: "button",
                "aria-current": t === i ? "page" : void 0,
                className: h(
                  b,
                  t === i ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg" : "hover:zen-bg-zen-muted"
                ),
                onClick: () => l(t),
                children: t
              },
              t
            )
          ),
          !o && /* @__PURE__ */ d(
            "button",
            {
              type: "button",
              className: h(b, "hover:zen-bg-zen-muted"),
              onClick: () => l(i + 1),
              disabled: i >= e,
              "aria-label": a.t("pagination.next"),
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
  p as usePaginationRange
};
//# sourceMappingURL=index143.js.map
