import { Button } from "./button/button";
import { Tooltip, type TooltipSide } from "./tooltip/tooltip";
import { DemoPage } from "./demo-helpers";

/**
 * Vanilla Tooltip demo. Mirrors the React NewTooltipDemo section-for-section,
 * translated to the data-driven factory: one `Tooltip({ trigger, content })`
 * instead of the `<Tooltip><TooltipTrigger><TooltipContent>` compound tree.
 */

/** External-link glyph as a real node — our own trusted markup, never a string. */
function externalLinkIcon(): SVGElement {
  const t = document.createElement("template");
  t.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
  return t.content.firstChild as SVGElement;
}

export default function TooltipDemo(): HTMLElement {
  return DemoPage({
    title: "Tooltip",
    description:
      "Data-driven factory. Positioning, viewport-collision flipping, hover/focus open with a delay, Escape and pointer-down dismissal, and a11y (aria-describedby) are all hand-written — the honest price of having no primitive library. Theming flows through --zen-* CSS variables.",
    sections: [
      {
        title: "1. Basic tooltip",
        codeTitle: "Hover or focus a trigger to open",
        codeDescription:
          "Pass the trigger and the content as data. There is no compound tree and no Provider — the trigger becomes `el`, the bubble is portalled to <body>.",
        code: `const tip = Tooltip({
  trigger: Button({ children: "Hover me" }),
  content: "This is a basic tooltip",
});
document.body.append(tip.el);`,
        render: () =>
          Tooltip({
            trigger: Button({ children: "Hover me" }),
            content: "This is a basic tooltip",
          }).el,
      },
      {
        title: "2. On links and text",
        codeTitle: "Any focusable element can be a trigger",
        codeDescription:
          "A Button rendered as a link, or a plain anchor — the trigger is whatever node you hand it, and it wires hover, focus and aria-describedby onto that node.",
        code: `Tooltip({
  trigger: Button({ variant: "link", color: "success", children: "Hover me" }),
  content: "Tooltip on a link-styled button",
});

Tooltip({
  trigger: anchor, // a plain <a href="#help">
  content: "Plain anchor as the trigger",
});`,
        render: () => {
          const anchor = document.createElement("a");
          anchor.href = "#help";
          anchor.textContent = "Help link";
          anchor.style.color = "var(--zen-color-primary)";
          anchor.style.textDecoration = "underline";
          return [
            Tooltip({
              trigger: Button({ variant: "link", color: "success", children: "Hover me" }),
              content: "Tooltip on a link-styled button",
            }).el,
            Tooltip({ trigger: anchor, content: "Plain anchor as the trigger" }).el,
          ];
        },
      },
      {
        title: "3. With arrow",
        codeTitle: "arrow: true",
        codeDescription:
          "A small square rotated into an arrow, coloured with zen-bg-zen-neutral so it tracks the bubble background. It repositions to whichever side the bubble lands on.",
        code: `Tooltip({
  trigger: Button({ children: "Hover me" }),
  content: "Tooltip with arrow indicator",
  arrow: true,
});`,
        render: () =>
          Tooltip({
            trigger: Button({ children: "Hover me" }),
            content: "Tooltip with arrow indicator",
            arrow: true,
          }).el,
      },
      {
        title: "4. Placement (side)",
        codeTitle: 'side: "top" · "right" · "bottom" · "left"',
        codeDescription:
          "The bubble flips to the opposite side when the preferred one would overflow the viewport. `sideOffset` controls the distance from the trigger.",
        code: `Tooltip({ trigger, content: "Appears above",         side: "top" });
Tooltip({ trigger, content: "Appears to the right",  side: "right" });
Tooltip({ trigger, content: "Appears below",         side: "bottom" });
Tooltip({ trigger, content: "Appears to the left",   side: "left" });`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.display = "grid";
          grid.style.gridTemplateColumns = "repeat(4, 1fr)";
          grid.style.gap = "1rem";
          grid.style.padding = "2.5rem 1.25rem";
          grid.style.justifyItems = "center";
          const cells: Array<[TooltipSide, string, string]> = [
            ["top", "Top", "Appears above"],
            ["right", "Right", "Appears to the right"],
            ["bottom", "Bottom", "Appears below"],
            ["left", "Left", "Appears to the left"],
          ];
          for (const [side, label, content] of cells) {
            grid.append(
              Tooltip({
                trigger: Button({ variant: "outline", children: label }),
                content,
                side,
              }).el,
            );
          }
          return grid;
        },
      },
      {
        title: "5. Controlled open state",
        codeTitle: "open + onOpenChange",
        codeDescription:
          "Present `open` -> controlled: hover only reports through onOpenChange; the caller drives the bubble with update({ open }). Useful when an external action toggles it.",
        code: `let open = false;
const trigger = Button({ children: "Open tooltip" });
const tip = Tooltip({
  trigger,
  content: "Controlled by parent state",
  open,
  onOpenChange: (o) => { open = o; },
});

const toggle = Button({ variant: "outline", children: "Toggle from outside" });
toggle.el.addEventListener("click", () => {
  open = !open;
  tip.update({ open });
  trigger.update({ children: open ? "Close tooltip" : "Open tooltip" });
});`,
        render: () => {
          let open = false;
          const trigger = Button({ children: "Open tooltip" });
          const tip = Tooltip({
            trigger,
            content: "Controlled by parent state",
            open,
            onOpenChange: (o) => {
              open = o;
            },
          });
          const toggle = Button({ variant: "outline", children: "Toggle from outside" });
          toggle.el.addEventListener("click", () => {
            open = !open;
            tip.update({ open });
            trigger.update({ children: open ? "Close tooltip" : "Open tooltip" });
          });
          return [tip.el, toggle.el];
        },
      },
      {
        title: "6. Custom colors",
        codeTitle: "class on the bubble",
        codeDescription:
          "`class` merges last (cn), so it wins over the defaults. Use it for ad-hoc theming; for app-wide overrides set the --zen-* variables on :root.",
        code: `Tooltip({
  trigger: Button({ variant: "outline", children: "Blue" }),
  content: "Custom background color",
  class: "zen-bg-blue-600 zen-text-white",
});

Tooltip({
  trigger: Button({ variant: "outline", children: "Pink" }),
  content: "Pink tooltip with arrow",
  class: "zen-bg-pink-500 zen-text-white",
  arrow: true,
});`,
        render: () => [
          Tooltip({
            trigger: Button({ variant: "outline", children: "Blue" }),
            content: "Custom background color",
            class: "zen-bg-blue-600 zen-text-white",
          }).el,
          Tooltip({
            trigger: Button({ variant: "outline", children: "Pink" }),
            content: "Pink tooltip with arrow",
            class: "zen-bg-pink-500 zen-text-white",
            arrow: true,
          }).el,
        ],
      },
      {
        title: "7. Custom width",
        codeTitle: "max-w-* / min-w-* utilities",
        codeDescription:
          "The bubble defaults to max-width xs (~12.5rem). Override it through `class`.",
        code: `Tooltip({
  trigger: Button({ variant: "outline", children: "Wider" }),
  content: "This tooltip can grow up to roughly 17.5rem wide before wrapping.",
  class: "zen-max-w-md",
});

Tooltip({
  trigger: Button({ variant: "outline", children: "Min-width" }),
  content: "Min-width forces a baseline tooltip size.",
  class: "zen-min-w-[200px]",
});`,
        render: () => [
          Tooltip({
            trigger: Button({ variant: "outline", children: "Wider" }),
            content:
              "This tooltip can grow up to roughly 17.5rem wide before wrapping. Great for medium-length help text or short explanations that need to breathe.",
            class: "zen-max-w-md",
          }).el,
          Tooltip({
            trigger: Button({ variant: "outline", children: "Min-width" }),
            content: "Min-width forces a baseline tooltip size.",
            class: "zen-min-w-[200px]",
          }).el,
        ],
      },
      {
        title: "8. Delays",
        codeTitle: "delayDuration per tooltip",
        codeDescription:
          "React sets delays on TooltipProvider; there is no provider here, so delayDuration is a per-tooltip prop (default 200ms). Focus always opens instantly — only pointer hover waits.",
        code: `// Opens after 700ms of hover
Tooltip({
  trigger: Button({ variant: "outline", children: "Slow tooltip (700ms)" }),
  content: "I take longer to appear",
  delayDuration: 700,
});

// No delay
Tooltip({
  trigger: Button({ variant: "outline", children: "Instant tooltip" }),
  content: "I appear immediately",
  delayDuration: 0,
});`,
        render: () => [
          Tooltip({
            trigger: Button({ variant: "outline", children: "Slow tooltip (700ms)" }),
            content: "I take longer to appear",
            delayDuration: 700,
          }).el,
          Tooltip({
            trigger: Button({ variant: "outline", children: "Instant tooltip" }),
            content: "I appear immediately",
            delayDuration: 0,
          }).el,
        ],
      },
      {
        title: "9. Disabled trigger",
        codeTitle: "Tooltips on disabled buttons",
        codeDescription:
          "A disabled <button> fires no pointer events, so it can never be a trigger. Wrap it in a focusable <span> that owns the tooltip and let the button ignore the pointer. shadcn uses the same pattern.",
        code: `const wrap = document.createElement("span");
wrap.tabIndex = 0;
wrap.setAttribute("aria-disabled", "true");
wrap.style.cursor = "not-allowed";
wrap.style.display = "inline-block";
wrap.append(Button({ disabled: true, children: "Disabled action", style: { pointerEvents: "none" } }).el);

Tooltip({ trigger: wrap, content: "You need permission to do this" });`,
        render: () => {
          const wrap = document.createElement("span");
          wrap.tabIndex = 0;
          wrap.setAttribute("aria-disabled", "true");
          wrap.style.cursor = "not-allowed";
          wrap.style.display = "inline-block";
          wrap.append(
            Button({
              disabled: true,
              children: "Disabled action",
              style: { pointerEvents: "none" },
            }).el,
          );
          return Tooltip({ trigger: wrap, content: "You need permission to do this" }).el;
        },
      },
      {
        title: "10. Composition: link-styled button as an anchor",
        codeTitle: "Tooltip on a Button rendered as an <a>",
        codeDescription:
          "The trigger is a Button rendered with `as: \"a\"` — vanilla's answer to asChild. The tooltip attaches to whatever node comes out.",
        code: `Tooltip({
  trigger: Button({
    as: "a",
    href: "https://algorisys.com",
    target: "_blank",
    rel: "noreferrer",
    variant: "link",
    iconLeft: externalLinkIcon(),
    children: "Open algorisys.com",
  }),
  content: "Opens in a new tab",
});`,
        render: () =>
          Tooltip({
            trigger: Button({
              as: "a",
              href: "https://algorisys.com",
              target: "_blank",
              rel: "noreferrer",
              variant: "link",
              iconLeft: externalLinkIcon(),
              children: "Open algorisys.com",
            }),
            content: "Opens in a new tab",
          }).el,
      },
    ],
  });
}
