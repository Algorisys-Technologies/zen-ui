import { MeasurementInput } from "./measurement-input/measurement-input";
import { LocaleProvider } from "./locale/locale";
import { DemoPage } from "./demo-helpers";

const bore = { nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 };

/** The preview's own layout: a stack of full-width fields. */
const stack = (...nodes: Node[]) => {
  const box = document.createElement("div");
  box.style.display = "grid";
  box.style.gap = "24px";
  box.style.width = "100%";
  box.append(...nodes);
  return box;
};

export default function MeasurementInputDemo(): HTMLElement {
  return DemoPage({
    title: "MeasurementInput",
    description:
      "An inspection reading checked against its limits as it is typed. The verdict is in words with an icon, and a scale shows the tolerance band, the warning band inside it, the nominal and the reading.",
    sections: [
      {
        title: "1. Two-sided with a warning band",
        codeTitle: "spec: nominal, limits, and an optional warning band",
        codeDescription:
          "Try 10.02 (within tolerance), 10.07 (near the upper limit), 10.12 (out), and 1000: the scale is built from the limits, so a typo is pinned to the end and marked off the scale instead of squashing the band to nothing.",
        code: `MeasurementInput({
  label: "Bore diameter", unit: "mm",
  spec: { nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 },
  onChange: (value, j) => record(value, j.verdict),
})`,
        render: () => {
          const readout = document.createElement("p");
          readout.className = "zen-m-0 zen-text-sm zen-tabular-nums";
          readout.textContent = "onChange: —";
          const field = MeasurementInput({
            label: "Bore diameter",
            unit: "mm",
            spec: bore,
            defaultValue: 10.02,
            onChange: (value, j) => {
              readout.textContent = `onChange: ${value} → ${j.verdict ?? "no verdict"}`;
            },
          });
          return stack(field.el, readout);
        },
      },
      {
        title: "2. One-sided specs",
        codeTitle: "a minimum or a maximum alone",
        code: `MeasurementInput({ label: "Bolt torque", unit: "Nm", spec: { lower: 40 } })
MeasurementInput({ label: "Burr height", unit: "mm", spec: { upper: 0.2, nominal: 0 } })`,
        render: () =>
          stack(
            MeasurementInput({ label: "Bolt torque", unit: "Nm", spec: { lower: 40 }, defaultValue: 38 }).el,
            MeasurementInput({ label: "Burr height", unit: "mm", spec: { upper: 0.2, nominal: 0 }, defaultValue: 0.05 }).el,
          ),
      },
      {
        title: "3. Decimals in the user's locale",
        codeTitle: "input and limits follow LocaleProvider",
        codeDescription: "In German the decimal separator is a comma: type 10,07.",
        code: `LocaleProvider({
  locale: "de-DE",
  children: () => MeasurementInput({ label: "Bohrung", unit: "mm", spec: bore }),
})`,
        render: () =>
          stack(
            LocaleProvider({
              locale: "de-DE",
              children: () => MeasurementInput({ label: "Bohrung", unit: "mm", spec: bore }),
            }).el,
          ),
      },
    ],
  });
}
