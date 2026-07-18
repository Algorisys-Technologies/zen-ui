import { Button } from "./button/button";
import { Icon } from "./icon/icon";
import { DemoPage } from "./demo-helpers";

const COLORS = ["primary", "neutral", "info", "success", "warning", "error"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export default function ButtonDemo(): HTMLElement {
  return DemoPage({
    title: "Button",
    description:
      "The vanilla port of the React Button. Same variant table — literally the same object, from @algorisys/zen-ui-core/variants — with `as` in place of asChild.",
    sections: [
      {
        title: "1. Variants",
        codeTitle: 'variant — defaults to "solid"',
        code: `const solid = Button({ children: "Solid" });
const outline = Button({ variant: "outline", children: "Outline" });
const soft = Button({ variant: "soft", children: "Soft" });

document.body.append(solid.el, outline.el, soft.el);`,
        render: () =>
          (["solid", "outline", "soft", "ghost", "link"] as const).map(
            (variant) => Button({ variant, children: variant[0].toUpperCase() + variant.slice(1) }).el,
          ),
      },
      {
        title: "2. Colours",
        codeTitle: "All six colour tokens",
        codeDescription:
          "Colours map to --zen-color-* tokens — override those CSS variables to retheme. Nothing here is vanilla-specific.",
        code: COLORS.map((c) => `Button({ color: "${c}", children: "${c}" })`).join("\n"),
        render: () => COLORS.map((color) => Button({ color, children: color }).el),
      },
      {
        title: "3. Sizes",
        codeTitle: "xs · sm · md · lg · xl",
        code: SIZES.map((s) => `Button({ size: "${s}", children: "${s.toUpperCase()}" })`).join("\n"),
        render: () => SIZES.map((size) => Button({ size, children: size.toUpperCase() }).el),
      },
      {
        title: "4. States",
        codeTitle: "loading · disabled · iconLeft",
        codeDescription:
          "While loading, a spinner replaces iconLeft and the button is disabled. Icons are props, not children, so they survive `as` composition.",
        code: `const save = Button({ children: "Save" });
save.update({ loading: true });   // no re-render — a targeted DOM write

Button({ disabled: true, children: "Disabled" });
Button({ iconLeft: Icon({ name: "check" }).el, children: "With icon" });`,
        render: () => [
          Button({ loading: true, children: "Loading" }).el,
          Button({ disabled: true, children: "Disabled" }).el,
          Button({ iconLeft: Icon({ name: "check" }), children: "With icon" }).el,
        ],
      },
      {
        title: "5. update() — the thing a framework would re-render",
        description:
          "There is no render loop. update() re-applies only what changed; click to watch the same element change props.",
        codeTitle: "the handle IS the API",
        code: `const btn = Button({ children: "Click me" });
btn.el.addEventListener("click", () => {
  btn.update({ loading: true });
  setTimeout(() => btn.update({ loading: false, color: "success", children: "Done" }), 900);
});`,
        render: () => {
          const btn = Button({ children: "Click me" });
          btn.el.addEventListener("click", () => {
            btn.update({ loading: true });
            setTimeout(() => btn.update({ loading: false, color: "success", children: "Done" }), 900);
          });
          return btn.el;
        },
      },
      {
        title: "6. Polymorphic (as)",
        description: "Render the button styles on an <a>. Vanilla's answer to Radix asChild.",
        codeTitle: "as — no Slot required",
        codeDescription:
          "Radix's Slot exists to merge props onto an unknown child at render time. With no render there is nothing to defer, so the tag is named up front.",
        code: `Button({ as: "a", href: "#", variant: "outline", children: "Anchor link" })`,
        render: () => Button({ as: "a", href: "#", variant: "outline", children: "Anchor link" }).el,
      },
    ],
  });
}
