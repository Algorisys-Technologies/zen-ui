import { DemoPage } from "./demo-helpers";
import { Toolbar, type ToolbarAction } from "./toolbar/toolbar";

/**
 * Toolbar demo. The sections deliberately constrain width, because the whole
 * point of the component only shows up when the actions do not fit. Mirrors the
 * React demo (NewToolbarDemo.tsx): same four sections, same snippets.
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
        code: `const actions: ToolbarAction[] = [
  { id: "create", label: "Create", icon: "plus", variant: "solid", color: "primary", overflow: "never" },
  { id: "edit", label: "Edit", icon: "edit" },
  { id: "delete", label: "Delete", icon: "trash", color: "error", separatorBefore: true },
];

const bar = Toolbar({ actions, "aria-label": "Order actions", children: heading("Orders") });
host.append(bar.el);`,
        render: () =>
          frame(
            null,
            Toolbar({
              actions: ACTIONS,
              "aria-label": "Order actions (full width)",
              children: heading("Orders"),
            }).el,
          ),
      },
      {
        title: "2. Constrained — actions collapse",
        codeTitle: "Same actions, 420px of room",
        codeDescription:
          "Create is pinned with overflow:'never', so it stays on the bar however tight it gets.",
        code: `const box = document.createElement("div");
box.style.width = "420px";
box.append(Toolbar({ actions, "aria-label": "Order actions" }).el);`,
        render: () =>
          frame(420, Toolbar({ actions: ACTIONS, "aria-label": "Order actions (420px)" }).el),
      },
      {
        title: "3. Very narrow — only the pinned action survives",
        codeTitle: "240px",
        codeDescription:
          "Everything collapsible is in the menu; the pinned Create and the ••• trigger remain.",
        code: `const box = document.createElement("div");
box.style.width = "240px";
box.append(Toolbar({ actions, "aria-label": "Order actions" }).el);`,
        render: () =>
          frame(240, Toolbar({ actions: ACTIONS, "aria-label": "Order actions (240px)" }).el),
      },
      {
        title: "4. With leading content",
        codeTitle: "children are leading content and never overflow",
        codeDescription: "A title, a count — whatever names the bar. Only `actions` collapse.",
        code: `const count = document.createElement("span");
count.className = "zen-text-xs zen-text-zen-muted-fg";
count.textContent = "128 items";

Toolbar({
  actions,
  "aria-label": "Order actions",
  children: [heading("Orders"), count],
});`,
        render: () => {
          const count = document.createElement("span");
          count.className = "zen-text-xs zen-text-zen-muted-fg";
          count.textContent = "128 items";
          return frame(
            560,
            Toolbar({
              actions: ACTIONS,
              "aria-label": "Order actions (leading)",
              children: [heading("Orders"), count],
            }).el,
          );
        },
      },
    ],
  });
}
