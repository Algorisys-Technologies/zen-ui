import { createComponent as a, template as g, memo as b, insert as x } from "solid-js/web";
import { splitProps as z, createSignal as S, createMemo as v } from "solid-js";
import { Button as w } from "./index5.js";
import { Popover as y, PopoverTrigger as T, PopoverContent as D } from "./index53.js";
import { Calendar as C } from "./index83.js";
import { TimePicker as $ } from "./index85.js";
import { cn as k } from "./index103.js";
var P = /* @__PURE__ */ g('<div class="zen-flex zen-items-center zen-justify-between zen-gap-3 zen-border-t zen-border-zen-border zen-px-3 zen-py-2.5"><label class="zen-text-xs zen-text-zen-muted-fg">Time'), H = /* @__PURE__ */ g('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden><rect x=3 y=4 width=18 height=18 rx=2></rect><line x1=16 y1=2 x2=16 y2=6></line><line x1=8 y1=2 x2=8 y2=6></line><line x1=3 y1=10 x2=21 y2=10>');
const d = (t) => t.toString().padStart(2, "0"), V = (t, e) => {
  if (!t) return;
  const r = `${d(t.getHours())}:${d(t.getMinutes())}`;
  return e ? `${r}:${d(t.getSeconds())}` : r;
}, L = (t, e) => {
  if (!e) {
    const u = new Date(t);
    return u.setHours(0, 0, 0, 0), u;
  }
  const r = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(e);
  if (!r) return t;
  const l = new Date(t);
  return l.setHours(Number(r[1]), Number(r[2]), r[3] ? Number(r[3]) : 0, 0), l;
}, M = (t) => t.toLocaleDateString(), j = (t, e) => t.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
  hour12: e === "12h"
}), G = (t) => {
  const [e] = z(t, ["value", "defaultValue", "onValueChange", "placeholder", "disabled", "class", "format", "showSeconds", "minuteStep", "formatDate", "formatTime"]), r = () => e.value !== void 0, [l, u] = S(e.defaultValue), o = v(() => r() ? e.value : l()), c = (n) => {
    r() || u(n), e.onValueChange?.(n);
  }, f = (n) => {
    if (!n) {
      c(void 0);
      return;
    }
    if (!o()) {
      const m = new Date(n);
      m.setHours(0, 0, 0, 0), c(m);
      return;
    }
    const i = new Date(n), s = o();
    i.setHours(s.getHours(), s.getMinutes(), s.getSeconds(), s.getMilliseconds()), c(i);
  }, p = (n) => {
    const i = o() ?? /* @__PURE__ */ new Date();
    c(L(i, n));
  }, h = () => {
    const n = o();
    if (!n) return e.placeholder ?? "Pick date & time";
    const i = e.formatDate ?? M, s = e.formatTime ?? j;
    return `${i(n)} ${s(n, e.format ?? "24h")}`;
  };
  return a(y, {
    get children() {
      return [a(T, {
        as: w,
        variant: "outline",
        color: "neutral",
        get disabled() {
          return e.disabled === !0;
        },
        get iconLeft() {
          return a(N, {});
        },
        get class() {
          return k("zen-w-72 zen-justify-between zen-font-normal", !o() && "zen-text-zen-muted-fg", e.class);
        },
        get children() {
          return h();
        }
      }), a(D, {
        class: "zen-w-auto zen-p-0",
        get children() {
          return [a(C, {
            mode: "single",
            get selected() {
              return o();
            },
            onSelect: f,
            get disabled() {
              return b(() => typeof e.disabled == "function")() ? e.disabled : void 0;
            }
          }), (() => {
            var n = P();
            return n.firstChild, x(n, a($, {
              get value() {
                return V(o(), !!e.showSeconds);
              },
              onValueChange: p,
              get format() {
                return e.format ?? "24h";
              },
              get showSeconds() {
                return e.showSeconds;
              },
              get minuteStep() {
                return e.minuteStep ?? 1;
              },
              get disabled() {
                return e.disabled === !0;
              }
            }), null), n;
          })()];
        }
      })];
    }
  });
}, N = () => H();
export {
  G as DateTimePicker
};
//# sourceMappingURL=index86.js.map
