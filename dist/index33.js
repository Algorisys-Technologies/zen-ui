import { createComponent as l, template as a, use as f, spread as d, mergeProps as z, insert as o, effect as m, className as v, memo as k, delegateEvents as y } from "solid-js/web";
import { splitProps as C, Switch as T, Match as h, Show as g } from "solid-js";
import { cardVariants as E } from "./index32.js";
import { Icon as N } from "./index21.js";
import { Skeleton as R } from "./index35.js";
import { cn as p } from "./index106.js";
var S = /* @__PURE__ */ a('<span class="zen-text-2xl zen-font-semibold zen-leading-none zen-text-zen-foreground">'), B = /* @__PURE__ */ a("<span aria-hidden=true>"), D = /* @__PURE__ */ a('<div class="zen-flex zen-items-start zen-justify-between zen-gap-3"><div class="zen-flex zen-min-w-0 zen-flex-col zen-gap-1.5"><span class="zen-truncate zen-text-sm zen-text-zen-muted-fg">'), L = /* @__PURE__ */ a("<span>"), O = /* @__PURE__ */ a("<a>"), I = /* @__PURE__ */ a("<button type=button>"), P = /* @__PURE__ */ a("<div>");
const _ = {
  primary: "zen-text-zen-primary",
  neutral: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error"
}, j = {
  up: "success",
  down: "error",
  flat: "neutral"
}, A = {
  up: "arrow-up",
  down: "arrow-down",
  flat: "arrow-right"
}, F = {
  up: "Trending up",
  down: "Trending down",
  flat: "Flat"
}, J = (w) => {
  const [e, s] = C(w, ["label", "value", "icon", "color", "trend", "onClick", "href", "loading", "class", "ref"]), $ = () => !!(e.href || e.onClick), x = () => e.color ?? "neutral", c = () => p(
    // The surface is Card's, not a copy of it.
    E({
      variant: "outlined",
      padding: "md"
    }),
    "zen-block zen-w-full zen-text-start",
    $() && "zen-cursor-pointer zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
    e.class
  ), u = () => (() => {
    var n = D(), r = n.firstChild, b = r.firstChild;
    return o(b, () => e.label), o(r, l(g, {
      get when() {
        return !e.loading;
      },
      get fallback() {
        return l(R, {
          class: "zen-h-7 zen-w-24"
        });
      },
      get children() {
        var t = S();
        return o(t, () => e.value), t;
      }
    }), null), o(r, l(g, {
      get when() {
        return k(() => !!e.trend)() && !e.loading;
      },
      get children() {
        return (() => {
          const t = e.trend;
          return (() => {
            var i = L();
            return o(i, l(N, {
              get name() {
                return A[t.direction];
              },
              size: 13,
              get title() {
                return F[t.direction];
              }
            }), null), o(i, () => t.value, null), m(() => v(i, p("zen-inline-flex zen-items-center zen-gap-1 zen-text-xs", _[t.color ?? j[t.direction]]))), i;
          })();
        })();
      }
    }), null), o(n, l(g, {
      get when() {
        return e.icon;
      },
      get children() {
        var t = B();
        return o(t, () => e.icon), m(() => v(t, p("zen-shrink-0", _[x()]))), t;
      }
    }), null), n;
  })();
  return l(T, {
    get fallback() {
      return (() => {
        var n = P(), r = e.ref;
        return typeof r == "function" ? f(r, n) : e.ref = n, d(n, z({
          get class() {
            return c();
          },
          get "aria-busy"() {
            return e.loading || void 0;
          }
        }, s), !1, !0), o(n, l(u, {})), n;
      })();
    },
    get children() {
      return [l(h, {
        get when() {
          return e.href;
        },
        get children() {
          var n = O(), r = e.ref;
          return typeof r == "function" ? f(r, n) : e.ref = n, d(n, z({
            get href() {
              return e.href;
            },
            get class() {
              return c();
            },
            get "aria-busy"() {
              return e.loading || void 0;
            }
          }, s), !1, !0), o(n, l(u, {})), n;
        }
      }), l(h, {
        get when() {
          return e.onClick;
        },
        get children() {
          var n = I();
          n.$$click = () => e.onClick?.();
          var r = e.ref;
          return typeof r == "function" ? f(r, n) : e.ref = n, d(n, z({
            get class() {
              return c();
            },
            get "aria-busy"() {
              return e.loading || void 0;
            }
          }, s), !1, !0), o(n, l(u, {})), n;
        }
      })];
    }
  });
};
y(["click"]);
export {
  J as StatCard
};
//# sourceMappingURL=index33.js.map
