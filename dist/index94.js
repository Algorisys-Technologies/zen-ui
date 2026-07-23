import { createComponent as c, template as d, spread as $, mergeProps as w, insert as z, effect as v, className as h, setAttribute as M, delegateEvents as k } from "solid-js/web";
import { splitProps as N, Show as b, For as S, createMemo as _ } from "solid-js";
import { cn as p } from "./index103.js";
var j = /* @__PURE__ */ d('<button type=button aria-label="Go to previous page">‹'), A = /* @__PURE__ */ d('<button type=button aria-label="Go to next page">›'), E = /* @__PURE__ */ d("<nav aria-label=pagination>"), G = /* @__PURE__ */ d("<button type=button>"), T = /* @__PURE__ */ d('<span aria-hidden=true class="zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-px-1 zen-text-zen-muted-fg">…');
const C = "dots", m = (s) => typeof s == "function" ? s() : s;
function B(s) {
  return _(() => {
    const e = m(s.page), u = m(s.pageCount), l = m(s.siblingCount) ?? 1, a = m(s.boundaryCount) ?? 1, o = (x, y) => Array.from({
      length: Math.max(y - x + 1, 0)
    }, (D, P) => x + P), n = a * 2 + l * 2 + 3;
    if (u <= n) return o(1, u);
    const t = o(1, a), r = o(u - a + 1, u), i = Math.max(Math.min(e - l, u - a - l * 2 - 1), a + 2), g = Math.min(Math.max(e + l, a + l * 2 + 2), r.length > 0 ? r[0] - 2 : u - 1);
    return [...t, i > a + 2 ? C : a + 1, ...o(i, g), g < u - a - 1 ? C : u - a, ...r];
  });
}
const f = "zen-inline-flex zen-h-9 zen-min-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-text-sm zen-transition-colors focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-pointer-events-none disabled:zen-opacity-50", q = (s) => {
  const [e, u] = N(s, ["page", "pageCount", "onPageChange", "siblingCount", "boundaryCount", "hidePrevNext", "class"]), l = B({
    page: () => e.page,
    pageCount: () => e.pageCount,
    siblingCount: () => e.siblingCount,
    boundaryCount: () => e.boundaryCount
  }), a = (o) => {
    const n = Math.min(Math.max(o, 1), e.pageCount);
    n !== e.page && e.onPageChange(n);
  };
  return c(b, {
    get when() {
      return e.pageCount > 1;
    },
    get children() {
      var o = E();
      return $(o, w({
        get class() {
          return p("zen-flex zen-items-center zen-gap-1", e.class);
        }
      }, u), !1, !0), z(o, c(b, {
        get when() {
          return !e.hidePrevNext;
        },
        get children() {
          var n = j();
          return n.$$click = () => a(e.page - 1), v((t) => {
            var r = p(f, "hover:zen-bg-zen-muted"), i = e.page <= 1;
            return r !== t.e && h(n, t.e = r), i !== t.t && (n.disabled = t.t = i), t;
          }, {
            e: void 0,
            t: void 0
          }), n;
        }
      }), null), z(o, c(S, {
        get each() {
          return l();
        },
        children: (n) => c(b, {
          when: n !== C,
          get fallback() {
            return T();
          },
          get children() {
            var t = G();
            return t.$$click = () => a(n), z(t, n), v((r) => {
              var i = n === e.page ? "page" : void 0, g = p(f, n === e.page ? "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg" : "hover:zen-bg-zen-muted");
              return i !== r.e && M(t, "aria-current", r.e = i), g !== r.t && h(t, r.t = g), r;
            }, {
              e: void 0,
              t: void 0
            }), t;
          }
        })
      }), null), z(o, c(b, {
        get when() {
          return !e.hidePrevNext;
        },
        get children() {
          var n = A();
          return n.$$click = () => a(e.page + 1), v((t) => {
            var r = p(f, "hover:zen-bg-zen-muted"), i = e.page >= e.pageCount;
            return r !== t.e && h(n, t.e = r), i !== t.t && (n.disabled = t.t = i), t;
          }, {
            e: void 0,
            t: void 0
          }), n;
        }
      }), null), o;
    }
  });
};
k(["click"]);
export {
  q as Pagination,
  B as usePaginationRange
};
//# sourceMappingURL=index94.js.map
