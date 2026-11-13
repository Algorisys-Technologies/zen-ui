import type { MeasurementJudgement } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * MeasurementInput demo — the web-components port. <zen-measurement-input>
 * takes `spec` as a JSON attribute (or a property), `label` / `unit` /
 * `precision` / `value` / `default-value` as attributes, and fires `zen-change`
 * with `[value, judgement]`. Section 3 builds it inside <zen-locale-provider>.
 */

const bore = { nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 };

type FieldEl = HTMLElement & Record<string, unknown>;

const field = (attrs: Record<string, string | number>): FieldEl => {
  const el = document.createElement("zen-measurement-input") as FieldEl;
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  return el;
};

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
        code: `<zen-measurement-input label="Bore diameter" unit="mm"
  spec='{"nominal":10,"lower":9.9,"upper":10.1,"warnLower":9.95,"warnUpper":10.05}'>
</zen-measurement-input>

el.addEventListener("zen-change", (e) => {
  const [value, j] = e.detail;
  record(value, j.verdict);
});`,
        render: () => {
          const readout = document.createElement("p");
          readout.className = "zen-m-0 zen-text-sm zen-tabular-nums";
          readout.textContent = "zen-change: —";
          const el = field({ label: "Bore diameter", unit: "mm", spec: JSON.stringify(bore), "default-value": 10.02 });
          el.addEventListener("zen-change", (e) => {
            const [value, j] = (e as CustomEvent<[number | null, MeasurementJudgement]>).detail;
            readout.textContent = `zen-change: ${value} → ${j.verdict ?? "no verdict"}`;
          });
          return stack(el, readout);
        },
      },
      {
        title: "2. One-sided specs",
        codeTitle: "a minimum or a maximum alone",
        code: `<zen-measurement-input label="Bolt torque" unit="Nm" spec='{"lower":40}'></zen-measurement-input>
<zen-measurement-input label="Burr height" unit="mm" spec='{"upper":0.2,"nominal":0}'></zen-measurement-input>`,
        render: () =>
          stack(
            field({ label: "Bolt torque", unit: "Nm", spec: JSON.stringify({ lower: 40 }), "default-value": 38 }),
            field({ label: "Burr height", unit: "mm", spec: JSON.stringify({ upper: 0.2, nominal: 0 }), "default-value": 0.05 }),
          ),
      },
      {
        title: "3. Decimals in the user's locale",
        codeTitle: "input and limits follow <zen-locale-provider>",
        codeDescription: "In German the decimal separator is a comma: type 10,07.",
        code: `<zen-locale-provider locale="de-DE">
  <zen-measurement-input label="Bohrung" unit="mm"
    spec='{"nominal":10,"lower":9.9,"upper":10.1,"warnLower":9.95,"warnUpper":10.05}'>
  </zen-measurement-input>
</zen-locale-provider>`,
        render: () => {
          const provider = document.createElement("zen-locale-provider");
          provider.setAttribute("locale", "de-DE");
          provider.append(field({ label: "Bohrung", unit: "mm", spec: JSON.stringify(bore) }));
          return stack(provider);
        },
      },
    ],
  });
}
