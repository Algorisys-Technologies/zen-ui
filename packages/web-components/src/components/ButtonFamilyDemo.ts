import { DemoPage } from "./demo-helpers";

/**
 * Button family demo — the web-components port. Three forms built on
 * <zen-button>:
 *   - <zen-toggle-button> — `default-pressed` attribute seeds it; `pressed` is a
 *     JS property for the controlled case, firing `zen-pressed-change`.
 *   - <zen-segmented-button> — data-driven: `el.items = [...]`, `value` /
 *     `default-value` attributes, firing `zen-value-change`.
 *   - <zen-split-button> — a default action (`el.onClick`) plus a dropdown
 *     (`el.menu = [...]`, each item carrying its own `onSelect`).
 * SegmentedButton and SplitButton take data rather than compound children, the
 * same divergence as Select — with no framework there is no context to thread a
 * parent through.
 */

interface MenuItem {
  heading?: boolean;
  separator?: boolean;
  label?: string;
  variant?: string;
  onSelect?: () => void;
}

interface SegmentItem {
  value: string;
  label: unknown;
}

function el(tag: string, attrs: Record<string, string> = {}, kids?: Node | Node[] | string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (kids != null) {
    if (typeof kids === "string") n.textContent = kids;
    else if (Array.isArray(kids)) n.append(...kids);
    else n.append(kids);
  }
  return n;
}

const icon = (name: string, size = 14): HTMLElement => el("zen-icon", { name, size: String(size) });

const row = (): HTMLDivElement => {
  const d = document.createElement("div");
  d.style.display = "flex";
  d.style.gap = "8px";
  d.style.flexWrap = "wrap";
  d.style.alignItems = "center";
  return d;
};

const stack = (): HTMLDivElement => {
  const d = document.createElement("div");
  d.style.display = "flex";
  d.style.flexDirection = "column";
  d.style.gap = "8px";
  d.style.alignItems = "flex-start";
  return d;
};

const note = (text: string): HTMLSpanElement => {
  const s = document.createElement("span");
  s.style.fontSize = "0.875rem";
  s.style.color = "var(--zen-color-muted-fg)";
  s.textContent = text;
  return s;
};

function segmented(opts: { defaultValue?: string; value?: string; ariaLabel: string; size?: string; items: SegmentItem[] }): HTMLElement {
  const s = document.createElement("zen-segmented-button") as HTMLElement & { items: SegmentItem[] };
  if (opts.defaultValue != null) s.setAttribute("default-value", opts.defaultValue);
  if (opts.value != null) s.setAttribute("value", opts.value);
  s.setAttribute("aria-label", opts.ariaLabel);
  if (opts.size) s.setAttribute("size", opts.size);
  s.items = opts.items;
  return s;
}

function split(opts: { attrs?: Record<string, string>; label: string; menu: MenuItem[]; onClick?: () => void }): HTMLElement {
  const sb = document.createElement("zen-split-button") as HTMLElement & {
    menu: MenuItem[];
    onClick?: () => void;
  };
  for (const [k, v] of Object.entries(opts.attrs ?? {})) sb.setAttribute(k, v);
  sb.textContent = opts.label;
  sb.menu = opts.menu;
  if (opts.onClick) sb.onClick = opts.onClick;
  return sb;
}

export default function ButtonFamilyDemo(): HTMLElement {
  return DemoPage({
    title: "Button family",
    description:
      "Three button forms built on the Button, so variant / color / size stay consistent: ToggleButton (a button with a pressed state), SegmentedButton (mutually exclusive choice as one joined control) and SplitButton (a default action plus a dropdown of related ones). SegmentedButton and SplitButton take data (items / menu) rather than compound children — the same divergence as Select, for the same reason: with no framework there is no context to thread a parent through.",
    sections: [
      {
        title: "1. ToggleButton — uncontrolled",
        codeTitle: "default-pressed seeds it; the button owns the state",
        codeDescription: "Renders aria-pressed, so it announces as a toggle.",
        code: `<zen-toggle-button default-pressed>Bold</zen-toggle-button>
<zen-toggle-button>Italic</zen-toggle-button>`,
        render: () => {
          const r = row();
          r.append(
            el("zen-toggle-button", { "default-pressed": "" }, "Bold"),
            el("zen-toggle-button", {}, "Italic"),
            el("zen-toggle-button", {}, "Underline"),
          );
          return r;
        },
      },
      {
        title: "2. ToggleButton — controlled",
        codeTitle: "pressed + zen-pressed-change",
        codeDescription: "Set the pressed property and listen to zen-pressed-change to own the state.",
        code: `const t = document.querySelector("zen-toggle-button");
t.pressed = true;
t.addEventListener("zen-pressed-change", (e) => { t.pressed = e.detail; });`,
        render: () => {
          const r = row();
          const label = note("pressed = true");
          const t = el("zen-toggle-button", {}, "Bold") as HTMLElement & { pressed: boolean };
          t.pressed = true;
          t.addEventListener("zen-pressed-change", (e) => {
            const v = (e as CustomEvent).detail as boolean;
            t.pressed = v;
            label.textContent = `pressed = ${v}`;
          });
          r.append(t, label);
          return r;
        },
      },
      {
        title: "3. ToggleButton — variants, colors, sizes",
        codeTitle: "Every Button prop still works — it is a Button",
        code: `<zen-toggle-button variant="soft" color="success" default-pressed>Soft</zen-toggle-button>
<zen-toggle-button variant="ghost">Ghost</zen-toggle-button>
<zen-toggle-button size="xs">xs</zen-toggle-button>
<zen-toggle-button shape="square" aria-label="Favourite"><zen-icon name="check-circle" size="16"></zen-icon></zen-toggle-button>`,
        render: () => {
          const wrap = stack();
          const r1 = row();
          r1.append(
            el("zen-toggle-button", { variant: "outline", "default-pressed": "" }, "Outline"),
            el("zen-toggle-button", { variant: "soft", color: "success", "default-pressed": "" }, "Soft"),
            el("zen-toggle-button", { variant: "ghost" }, "Ghost"),
          );
          const r2 = row();
          r2.append(
            el("zen-toggle-button", { size: "xs" }, "xs"),
            el("zen-toggle-button", { size: "sm" }, "sm"),
            el("zen-toggle-button", { size: "md", "default-pressed": "" }, "md"),
            el("zen-toggle-button", { size: "lg" }, "lg"),
          );
          const r3 = row();
          r3.append(
            el("zen-toggle-button", { shape: "square", "aria-label": "Favourite", "default-pressed": "" }, icon("check-circle", 16)),
            el("zen-toggle-button", { shape: "square", "aria-label": "Flag" }, icon("x-circle", 16)),
            el("zen-toggle-button", { disabled: "" }, "Disabled"),
            el("zen-toggle-button", { disabled: "", "default-pressed": "" }, "Disabled + pressed"),
          );
          wrap.append(r1, r2, r3);
          return wrap;
        },
      },
      {
        title: "4. SegmentedButton — uncontrolled",
        codeTitle: "default-value picks the initial segment",
        codeDescription: "The group is a radiogroup and each item a radio, so it needs an aria-label.",
        code: `<zen-segmented-button default-value="day" aria-label="Range"></zen-segmented-button>

seg.items = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];`,
        render: () =>
          segmented({
            defaultValue: "day",
            ariaLabel: "Range",
            items: [
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ],
          }),
      },
      {
        title: "5. SegmentedButton — controlled",
        codeTitle: "value + zen-value-change",
        codeDescription: "Set value and listen to zen-value-change to own the selection.",
        code: `const seg = document.querySelector("zen-segmented-button");
seg.setAttribute("value", "list");
seg.addEventListener("zen-value-change", (e) => { seg.setAttribute("value", e.detail); });`,
        render: () => {
          const r = row();
          const label = note("value = list");
          const seg = segmented({
            value: "list",
            ariaLabel: "View",
            items: [
              { value: "list", label: "List" },
              { value: "grid", label: "Grid" },
              { value: "map", label: "Map" },
            ],
          });
          seg.addEventListener("zen-value-change", (e) => {
            const v = (e as CustomEvent).detail as string;
            seg.setAttribute("value", v);
            label.textContent = `value = ${v}`;
          });
          r.append(seg, label);
          return r;
        },
      },
      {
        title: "6. SegmentedButton — sizes and icons",
        codeTitle: "size on the group cascades to every item",
        code: `seg.items = [
  { value: "asc", label: [icon("sort-asc"), " Asc"] },
  { value: "desc", label: [icon("sort-desc"), " Desc"] },
];`,
        render: () => {
          const wrap = stack();
          for (const s of ["xs", "sm", "md", "lg"] as const) {
            wrap.append(
              segmented({
                defaultValue: "a",
                size: s,
                ariaLabel: `Size ${s}`,
                items: [
                  { value: "a", label: s },
                  { value: "b", label: "Segments" },
                  { value: "c", label: "Here" },
                ],
              }),
            );
          }
          wrap.append(
            segmented({
              defaultValue: "asc",
              ariaLabel: "Sort direction",
              items: [
                { value: "asc", label: [icon("sort-asc"), document.createTextNode(" Asc")] },
                { value: "desc", label: [icon("sort-desc"), document.createTextNode(" Desc")] },
              ],
            }),
          );
          return wrap;
        },
      },
      {
        title: "7. SplitButton — default action plus a menu",
        codeTitle: "onClick fires the default action; the arrow opens the menu",
        codeDescription:
          "Two real buttons, not one with a nested trigger — a <button> inside a <button> is invalid HTML. The menu is a data array; each item carries its own onSelect.",
        code: `const sb = document.querySelector("zen-split-button");
sb.onClick = () => save();
sb.menu = [
  { heading: true, label: "Save options" },
  { label: "Save as…", onSelect: () => saveAs() },
  { label: "Save all", onSelect: () => saveAll() },
  { separator: true },
  { label: "Discard", variant: "destructive", onSelect: () => discard() },
];`,
        render: () => {
          const r = row();
          const label = note("last action = —");
          const set = (a: string): void => {
            label.textContent = `last action = ${a}`;
          };
          const menu: MenuItem[] = [
            { heading: true, label: "Save options" },
            { label: "Save as…", onSelect: () => set("Save as…") },
            { label: "Save all", onSelect: () => set("Save all") },
            { separator: true },
            { label: "Discard", variant: "destructive", onSelect: () => set("Discard") },
          ];
          r.append(split({ label: "Save", menu, onClick: () => set("Save") }), label);
          return r;
        },
      },
      {
        title: "8. SplitButton — variants, colors, sizes",
        codeTitle: "Both halves take the same Button styling",
        code: `<zen-split-button variant="outline" color="neutral">Export</zen-split-button>
<zen-split-button variant="soft" color="success" size="sm">Approve</zen-split-button>`,
        render: () => {
          const r = row();
          r.append(
            split({ label: "Solid", menu: [{ label: "Solid / primary" }] }),
            split({ attrs: { variant: "outline", color: "neutral" }, label: "Export", menu: [{ label: "Outline / neutral" }] }),
            split({ attrs: { variant: "soft", color: "success", size: "sm" }, label: "Approve", menu: [{ label: "Soft / success" }] }),
            split({ attrs: { color: "error", size: "lg" }, label: "Delete", menu: [{ label: "Solid / error" }] }),
          );
          return r;
        },
      },
      {
        title: "9. SplitButton — menuLabel, menuAlign, disabled",
        codeTitle: "menu-label names the arrow half; menu-align places the panel",
        codeDescription: "disabled disables both halves.",
        code: `<zen-split-button menu-label="More export options" menu-align="start">Export</zen-split-button>
<zen-split-button disabled>Disabled</zen-split-button>`,
        render: () => {
          const r = row();
          r.append(
            split({
              attrs: { "menu-label": "More export options", "menu-align": "start" },
              label: "Export (align start)",
              menu: [{ label: "Export as CSV" }, { label: "Export as XLSX" }],
            }),
            split({ attrs: { disabled: "" }, label: "Disabled", menu: [{ label: "Unreachable" }] }),
          );
          return r;
        },
      },
      {
        title: "10. In context — a toolbar",
        codeTitle: "All three together",
        code: `<zen-toggle-button size="sm" shape="square" aria-label="Filter">…</zen-toggle-button>
<zen-segmented-button aria-label="View"></zen-segmented-button>
<zen-split-button size="sm">Save</zen-split-button>`,
        render: () => {
          const bar = document.createElement("div");
          bar.style.display = "flex";
          bar.style.gap = "12px";
          bar.style.flexWrap = "wrap";
          bar.style.alignItems = "center";
          bar.style.width = "100%";
          bar.style.padding = "0.625rem 0.75rem";
          bar.style.border = "1px solid var(--zen-color-border)";
          bar.style.borderRadius = "var(--zen-radius-md)";

          const toggles = row();
          toggles.append(
            el("zen-toggle-button", { size: "sm", shape: "square", "aria-label": "Filter" }, icon("sort-asc", 14)),
            el("zen-toggle-button", { size: "sm", shape: "square", "aria-label": "Favourites only", "default-pressed": "" }, icon("check-circle", 14)),
          );

          const seg = segmented({
            defaultValue: "list",
            ariaLabel: "Toolbar view",
            items: [
              { value: "list", label: "List" },
              { value: "grid", label: "Grid" },
            ],
          });

          const right = document.createElement("div");
          right.style.marginLeft = "auto";
          right.append(split({ attrs: { size: "sm" }, label: "Save", menu: [{ label: "Save as…" }, { label: "Save all" }] }));

          bar.append(toggles, seg, right);
          return bar;
        },
      },
    ],
  });
}
