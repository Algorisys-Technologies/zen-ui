import { createComponent as n, mergeProps as s, template as i } from "solid-js/web";
import { splitProps as u, Show as o } from "solid-js";
import { Select as t } from "./index131.js";
import { cn as l } from "./index103.js";
var z = /* @__PURE__ */ i('<svg width=16 height=16 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden><polyline points="6 9 12 15 18 9">'), c = /* @__PURE__ */ i('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><polyline points="20 6 9 17 4 12">');
const v = (a) => {
  const [e, d] = u(a, ["options", "value", "defaultValue", "onChange", "placeholder", "disabled", "required", "name", "class", "label", "errorMessage", "id"]);
  return n(t, s(d, {
    get options() {
      return e.options;
    },
    optionValue: "value",
    optionTextValue: "label",
    optionDisabled: "disabled",
    get value() {
      return e.options.find((r) => r.value === e.value) ?? null;
    },
    get defaultValue() {
      return e.options.find((r) => r.value === e.defaultValue) ?? void 0;
    },
    onChange: (r) => e.onChange?.(r?.value ?? null),
    get placeholder() {
      return e.placeholder;
    },
    get disabled() {
      return e.disabled;
    },
    get required() {
      return e.required;
    },
    get name() {
      return e.name;
    },
    get validationState() {
      return e.errorMessage ? "invalid" : "valid";
    },
    itemComponent: (r) => n(t.Item, {
      get item() {
        return r.item;
      },
      get class() {
        return l("zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none", "data-[highlighted]:zen-bg-zen-muted", "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50");
      },
      get children() {
        return [n(t.ItemIndicator, {
          class: "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center",
          get children() {
            return n(h, {});
          }
        }), n(t.ItemLabel, {
          get children() {
            return r.item.rawValue.label;
          }
        })];
      }
    }),
    get class() {
      return e.class;
    },
    get children() {
      return [n(o, {
        get when() {
          return e.label;
        },
        get children() {
          return n(t.Label, {
            class: "zen-text-sm zen-font-medium zen-text-zen-foreground zen-block zen-mb-1",
            get children() {
              return e.label;
            }
          });
        }
      }), n(t.HiddenSelect, {}), n(t.Trigger, {
        get id() {
          return e.id;
        },
        get class() {
          return l("zen-flex zen-items-center zen-justify-between zen-gap-2 zen-h-10 zen-px-3 zen-w-full", "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-sm zen-text-zen-foreground", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50", "data-[invalid]:zen-border-zen-error");
        },
        get children() {
          return [n(t.Value, {
            class: "zen-truncate",
            children: (r) => r.selectedOption()?.label ?? null
          }), n(t.Icon, {
            class: "zen-text-zen-muted-fg",
            get children() {
              return n(g, {});
            }
          })];
        }
      }), n(o, {
        get when() {
          return e.errorMessage;
        },
        get children() {
          return n(t.ErrorMessage, {
            class: "zen-text-xs zen-text-zen-error zen-mt-1",
            get children() {
              return e.errorMessage;
            }
          });
        }
      }), n(t.Portal, {
        get children() {
          return n(t.Content, {
            get class() {
              return l("zen-z-50 zen-min-w-32 zen-overflow-hidden", "zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md");
            },
            get children() {
              return n(t.Listbox, {
                class: "zen-overflow-y-auto zen-max-h-72"
              });
            }
          });
        }
      })];
    }
  }));
}, g = () => z(), h = () => c();
export {
  v as Select
};
//# sourceMappingURL=index58.js.map
