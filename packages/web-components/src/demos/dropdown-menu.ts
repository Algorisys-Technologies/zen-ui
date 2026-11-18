import type { DropdownMenuItemSpec } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * DropdownMenu demo — the web-components mirror of the vanilla DropdownMenuDemo.
 * The compound React parts are entries in the `items` array. `trigger` and `items`
 * are set as JS properties on <zen-dropdown-menu>; the imperative handle
 * (open/close) is forwarded onto the element.
 */

function el(tag: string, attrs: Record<string, string> = {}, text?: string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

/** Build a <zen-dropdown-menu> with a trigger element and item specs. */
function menu(trigger: HTMLElement, items: DropdownMenuItemSpec[], attrs: Record<string, string> = {}): HTMLElement {
  const dd = el("zen-dropdown-menu", attrs);
  (dd as unknown as { trigger: Node }).trigger = trigger;
  (dd as unknown as { items: DropdownMenuItemSpec[] }).items = items;
  return dd;
}

const note = (text: string): HTMLElement => {
  const s = document.createElement("span");
  s.style.marginLeft = "1rem";
  s.style.fontSize = "0.8125rem";
  s.style.color = "var(--zen-color-muted-fg)";
  s.textContent = text;
  return s;
};

const moreIcon = (): Node => {
  const t = document.createElement("template");
  t.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`;
  return t.content.firstChild!;
};

export default function DropdownMenuDemo(): HTMLElement {
  return DemoPage({
    title: "DropdownMenu",
    description:
      "An action menu (kebab / user / context menus), NOT a form-field replacement. React exposes Radix's compound parts wired through context; with no framework there is no context, so the parts become entries in an `items` array — the same call Select and Popover made. This hand-writes positioning, collision flip, keyboard navigation (Arrow/Home/End), dismissal and ARIA.",
    sections: [
      {
        title: "1. Basic menu",
        codeTitle: "trigger + items",
        code: `const dd = document.createElement("zen-dropdown-menu");
dd.trigger = triggerButton;   // any element
dd.items = [
  { label: "Profile", onSelect: () => alert("Profile") },
  { label: "Settings", onSelect: () => alert("Settings") },
  { label: "Sign out", onSelect: () => alert("Sign out") },
];`,
        render: () =>
          menu(el("zen-button", { variant: "outline" }, "Options"), [
            { label: "Profile", onSelect: () => alert("Profile") },
            { label: "Settings", onSelect: () => alert("Settings") },
            { label: "Sign out", onSelect: () => alert("Sign out") },
          ]),
      },
      {
        title: "2. With label, separator, and shortcut hints",
        codeTitle: "Typical user-menu shape",
        code: `dd.items = [
  { type: "label", label: "My account" },
  { type: "separator" },
  { label: "Profile", shortcut: "⇧⌘P" },
  { label: "Billing", shortcut: "⌘B" },
  { label: "Settings", shortcut: "⌘," },
  { type: "separator" },
  { label: "Sign out", variant: "destructive" },
];`,
        render: () =>
          menu(el("zen-button", { variant: "soft" }, "My account"), [
            { type: "label", label: "My account" },
            { type: "separator" },
            { label: "Profile", shortcut: "⇧⌘P" },
            { label: "Billing", shortcut: "⌘B" },
            { label: "Settings", shortcut: "⌘," },
            { type: "separator" },
            { label: "Sign out", variant: "destructive" },
          ]),
      },
      {
        title: "3. Checkbox items (multi-select toggles)",
        codeTitle: "Stateful boolean toggles inside a menu",
        code: `function buildItems() {
  return [
    { type: "label", label: "Appearance" },
    { type: "separator" },
    { type: "checkbox", label: "Show toolbar", checked: showToolbar,
      onCheckedChange: (v) => { showToolbar = v; dd.items = buildItems(); } },
    { type: "checkbox", label: "Show status bar", checked: showStatus,
      onCheckedChange: (v) => { showStatus = v; dd.items = buildItems(); } },
  ];
}`,
        render: () => {
          let showToolbar = true;
          let showStatus = false;
          const out = note("");
          const paint = () => (out.textContent = `toolbar: ${showToolbar} · status: ${showStatus}`);
          const buildItems = (): DropdownMenuItemSpec[] => [
            { type: "label", label: "Appearance" },
            { type: "separator" },
            {
              type: "checkbox",
              label: "Show toolbar",
              checked: showToolbar,
              onCheckedChange: (v) => {
                showToolbar = v;
                paint();
                (dd as unknown as { items: DropdownMenuItemSpec[] }).items = buildItems();
              },
            },
            {
              type: "checkbox",
              label: "Show status bar",
              checked: showStatus,
              onCheckedChange: (v) => {
                showStatus = v;
                paint();
                (dd as unknown as { items: DropdownMenuItemSpec[] }).items = buildItems();
              },
            },
          ];
          const dd = menu(el("zen-button", { variant: "outline" }, "View"), buildItems());
          paint();
          return [dd, out];
        },
      },
      {
        title: "4. Radio items (single-select inside a menu)",
        codeTitle: "Mutually exclusive choices via a radio group",
        code: `function buildItems() {
  return [
    { type: "label", label: "Position" },
    { type: "separator" },
    { type: "radio", value: position,
      onValueChange: (v) => { position = v; dd.items = buildItems(); },
      options: [
        { value: "top", label: "Top" },
        { value: "bottom", label: "Bottom" },
        { value: "right", label: "Right" },
      ] },
  ];
}`,
        render: () => {
          let position = "bottom";
          const out = note("");
          const paint = () => (out.textContent = `position: ${position}`);
          const buildItems = (): DropdownMenuItemSpec[] => [
            { type: "label", label: "Position" },
            { type: "separator" },
            {
              type: "radio",
              value: position,
              onValueChange: (v) => {
                position = v;
                paint();
                (dd as unknown as { items: DropdownMenuItemSpec[] }).items = buildItems();
              },
              options: [
                { value: "top", label: "Top" },
                { value: "bottom", label: "Bottom" },
                { value: "right", label: "Right" },
              ],
            },
          ];
          const dd = menu(el("zen-button", { variant: "outline" }, "Panel position"), buildItems());
          paint();
          return [dd, out];
        },
      },
      {
        title: "5. Sub-menu",
        codeTitle: "Nested items via a `sub` entry",
        code: `dd.items = [
  { label: "New file" },
  { label: "Open" },
  { type: "sub", label: "Share", items: [
    { label: "Email" },
    { label: "Slack" },
    { label: "Copy link" },
  ] },
  { type: "separator" },
  { label: "Delete", variant: "destructive" },
];`,
        render: () =>
          menu(el("zen-button", { variant: "outline" }, "File"), [
            { label: "New file" },
            { label: "Open" },
            {
              type: "sub",
              label: "Share",
              items: [{ label: "Email" }, { label: "Slack" }, { label: "Copy link" }],
            },
            { type: "separator" },
            { label: "Delete", variant: "destructive" },
          ]),
      },
      {
        title: "6. Disabled items",
        description: "Disabled rows are skipped during keyboard traversal, not merely greyed.",
        codeTitle: "Per-item disabling with full keyboard awareness",
        code: `dd.items = [
  { label: "Edit" },
  { label: "Duplicate (no permission)", disabled: true },
  { label: "Archive" },
  { label: "Delete (read-only)", disabled: true, variant: "destructive" },
];`,
        render: () =>
          menu(el("zen-button", { variant: "outline" }, "Actions"), [
            { label: "Edit" },
            { label: "Duplicate (no permission)", disabled: true },
            { label: "Archive" },
            { label: "Delete (read-only)", disabled: true, variant: "destructive" },
          ]),
      },
      {
        title: "7. Side and alignment",
        description: "The panel flips to the opposite side automatically on a viewport collision.",
        codeTitle: `side: "top" | "right" | "bottom" | "left", align: "start" | "center" | "end"`,
        code: `<zen-dropdown-menu side="top" align="start"></zen-dropdown-menu>
<zen-dropdown-menu side="right" align="center"></zen-dropdown-menu>
<zen-dropdown-menu side="bottom" align="end"></zen-dropdown-menu>`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.flexWrap = "wrap";
          row.style.gap = "0.5rem";
          const two: DropdownMenuItemSpec[] = [{ label: "Item A" }, { label: "Item B" }];
          row.append(
            menu(el("zen-button", { variant: "outline" }, "Top start"), two, { side: "top", align: "start" }),
            menu(el("zen-button", { variant: "outline" }, "Right center"), two, { side: "right", align: "center" }),
            menu(el("zen-button", { variant: "outline" }, "Bottom end"), two, { side: "bottom", align: "end" }),
          );
          return row;
        },
      },
      {
        title: "8. Kebab menu (icon trigger)",
        codeTitle: "Common row-actions pattern",
        code: `const trigger = document.createElement("zen-button");
trigger.setAttribute("variant", "ghost");
trigger.setAttribute("shape", "circle");
trigger.setAttribute("aria-label", "More");
trigger.iconLeft = moreIcon();

dd.trigger = trigger;
dd.setAttribute("align", "end");`,
        render: () => {
          const trigger = el("zen-button", { variant: "ghost", shape: "circle", "aria-label": "More" });
          (trigger as unknown as { iconLeft: Node }).iconLeft = moreIcon();
          return menu(
            trigger,
            [
              { label: "Rename" },
              { label: "Move" },
              { label: "Delete", variant: "destructive" },
            ],
            { align: "end" },
          );
        },
      },
    ],
  });
}
