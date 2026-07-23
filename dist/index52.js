import { createComponent as t, mergeProps as a } from "solid-js/web";
import { splitProps as i } from "solid-js";
import { Tabs as o } from "./index126.js";
import { cva as l } from "./index118.js";
import { cn as s } from "./index106.js";
const p = (n) => {
  const [e, r] = i(n, ["value", "defaultValue", "onChange", "orientation", "activationMode", "disabled", "class", "children"]);
  return t(o, a(r, {
    get value() {
      return e.value;
    },
    get defaultValue() {
      return e.defaultValue;
    },
    get onChange() {
      return e.onChange;
    },
    get orientation() {
      return e.orientation;
    },
    get activationMode() {
      return e.activationMode;
    },
    get disabled() {
      return e.disabled;
    },
    get class() {
      return e.class;
    },
    get children() {
      return e.children;
    }
  }));
}, d = l("zen-inline-flex zen-items-stretch", {
  variants: {
    variant: {
      underline: "zen-border-b zen-border-zen-border zen-w-full zen-gap-1",
      pills: "zen-rounded-zen-md zen-bg-zen-muted zen-p-1 zen-gap-1"
    },
    orientation: {
      // flex-wrap so a horizontal tab list with many tabs wraps to multiple
      // rows instead of overflowing/clipping its container.
      horizontal: "zen-flex-row zen-flex-wrap",
      vertical: "zen-flex-col zen-items-start"
    }
  },
  compoundVariants: [{
    variant: "underline",
    orientation: "vertical",
    class: "zen-border-b-0 zen-border-r zen-border-zen-border"
  }, {
    variant: "pills",
    orientation: "vertical",
    class: "zen-items-stretch"
  }],
  defaultVariants: {
    variant: "underline",
    orientation: "horizontal"
  }
}), f = (n) => {
  const [e, r] = i(n, ["variant", "orientation", "class", "children"]);
  return t(o.List, a(r, {
    get "data-variant"() {
      return e.variant ?? "underline";
    },
    get class() {
      return s(d({
        variant: e.variant,
        orientation: e.orientation
      }), e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, z = l(["zen-inline-flex zen-items-center zen-justify-center zen-whitespace-nowrap", "zen-text-sm zen-font-medium", "zen-border-0 zen-bg-transparent zen-cursor-pointer", "zen-transition-colors", "disabled:zen-opacity-50 disabled:zen-cursor-not-allowed", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset"].join(" "), {
  variants: {
    variant: {
      underline: ["zen-px-3 zen-py-2 -zen-mb-px zen-text-zen-muted-fg", "zen-border-b-2 zen-border-transparent", "hover:zen-text-zen-foreground", "data-[selected]:zen-text-zen-primary data-[selected]:zen-border-zen-primary"].join(" "),
      pills: ["zen-px-3 zen-py-1.5 zen-rounded-zen-sm zen-text-zen-muted-fg", "hover:zen-text-zen-foreground", "data-[selected]:zen-bg-zen-background data-[selected]:zen-text-zen-foreground data-[selected]:zen-shadow-zen-xs"].join(" ")
    }
  },
  defaultVariants: {
    variant: "underline"
  }
}), m = (n) => {
  const [e, r] = i(n, ["variant", "value", "disabled", "class", "children"]);
  return t(o.Trigger, a(r, {
    get value() {
      return e.value;
    },
    get disabled() {
      return e.disabled;
    },
    get class() {
      return s(z({
        variant: e.variant
      }), e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, h = (n) => {
  const [e, r] = i(n, ["value", "class", "children"]);
  return t(o.Content, a(r, {
    get value() {
      return e.value;
    },
    get class() {
      return s("zen-mt-3 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring zen-rounded-zen-sm", e.class);
    },
    get children() {
      return e.children;
    }
  }));
};
export {
  p as Tabs,
  h as TabsContent,
  f as TabsList,
  m as TabsTrigger,
  d as tabsListVariants,
  z as tabsTriggerVariants
};
//# sourceMappingURL=index52.js.map
