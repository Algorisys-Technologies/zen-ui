import { createComponent as a, template as f, effect as o, setStyleProperty as x, insert as w, memo as $, className as k, delegateEvents as B } from "solid-js/web";
import { createSignal as d, createMemo as P, createEffect as E, Show as _ } from "solid-js";
import { normalizeHex as u, toColorOption as L, colorLabel as V } from "./index119.js";
import { Button as j } from "./index5.js";
import { Input as D } from "./index64.js";
import { Popover as H, PopoverTrigger as R, PopoverContent as A } from "./index56.js";
import { ColorPalette as F } from "./index23.js";
import { cn as z } from "./index106.js";
var G = /* @__PURE__ */ f('<span aria-hidden=true class="zen-h-4 zen-w-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border">'), M = /* @__PURE__ */ f("<span>"), N = /* @__PURE__ */ f('<div class="zen-flex zen-items-center zen-gap-2"><label title="Custom colour"><span class=zen-sr-only>Custom colour</span><input type=color class="zen-absolute zen-inset-0 zen-cursor-pointer zen-opacity-0">');
const U = [{
  value: "#ef4444",
  label: "Red"
}, {
  value: "#f97316",
  label: "Orange"
}, {
  value: "#facc15",
  label: "Yellow"
}, {
  value: "#22c55e",
  label: "Green"
}, {
  value: "#3b82f6",
  label: "Blue"
}, {
  value: "#6366f1",
  label: "Indigo"
}, {
  value: "#a855f7",
  label: "Purple"
}, {
  value: "#ec4899",
  label: "Pink"
}, {
  value: "#78716c",
  label: "Stone"
}, {
  value: "#000000",
  label: "Black"
}], ee = (n) => {
  const [y, O] = d(u(n.defaultValue ?? "") ?? ""), v = () => n.value !== void 0, l = P(() => v() ? u(n.value) ?? "" : y()), [m, S] = d(!1), [T, g] = d("");
  E(() => {
    m(), g(l());
  });
  const c = () => n.colors ?? U, i = (e) => {
    const t = u(e);
    t && (v() || O(t), n.onValueChange?.(t));
  }, b = P(() => c().map(L).find((e) => u(e.value) === l()));
  return a(H, {
    get open() {
      return m();
    },
    onOpenChange: S,
    get children() {
      return [a(R, {
        as: j,
        variant: "outline",
        color: "neutral",
        get disabled() {
          return n.disabled;
        },
        get "aria-label"() {
          return n.label ?? "Choose a colour";
        },
        get class() {
          return z("zen-justify-start zen-gap-2 zen-font-normal", n.class);
        },
        get children() {
          return [(() => {
            var e = G();
            return o((t) => x(e, "background-color", l() || "transparent")), e;
          })(), (() => {
            var e = M();
            return w(e, (() => {
              var t = $(() => !!l());
              return () => t() ? $(() => !!b())() ? V(b()) : l() : n.placeholder ?? "Pick a colour";
            })()), o(() => k(e, z(!l() && "zen-text-zen-muted-fg"))), e;
          })()];
        }
      }), a(A, {
        class: "zen-w-auto zen-flex zen-flex-col zen-gap-3",
        get children() {
          return [a(_, {
            get when() {
              return c().length;
            },
            get children() {
              return a(F, {
                get colors() {
                  return c();
                },
                get value() {
                  return l();
                },
                onValueChange: i,
                get label() {
                  return n.label ?? "Choose a colour";
                }
              });
            }
          }), a(_, {
            get when() {
              return n.allowCustom ?? !0;
            },
            get children() {
              var e = N(), t = e.firstChild, I = t.firstChild, s = I.nextSibling;
              return s.$$input = (r) => i(r.currentTarget.value), w(e, a(D, {
                get value() {
                  return T();
                },
                onInput: (r) => {
                  g(r.currentTarget.value), i(r.currentTarget.value);
                },
                placeholder: "#3b82f6",
                "aria-label": "Hex colour",
                spellcheck: !1,
                autocomplete: "off",
                class: "zen-h-8 zen-w-28 zen-font-mono zen-text-xs"
              }), null), o((r) => {
                var h = z("zen-relative zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-cursor-pointer", "zen-items-center zen-justify-center zen-overflow-hidden zen-rounded-zen-sm", "zen-border zen-border-zen-border"), p = l() || "transparent", C = n.disabled;
                return h !== r.e && k(t, r.e = h), p !== r.t && x(t, "background-color", r.t = p), C !== r.a && (s.disabled = r.a = C), r;
              }, {
                e: void 0,
                t: void 0,
                a: void 0
              }), o(() => s.value = l() || "#000000"), e;
            }
          })];
        }
      })];
    }
  });
};
B(["input"]);
export {
  ee as ColorPicker
};
//# sourceMappingURL=index22.js.map
