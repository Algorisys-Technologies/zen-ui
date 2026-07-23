import { createComponent as n, mergeProps as d, memo as t, template as a } from "solid-js/web";
import { splitProps as s, Show as c } from "solid-js";
import { Checkbox as r } from "./index121.js";
import { cn as i } from "./index103.js";
var u = /* @__PURE__ */ a('<svg viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round width=100% height=100%><polyline points="20 6 9 17 4 12">'), z = /* @__PURE__ */ a('<svg viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=3 stroke-linecap=round width=100% height=100%><line x1=6 y1=12 x2=18 y2=12>');
const g = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5"
}, x = (o) => {
  const [e, l] = s(o, ["class", "size", "checked", "defaultChecked", "indeterminate", "onChange", "disabled", "required", "name", "value", "label", "id"]);
  return n(r, d(l, {
    get checked() {
      return e.checked;
    },
    get defaultChecked() {
      return e.defaultChecked;
    },
    get indeterminate() {
      return e.indeterminate;
    },
    get onChange() {
      return e.onChange;
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
    get value() {
      return e.value;
    },
    get class() {
      return i("zen-inline-flex zen-items-center zen-gap-2", e.class);
    },
    get children() {
      return [n(r.Input, {
        get id() {
          return e.id;
        },
        class: "zen-sr-only"
      }), n(r.Control, {
        get class() {
          return i("zen-peer zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50", "data-[checked]:zen-bg-zen-primary data-[checked]:zen-border-zen-primary data-[checked]:zen-text-zen-primary-fg", "data-[indeterminate]:zen-bg-zen-primary data-[indeterminate]:zen-border-zen-primary data-[indeterminate]:zen-text-zen-primary-fg", g[e.size ?? "md"]);
        },
        get children() {
          return n(r.Indicator, {
            class: "zen-flex zen-items-center zen-justify-center zen-text-current zen-h-full zen-w-full",
            get children() {
              return n(c, {
                get when() {
                  return e.indeterminate;
                },
                get fallback() {
                  return n(m, {});
                },
                get children() {
                  return n(h, {});
                }
              });
            }
          });
        }
      }), t(() => t(() => !!e.label)() ? n(r.Label, {
        class: "zen-text-sm",
        get children() {
          return e.label;
        }
      }) : null)];
    }
  }));
}, m = () => u(), h = () => z();
export {
  x as Checkbox
};
//# sourceMappingURL=index46.js.map
