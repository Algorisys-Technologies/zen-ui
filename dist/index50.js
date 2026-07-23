import { createComponent as t, mergeProps as l, memo as d, template as a, insert as u, effect as z, className as g } from "solid-js/web";
import { splitProps as s } from "solid-js";
import { Accordion as o } from "./index124.js";
import { cn as i } from "./index103.js";
var p = /* @__PURE__ */ a('<svg class="zen-acc-chevron zen-transition-transform zen-duration-200 zen-text-zen-muted-fg zen-flex-shrink-0"width=16 height=16 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="6 9 12 15 18 9">'), m = /* @__PURE__ */ a("<div>");
const x = (n) => {
  const [e, r] = s(n, ["value", "defaultValue", "onChange", "multiple", "collapsible", "class", "children"]);
  return t(o, l(r, {
    get value() {
      return e.value;
    },
    get defaultValue() {
      return e.defaultValue;
    },
    get onChange() {
      return e.onChange;
    },
    get multiple() {
      return e.multiple;
    },
    get collapsible() {
      return e.collapsible;
    },
    get class() {
      return e.class;
    },
    get children() {
      return e.children;
    }
  }));
}, C = (n) => {
  const [e, r] = s(n, ["value", "disabled", "class", "children"]);
  return t(o.Item, l(r, {
    get value() {
      return e.value;
    },
    get disabled() {
      return e.disabled;
    },
    get class() {
      return i("zen-border-b zen-border-zen-border last:zen-border-b-0", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, k = (n) => {
  const [e, r] = s(n, ["class", "children"]);
  return t(o.Header, {
    class: "zen-flex",
    get children() {
      return t(o.Trigger, l(r, {
        get class() {
          return i(
            "zen-flex zen-flex-1 zen-items-center zen-justify-between zen-gap-2",
            "zen-py-3 zen-px-1 zen-text-sm zen-font-medium zen-text-start",
            "zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "zen-transition-colors hover:zen-text-zen-foreground",
            "zen-text-zen-foreground",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset zen-rounded-zen-sm",
            // Rotate the trailing chevron when expanded.
            "[&[data-expanded]>svg.zen-acc-chevron]:zen-rotate-180",
            e.class
          );
        },
        get children() {
          return [d(() => e.children), p()];
        }
      }));
    }
  });
}, w = (n) => {
  const [e, r] = s(n, ["class", "children"]);
  return t(o.Content, l(r, {
    style: {
      "--zen-collapsible-content-height": "var(--kb-accordion-content-height)"
    },
    class: "zen-overflow-hidden zen-text-sm data-[closed]:zen-anim-accordion-up data-[expanded]:zen-anim-accordion-down",
    get children() {
      var c = m();
      return u(c, () => e.children), z(() => g(c, i("zen-pb-3 zen-px-1 zen-pt-0 zen-text-zen-foreground", e.class))), c;
    }
  }));
};
export {
  x as Accordion,
  w as AccordionContent,
  C as AccordionItem,
  k as AccordionTrigger
};
//# sourceMappingURL=index50.js.map
