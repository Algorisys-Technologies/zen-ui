import { Button } from "./button/button";
import { DropdownMenu, type DropdownMenuItemSpec } from "./dropdown-menu/dropdown-menu";
import { DemoPage } from "./demo-helpers";

/**
 * DropdownMenuDemo — the action-menu primitive.
 *
 * This is intentionally NOT a form-input replacement. For form selection use
 * the Select primitive. Mirrors NewDropdownMenuDemo.tsx section-for-section; the
 * compound React parts become entries in the `items` array (see the divergence
 * note in dropdown-menu.ts).
 */

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
        code: `DropdownMenu({
  trigger: Button({ variant: "outline", children: "Options" }),
  items: [
    { label: "Profile", onSelect: () => alert("Profile") },
    { label: "Settings", onSelect: () => alert("Settings") },
    { label: "Sign out", onSelect: () => alert("Sign out") },
  ],
})`,
        render: () =>
          DropdownMenu({
            trigger: Button({ variant: "outline", children: "Options" }),
            items: [
              { label: "Profile", onSelect: () => alert("Profile") },
              { label: "Settings", onSelect: () => alert("Settings") },
              { label: "Sign out", onSelect: () => alert("Sign out") },
            ],
          }).el,
      },
      {
        title: "2. With label, separator, and shortcut hints",
        codeTitle: "Typical user-menu shape",
        code: `DropdownMenu({
  trigger: Button({ variant: "soft", children: "My account" }),
  items: [
    { type: "label", label: "My account" },
    { type: "separator" },
    { label: "Profile", shortcut: "⇧⌘P" },
    { label: "Billing", shortcut: "⌘B" },
    { label: "Settings", shortcut: "⌘," },
    { type: "separator" },
    { label: "Sign out", variant: "destructive" },
  ],
})`,
        render: () =>
          DropdownMenu({
            trigger: Button({ variant: "soft", children: "My account" }),
            items: [
              { type: "label", label: "My account" },
              { type: "separator" },
              { label: "Profile", shortcut: "⇧⌘P" },
              { label: "Billing", shortcut: "⌘B" },
              { label: "Settings", shortcut: "⌘," },
              { type: "separator" },
              { label: "Sign out", variant: "destructive" },
            ],
          }).el,
      },
      {
        title: "3. Checkbox items (multi-select toggles)",
        codeTitle: "Stateful boolean toggles inside a menu",
        code: `let showToolbar = true;
let showStatus = false;

const dd = DropdownMenu({
  trigger: Button({ variant: "outline", children: "View" }),
  items: buildItems(),
});

function buildItems() {
  return [
    { type: "label", label: "Appearance" },
    { type: "separator" },
    { type: "checkbox", label: "Show toolbar", checked: showToolbar,
      onCheckedChange: (v) => { showToolbar = v; dd.update({ items: buildItems() }); } },
    { type: "checkbox", label: "Show status bar", checked: showStatus,
      onCheckedChange: (v) => { showStatus = v; dd.update({ items: buildItems() }); } },
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
                dd.update({ items: buildItems() });
              },
            },
            {
              type: "checkbox",
              label: "Show status bar",
              checked: showStatus,
              onCheckedChange: (v) => {
                showStatus = v;
                paint();
                dd.update({ items: buildItems() });
              },
            },
          ];
          const dd = DropdownMenu({
            trigger: Button({ variant: "outline", children: "View" }),
            items: buildItems(),
          });
          paint();
          return [dd.el, out];
        },
      },
      {
        title: "4. Radio items (single-select inside a menu)",
        codeTitle: "Mutually exclusive choices via a radio group",
        code: `let position = "bottom";

const dd = DropdownMenu({
  trigger: Button({ variant: "outline", children: "Panel position" }),
  items: buildItems(),
});

function buildItems() {
  return [
    { type: "label", label: "Position" },
    { type: "separator" },
    { type: "radio", value: position,
      onValueChange: (v) => { position = v; dd.update({ items: buildItems() }); },
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
                dd.update({ items: buildItems() });
              },
              options: [
                { value: "top", label: "Top" },
                { value: "bottom", label: "Bottom" },
                { value: "right", label: "Right" },
              ],
            },
          ];
          const dd = DropdownMenu({
            trigger: Button({ variant: "outline", children: "Panel position" }),
            items: buildItems(),
          });
          paint();
          return [dd.el, out];
        },
      },
      {
        title: "5. Sub-menu",
        codeTitle: "Nested items via a `sub` entry",
        code: `DropdownMenu({
  trigger: Button({ variant: "outline", children: "File" }),
  items: [
    { label: "New file" },
    { label: "Open" },
    { type: "sub", label: "Share", items: [
      { label: "Email" },
      { label: "Slack" },
      { label: "Copy link" },
    ] },
    { type: "separator" },
    { label: "Delete", variant: "destructive" },
  ],
})`,
        render: () =>
          DropdownMenu({
            trigger: Button({ variant: "outline", children: "File" }),
            items: [
              { label: "New file" },
              { label: "Open" },
              {
                type: "sub",
                label: "Share",
                items: [{ label: "Email" }, { label: "Slack" }, { label: "Copy link" }],
              },
              { type: "separator" },
              { label: "Delete", variant: "destructive" },
            ],
          }).el,
      },
      {
        title: "6. Disabled items",
        description: "Disabled rows are skipped during keyboard traversal, not merely greyed.",
        codeTitle: "Per-item disabling with full keyboard awareness",
        code: `DropdownMenu({
  trigger: Button({ variant: "outline", children: "Actions" }),
  items: [
    { label: "Edit" },
    { label: "Duplicate (no permission)", disabled: true },
    { label: "Archive" },
    { label: "Delete (read-only)", disabled: true, variant: "destructive" },
  ],
})`,
        render: () =>
          DropdownMenu({
            trigger: Button({ variant: "outline", children: "Actions" }),
            items: [
              { label: "Edit" },
              { label: "Duplicate (no permission)", disabled: true },
              { label: "Archive" },
              { label: "Delete (read-only)", disabled: true, variant: "destructive" },
            ],
          }).el,
      },
      {
        title: "7. Side and alignment",
        description: "The panel flips to the opposite side automatically on a viewport collision.",
        codeTitle: `side: "top" | "right" | "bottom" | "left", align: "start" | "center" | "end"`,
        code: `DropdownMenu({ trigger: …, side: "top", align: "start", items: […] })
DropdownMenu({ trigger: …, side: "right", align: "center", items: […] })
DropdownMenu({ trigger: …, side: "bottom", align: "end", items: […] })`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.flexWrap = "wrap";
          row.style.gap = "0.5rem";
          const two: DropdownMenuItemSpec[] = [{ label: "Item A" }, { label: "Item B" }];
          row.append(
            DropdownMenu({
              trigger: Button({ variant: "outline", children: "Top start" }),
              side: "top",
              align: "start",
              items: two,
            }).el,
            DropdownMenu({
              trigger: Button({ variant: "outline", children: "Right center" }),
              side: "right",
              align: "center",
              items: two,
            }).el,
            DropdownMenu({
              trigger: Button({ variant: "outline", children: "Bottom end" }),
              side: "bottom",
              align: "end",
              items: two,
            }).el,
          );
          return row;
        },
      },
      {
        title: "8. Kebab menu (icon trigger)",
        codeTitle: "Common row-actions pattern",
        code: `DropdownMenu({
  trigger: Button({ variant: "ghost", shape: "circle", "aria-label": "More", iconLeft: moreIcon() }),
  align: "end",
  items: [
    { label: "Rename" },
    { label: "Move" },
    { label: "Delete", variant: "destructive" },
  ],
})`,
        render: () =>
          DropdownMenu({
            trigger: Button({
              variant: "ghost",
              shape: "circle",
              "aria-label": "More",
              iconLeft: moreIcon(),
            }),
            align: "end",
            items: [
              { label: "Rename" },
              { label: "Move" },
              { label: "Delete", variant: "destructive" },
            ],
          }).el,
      },
    ],
  });
}
