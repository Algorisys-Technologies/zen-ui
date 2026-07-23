import { createComponent as a, mergeProps as m, template as o, insert as t, memo as d, effect as f, className as h } from "solid-js/web";
import { splitProps as p } from "solid-js";
import { RadioGroup as i } from "./index120.js";
import { cn as s } from "./index106.js";
var b = /* @__PURE__ */ o('<div class="zen-flex zen-items-start zen-gap-3"><div class="zen-flex-1 zen-min-w-0"><div class="zen-flex zen-items-center zen-gap-2">'), v = /* @__PURE__ */ o('<svg width=12 height=12 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="20 6 9 17 4 12">'), x = /* @__PURE__ */ o("<span aria-hidden=true>"), _ = /* @__PURE__ */ o("<span class=zen-ml-auto>"), $ = /* @__PURE__ */ o('<div class="zen-text-xs zen-text-zen-muted-fg zen-mt-1 zen-leading-relaxed">');
const I = (u) => {
  const [e, z] = p(u, ["value", "defaultValue", "onChange", "onValueChange", "name", "disabled", "required", "orientation", "class", "children"]);
  return a(i, m(z, {
    get value() {
      return e.value;
    },
    get defaultValue() {
      return e.defaultValue;
    },
    onChange: (l) => {
      e.onChange?.(l), e.onValueChange?.(l);
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
      return s("zen-grid zen-gap-3", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, V = (u) => {
  const [e, z] = p(u, ["value", "title", "icon", "badge", "children", "disabled", "class"]);
  return a(i.Item, m(z, {
    get value() {
      return e.value;
    },
    get disabled() {
      return e.disabled;
    },
    get class() {
      return s(
        "zen-group zen-relative zen-w-full zen-text-start",
        "zen-rounded-zen-md zen-border-2 zen-border-zen-border zen-bg-zen-background",
        "zen-p-4 zen-cursor-pointer zen-transition-colors",
        // hover (only when not selected and not disabled)
        "hover:zen-border-zen-muted-fg",
        // selected — primary ring + soft tint (Kobalte uses data-checked)
        "data-[checked]:zen-border-zen-primary data-[checked]:zen-bg-zen-primary-soft",
        // disabled
        "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50",
        "data-[disabled]:hover:zen-border-zen-border",
        "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
        e.class
      );
    },
    get children() {
      return [a(i.ItemInput, {
        class: "zen-sr-only"
      }), a(i.ItemControl, {
        class: "zen-contents",
        get children() {
          return [(() => {
            var l = b(), c = l.firstChild, g = c.firstChild;
            return t(l, (() => {
              var r = d(() => !!e.icon);
              return () => r() ? (() => {
                var n = x();
                return t(n, () => e.icon), f(() => h(n, s("zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0", "zen-h-8 zen-w-8 zen-rounded-zen-sm", "zen-bg-zen-muted zen-text-zen-muted-fg", "group-data-[checked]:zen-bg-zen-primary group-data-[checked]:zen-text-zen-primary-fg"))), n;
              })() : null;
            })(), c), t(g, (() => {
              var r = d(() => !!e.title);
              return () => r() ? a(i.ItemLabel, {
                class: "zen-text-sm zen-font-semibold zen-text-zen-foreground",
                get children() {
                  return e.title;
                }
              }) : null;
            })(), null), t(g, (() => {
              var r = d(() => !!e.badge);
              return () => r() ? (() => {
                var n = _();
                return t(n, () => e.badge), n;
              })() : null;
            })(), null), t(c, (() => {
              var r = d(() => !!e.children);
              return () => r() ? (() => {
                var n = $();
                return t(n, () => e.children), n;
              })() : null;
            })(), null), l;
          })(), a(i.ItemIndicator, {
            get class() {
              return s("zen-absolute zen-top-2.5 zen-end-2.5", "zen-inline-flex zen-items-center zen-justify-center", "zen-h-5 zen-w-5 zen-rounded-zen-full", "zen-bg-zen-primary zen-text-zen-primary-fg");
            },
            get children() {
              return v();
            }
          })];
        }
      })];
    }
  }));
};
export {
  V as SelectableCard,
  I as SelectableCardGroup
};
//# sourceMappingURL=index34.js.map
