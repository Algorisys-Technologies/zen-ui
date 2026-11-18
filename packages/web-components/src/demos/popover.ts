import { DemoPage } from "./demo-helpers";

/**
 * Popover demo — the web-components port. <zen-popover> takes the compound parts
 * as data: `trigger` and `anchor` are JS properties (element nodes), the panel
 * body is the light-DOM children slot. `side` / `align` are attributes, and
 * `zen-open-change` reports open state.
 */

function button(attrs: Record<string, string>, text: string): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = text;
  return b;
}

function popover(
  trigger: HTMLElement,
  panel: Node,
  opts: { side?: string; align?: string; anchor?: HTMLElement } = {},
): HTMLElement {
  const pop = document.createElement("zen-popover");
  if (opts.side) pop.setAttribute("side", opts.side);
  if (opts.align) pop.setAttribute("align", opts.align);
  (pop as unknown as { trigger: HTMLElement }).trigger = trigger;
  if (opts.anchor) (pop as unknown as { anchor: HTMLElement }).anchor = opts.anchor;
  pop.append(panel);
  return pop;
}

function profilePanel(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-gap-2";

  const h4 = document.createElement("h4");
  h4.className = "zen-m-0 zen-text-sm zen-font-semibold";
  h4.textContent = "Profile";

  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  p.textContent = "Sign in to see your account details.";

  wrap.append(h4, p, button({ size: "sm" }, "Sign in"));
  return wrap;
}

export default function PopoverDemo(): HTMLElement {
  return DemoPage({
    title: "Popover",
    description:
      "An anchored panel on a trigger. Radix gives the React binding positioning, collision handling, focus and dismissal; with no primitive library this one writes them — portal to <body>, place-and-flip, and Escape / click-outside. The compound parts become data on one element: trigger, anchor and the panel body.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "trigger + children — the compound parts as data",
        codeDescription:
          "React writes <PopoverTrigger asChild><Button/></PopoverTrigger>. Here the trigger is a property and the panel body is the light-DOM children.",
        code: `const pop = document.createElement("zen-popover");
pop.trigger = openButton;               // an element node
pop.append(profilePanel());             // the panel body (children)
document.body.append(pop);`,
        render: () =>
          popover(
            button({ variant: "outline", color: "neutral" }, "Open popover"),
            profilePanel(),
          ),
      },
      {
        title: "2. Side and alignment",
        codeTitle: "side + align, with collision handling for free",
        codeDescription:
          "The panel flips to the opposite side when the preferred one would leave the viewport, so a side is a preference and not a promise. That is the point of the primitive.",
        code: `<zen-popover side="right" align="start">
  <p>side="right"</p>
</zen-popover>
<!-- trigger set via el.trigger = … -->`,
        render: () =>
          (["top", "right", "bottom", "left"] as const).map((side) => {
            const label = document.createElement("p");
            label.className = "zen-m-0 zen-text-sm";
            label.textContent = `side="${side}"`;
            return popover(button({ variant: "outline", color: "neutral", size: "sm" }, side), label, {
              side,
            });
          }),
      },
      {
        title: "3. A separate anchor",
        codeTitle: "anchor — position against something other than the trigger",
        codeDescription:
          "The panel normally hangs off whatever opened it. `anchor` decouples the two, so a button can open a panel that positions against the field it belongs to.",
        code: `const pop = document.createElement("zen-popover");
pop.anchor = inputField;                // panel positions against this
pop.trigger = openButton;               // …but this opens it
pop.setAttribute("align", "start");
pop.append(note);`,
        render: () => {
          const note = document.createElement("p");
          note.className = "zen-m-0 zen-text-sm";
          note.textContent = "Anchored to the input, opened by the button.";

          const anchor = document.createElement("zen-input");
          anchor.setAttribute("placeholder", "the panel anchors here");
          anchor.setAttribute("class", "zen-max-w-xs");

          return popover(
            button({ variant: "outline", color: "neutral", size: "sm" }, "…but this opens it"),
            note,
            { align: "start", anchor },
          );
        },
      },
    ],
  });
}
