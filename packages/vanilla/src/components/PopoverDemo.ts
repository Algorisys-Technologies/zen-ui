import { Popover, type PopoverSide } from "./popover/popover";
import { Button } from "./button/button";
import { Input } from "./form/input/input";
import { DemoPage } from "./demo-helpers";

/**
 * Popover demo. Mirrors the React NewPopoverDemo — basic panel, the side/align
 * matrix with collision-flip, and a separate anchor — adapted to the vanilla
 * factory that takes `trigger` / `anchor` / `children` as data instead of the
 * compound `<PopoverTrigger>` / `<PopoverAnchor>` parts.
 */

function profilePanel(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-gap-2";

  const h4 = document.createElement("h4");
  h4.className = "zen-m-0 zen-text-sm zen-font-semibold";
  h4.textContent = "Profile";

  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  p.textContent = "Sign in to see your account details.";

  wrap.append(h4, p, Button({ size: "sm", children: "Sign in" }).el);
  return wrap;
}

export default function PopoverDemo(): HTMLElement {
  return DemoPage({
    title: "Popover",
    description:
      "An anchored panel on a trigger. Radix gives the React binding positioning, collision handling, focus and dismissal; with no primitive library this one writes them — portal to <body>, place-and-flip, and Escape / click-outside. The compound parts become data on one factory: trigger, anchor and children.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "trigger + children — the compound parts as data",
        codeDescription:
          "React writes <PopoverTrigger asChild><Button/></PopoverTrigger>. With no context to thread a root through, the trigger and the panel body are props on one factory.",
        code: `const pop = Popover({
  trigger: Button({ variant: "outline", color: "neutral", children: "Open popover" }),
  children: profilePanel,   // an <h4>, a <p>, and a Sign in button
});
document.body.append(pop.el);`,
        render: () =>
          Popover({
            trigger: Button({ variant: "outline", color: "neutral", children: "Open popover" }),
            children: profilePanel(),
          }).el,
      },
      {
        title: "2. Side and alignment",
        codeTitle: "side + align, with collision handling for free",
        codeDescription:
          "The panel flips to the opposite side when the preferred one would leave the viewport, so a side is a preference and not a promise. That is the point of the primitive.",
        code: `Popover({
  trigger: Button({ size: "sm", children: "right" }),
  side: "right",
  align: "start",
  class: "zen-w-auto",
  children: sideLabel,
});`,
        render: () =>
          (["top", "right", "bottom", "left"] as const).map((side: PopoverSide) => {
            const label = document.createElement("p");
            label.className = "zen-m-0 zen-text-sm";
            label.textContent = `side="${side}"`;
            return Popover({
              trigger: Button({ variant: "outline", color: "neutral", size: "sm", children: side }),
              side,
              class: "zen-w-auto",
              children: label,
            }).el;
          }),
      },
      {
        title: "3. A separate anchor",
        codeTitle: "anchor — position against something other than the trigger",
        codeDescription:
          "The panel normally hangs off whatever opened it. `anchor` decouples the two, so a button can open a panel that positions against the field it belongs to.",
        code: `Popover({
  anchor: Input({ placeholder: "the panel anchors here" }),
  trigger: Button({ children: "…but this opens it" }),
  align: "start",
  children: note,   // "Anchored to the input, opened by the button."
});`,
        render: () => {
          const note = document.createElement("p");
          note.className = "zen-m-0 zen-text-sm";
          note.textContent = "Anchored to the input, opened by the button.";
          return Popover({
            anchor: Input({ placeholder: "the panel anchors here", class: "zen-max-w-xs" }),
            trigger: Button({
              variant: "outline",
              color: "neutral",
              size: "sm",
              children: "…but this opens it",
            }),
            align: "start",
            children: note,
          }).el;
        },
      },
    ],
  });
}
