import { NativeSelect } from "../components/form/native-select/native-select";
import { Label } from "../components/form/label/label";
import { Input } from "../components/form/input/input";
import { DemoPage } from "./demo-helpers";

/**
 * NativeSelect demo — the vanilla mirror of the React page. Options are DATA
 * (`options: [{ value, label, disabled }]`) rather than slotted <option>
 * children, as in every data-driven family in this binding.
 */

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
        codeTitle: "name + defaultValue",
        codeDescription:
          "No hidden input and no onChange needed — the browser puts the value in the FormData, which is the whole point of reaching for this over a listbox.",
        code: `const form = document.createElement("form");
form.append(
  NativeSelect({
    name: "dept_id",
    defaultValue: "eng",
    options: [
      { value: "", label: "Choose a department" },
      { value: "eng", label: "Engineering" },
      { value: "sales", label: "Sales" },
    ],
  }).el,
);`,
        render: () =>
          box("zen-w-72 zen-space-y-1.5", [
            Label({ for: "dept", children: "Department" }).el,
            NativeSelect({
              id: "dept",
              name: "dept_id",
              defaultValue: "eng",
              options: [
                { value: "", label: "Choose a department" },
                { value: "eng", label: "Engineering" },
                { value: "sales", label: "Sales" },
                { value: "ops", label: "Operations" },
              ],
            }).el,
          ]),
      },
      {
        title: "2. Beside an Input",
        codeTitle: "Same height, same border, same focus ring",
        codeDescription:
          "It borrows Input's exact class list, which is the reason it exists — an unstyled browser select next to a styled Input is the mismatch this removes.",
        code: `Input({ placeholder: "Amount" });
NativeSelect({ defaultValue: "inr", options: [ … ] });`,
        render: () =>
          box("zen-flex zen-gap-2 zen-w-96", [
            Input({ placeholder: "Amount" }).el,
            NativeSelect({
              defaultValue: "inr",
              class: "zen-w-32",
              options: [
                { value: "inr", label: "INR" },
                { value: "usd", label: "USD" },
                { value: "eur", label: "EUR" },
              ],
            }).el,
          ]),
      },
      {
        title: "3. Placeholder option",
        codeTitle: 'An option with value=""',
        codeDescription:
          "The usual way to say 'nothing chosen yet' in a native select, and it pairs with `required` so the browser blocks submission until something is picked. It is NOT greyed: styling the closed control based on which option is selected needs a :has() selector the utility layer does not generate, and dead CSS is worse than none.",
        code: `NativeSelect({
  defaultValue: "",
  options: [
    { value: "", label: "Select a shift" },
    …
  ],
});`,
        render: () =>
          box("zen-w-72", [
            NativeSelect({
              defaultValue: "",
              options: [
                { value: "", label: "Select a shift" },
                { value: "general", label: "General (09:00–18:00)" },
                { value: "night", label: "Night (22:00–06:00)" },
              ],
            }).el,
          ]),
      },
      {
        // Adapted: vanilla's NativeSelect takes a flat `options` array with no
        // group field, so the reference's <optgroup> half becomes a flat list
        // with a disabled option. Disabled control and disabled option are both
        // real here.
        title: "4. Disabled and grouped",
        codeTitle: "Everything a <select> already does",
        codeDescription:
          "Disabled controls, disabled options, required — all of it works, because this is the platform control with a class list on it. (Vanilla's options are a flat array with no group field, so <optgroup> is not available from the factory.)",
        code: `NativeSelect({ disabled: true, options: [ … ] });

NativeSelect({
  options: [
    { value: "basic", label: "Basic" },
    { value: "hra", label: "HRA" },
    { value: "pf", label: "Provident Fund" },
    { value: "tds", label: "TDS (auto)", disabled: true },
  ],
});`,
        render: () =>
          box("zen-flex zen-gap-3 zen-w-full", [
            NativeSelect({
              disabled: true,
              defaultValue: "locked",
              class: "zen-w-48",
              options: [{ value: "locked", label: "Locked" }],
            }).el,
            NativeSelect({
              defaultValue: "basic",
              class: "zen-w-56",
              options: [
                { value: "basic", label: "Basic" },
                { value: "hra", label: "HRA" },
                { value: "pf", label: "Provident Fund" },
                { value: "tds", label: "TDS (auto)", disabled: true },
              ],
            }).el,
          ]),
      },
    ],
  });
}
