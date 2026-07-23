import { createComponent as t, Dynamic as s, mergeProps as c, memo as r, template as p } from "solid-js/web";
import { mergeProps as d, splitProps as g, Show as n } from "solid-js";
import { buttonVariants as u } from "./index107.js";
import { cn as m } from "./index106.js";
var h = /* @__PURE__ */ p('<svg class="zen-animate-spin zen-h-4 zen-w-4"xmlns=http://www.w3.org/2000/svg fill=none viewBox="0 0 24 24"aria-hidden=true><circle class=zen-opacity-25 cx=12 cy=12 r=10 stroke=currentColor stroke-width=4></circle><path class=zen-opacity-75 fill=currentColor d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">');
const v = () => h(), z = (o) => {
  const i = d({
    as: "button",
    loading: !1
  }, o), [e, a] = g(i, ["as", "class", "variant", "color", "size", "shape", "multiline", "loading", "disabled", "iconLeft", "iconRight", "children", "type"]), l = () => e.disabled || e.loading;
  return t(s, c({
    get component() {
      return e.as;
    },
    get class() {
      return m(u({
        variant: e.variant,
        color: e.color,
        size: e.size,
        shape: e.shape,
        multiline: e.multiline
      }), e.class);
    },
    get type() {
      return r(() => e.as === "button")() ? e.type ?? "button" : e.type;
    },
    get disabled() {
      return l() || void 0;
    },
    get "aria-busy"() {
      return e.loading || void 0;
    },
    get "data-loading"() {
      return e.loading || void 0;
    }
  }, a, {
    get children() {
      return [t(n, {
        get when() {
          return e.loading;
        },
        get fallback() {
          return e.iconLeft;
        },
        get children() {
          return t(v, {});
        }
      }), r(() => e.children), t(n, {
        get when() {
          return !e.loading;
        },
        get children() {
          return e.iconRight;
        }
      })];
    }
  }));
};
export {
  z as Button,
  u as buttonVariants
};
//# sourceMappingURL=index5.js.map
