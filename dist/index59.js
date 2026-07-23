import { createComponent as o, mergeProps as s, memo as a, template as z, spread as d, insert as c } from "solid-js/web";
import { splitProps as i } from "solid-js";
import { cva as m } from "./index118.js";
import { cn as l } from "./index106.js";
import { DialogRoot as f, DialogTrigger as x, DialogCloseButton as u, DialogPortal as h, DialogOverlay as p, DialogContent as b, DialogTitle as v, DialogDescription as w } from "./index131.js";
var C = /* @__PURE__ */ z('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2.5 stroke-linecap=round stroke-linejoin=round aria-hidden><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>'), g = /* @__PURE__ */ z("<div>");
const T = f, _ = x, $ = u, O = h, y = (n) => {
  const [e, t] = i(n, ["class", "children"]);
  return o(p, s(t, {
    get class() {
      return l("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/40", "data-[expanded]:zen-anim-fade-in", "data-[closed]:zen-anim-fade-out", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, D = m(["zen-fixed zen-z-50 zen-flex zen-flex-col zen-gap-4 zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg", "zen-transition zen-ease-in-out", "focus-visible:zen-outline-none"].join(" "), {
  variants: {
    side: {
      right: ["zen-inset-y-0 zen-right-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-l zen-border-zen-border", "data-[expanded]:zen-anim-slide-in-right", "data-[closed]:zen-anim-slide-out-right"].join(" "),
      left: ["zen-inset-y-0 zen-left-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-r zen-border-zen-border", "data-[expanded]:zen-anim-slide-in-left", "data-[closed]:zen-anim-slide-out-left"].join(" "),
      top: ["zen-inset-x-0 zen-top-0 zen-w-full zen-max-h-[80vh] zen-border-b zen-border-zen-border", "data-[expanded]:zen-anim-slide-in-top", "data-[closed]:zen-anim-slide-out-top"].join(" "),
      bottom: ["zen-inset-x-0 zen-bottom-0 zen-w-full zen-max-h-[80vh] zen-border-t zen-border-zen-border", "zen-rounded-t-zen-lg", "data-[expanded]:zen-anim-slide-in-bottom", "data-[closed]:zen-anim-slide-out-bottom"].join(" ")
    }
  },
  defaultVariants: {
    side: "right"
  }
}), V = (n) => {
  const [e, t] = i(n, ["class", "side", "showCloseButton", "children"]), r = () => e.showCloseButton ?? !0;
  return o(h, {
    get children() {
      return [o(y, {}), o(b, s(t, {
        get class() {
          return l(D({
            side: e.side
          }), e.class);
        },
        get children() {
          return [a(() => e.children), a(() => a(() => !!r())() ? o(u, {
            "aria-label": "Close sheet",
            get class() {
              return l("zen-absolute zen-top-3 zen-end-3 zen-inline-flex zen-items-center zen-justify-center", "zen-h-7 zen-w-7 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer", "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring");
            },
            get children() {
              return C();
            }
          }) : null)];
        }
      }))];
    }
  });
}, F = (n) => {
  const [e, t] = i(n, ["class", "children"]);
  return (() => {
    var r = g();
    return d(r, s(t, {
      get class() {
        return l("zen-flex zen-flex-col zen-gap-1.5", e.class);
      }
    }), !1, !0), c(r, () => e.children), r;
  })();
}, H = (n) => {
  const [e, t] = i(n, ["class", "children"]);
  return (() => {
    var r = g();
    return d(r, s(t, {
      get class() {
        return l("zen-mt-auto zen-flex zen-flex-col-reverse zen-gap-2 sm:zen-flex-row sm:zen-justify-end", e.class);
      }
    }), !1, !0), c(r, () => e.children), r;
  })();
}, R = (n) => {
  const [e, t] = i(n, ["class", "children"]);
  return o(v, s(t, {
    get class() {
      return l("zen-text-base zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-m-0", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, q = (n) => {
  const [e, t] = i(n, ["class", "children"]);
  return o(w, s(t, {
    get class() {
      return l("zen-text-sm zen-text-zen-muted-fg zen-m-0", e.class);
    },
    get children() {
      return e.children;
    }
  }));
};
export {
  T as Sheet,
  $ as SheetClose,
  V as SheetContent,
  q as SheetDescription,
  H as SheetFooter,
  F as SheetHeader,
  y as SheetOverlay,
  O as SheetPortal,
  R as SheetTitle,
  _ as SheetTrigger,
  D as sheetContentVariants
};
//# sourceMappingURL=index59.js.map
