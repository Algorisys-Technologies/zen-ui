import { createComponent as t, template as d, insert as x, effect as L, className as S, setAttribute as j, memo as E, delegateEvents as B } from "solid-js/web";
import { splitProps as M, createSignal as w, createMemo as u, For as N, Show as P } from "solid-js";
import { Combobox as o } from "./index142.js";
import { cn as c } from "./index103.js";
var T = /* @__PURE__ */ d('<div class="zen-py-1.5 zen-px-2 zen-text-sm zen-text-zen-muted-fg">'), A = /* @__PURE__ */ d('<span><span></span><button type=button class="zen-inline-flex zen-items-center zen-justify-center zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer zen-opacity-70 hover:zen-opacity-100"><svg width=10 height=10 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round aria-hidden><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>'), D = /* @__PURE__ */ d('<svg width=16 height=16 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden><polyline points="6 9 12 15 18 9">'), O = /* @__PURE__ */ d('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><polyline points="20 6 9 17 4 12">');
const h = "__zen_create__", J = (y) => {
  const [e] = M(y, ["options", "value", "defaultValue", "onValueChange", "placeholder", "searchPlaceholder", "emptyMessage", "creatable", "onCreate", "createLabel", "width", "disabled", "class"]), g = () => e.value !== void 0, [C, k] = w(e.defaultValue ?? []), z = u(() => g() ? e.value : C()), m = u(() => {
    const n = new Set(z());
    return (e.options ?? []).filter((l) => n.has(l.value));
  }), p = (n) => {
    g() || k(n), e.onValueChange?.(n);
  }, _ = (n) => p(z().filter((l) => l !== n)), [$, b] = w(""), s = () => $().trim(), V = u(() => !!(e.creatable && e.onCreate) && s().length > 0 && !(e.options ?? []).some((n) => n.label.trim().toLowerCase() === s().toLowerCase())), I = u(() => V() ? [...e.options ?? [], {
    value: h,
    label: `${e.createLabel ?? "Create"} “${s()}”`
  }] : e.options ?? []);
  return t(o, {
    multiple: !0,
    get options() {
      return I();
    },
    optionValue: "value",
    optionTextValue: "label",
    optionLabel: "label",
    optionDisabled: "disabled",
    get value() {
      return m();
    },
    onInputChange: b,
    onChange: (n) => {
      const l = n ?? [], i = l.filter((r) => r.value !== h).map((r) => r.value);
      if (!l.some((r) => r.value === h)) {
        p(i);
        return;
      }
      const a = e.onCreate?.(s());
      b(""), p(a && !i.includes(a.value) ? [...i, a.value] : i);
    },
    get disabled() {
      return e.disabled;
    },
    get placeholder() {
      return e.placeholder ?? "Select…";
    },
    itemComponent: (n) => t(o.Item, {
      get item() {
        return n.item;
      },
      get class() {
        return c("zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none", "data-[highlighted]:zen-bg-zen-muted", "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50");
      },
      get children() {
        return [t(o.ItemIndicator, {
          class: "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center",
          get children() {
            return t(q, {});
          }
        }), t(o.ItemLabel, {
          get children() {
            return n.item.rawValue.label;
          }
        })];
      }
    }),
    get class() {
      return e.class;
    },
    get children() {
      return [t(o.Control, {
        get class() {
          return c("zen-inline-flex zen-flex-wrap zen-items-center zen-gap-1 zen-min-h-10 zen-px-2 zen-py-1", "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background", "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2");
        },
        get style() {
          return {
            width: typeof e.width == "number" ? `${e.width}px` : e.width ?? "320px"
          };
        },
        get children() {
          return [t(N, {
            get each() {
              return m();
            },
            children: (n) => (() => {
              var l = A(), i = l.firstChild, a = i.nextSibling;
              return x(i, () => n.label), a.$$click = (r) => {
                r.stopPropagation(), _(n.value);
              }, L((r) => {
                var f = c("zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5 zen-text-xs zen-font-medium", "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"), v = `Remove ${n.label}`;
                return f !== r.e && S(l, r.e = f), v !== r.t && j(a, "aria-label", r.t = v), r;
              }, {
                e: void 0,
                t: void 0
              }), l;
            })()
          }), t(o.Input, {
            class: "zen-flex-1 zen-min-w-[6rem] zen-bg-transparent zen-border-0 zen-outline-none zen-text-sm placeholder:zen-text-zen-muted-fg",
            get placeholder() {
              return E(() => z().length === 0)() ? e.searchPlaceholder ?? "Search…" : "";
            }
          }), t(o.Trigger, {
            class: "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg",
            get children() {
              return t(o.Icon, {
                get children() {
                  return t(R, {});
                }
              });
            }
          })];
        }
      }), t(o.Portal, {
        get children() {
          return t(o.Content, {
            get class() {
              return c("zen-z-50 zen-min-w-44 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md");
            },
            get children() {
              return [t(o.Listbox, {
                class: "zen-max-h-72 zen-overflow-y-auto"
              }), t(P, {
                get when() {
                  return (e.options ?? []).length === 0;
                },
                get children() {
                  var n = T();
                  return x(n, () => e.emptyMessage ?? "No results."), n;
                }
              })];
            }
          });
        }
      })];
    }
  });
}, R = () => D(), q = () => O();
B(["click"]);
export {
  J as MultiCombobox
};
//# sourceMappingURL=index80.js.map
