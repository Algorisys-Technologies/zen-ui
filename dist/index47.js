import { createComponent as n, mergeProps as d, memo as s, template as z, effect as c, className as g } from "solid-js/web";
import { splitProps as u } from "solid-js";
import { RadioGroup as r } from "./index117.js";
import { cn as t } from "./index103.js";
var m = /* @__PURE__ */ z("<span>");
const w = (a) => {
  const [e, l] = u(a, ["class", "value", "defaultValue", "onChange", "name", "disabled", "required", "orientation", "children"]);
  return n(r, d(l, {
    get value() {
      return e.value;
    },
    get defaultValue() {
      return e.defaultValue;
    },
    get onChange() {
      return e.onChange;
    },
    get name() {
      return e.name;
    },
    get disabled() {
      return e.disabled;
    },
    get required() {
      return e.required;
    },
    get orientation() {
      return e.orientation;
    },
    get class() {
      return t(e.orientation === "horizontal" ? "zen-flex zen-gap-3" : "zen-grid zen-gap-2", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, p = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5"
}, b = {
  sm: "zen-h-1.5 zen-w-1.5",
  md: "zen-h-2 zen-w-2",
  lg: "zen-h-2.5 zen-w-2.5"
}, x = (a) => {
  const [e, l] = u(a, ["class", "value", "disabled", "size", "children", "id"]), i = () => e.size ?? "md";
  return n(r.Item, d(l, {
    get value() {
      return e.value;
    },
    get disabled() {
      return e.disabled;
    },
    get class() {
      return t("zen-inline-flex zen-items-center zen-gap-2", e.class);
    },
    get children() {
      return [n(r.ItemInput, {
        get id() {
          return e.id;
        }
      }), n(r.ItemControl, {
        get class() {
          return t("zen-aspect-square zen-rounded-zen-full zen-border zen-border-zen-border zen-text-zen-primary zen-bg-zen-background", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50", "data-[checked]:zen-border-zen-primary", "zen-flex zen-items-center zen-justify-center", p[i()]);
        },
        get children() {
          return n(r.ItemIndicator, {
            get children() {
              var o = m();
              return c(() => g(o, t("zen-block zen-rounded-zen-full zen-bg-zen-primary", b[i()]))), o;
            }
          });
        }
      }), s(() => s(() => !!e.children)() ? n(r.ItemLabel, {
        class: "zen-text-sm",
        get children() {
          return e.children;
        }
      }) : null)];
    }
  }));
};
export {
  w as RadioGroup,
  x as RadioGroupItem
};
//# sourceMappingURL=index47.js.map
