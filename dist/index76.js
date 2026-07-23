import { createComponent as s, template as l, insert as n, effect as m, className as c, setAttribute as b, memo as h } from "solid-js/web";
import { createMemo as $, Show as i, For as v } from "solid-js";
import { Icon as C } from "./index21.js";
import { cn as g } from "./index103.js";
var w = /* @__PURE__ */ l("<ol>"), y = /* @__PURE__ */ l('<p class="zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">'), S = /* @__PURE__ */ l('<p class="zen-mb-2 zen-mt-4 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg first:zen-mt-0">'), k = /* @__PURE__ */ l('<span aria-hidden=true class="zen-absolute zen-top-2 zen-bottom-0 zen-start-[7px] zen-w-px zen-bg-zen-border">'), L = /* @__PURE__ */ l('<time class="zen-text-xs zen-text-zen-muted-fg">'), A = /* @__PURE__ */ l('<p class="zen-m-0 zen-text-sm zen-leading-relaxed zen-text-zen-muted-fg">'), N = /* @__PURE__ */ l("<div class=zen-mt-1>"), T = /* @__PURE__ */ l('<li><div class="zen-flex zen-flex-col zen-gap-0.5"><div class="zen-flex zen-flex-wrap zen-items-baseline zen-gap-x-2"><span class="zen-text-sm zen-font-medium zen-text-zen-foreground">'), x = /* @__PURE__ */ l("<span aria-hidden=true>");
const G = {
  default: "zen-bg-zen-muted-fg",
  info: "zen-bg-zen-info",
  success: "zen-bg-zen-success",
  warning: "zen-bg-zen-warning",
  error: "zen-bg-zen-error"
}, I = {
  default: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error"
}, F = (u) => {
  const p = $(() => (u.items ?? []).map((z, e, r) => ({
    item: z,
    startsGroup: !!z.group && z.group !== r[e - 1]?.group,
    isLast: e === r.length - 1
  }))), d = () => u.density === "compact";
  return s(i, {
    get when() {
      return p().length > 0;
    },
    get fallback() {
      return (() => {
        var z = y();
        return n(z, () => u.emptyMessage ?? "Nothing yet"), z;
      })();
    },
    get children() {
      var z = w();
      return n(z, s(v, {
        get each() {
          return p();
        },
        children: (e) => [s(i, {
          get when() {
            return e.startsGroup;
          },
          get children() {
            var r = S();
            return n(r, () => e.item.group), r;
          }
        }), (() => {
          var r = T(), a = r.firstChild, f = a.firstChild, _ = f.firstChild;
          return n(r, s(i, {
            get when() {
              return !e.isLast;
            },
            get children() {
              return k();
            }
          }), a), n(r, s(i, {
            get when() {
              return e.item.icon;
            },
            get fallback() {
              return (() => {
                var t = x();
                return m(() => c(t, g("zen-absolute zen-start-1 zen-top-1.5 zen-h-2 zen-w-2 zen-rounded-zen-full", G[e.item.state ?? "default"]))), t;
              })();
            },
            children: (t) => (() => {
              var o = x();
              return n(o, s(C, {
                get name() {
                  return t();
                },
                size: 14
              })), m(() => c(o, g("zen-absolute zen-start-0 zen-top-0.5 zen-flex zen-h-4 zen-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-background", I[e.item.state ?? "default"]))), o;
            })()
          }), a), n(_, () => e.item.title), n(f, s(i, {
            get when() {
              return e.item.timestamp;
            },
            get children() {
              var t = L();
              return n(t, () => e.item.timestamp), m(() => b(t, "datetime", e.item.dateTime)), t;
            }
          }), null), n(a, s(i, {
            get when() {
              return h(() => !d())() && e.item.description;
            },
            get children() {
              var t = A();
              return n(t, () => e.item.description), t;
            }
          }), null), n(a, s(i, {
            get when() {
              return h(() => !d())() && e.item.children;
            },
            get children() {
              var t = N();
              return n(t, () => e.item.children), t;
            }
          }), null), m(() => c(r, g("zen-relative zen-ps-8", d() ? "zen-pb-3" : "zen-pb-6"))), r;
        })()]
      })), m(() => c(z, g("zen-m-0 zen-list-none zen-p-0", u.class))), z;
    }
  });
};
export {
  F as Timeline
};
//# sourceMappingURL=index76.js.map
