import { DemoPage } from "./demo-helpers";

/**
 * Button demo — the web-components port. <zen-button> exposes the whole variant
 * table as attributes (variant / color / size / shape / loading / disabled / as /
 * href …). Icons are JS properties (`el.iconLeft = …`) so they survive `as`
 * composition. Native `click` bubbles from the inner <button> through the host.
 */

const COLORS = ["primary", "neutral", "info", "success", "warning", "error"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

function button(attrs: Record<string, string> = {}, text?: string): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  if (text != null) b.textContent = text;
  return b;
}

function icon(name: string): HTMLElement {
  const i = document.createElement("zen-icon");
  i.setAttribute("name", name);
  return i;
}

export default function ButtonDemo(): HTMLElement {
  return DemoPage({
    title: "Button",
    description:
      "The web-components port of the Button. Same variant table — literally the same object, from @algorisys/zen-ui-core/variants — with `as` in place of asChild.",
    sections: [
      {
        title: "1. Variants",
        codeTitle: 'variant — defaults to "solid"',
        code: `<zen-button>Solid</zen-button>
<zen-button variant="outline">Outline</zen-button>
<zen-button variant="soft">Soft</zen-button>
<zen-button variant="ghost">Ghost</zen-button>
<zen-button variant="link">Link</zen-button>`,
        render: () =>
          (["solid", "outline", "soft", "ghost", "link"] as const).map((variant) =>
            button({ variant }, variant[0].toUpperCase() + variant.slice(1)),
          ),
      },
      {
        title: "2. Colours",
        codeTitle: "All six colour tokens",
        codeDescription:
          "Colours map to --zen-color-* tokens — override those CSS variables to retheme. Nothing here is binding-specific.",
        code: COLORS.map((c) => `<zen-button color="${c}">${c}</zen-button>`).join("\n"),
        render: () => COLORS.map((color) => button({ color }, color)),
      },
      {
        title: "3. Sizes",
        codeTitle: "xs · sm · md · lg · xl",
        code: SIZES.map((s) => `<zen-button size="${s}">${s.toUpperCase()}</zen-button>`).join("\n"),
        render: () => SIZES.map((size) => button({ size }, size.toUpperCase())),
      },
      {
        title: "4. States",
        codeTitle: "loading · disabled · iconLeft",
        codeDescription:
          "While loading, a spinner replaces iconLeft and the button is disabled. Icons are JS properties, not children, so they survive `as` composition.",
        code: `<zen-button loading>Loading</zen-button>
<zen-button disabled>Disabled</zen-button>

<zen-button>With icon</zen-button>
const b = document.querySelector("zen-button");
b.iconLeft = document.createElement("zen-icon"); // name="check"`,
        render: () => {
          const withIcon = button({}, "With icon") as HTMLElement & { iconLeft: HTMLElement };
          withIcon.iconLeft = icon("check");
          return [button({ loading: "" }, "Loading"), button({ disabled: "" }, "Disabled"), withIcon];
        },
      },
      {
        title: "5. In-place update — the thing a framework would re-render",
        description:
          "There is no render loop. Changing an attribute re-applies only what changed; click to watch the same element update its props.",
        codeTitle: "attributes drive targeted DOM writes",
        code: `const btn = document.querySelector("zen-button");
btn.addEventListener("click", () => {
  btn.setAttribute("loading", "");
  setTimeout(() => {
    btn.removeAttribute("loading");
    btn.setAttribute("color", "success");
  }, 900);
});`,
        render: () => {
          const host = document.createElement("span");
          const btn = button({}, "Click me");
          btn.addEventListener("click", () => {
            btn.setAttribute("loading", "");
            setTimeout(() => {
              // The label lives in the light DOM the factory adopted at connect, and
              // this binding exposes no update() handle, so the "Done" relabel swaps
              // in a fresh element; the color flip above is a genuine in-place update.
              const done = button({ color: "success" }, "Done");
              host.replaceChildren(done);
            }, 900);
          });
          host.append(btn);
          return host;
        },
      },
      {
        title: "6. Polymorphic (as)",
        description: "Render the button styles on an <a>. The answer to Radix asChild.",
        codeTitle: "as — no Slot required",
        codeDescription:
          "Radix's Slot exists to merge props onto an unknown child at render time. With no render there is nothing to defer, so the tag is named up front.",
        code: `<zen-button as="a" href="#" variant="outline">Anchor link</zen-button>`,
        render: () => button({ as: "a", href: "#", variant: "outline" }, "Anchor link"),
      },
    ],
  });
}
