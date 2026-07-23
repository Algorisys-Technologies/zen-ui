import { createComponent as l, mergeProps as z, template as y, spread as k, insert as o, effect as x, className as p, memo as A } from "solid-js/web";
import { splitProps as u, children as I, createMemo as m, For as S, Show as _ } from "solid-js";
import { Image as g } from "./index118.js";
import { cn as s } from "./index103.js";
var d = /* @__PURE__ */ y("<div>");
const $ = {
  xs: "zen-h-6 zen-w-6 zen-text-xs",
  sm: "zen-h-8 zen-w-8 zen-text-xs",
  md: "zen-h-10 zen-w-10 zen-text-sm",
  lg: "zen-h-12 zen-w-12 zen-text-base",
  xl: "zen-h-16 zen-w-16 zen-text-lg"
}, D = (r) => {
  const [e, t] = u(r, ["class", "size", "children", "fallbackDelay"]);
  return l(g, z(t, {
    get fallbackDelay() {
      return e.fallbackDelay;
    },
    get class() {
      return s("zen-relative zen-inline-flex zen-shrink-0 zen-overflow-hidden zen-rounded-zen-full", $[e.size ?? "md"], e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, q = (r) => {
  const [e, t] = u(r, ["class", "src", "alt"]);
  return l(g.Img, z(t, {
    get src() {
      return e.src;
    },
    get alt() {
      return e.alt;
    },
    get class() {
      return s("zen-aspect-square zen-h-full zen-w-full zen-object-cover", e.class);
    }
  }));
}, F = (r) => {
  const [e, t] = u(r, ["class", "children"]);
  return l(g.Fallback, z(t, {
    get class() {
      return s("zen-flex zen-h-full zen-w-full zen-items-center zen-justify-center zen-bg-zen-muted zen-text-zen-muted-fg zen-font-medium", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, P = {
  tight: "-zen-ml-3",
  default: "-zen-ml-2",
  loose: "-zen-ml-1"
}, E = (r) => {
  const [e, t] = u(r, ["class", "max", "spacing", "size", "children"]), v = I(() => e.children), c = m(() => {
    const n = v();
    return Array.isArray(n) ? n : n == null ? [] : [n];
  }), b = m(() => typeof e.max == "number" ? c().slice(0, e.max) : c()), f = m(() => typeof e.max == "number" && c().length > e.max ? c().length - e.max : 0), h = () => P[e.spacing ?? "default"];
  return (() => {
    var n = d();
    return k(n, z(t, {
      get class() {
        return s("zen-flex zen-items-center", e.class);
      }
    }), !1, !0), o(n, l(S, {
      get each() {
        return b();
      },
      children: (a, w) => (() => {
        var i = d();
        return o(i, a), x(() => p(i, s("zen-ring-2 zen-ring-zen-background zen-rounded-zen-full", w() > 0 && h()))), i;
      })()
    }), null), o(n, l(_, {
      get when() {
        return f() > 0;
      },
      get children() {
        var a = d();
        return o(a, l(D, {
          get size() {
            return e.size ?? "md";
          },
          get children() {
            return l(F, {
              get children() {
                return ["+", A(() => f())];
              }
            });
          }
        })), x(() => p(a, s("zen-ring-2 zen-ring-zen-background zen-rounded-zen-full", h()))), a;
      }
    }), null), n;
  })();
};
export {
  D as Avatar,
  F as AvatarFallback,
  E as AvatarGroup,
  q as AvatarImage
};
//# sourceMappingURL=index43.js.map
