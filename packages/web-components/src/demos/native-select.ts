import { DemoPage } from "./demo-helpers";

/**
 * NativeSelect demo — the web-components mirror of the vanilla page. Renders
 * <zen-native-select>; `options` is DATA (a JS property, or JSON in the
 * attribute) rather than slotted <option> children, as in every data-driven
 * family in this binding. `name`, `default-value`, `disabled` and `required` are
 * attributes.
 */

type Option = { value: string; label: string; disabled?: boolean };

function nativeSelect(
  options: Option[],
  attrs: Record<string, string> = {},
): HTMLElement {
  const s = document.createElement("zen-native-select");
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  (s as unknown as { options: Option[] }).options = options;
  return s;
}

const box = (className: string, children: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...children);
  return d;
};

export default function NativeSelectDemo(): HTMLElement {
  return DemoPage({
    title: "Native Select",
    description:
      "A styled <select>. Not a lesser Select — a different control for a different job. Select is a listbox: reach for it when the options need what the platform cannot draw (icons, two-line rows, groups, a search field), or when the open state must be controlled. NativeSelect is the platform control: it submits inside a plain <form> with no hidden input and no JavaScript, and it opens as the OS picker on a phone.",
    sections: [
      {
        title: "1. In a form",
        codeTitle: "name + default-value",
        codeDescription:
          "No hidden input and no zen-change listener needed — the browser puts the value in the FormData, which is the whole point of reaching for this over a listbox.",
        code: `<form>
  <zen-label for="dept">Department</zen-label>
  <!-- input-id, not id: it lands on the inner <select>, which <label for> can name -->
  <zen-native-select
    input-id="dept"
    name="dept_id"
    default-value="eng"
    options='[
      { "value": "", "label": "Choose a department" },
      { "value": "eng", "label": "Engineering" },
      { "value": "sales", "label": "Sales" }
    ]'
  ></zen-native-select>
</form>`,
        render: () => {
          const label = document.createElement("zen-label");
          label.setAttribute("for", "dept");
          label.textContent = "Department";
          const select = nativeSelect(
            [
              { value: "", label: "Choose a department" },
              { value: "eng", label: "Engineering" },
              { value: "sales", label: "Sales" },
              { value: "ops", label: "Operations" },
            ],
            { name: "dept_id", "default-value": "eng", "input-id": "dept" },
          );
          return box("zen-w-72 zen-space-y-1.5", [label, select]);
        },
      },
      {
        title: "2. Beside an Input",
        codeTitle: "Same height, same border, same focus ring",
        codeDescription:
          "It borrows Input's exact class list, which is the reason it exists — an unstyled browser select next to a styled Input is the mismatch this removes.",
        code: `<zen-input placeholder="Amount"></zen-input>
<zen-native-select default-value="inr" options='[ … ]'></zen-native-select>`,
        render: () => {
          const input = document.createElement("zen-input");
          input.setAttribute("placeholder", "Amount");
          return box("zen-flex zen-gap-2 zen-w-96", [
            input,
            nativeSelect(
              [
                { value: "inr", label: "INR" },
                { value: "usd", label: "USD" },
                { value: "eur", label: "EUR" },
              ],
              { "default-value": "inr", class: "zen-w-32" },
            ),
          ]);
        },
      },
      {
        title: "3. Placeholder option",
        codeTitle: 'An option with value=""',
        codeDescription:
          "The usual way to say 'nothing chosen yet' in a native select, and it pairs with `required` so the browser blocks submission until something is picked. It is NOT greyed: styling the closed control based on which option is selected needs a :has() selector the utility layer does not generate, and dead CSS is worse than none.",
        code: `<zen-native-select
  default-value=""
  options='[
    { "value": "", "label": "Select a shift" },
    …
  ]'
></zen-native-select>`,
        render: () =>
          box("zen-w-72", [
            nativeSelect(
              [
                { value: "", label: "Select a shift" },
                { value: "general", label: "General (09:00–18:00)" },
                { value: "night", label: "Night (22:00–06:00)" },
              ],
              { "default-value": "" },
            ),
          ]),
      },
      {
        // Adapted, as in vanilla: the factory takes a flat `options` array with
        // no group field, so the reference's <optgroup> half becomes a flat list
        // with a disabled option. Disabled control and disabled option are both
        // real here.
        title: "4. Disabled and grouped",
        codeTitle: "Everything a <select> already does",
        codeDescription:
          "Disabled controls, disabled options, required — all of it works, because this is the platform control with a class list on it. (The options are a flat array with no group field, so <optgroup> is not available from the element.)",
        code: `<zen-native-select disabled options='[ … ]'></zen-native-select>

const s = document.createElement("zen-native-select");
s.options = [
  { value: "basic", label: "Basic" },
  { value: "hra", label: "HRA" },
  { value: "pf", label: "Provident Fund" },
  { value: "tds", label: "TDS (auto)", disabled: true },
];`,
        render: () =>
          box("zen-flex zen-gap-3 zen-w-full", [
            nativeSelect([{ value: "locked", label: "Locked" }], {
              disabled: "",
              "default-value": "locked",
              class: "zen-w-48",
            }),
            nativeSelect(
              [
                { value: "basic", label: "Basic" },
                { value: "hra", label: "HRA" },
                { value: "pf", label: "Provident Fund" },
                { value: "tds", label: "TDS (auto)", disabled: true },
              ],
              { "default-value": "basic", class: "zen-w-56" },
            ),
          ]),
      },
    ],
  });
}
