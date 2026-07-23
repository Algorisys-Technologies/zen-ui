import { createComponent as r, template as h, memo as D, insert as p } from "solid-js/web";
import { splitProps as O, createSignal as d, createMemo as L, createEffect as P } from "solid-js";
import { Button as u } from "./index5.js";
import { Popover as $, PopoverTrigger as M, PopoverContent as V } from "./index53.js";
import { Calendar as j } from "./index83.js";
import { cn as B } from "./index103.js";
var S = /* @__PURE__ */ h('<div class="zen-flex zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-3 zen-py-2">'), _ = /* @__PURE__ */ h('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden><rect x=3 y=4 width=18 height=18 rx=2></rect><line x1=16 y1=2 x2=16 y2=6></line><line x1=8 y1=2 x2=8 y2=6></line><line x1=3 y1=10 x2=21 y2=10>');
const g = (l) => !!(l?.from && l?.to), G = (l) => {
  const [n] = O(l, ["value", "defaultValue", "onValueChange", "placeholder", "disabled", "class", "numberOfMonths", "formatDate", "cancelLabel", "doneLabel"]), m = () => n.value !== void 0, [f, i] = d(!1), [b, z] = d(n.defaultValue), t = L(() => m() ? n.value : b()), [a, o] = d(t());
  let s = t();
  P(() => {
    f() || o(t());
  });
  const v = (e) => {
    m() || z(e), n.onValueChange?.(e);
  }, C = (e) => {
    e ? (s = t(), o(t())) : o(s), i(e);
  }, y = () => {
    g(a()) && (v(a()), i(!1));
  }, x = () => {
    o(s), i(!1);
  }, c = (e) => (n.formatDate ?? ((w) => w.toLocaleDateString()))(e), k = () => {
    const e = t();
    return e?.from ? e.to ? `${c(e.from)} – ${c(e.to)}` : c(e.from) : n.placeholder ?? "Pick a date range";
  };
  return r($, {
    get open() {
      return f();
    },
    onOpenChange: C,
    get children() {
      return [r(M, {
        as: u,
        variant: "outline",
        color: "neutral",
        get disabled() {
          return n.disabled === !0;
        },
        get iconLeft() {
          return r(I, {});
        },
        get class() {
          return B("zen-min-w-[16rem] zen-justify-between zen-font-normal", !t()?.from && "zen-text-zen-muted-fg", n.class);
        },
        get children() {
          return k();
        }
      }), r(V, {
        class: "zen-w-auto zen-p-0",
        get children() {
          return [r(j, {
            mode: "range",
            get selected() {
              return a();
            },
            onSelect: o,
            get numberOfMonths() {
              return n.numberOfMonths ?? 2;
            },
            get disabled() {
              return D(() => typeof n.disabled == "function")() ? n.disabled : void 0;
            }
          }), (() => {
            var e = S();
            return p(e, r(u, {
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              onClick: x,
              get children() {
                return n.cancelLabel ?? "Cancel";
              }
            }), null), p(e, r(u, {
              type: "button",
              variant: "solid",
              color: "primary",
              size: "sm",
              onClick: y,
              get disabled() {
                return !g(a());
              },
              get children() {
                return n.doneLabel ?? "Done";
              }
            }), null), e;
          })()];
        }
      })];
    }
  });
}, I = () => _();
export {
  G as DateRangePicker
};
//# sourceMappingURL=index84.js.map
