import { createComponent as l, mergeProps as s, memo as a, template as c, spread as z, insert as g } from "solid-js/web";
import { splitProps as i } from "solid-js";
import { cn as o } from "./index106.js";
import { DialogRoot as f, DialogTrigger as m, DialogPortal as u, DialogCloseButton as d, DialogOverlay as D, DialogContent as p, DialogTitle as x, DialogDescription as b } from "./index131.js";
var h = /* @__PURE__ */ c("<div>"), v = /* @__PURE__ */ c('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>');
const P = f, B = m, _ = u, j = d, w = (n) => {
  const [e, r] = i(n, ["class", "children"]);
  return l(D, s(r, {
    get class() {
      return o("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, O = (n) => {
  const [e, r] = i(n, ["class", "children", "showCloseButton"]), t = () => e.showCloseButton ?? !0;
  return l(u, {
    get children() {
      return [l(w, {}), l(p, s(r, {
        get class() {
          return o("zen-fixed zen-left-1/2 zen-top-1/2 zen-z-50 -zen-translate-x-1/2 -zen-translate-y-1/2", "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto", "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg", "focus:zen-outline-none", e.class);
        },
        get children() {
          return [a(() => e.children), a(() => a(() => !!t())() ? l(d, {
            "aria-label": "Close",
            get class() {
              return o("zen-absolute zen-end-3 zen-top-3 zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center", "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg", "hover:zen-text-zen-foreground hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring");
            },
            get children() {
              return l(y, {});
            }
          }) : null)];
        }
      }))];
    }
  });
}, F = (n) => {
  const [e, r] = i(n, ["class", "children"]);
  return (() => {
    var t = h();
    return z(t, s(r, {
      get class() {
        return o("zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3 zen-pe-8", e.class);
      }
    }), !1, !0), g(t, () => e.children), t;
  })();
}, H = (n) => {
  const [e, r] = i(n, ["class", "children"]);
  return (() => {
    var t = h();
    return z(t, s(r, {
      get class() {
        return o("zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5", e.class);
      }
    }), !1, !0), g(t, () => e.children), t;
  })();
}, I = (n) => {
  const [e, r] = i(n, ["class", "children"]);
  return l(x, s(r, {
    get class() {
      return o("zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, R = (n) => {
  const [e, r] = i(n, ["class", "children"]);
  return l(b, s(r, {
    get class() {
      return o("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, y = () => v();
export {
  P as Dialog,
  j as DialogClose,
  O as DialogContent,
  R as DialogDescription,
  H as DialogFooter,
  F as DialogHeader,
  w as DialogOverlay,
  _ as DialogPortal,
  I as DialogTitle,
  B as DialogTrigger
};
//# sourceMappingURL=index57.js.map
