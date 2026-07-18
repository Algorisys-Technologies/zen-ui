import { DemoPage } from "./demo-helpers";
import type { ToolbarAction } from "@algorisys/zen-ui-vanilla";

/**
 * Mirrors the vanilla ToolbarDemo, rendered through <zen-toolbar>. `actions` is the
 * data collection (set `el.actions = [...]` or author `actions='[…]'` inline);
 * `children` is leading content (a title) slotted as light-DOM children and never
 * overflows. The sections constrain width so the overflow menu actually appears.
 */
const ACTIONS: ToolbarAction[] = [
  { id: "create", label: "Create", icon: "plus", variant: "solid", color: "primary", overflow: "never" },
  { id: "edit", label: "Edit", icon: "edit" },
  { id: "copy", label: "Duplicate", icon: "file" },
  { id: "share", label: "Share", icon: "external-link" },
  { id: "download", label: "Download", icon: "download" },
  { id: "flag", label: "Flag", icon: "flag" },
  { id: "delete", label: "Delete", icon: "trash", color: "error", separatorBefore: true },
];

/** A <zen-toolbar> with ACTIONS set and any leading children slotted in. */
function toolbar(ariaLabel: string, ...children: Node[]): HTMLElement {
  const bar = document.createElement("zen-toolbar");
  bar.setAttribute("aria-label", ariaLabel);
  (bar as unknown as { actions: ToolbarAction[] }).actions = ACTIONS;
  if (children.length) bar.append(...children);
  return bar;
}

const frame = (width: number | null, ...children: Node[]): HTMLElement => {
  const box = document.createElement("div");
  box.className = "zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2";
  if (width === null) box.classList.add("zen-w-full");
  else box.style.width = `${width}px`;
  box.append(...children);
  return box;
};

const heading = (text: string): HTMLElement => {
  const h = document.createElement("h3");
  h.className = "zen-m-0 zen-text-sm zen-font-semibold";
  h.textContent = text;
  return h;
};

export default function ToolbarDemo(): HTMLElement {
  return DemoPage({
    title: "Toolbar",
    description:
      "A row of actions that collapses into an overflow menu when it runs out of room. actions is data rather than children: an overflowed action has to re-render as a menu item, which is a different element than the button it was — the same node cannot be in two places, so the toolbar needs the action's intent to render it either way.",
    sections: [
      {
        title: "1. Full width — everything fits",
        codeTitle: "No overflow when there is room",
        codeDescription:
          "Resize the window: actions collapse into the ••• menu as space runs out.",
        code: `const bar = document.createElement("zen-toolbar");
bar.setAttribute("aria-label", "Order actions");
bar.actions = [
  { id: "create", label: "Create", icon: "plus", variant: "solid", color: "primary", overflow: "never" },
  { id: "edit", label: "Edit", icon: "edit" },
  { id: "delete", label: "Delete", icon: "trash", color: "error", separatorBefore: true },
];
bar.append(heading);   // leading content`,
        render: () =>
          frame(null, toolbar("Order actions (full width)", heading("Orders"))),
      },
      {
        title: "2. Constrained — actions collapse",
        codeTitle: "Same actions, 420px of room",
        codeDescription:
          "Create is pinned with overflow:'never', so it stays on the bar however tight it gets.",
        code: `<div style="width:420px">
  <zen-toolbar aria-label="Order actions"></zen-toolbar>
</div>`,
        render: () => frame(420, toolbar("Order actions (420px)")),
      },
      {
        title: "3. Very narrow — only the pinned action survives",
        codeTitle: "240px",
        codeDescription:
          "Everything collapsible is in the menu; the pinned Create and the ••• trigger remain.",
        code: `<div style="width:240px">
  <zen-toolbar aria-label="Order actions"></zen-toolbar>
</div>`,
        render: () => frame(240, toolbar("Order actions (240px)")),
      },
      {
        title: "4. With leading content",
        codeTitle: "children are leading content and never overflow",
        codeDescription: "A title, a count — whatever names the bar. Only `actions` collapse.",
        code: `<zen-toolbar aria-label="Order actions">
  <h3>Orders</h3>
  <span class="count">128 items</span>
</zen-toolbar>`,
        render: () => {
          const count = document.createElement("span");
          count.className = "zen-text-xs zen-text-zen-muted-fg";
          count.textContent = "128 items";
          return frame(560, toolbar("Order actions (leading)", heading("Orders"), count));
        },
      },
    ],
  });
}
