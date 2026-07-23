import { createComponent as n, mergeProps as z, memo as l } from "solid-js/web";
import { splitProps as d } from "solid-js";
import { Switch as t } from "./index120.js";
import { cn as r } from "./index103.js";
const c = {
  sm: "zen-h-4 zen-w-7",
  md: "zen-h-5 zen-w-9",
  lg: "zen-h-6 zen-w-11"
}, o = {
  sm: "zen-h-3 zen-w-3 data-[checked]:zen-translate-x-3 zen-translate-x-0.5",
  md: "zen-h-4 zen-w-4 data-[checked]:zen-translate-x-4 zen-translate-x-0.5",
  lg: "zen-h-5 zen-w-5 data-[checked]:zen-translate-x-5 zen-translate-x-0.5"
}, b = (s) => {
  const [e, i] = d(s, ["class", "id", "size", "checked", "defaultChecked", "onChange", "disabled", "required", "name", "value", "label"]), a = () => e.size ?? "md";
  return (
    // `id` is deliberately NOT forwarded here — it's routed to KSwitch.Input
    // below so `<label for>` targets the actual native input, not this
    // wrapping group div (Kobalte generates the Input's id from the root's,
    // which would produce a different string than what the caller passed).
    n(t, z(i, {
      get checked() {
        return e.checked;
      },
      get defaultChecked() {
        return e.defaultChecked;
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
        return r("zen-inline-flex zen-items-center zen-gap-2", e.class);
      },
      get children() {
        return [n(t.Input, {
          get id() {
            return e.id;
          }
        }), n(t.Control, {
          get class() {
            return r("zen-peer zen-inline-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-full", "zen-transition-colors", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50", "data-[checked]:zen-bg-zen-primary zen-bg-zen-muted", c[a()]);
          },
          get children() {
            return n(t.Thumb, {
              get class() {
                return r("zen-block zen-rounded-zen-full zen-bg-zen-background zen-shadow-md zen-ring-0", "zen-transition-transform", o[a()]);
              }
            });
          }
        }), l(() => l(() => !!e.label)() ? n(t.Label, {
          class: "zen-text-sm",
          get children() {
            return e.label;
          }
        }) : null)];
      }
    }))
  );
};
export {
  b as Switch
};
//# sourceMappingURL=index45.js.map
