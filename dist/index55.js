import { createComponent as l, mergeProps as o, template as u, spread as c, insert as i } from "solid-js/web";
import { splitProps as s } from "solid-js";
import { cn as a } from "./index103.js";
import { DialogRoot as m, DialogTrigger as f, DialogPortal as g, DialogCloseButton as z, DialogOverlay as D, DialogTitle as h, DialogDescription as p } from "./index128.js";
import { AlertDialogContent as x } from "./index129.js";
var d = /* @__PURE__ */ u("<div>");
const P = m, T = f, $ = g, _ = z, k = z, A = (n) => {
  const [e, r] = s(n, ["class", "children"]);
  return l(D, o(r, {
    get class() {
      return a("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, O = (n) => {
  const [e, r] = s(n, ["class", "children"]);
  return l(g, {
    get children() {
      return [l(A, {}), l(x, o(r, {
        get class() {
          return a("zen-fixed zen-left-1/2 zen-top-1/2 zen-z-50 -zen-translate-x-1/2 -zen-translate-y-1/2", "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto", "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg", "focus:zen-outline-none", e.class);
        },
        get children() {
          return e.children;
        }
      }))];
    }
  });
}, j = (n) => {
  const [e, r] = s(n, ["class", "children"]);
  return (() => {
    var t = d();
    return c(t, o(r, {
      get class() {
        return a("zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3", e.class);
      }
    }), !1, !0), i(t, () => e.children), t;
  })();
}, B = (n) => {
  const [e, r] = s(n, ["class", "children"]);
  return (() => {
    var t = d();
    return c(t, o(r, {
      get class() {
        return a("zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5", e.class);
      }
    }), !1, !0), i(t, () => e.children), t;
  })();
}, F = (n) => {
  const [e, r] = s(n, ["class", "children"]);
  return l(h, o(r, {
    get class() {
      return a("zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, H = (n) => {
  const [e, r] = s(n, ["class", "children"]);
  return l(p, o(r, {
    get class() {
      return a("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", e.class);
    },
    get children() {
      return e.children;
    }
  }));
};
export {
  P as AlertDialog,
  k as AlertDialogAction,
  _ as AlertDialogCancel,
  O as AlertDialogContent,
  H as AlertDialogDescription,
  B as AlertDialogFooter,
  j as AlertDialogHeader,
  A as AlertDialogOverlay,
  $ as AlertDialogPortal,
  F as AlertDialogTitle,
  T as AlertDialogTrigger
};
//# sourceMappingURL=index55.js.map
