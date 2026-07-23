import { createComponent as t, template as g, insert as l, memo as D } from "solid-js/web";
import { createSignal as f, createUniqueId as k, createEffect as O, createMemo as _, Show as a } from "solid-js";
import { Dialog as $, DialogContent as I, DialogTitle as L, DialogDescription as T } from "./index57.js";
import { Button as d } from "./index5.js";
import { SelectSearchField as B, SelectListBody as P } from "./index116.js";
import { filterItems as q } from "./index117.js";
import { cn as A } from "./index106.js";
var j = /* @__PURE__ */ g('<div class="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">'), E = /* @__PURE__ */ g('<div class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2">'), F = /* @__PURE__ */ g('<div class="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">');
const J = (e) => {
  const [m, s] = f(""), [o, u] = f([]), h = k();
  O(() => {
    e.open && (u(e.selectedIds ? [...e.selectedIds] : []), s(""));
  });
  const b = _(() => q(e.items, m(), !!e.onSearch)), z = (n) => {
    e.onConfirm(n), e.onOpenChange(!1);
  }, C = (n) => u((r) => r.includes(n) ? r.filter((c) => c !== n) : [...r, n]), y = (n) => {
    const r = new Set(n), c = e.items.filter((i) => r.has(i.id)).map((i) => i.id), S = new Set(c);
    return [...c, ...n.filter((i) => !S.has(i))];
  }, x = (n) => {
    s(n), e.onSearch?.(n);
  }, v = () => e.searchPlaceholder ?? "Search", w = () => e.showClearAll ?? !0;
  return t($, {
    get open() {
      return e.open;
    },
    get onOpenChange() {
      return e.onOpenChange;
    },
    get children() {
      return t(
        I,
        {
          get class() {
            return A("zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0", e.class);
          },
          get "aria-describedby"() {
            return e.description ? h : void 0;
          },
          get children() {
            return [(() => {
              var n = j();
              return l(n, t(L, {
                class: "zen-pr-8",
                get children() {
                  return e.title;
                }
              }), null), l(n, t(a, {
                get when() {
                  return e.description;
                },
                get children() {
                  return t(T, {
                    id: h,
                    get children() {
                      return e.description;
                    }
                  });
                }
              }), null), l(n, t(a, {
                get when() {
                  return e.searchable ?? !0;
                },
                get children() {
                  return t(B, {
                    get value() {
                      return m();
                    },
                    onValueChange: x,
                    get placeholder() {
                      return v();
                    },
                    class: "zen-mt-1"
                  });
                }
              }), null), n;
            })(), (() => {
              var n = E();
              return l(n, t(P, {
                get items() {
                  return b();
                },
                get multiple() {
                  return e.multiple;
                },
                get selected() {
                  return o();
                },
                onToggle: C,
                onPick: (r) => z([r]),
                get emptyText() {
                  return e.emptyText;
                }
              })), n;
            })(), (() => {
              var n = F();
              return l(n, t(a, {
                get when() {
                  return D(() => !!e.multiple)() && w();
                },
                get children() {
                  return t(d, {
                    type: "button",
                    variant: "ghost",
                    color: "neutral",
                    size: "sm",
                    get disabled() {
                      return o().length === 0;
                    },
                    onClick: () => u([]),
                    class: "zen-mr-auto",
                    get children() {
                      return e.clearLabel ?? "Clear";
                    }
                  });
                }
              }), null), l(n, t(d, {
                type: "button",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: () => e.onOpenChange(!1),
                get children() {
                  return e.cancelLabel ?? "Cancel";
                }
              }), null), l(n, t(a, {
                get when() {
                  return e.multiple;
                },
                get children() {
                  return t(d, {
                    type: "button",
                    size: "sm",
                    onClick: () => z(y(o())),
                    get children() {
                      return e.confirmLabel ?? "OK";
                    }
                  });
                }
              }), null), n;
            })()];
          }
        }
      );
    }
  });
};
export {
  J as SelectDialog
};
//# sourceMappingURL=index15.js.map
