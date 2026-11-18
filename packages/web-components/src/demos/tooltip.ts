import { DemoPage } from "./demo-helpers";

/**
 * Mirrors the vanilla TooltipDemo, rendered through <zen-tooltip>. The `trigger`
 * (the node the bubble anchors to) is set as a JS property — here a <zen-button>
 * or a plain anchor. The bubble body is the element's `content` slot, so it is set
 * as text content. `side`, `arrow`, `side-offset`, `delay-duration` and
 * `default-open` are attributes; `open` is a controlled JS property; onOpenChange
 * maps to zen-open-change.
 *
 * Note: the vanilla `class` prop tinted the portalled bubble. The custom element
 * exposes no `class` passthrough to the bubble, so the "custom colors"/"custom
 * width" sections author the class in the snippet but render with default styling.
 */
function button(attrs: Record<string, string>, label: string): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = label;
  return b;
}

/** External-link glyph as a real node — our own trusted markup, never a string. */
function externalLinkIcon(): SVGElement {
  const t = document.createElement("template");
  t.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
  return t.content.firstChild as SVGElement;
}

interface TipOpts {
  trigger: HTMLElement;
  content: string;
  attrs?: Record<string, string | boolean>;
}

function tooltip(opts: TipOpts): HTMLElement {
  const t = document.createElement("zen-tooltip");
  for (const [k, v] of Object.entries(opts.attrs ?? {})) {
    if (v === false) continue;
    t.setAttribute(k, v === true ? "" : String(v));
  }
  // The bubble body is the `content` slot — a text child is captured as content.
  t.textContent = opts.content;
  (t as unknown as { trigger: HTMLElement }).trigger = opts.trigger;
  return t;
}

export default function TooltipDemo(): HTMLElement {
  return DemoPage({
    title: "Tooltip",
    description:
      "Data-driven element. Positioning, viewport-collision flipping, hover/focus open with a delay, Escape and pointer-down dismissal, and a11y (aria-describedby) are all hand-written — the honest price of having no primitive library. Theming flows through --zen-* CSS variables.",
    sections: [
      {
        title: "1. Basic tooltip",
        codeTitle: "Hover or focus a trigger to open",
        codeDescription:
          "Pass the trigger as a property and the content as the element's text. There is no Provider — the trigger becomes the element, the bubble is portalled to <body>.",
        code: `const tip = document.createElement("zen-tooltip");
tip.textContent = "This is a basic tooltip";
tip.trigger = zenButton;   // a <zen-button>
document.body.append(tip);`,
        render: () =>
          tooltip({ trigger: button({}, "Hover me"), content: "This is a basic tooltip" }),
      },
      {
        title: "2. On links and text",
        codeTitle: "Any focusable element can be a trigger",
        codeDescription:
          "A button rendered as a link, or a plain anchor — the trigger is whatever node you hand it, and it wires hover, focus and aria-describedby onto that node.",
        code: `tip.trigger = zenLinkButton;   // <zen-button variant="link">
tip2.trigger = anchor;         // a plain <a href="#help">`,
        render: () => {
          const anchor = document.createElement("a");
          anchor.href = "#help";
          anchor.textContent = "Help link";
          anchor.style.color = "var(--zen-color-primary)";
          anchor.style.textDecoration = "underline";
          return [
            tooltip({
              trigger: button({ variant: "link", color: "success" }, "Hover me"),
              content: "Tooltip on a link-styled button",
            }),
            tooltip({ trigger: anchor, content: "Plain anchor as the trigger" }),
          ];
        },
      },
      {
        title: "3. With arrow",
        codeTitle: "arrow attribute",
        codeDescription:
          "A small square rotated into an arrow, coloured with zen-bg-zen-neutral so it tracks the bubble background. It repositions to whichever side the bubble lands on.",
        code: `<zen-tooltip arrow>Tooltip with arrow indicator</zen-tooltip>`,
        render: () =>
          tooltip({
            trigger: button({}, "Hover me"),
            content: "Tooltip with arrow indicator",
            attrs: { arrow: true },
          }),
      },
      {
        title: "4. Placement (side)",
        codeTitle: 'side="top" · "right" · "bottom" · "left"',
        codeDescription:
          "The bubble flips to the opposite side when the preferred one would overflow the viewport. `side-offset` controls the distance from the trigger.",
        code: `<zen-tooltip side="top">Appears above</zen-tooltip>
<zen-tooltip side="right">Appears to the right</zen-tooltip>
<zen-tooltip side="bottom">Appears below</zen-tooltip>
<zen-tooltip side="left">Appears to the left</zen-tooltip>`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.display = "grid";
          grid.style.gridTemplateColumns = "repeat(4, 1fr)";
          grid.style.gap = "1rem";
          grid.style.padding = "2.5rem 1.25rem";
          grid.style.justifyItems = "center";
          const cells: Array<[string, string, string]> = [
            ["top", "Top", "Appears above"],
            ["right", "Right", "Appears to the right"],
            ["bottom", "Bottom", "Appears below"],
            ["left", "Left", "Appears to the left"],
          ];
          for (const [side, label, content] of cells) {
            grid.append(
              tooltip({
                trigger: button({ variant: "outline" }, label),
                content,
                attrs: { side },
              }),
            );
          }
          return grid;
        },
      },
      {
        title: "5. Controlled open state",
        codeTitle: "open property + zen-open-change",
        codeDescription:
          "Set `open` -> controlled: hover only reports through zen-open-change; the caller drives the bubble by setting `tip.open`. Useful when an external action toggles it.",
        code: `const tip = document.createElement("zen-tooltip");
tip.textContent = "Controlled by parent state";
tip.trigger = trigger;
tip.open = false;

toggle.addEventListener("click", () => { tip.open = !tip.open; });`,
        render: () => {
          const trigger = button({}, "Open tooltip");
          const tip = tooltip({
            trigger,
            content: "Controlled by parent state",
          });
          let open = false;
          (tip as unknown as { open: boolean }).open = open;
          tip.addEventListener("zen-open-change", (e) => {
            open = (e as CustomEvent<boolean>).detail;
          });
          const toggle = button({ variant: "outline" }, "Toggle from outside");
          toggle.addEventListener("click", () => {
            open = !open;
            (tip as unknown as { open: boolean }).open = open;
          });
          return [tip, toggle];
        },
      },
      {
        title: "6. Custom colors",
        codeTitle: "class on the bubble",
        codeDescription:
          "In the factory bindings a `class` tints the bubble. The custom element renders default styling here; set --zen-* variables for app-wide theming.",
        code: `<zen-tooltip class="zen-bg-blue-600 zen-text-white">Custom background color</zen-tooltip>
<zen-tooltip arrow class="zen-bg-pink-500 zen-text-white">Pink tooltip with arrow</zen-tooltip>`,
        render: () => [
          tooltip({
            trigger: button({ variant: "outline" }, "Blue"),
            content: "Custom background color",
          }),
          tooltip({
            trigger: button({ variant: "outline" }, "Pink"),
            content: "Pink tooltip with arrow",
            attrs: { arrow: true },
          }),
        ],
      },
      {
        title: "7. Custom width",
        codeTitle: "max-w-* / min-w-* utilities",
        codeDescription:
          "The bubble defaults to max-width xs (~12.5rem). In the factory bindings a `class` overrides it.",
        code: `<zen-tooltip class="zen-max-w-md">…longer help text…</zen-tooltip>
<zen-tooltip class="zen-min-w-[200px]">Min-width forces a baseline size.</zen-tooltip>`,
        render: () => [
          tooltip({
            trigger: button({ variant: "outline" }, "Wider"),
            content:
              "This tooltip can grow up to roughly 17.5rem wide before wrapping. Great for medium-length help text or short explanations that need to breathe.",
          }),
          tooltip({
            trigger: button({ variant: "outline" }, "Min-width"),
            content: "Min-width forces a baseline tooltip size.",
          }),
        ],
      },
      {
        title: "8. Delays",
        codeTitle: "delay-duration per tooltip",
        codeDescription:
          "There is no provider here, so delay-duration is a per-tooltip attribute (default 200ms). Focus always opens instantly — only pointer hover waits.",
        code: `<zen-tooltip delay-duration="700">I take longer to appear</zen-tooltip>
<zen-tooltip delay-duration="0">I appear immediately</zen-tooltip>`,
        render: () => [
          tooltip({
            trigger: button({ variant: "outline" }, "Slow tooltip (700ms)"),
            content: "I take longer to appear",
            attrs: { "delay-duration": "700" },
          }),
          tooltip({
            trigger: button({ variant: "outline" }, "Instant tooltip"),
            content: "I appear immediately",
            attrs: { "delay-duration": "0" },
          }),
        ],
      },
      {
        title: "9. Disabled trigger",
        codeTitle: "Tooltips on disabled buttons",
        codeDescription:
          "A disabled <button> fires no pointer events, so it can never be a trigger. Wrap it in a focusable <span> that owns the tooltip and let the button ignore the pointer.",
        code: `const wrap = document.createElement("span");
wrap.tabIndex = 0;
wrap.setAttribute("aria-disabled", "true");
wrap.append(disabledZenButton);   // style="pointer-events:none"
tip.trigger = wrap;`,
        render: () => {
          const wrap = document.createElement("span");
          wrap.tabIndex = 0;
          wrap.setAttribute("aria-disabled", "true");
          wrap.style.cursor = "not-allowed";
          wrap.style.display = "inline-block";
          const disabled = button({ disabled: "" }, "Disabled action");
          disabled.style.pointerEvents = "none";
          wrap.append(disabled);
          return tooltip({ trigger: wrap, content: "You need permission to do this" });
        },
      },
      {
        title: "10. Composition: link-styled button as an anchor",
        codeTitle: "Tooltip on a <zen-button as='a'>",
        codeDescription:
          "The trigger is a <zen-button as=\"a\"> — the element's answer to asChild. The tooltip attaches to whatever node comes out.",
        code: `<zen-button as="a" href="https://algorisys.com" target="_blank"
  rel="noreferrer" variant="link">Open algorisys.com</zen-button>`,
        render: () => {
          const trigger = button(
            {
              as: "a",
              href: "https://algorisys.com",
              target: "_blank",
              rel: "noreferrer",
              variant: "link",
            },
            "Open algorisys.com",
          );
          (trigger as unknown as { iconLeft: SVGElement }).iconLeft = externalLinkIcon();
          return tooltip({ trigger, content: "Opens in a new tab" });
        },
      },
    ],
  });
}
