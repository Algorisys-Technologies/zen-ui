import { template as i, spread as p, mergeProps as v, insert as t, createComponent as l, effect as h, setAttribute as x, className as $, delegateEvents as _ } from "solid-js/web";
import { splitProps as k, Show as z } from "solid-js";
import { Icon as w } from "./index21.js";
import { cn as f } from "./index106.js";
var C = /* @__PURE__ */ i("<button type=button>"), B = /* @__PURE__ */ i('<span class="zen-inline-flex zen-shrink-0 zen-items-center">'), P = /* @__PURE__ */ i('<p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">'), y = /* @__PURE__ */ i('<div class="zen-flex zen-shrink-0 zen-items-center zen-gap-2">'), L = /* @__PURE__ */ i('<div><div class="zen-flex zen-items-start zen-gap-3"><div class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5"><div class="zen-flex zen-min-w-0 zen-items-center zen-gap-2"><h2 class="zen-m-0 zen-min-w-0 zen-truncate zen-text-xl zen-font-semibold zen-leading-8 zen-text-zen-foreground">');
const I = (d) => {
  const [n, g] = k(d, ["title", "subtitle", "onBack", "backLabel", "actions", "info", "breadcrumb", "class"]);
  return (() => {
    var s = L(), a = s.firstChild, o = a.firstChild, c = o.firstChild, b = c.firstChild;
    return p(s, v({
      get class() {
        return f("zen-flex zen-flex-col zen-gap-2", n.class);
      }
    }, g), !1, !0), t(s, () => n.breadcrumb, a), t(a, l(z, {
      get when() {
        return n.onBack;
      },
      get children() {
        var e = C();
        return e.$$click = () => n.onBack?.(), t(e, l(w, {
          name: "arrow-left",
          size: 18
        })), h((r) => {
          var u = n.backLabel ?? "Back", m = f("zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center", "zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent", "zen-text-zen-muted-fg zen-transition-colors", "hover:zen-bg-zen-muted hover:zen-text-zen-foreground", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring");
          return u !== r.e && x(e, "aria-label", r.e = u), m !== r.t && $(e, r.t = m), r;
        }, {
          e: void 0,
          t: void 0
        }), e;
      }
    }), o), t(b, () => n.title), t(c, l(z, {
      get when() {
        return n.info;
      },
      get children() {
        var e = B();
        return t(e, () => n.info), e;
      }
    }), null), t(o, l(z, {
      get when() {
        return n.subtitle;
      },
      get children() {
        var e = P();
        return t(e, () => n.subtitle), e;
      }
    }), null), t(a, l(z, {
      get when() {
        return n.actions;
      },
      get children() {
        var e = y();
        return t(e, () => n.actions), e;
      }
    }), null), s;
  })();
};
_(["click"]);
export {
  I as PageHeader
};
//# sourceMappingURL=index8.js.map
