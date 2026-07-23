import { createComponent as t, template as c, insert as M, memo as O } from "solid-js/web";
import { splitProps as A, createSignal as i, createMemo as a, createEffect as j, Show as C } from "solid-js";
import { Combobox as r } from "./index142.js";
import { cn as m } from "./index103.js";
var B = /* @__PURE__ */ c('<div class="zen-py-1.5 zen-px-2 zen-text-sm zen-text-zen-muted-fg">Loading…'), N = /* @__PURE__ */ c('<div class="zen-py-1.5 zen-px-2 zen-text-sm zen-text-zen-muted-fg">'), P = /* @__PURE__ */ c('<svg width=16 height=16 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden><polyline points="6 9 12 15 18 9">'), D = /* @__PURE__ */ c('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><polyline points="20 6 9 17 4 12">');
const y = "__zen_create__", J = (k) => {
  const [e] = A(k, ["options", "onSearch", "value", "defaultValue", "onValueChange", "placeholder", "searchPlaceholder", "emptyMessage", "debounceMs", "creatable", "onCreate", "createLabel", "width", "disabled", "class"]), u = () => typeof e.onSearch == "function", [L, V] = i([]), [f, b] = i(!1);
  let d, z = 0;
  const [_, w] = i(""), h = a(() => u() ? L() : e.options ?? []), s = () => _().trim(), I = a(() => !!(e.creatable && e.onCreate) && s().length > 0 && !h().some((n) => n.label.trim().toLowerCase() === s().toLowerCase())), g = a(() => I() ? [...h(), {
    value: y,
    label: `${e.createLabel ?? "Create"} “${s()}”`
  }] : h()), v = (n) => {
    if (!e.onSearch) return;
    const o = ++z;
    b(!0), e.onSearch(n).then((l) => {
      o === z && V(l);
    }).finally(() => {
      o === z && b(!1);
    });
  }, S = (n) => {
    w(n), u() && (d && clearTimeout(d), d = setTimeout(() => v(n), e.debounceMs ?? 250));
  };
  j(() => {
    u() && v("");
  });
  const p = () => e.value !== void 0, [$, x] = i(e.defaultValue ?? ""), T = a(() => p() ? e.value : $()), E = a(() => {
    const n = T();
    return g().find((o) => o.value === n) ?? null;
  });
  return t(r, {
    get options() {
      return g();
    },
    optionValue: "value",
    optionTextValue: "label",
    optionLabel: "label",
    optionDisabled: "disabled",
    get value() {
      return E();
    },
    onChange: (n) => {
      if (n?.value === y) {
        const l = e.onCreate?.(s());
        w(""), l && (p() || x(l.value), e.onValueChange?.(l.value, l));
        return;
      }
      const o = n?.value ?? "";
      p() || x(o), e.onValueChange?.(o, n);
    },
    onInputChange: S,
    get disabled() {
      return e.disabled;
    },
    get placeholder() {
      return e.placeholder ?? "Select…";
    },
    itemComponent: (n) => t(r.Item, {
      get item() {
        return n.item;
      },
      get class() {
        return m("zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none", "data-[highlighted]:zen-bg-zen-muted", "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50");
      },
      get children() {
        return [t(r.ItemIndicator, {
          class: "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center",
          get children() {
            return t(R, {});
          }
        }), t(r.ItemLabel, {
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
      return [t(r.Control, {
        get class() {
          return m("zen-inline-flex zen-items-center zen-gap-2 zen-h-10 zen-px-3", "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background", "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2");
        },
        get style() {
          return {
            width: typeof e.width == "number" ? `${e.width}px` : e.width ?? "240px"
          };
        },
        get children() {
          return [t(r.Input, {
            class: "zen-flex-1 zen-min-w-0 zen-bg-transparent zen-border-0 zen-outline-none zen-text-sm placeholder:zen-text-zen-muted-fg",
            get placeholder() {
              return e.searchPlaceholder ?? "Search…";
            }
          }), t(r.Trigger, {
            class: "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg",
            get children() {
              return t(r.Icon, {
                get children() {
                  return t(Q, {});
                }
              });
            }
          })];
        }
      }), t(r.Portal, {
        get children() {
          return t(r.Content, {
            get class() {
              return m("zen-z-50 zen-min-w-44 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md");
            },
            get children() {
              return [t(C, {
                get when() {
                  return f();
                },
                get children() {
                  return B();
                }
              }), t(r.Listbox, {
                class: "zen-max-h-72 zen-overflow-y-auto"
              }), t(C, {
                get when() {
                  return O(() => g().length === 0)() && !f();
                },
                get children() {
                  var n = N();
                  return M(n, () => e.emptyMessage ?? "No results."), n;
                }
              })];
            }
          });
        }
      })];
    }
  });
}, Q = () => P(), R = () => D();
export {
  J as Combobox
};
//# sourceMappingURL=index79.js.map
