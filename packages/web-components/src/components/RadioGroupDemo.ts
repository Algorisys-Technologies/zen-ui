import { DemoPage } from "./demo-helpers";

/**
 * RadioGroup demo — the web-components port. <zen-radio-group> keeps the default
 * children slot: it renders the caller's items + labels and reaches them by
 * scanning the subtree for role="radio", so <zen-radio-group-item> stays inert
 * markup. `value` is controlled; `zen-value-change` fires with the new value.
 *
 * The vanilla demo passed row/gap layout through the `style` prop. The custom
 * element does not forward style to the inner group root, so where a horizontal
 * layout is wanted the items are wrapped in a flex <div> that the group renders
 * as-is (it finds the radios wherever they are nested).
 */

function item(value: string, opts: { size?: string; disabled?: boolean } = {}): HTMLElement {
  const it = document.createElement("zen-radio-group-item");
  it.setAttribute("value", value);
  if (opts.size) it.setAttribute("size", opts.size);
  if (opts.disabled) it.setAttribute("disabled", "");
  return it;
}

function option(
  node: HTMLElement,
  text: string,
  opts: { row?: boolean; muted?: boolean } = {},
): HTMLLabelElement {
  const label = document.createElement("label");
  label.style.display = opts.row ? "inline-flex" : "flex";
  label.style.alignItems = "center";
  label.style.gap = "8px";
  label.style.fontSize = "0.875rem";
  if (opts.muted) label.style.color = "var(--zen-color-muted-fg)";
  const span = document.createElement("span");
  span.textContent = text;
  label.append(node, span);
  return label;
}

function row(...children: Node[]): HTMLElement {
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "row";
  div.style.gap = "1rem";
  div.style.alignItems = "center";
  div.append(...children);
  return div;
}

function group(attrs: Record<string, string>, ...children: Node[]): HTMLElement {
  const g = document.createElement("zen-radio-group");
  for (const [k, v] of Object.entries(attrs)) g.setAttribute(k, v);
  g.append(...children);
  return g;
}

export default function RadioGroupDemo(): HTMLElement {
  return DemoPage({
    title: "RadioGroup",
    description:
      "Mutually-exclusive selection. Radix supplied roving tabindex, arrow-key navigation, ARIA and form submission; here the group owns all of it and reaches its items by scanning the DOM subtree it was handed, so the item stays inert markup and the caller keeps the compound shape.",
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "value + zen-value-change",
        code: `<zen-radio-group value="pro">
  <label><zen-radio-group-item value="free"></zen-radio-group-item> Free</label>
  <label><zen-radio-group-item value="pro"></zen-radio-group-item> Pro</label>
  <label><zen-radio-group-item value="team"></zen-radio-group-item> Team</label>
</zen-radio-group>

group.addEventListener("zen-value-change", (e) => { group.value = e.detail; });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.alignItems = "flex-start";
          wrap.style.gap = "0.75rem";

          const readout = document.createElement("span");
          readout.style.fontSize = "0.8125rem";
          readout.style.color = "var(--zen-color-muted-fg)";

          const g = group(
            { value: "pro" },
            option(item("free"), "Free"),
            option(item("pro"), "Pro"),
            option(item("team"), "Team"),
          );
          const paint = () =>
            (readout.textContent = `selected: ${(g as unknown as { value: string }).value}`);
          g.addEventListener("zen-value-change", (e) => {
            (g as unknown as { value: string }).value = (e as CustomEvent).detail as string;
            paint();
          });
          paint();
          wrap.append(g, readout);
          return wrap;
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "default-value",
        code: `<zen-radio-group default-value="b">
  <label><zen-radio-group-item value="a"></zen-radio-group-item> A</label>
  <label><zen-radio-group-item value="b"></zen-radio-group-item> B</label>
</zen-radio-group>`,
        render: () =>
          group({ "default-value": "b" }, option(item("a"), "A"), option(item("b"), "B")),
      },
      {
        title: "3. Sizes",
        codeTitle: "size sm · md · lg on zen-radio-group-item",
        code: `<zen-radio-group default-value="b">
  <zen-radio-group-item size="sm" value="a"></zen-radio-group-item>
  <zen-radio-group-item size="md" value="b"></zen-radio-group-item>
  <zen-radio-group-item size="lg" value="c"></zen-radio-group-item>
</zen-radio-group>`,
        render: () =>
          group(
            { "default-value": "b" },
            row(
              item("a", { size: "sm" }),
              item("b", { size: "md" }),
              item("c", { size: "lg" }),
            ),
          ),
      },
      {
        title: "4. Horizontal layout",
        codeTitle: "Row layout for the options",
        code: `<zen-radio-group default-value="opt2" orientation="horizontal">
  <label><zen-radio-group-item value="opt1"></zen-radio-group-item> Option 1</label>
  <label><zen-radio-group-item value="opt2"></zen-radio-group-item> Option 2</label>
  <label><zen-radio-group-item value="opt3"></zen-radio-group-item> Option 3</label>
</zen-radio-group>`,
        render: () =>
          group(
            { "default-value": "opt2", orientation: "horizontal" },
            row(
              option(item("opt1"), "Option 1", { row: true }),
              option(item("opt2"), "Option 2", { row: true }),
              option(item("opt3"), "Option 3", { row: true }),
            ),
          ),
      },
      {
        title: "5. Disabled options",
        codeTitle: "Per-item disabled attribute",
        code: `<zen-radio-group default-value="a">
  <label><zen-radio-group-item value="a"></zen-radio-group-item> Available</label>
  <label><zen-radio-group-item value="locked" disabled></zen-radio-group-item> Locked</label>
</zen-radio-group>`,
        render: () =>
          group(
            { "default-value": "a" },
            option(item("a"), "Available"),
            option(item("locked", { disabled: true }), "Locked", { muted: true }),
          ),
      },
      {
        title: "6. Form submission",
        codeTitle: "name on zen-radio-group serializes to a single FormData entry",
        code: `<form>
  <zen-radio-group name="priority" default-value="medium" orientation="horizontal">
    <label><zen-radio-group-item value="low"></zen-radio-group-item> Low</label>
    <label><zen-radio-group-item value="medium"></zen-radio-group-item> Medium</label>
    <label><zen-radio-group-item value="high"></zen-radio-group-item> High</label>
  </zen-radio-group>
  <button type="submit">Submit</button>
</form>`,
        render: () => {
          const form = document.createElement("form");
          form.style.display = "flex";
          form.style.flexDirection = "column";
          form.style.gap = "12px";
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            alert(`priority = ${fd.get("priority")}`);
          });

          const g = group(
            { name: "priority", "default-value": "medium", orientation: "horizontal" },
            row(
              option(item("low"), "Low", { row: true }),
              option(item("medium"), "Medium", { row: true }),
              option(item("high"), "High", { row: true }),
            ),
          );

          const submit = document.createElement("button");
          submit.type = "submit";
          submit.textContent = "Submit";
          submit.style.width = "fit-content";
          submit.style.padding = "0.375rem 0.75rem";
          submit.style.background = "var(--zen-color-primary)";
          submit.style.color = "white";
          submit.style.border = "0";
          submit.style.borderRadius = "6px";
          submit.style.cursor = "pointer";
          submit.style.fontSize = "0.8125rem";

          form.append(g, submit);
          return form;
        },
      },
    ],
  });
}
