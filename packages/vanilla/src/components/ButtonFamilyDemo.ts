import {
  ToggleButton,
  SegmentedButton,
  SplitButton,
  type SplitButtonMenuItem,
} from "./button/button-family";
import { Icon } from "./icon/icon";
import { DemoPage } from "./demo-helpers";

/**
 * ButtonFamilyDemo — mirrors packages/react/src/components/NewButtonFamilyDemo.tsx,
 * section for section. The code snippets are adapted to the vanilla factory API
 * (and to `items` / `menu` data where React uses compound children), the way
 * SelectDemo and TabsDemo already adapt theirs.
 */

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

export default function ButtonFamilyDemo(): HTMLElement {
  return DemoPage({
    title: "Button family",
    description:
      "Three button forms built on the vanilla Button, so variant / color / size stay consistent: ToggleButton (a button with a pressed state), SegmentedButton (mutually exclusive choice as one joined control) and SplitButton (a default action plus a dropdown of related ones). SegmentedButton and SplitButton take data (items / menu) rather than compound children — the same divergence as Select, for the same reason: with no framework there is no context to thread a parent through.",
    sections: [
      {
        title: "1. ToggleButton — uncontrolled",
        codeTitle: "defaultPressed seeds it; the button owns the state",
        codeDescription: "Renders aria-pressed, so it announces as a toggle.",
        code: `ToggleButton({ defaultPressed: true, children: "Bold" });
ToggleButton({ children: "Italic" });`,
        render: () => {
          const r = row();
          r.append(
            ToggleButton({ defaultPressed: true, children: "Bold" }).el,
            ToggleButton({ children: "Italic" }).el,
            ToggleButton({ children: "Underline" }).el,
          );
          return r;
        },
      },
      {
        title: "2. ToggleButton — controlled",
        codeTitle: "pressed + onPressedChange",
        codeDescription: "Pass pressed + onPressedChange to own the state.",
        code: `let bold = true;
const t = ToggleButton({
  pressed: bold,
  onPressedChange: (v) => {
    bold = v;
    t.update({ pressed: bold });
  },
  children: "Bold",
});`,
        render: () => {
          const r = row();
          const label = note("pressed = true");
          let bold = true;
          const t = ToggleButton({
            pressed: bold,
            onPressedChange: (v) => {
              bold = v;
              t.update({ pressed: bold });
              label.textContent = `pressed = ${bold}`;
            },
            children: "Bold",
          });
          r.append(t.el, label);
          return r;
        },
      },
      {
        title: "3. ToggleButton — variants, colors, sizes",
        codeTitle: "Every Button prop still works — it is a Button",
        code: `ToggleButton({ variant: "soft", color: "success", defaultPressed: true, children: "Soft" });
ToggleButton({ variant: "ghost", children: "Ghost" });
ToggleButton({ size: "xs", children: "xs" });
ToggleButton({ shape: "square", "aria-label": "Favourite", children: Icon({ name: "check-circle", size: 16 }) });`,
        render: () => {
          const wrap = stack();
          const r1 = row();
          r1.append(
            ToggleButton({ variant: "outline", defaultPressed: true, children: "Outline" }).el,
            ToggleButton({ variant: "soft", color: "success", defaultPressed: true, children: "Soft" }).el,
            ToggleButton({ variant: "ghost", children: "Ghost" }).el,
          );
          const r2 = row();
          r2.append(
            ToggleButton({ size: "xs", children: "xs" }).el,
            ToggleButton({ size: "sm", children: "sm" }).el,
            ToggleButton({ size: "md", defaultPressed: true, children: "md" }).el,
            ToggleButton({ size: "lg", children: "lg" }).el,
          );
          const r3 = row();
          r3.append(
            ToggleButton({ shape: "square", "aria-label": "Favourite", defaultPressed: true, children: Icon({ name: "check-circle", size: 16 }) }).el,
            ToggleButton({ shape: "square", "aria-label": "Flag", children: Icon({ name: "x-circle", size: 16 }) }).el,
            ToggleButton({ disabled: true, children: "Disabled" }).el,
            ToggleButton({ disabled: true, defaultPressed: true, children: "Disabled + pressed" }).el,
          );
          wrap.append(r1, r2, r3);
          return wrap;
        },
      },
      {
        title: "4. SegmentedButton — uncontrolled",
        codeTitle: "defaultValue picks the initial segment",
        codeDescription: "The group is a radiogroup and each item a radio, so it needs an aria-label.",
        code: `SegmentedButton({
  defaultValue: "day",
  "aria-label": "Range",
  items: [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ],
});`,
        render: () =>
          SegmentedButton({
            defaultValue: "day",
            "aria-label": "Range",
            items: [
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ],
          }).el,
      },
      {
        title: "5. SegmentedButton — controlled",
        codeTitle: "value + onValueChange",
        codeDescription: "Pass value + onValueChange to own the selection.",
        code: `let view = "list";
const seg = SegmentedButton({
  value: view,
  onValueChange: (v) => {
    view = v;
    seg.update({ value: view });
  },
  "aria-label": "View",
  items: [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
  ],
});`,
        render: () => {
          const r = row();
          const label = note("value = list");
          let view = "list";
          const seg = SegmentedButton({
            value: view,
            onValueChange: (v) => {
              view = v;
              seg.update({ value: view });
              label.textContent = `value = ${view}`;
            },
            "aria-label": "View",
            items: [
              { value: "list", label: "List" },
              { value: "grid", label: "Grid" },
              { value: "map", label: "Map" },
            ],
          });
          r.append(seg.el, label);
          return r;
        },
      },
      {
        title: "6. SegmentedButton — sizes and icons",
        codeTitle: "size on the group cascades to every item",
        code: `SegmentedButton({
  defaultValue: "a",
  size: "lg",
  "aria-label": "Size",
  items: [
    { value: "a", label: "Large" },
    { value: "b", label: "Segments" },
  ],
});

SegmentedButton({
  defaultValue: "asc",
  "aria-label": "Sort",
  items: [
    { value: "asc", label: [Icon({ name: "sort-asc", size: 14 }).el, " Asc"] },
    { value: "desc", label: [Icon({ name: "sort-desc", size: 14 }).el, " Desc"] },
  ],
});`,
        render: () => {
          const wrap = stack();
          for (const s of ["xs", "sm", "md", "lg"] as const) {
            wrap.append(
              SegmentedButton({
                defaultValue: "a",
                size: s,
                "aria-label": `Size ${s}`,
                items: [
                  { value: "a", label: s },
                  { value: "b", label: "Segments" },
                  { value: "c", label: "Here" },
                ],
              }).el,
            );
          }
          wrap.append(
            SegmentedButton({
              defaultValue: "asc",
              "aria-label": "Sort direction",
              items: [
                { value: "asc", label: [Icon({ name: "sort-asc", size: 14 }).el, document.createTextNode(" Asc")] },
                { value: "desc", label: [Icon({ name: "sort-desc", size: 14 }).el, document.createTextNode(" Desc")] },
              ],
            }).el,
          );
          return wrap;
        },
      },
      {
        title: "7. SplitButton — default action plus a menu",
        codeTitle: "onClick fires the default action; the arrow opens the menu",
        codeDescription:
          "Two real buttons, not one with a nested trigger — a <button> inside a <button> is invalid HTML. React takes DropdownMenuItem nodes; vanilla takes a menu array.",
        code: `SplitButton({
  children: "Save",
  onClick: () => save(),
  menu: [
    { heading: true, label: "Save options" },
    { label: "Save as…", onSelect: () => saveAs() },
    { label: "Save all", onSelect: () => saveAll() },
    { separator: true },
    { label: "Discard", variant: "destructive", onSelect: () => discard() },
  ],
});`,
        render: () => {
          const r = row();
          const label = note("last action = —");
          const set = (a: string) => (label.textContent = `last action = ${a}`);
          const menu: SplitButtonMenuItem[] = [
            { heading: true, label: "Save options" },
            { label: "Save as…", onSelect: () => set("Save as…") },
            { label: "Save all", onSelect: () => set("Save all") },
            { separator: true },
            { label: "Discard", variant: "destructive", onSelect: () => set("Discard") },
          ];
          r.append(SplitButton({ children: "Save", onClick: () => set("Save"), menu }).el, label);
          return r;
        },
      },
      {
        title: "8. SplitButton — variants, colors, sizes",
        codeTitle: "Both halves take the same Button styling",
        code: `SplitButton({ variant: "outline", color: "neutral", children: "Export", menu });
SplitButton({ variant: "soft", color: "success", size: "sm", children: "Approve", menu });`,
        render: () => {
          const r = row();
          r.append(
            SplitButton({ children: "Solid", menu: [{ label: "Solid / primary" }] }).el,
            SplitButton({ variant: "outline", color: "neutral", children: "Export", menu: [{ label: "Outline / neutral" }] }).el,
            SplitButton({ variant: "soft", color: "success", size: "sm", children: "Approve", menu: [{ label: "Soft / success" }] }).el,
            SplitButton({ color: "error", size: "lg", children: "Delete", menu: [{ label: "Solid / error" }] }).el,
          );
          return r;
        },
      },
      {
        title: "9. SplitButton — menuLabel, menuAlign, disabled",
        codeTitle: "menuLabel names the arrow half; menuAlign places the panel",
        codeDescription: "disabled disables both halves.",
        code: `SplitButton({
  children: "Export",
  menuLabel: "More export options",
  menuAlign: "start",
  menu: [{ label: "Export as CSV" }, { label: "Export as XLSX" }],
});

SplitButton({ children: "Disabled", disabled: true, menu: [{ label: "Unreachable" }] });`,
        render: () => {
          const r = row();
          r.append(
            SplitButton({
              children: "Export (align start)",
              menuLabel: "More export options",
              menuAlign: "start",
              menu: [{ label: "Export as CSV" }, { label: "Export as XLSX" }],
            }).el,
            SplitButton({ children: "Disabled", disabled: true, menu: [{ label: "Unreachable" }] }).el,
          );
          return r;
        },
      },
      {
        title: "10. In context — a toolbar",
        codeTitle: "All three together",
        code: `ToggleButton({ size: "sm", shape: "square", "aria-label": "Filter", children: Icon({ name: "sort-asc", size: 14 }) });
SegmentedButton({ defaultValue: "list", "aria-label": "View", items: [...] });
SplitButton({ size: "sm", children: "Save", menu: [...] });`,
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
            ToggleButton({ size: "sm", shape: "square", "aria-label": "Filter", children: Icon({ name: "sort-asc", size: 14 }) }).el,
            ToggleButton({ size: "sm", shape: "square", "aria-label": "Favourites only", defaultPressed: true, children: Icon({ name: "check-circle", size: 14 }) }).el,
          );

          const seg = SegmentedButton({
            defaultValue: "list",
            "aria-label": "Toolbar view",
            items: [
              { value: "list", label: "List" },
              { value: "grid", label: "Grid" },
            ],
          }).el;

          const right = document.createElement("div");
          right.style.marginLeft = "auto";
          right.append(
            SplitButton({
              size: "sm",
              children: "Save",
              menu: [{ label: "Save as…" }, { label: "Save all" }],
            }).el,
          );

          bar.append(toggles, seg, right);
          return bar;
        },
      },
    ],
  });
}
