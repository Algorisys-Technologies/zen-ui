import type { ReasonCode } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * ReasonCodePicker demo — the web-components port. <zen-reason-code-picker>
 * takes `reasons` as a JSON attribute or a property, `value` / `default-value`
 * / `label` as attributes, and fires `zen-change` with `[id, reason]`.
 */

const downtime: ReasonCode[] = [
  { id: "m12", code: "M12", label: "Hydraulic pressure low", category: "Mechanical" },
  { id: "m07", code: "M07", label: "Tool breakage", category: "Mechanical" },
  { id: "m03", code: "M03", label: "Jam at infeed", category: "Mechanical" },
  { id: "m21", code: "M21", label: "Lubrication alarm", category: "Mechanical" },
  { id: "e02", code: "E02", label: "Power loss", category: "Electrical" },
  { id: "e05", code: "E05", label: "Sensor fault", category: "Electrical", description: "Light curtain or proximity sensor not reading" },
  { id: "e09", code: "E09", label: "Drive overload", category: "Electrical" },
  { id: "s01", code: "S01", label: "No blanks", category: "Supply" },
  { id: "s04", code: "S04", label: "Waiting for crane", category: "Supply" },
  { id: "s06", code: "S06", label: "Packaging material out", category: "Supply" },
  { id: "q01", code: "Q01", label: "First-off inspection", category: "Quality" },
  { id: "q03", code: "Q03", label: "Dimension out of tolerance", category: "Quality", description: "Measured outside the drawing limits" },
  { id: "o01", code: "O01", label: "No operator", category: "Organisational" },
  { id: "o02", code: "O02", label: "Shift handover", category: "Organisational" },
  { id: "o05", code: "O05", label: "Meeting / training", category: "Organisational" },
];

const scrap: ReasonCode[] = [
  { id: "burr", label: "Burr" },
  { id: "scratch", label: "Scratch" },
  { id: "crack", label: "Crack" },
  { id: "dim", label: "Wrong dimension" },
  { id: "other", label: "Other" },
];

type PickerEl = HTMLElement & Record<string, unknown>;

/** `reasons` as a property when given; otherwise the caller put it in `attrs` as JSON. */
const picker = (attrs: Record<string, string>, reasons?: ReasonCode[]): PickerEl => {
  const el = document.createElement("zen-reason-code-picker") as PickerEl;
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  if (reasons) el.reasons = reasons;
  return el;
};

const div = (className: string, ...kids: Node[]) => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...kids);
  return d;
};

/** 1. Controlled: the page owns the answer, and "Record stop" reads it. */
function downtimePicker(): Node {
  let reason: string | undefined = "e05";
  const out = document.createElement("span");
  out.className = "zen-text-sm";
  out.setAttribute("role", "status");

  const record = document.createElement("zen-button");
  record.textContent = "Record stop";
  if (!reason) record.setAttribute("disabled", "");
  record.addEventListener("click", () => {
    out.textContent = "Recorded: " + (downtime.find((r) => r.id === reason)?.label ?? "");
  });

  const el = picker({ label: "Why did Press 5 stop?", value: reason }, downtime);
  el.addEventListener("zen-change", (e) => {
    const [id] = (e as CustomEvent<[string, ReasonCode]>).detail;
    reason = id;
    el.value = id;
    record.toggleAttribute("disabled", !reason);
  });
  return div(
    "zen-flex zen-w-full zen-flex-col zen-gap-3",
    el,
    div("zen-flex zen-items-center zen-gap-3", record, out),
  );
}

export default function ReasonCodePickerDemo(): HTMLElement {
  return DemoPage({
    title: "ReasonCodePicker",
    description:
      "A touch grid for saying why — why a machine stopped, why a part was scrapped. Targets are at least 48px for gloved hands; category chips and a search box appear when the list is long enough to need them.",
    sections: [
      {
        title: "1. Downtime reasons",
        codeTitle: "reasons, value, zen-change",
        codeDescription:
          "Search matches the label, the code and the description, every word in any order, ignoring accents — try “m12”, “sensor” or “low hyd”. Arrow keys move through the grid without choosing; Enter or Space chooses. Filter the selected reason out of view and it stays selected, named under the grid.",
        code: `<zen-reason-code-picker id="why" label="Why did Press 5 stop?"></zen-reason-code-picker>

const picker = document.getElementById("why");
picker.reasons = downtimeReasons;
picker.addEventListener("zen-change", (e) => {
  const [id] = e.detail;
  picker.value = id;
});`,
        render: downtimePicker,
      },
      {
        title: "2. A short list",
        codeTitle: "no categories and few reasons: no chips, no search",
        code: `<zen-reason-code-picker class="zen-max-w-xl" label="Scrap reason"
  reasons='[{"id":"burr","label":"Burr"},{"id":"scratch","label":"Scratch"}, …]'>
</zen-reason-code-picker>`,
        render: () => picker({ class: "zen-max-w-xl", label: "Scrap reason", reasons: JSON.stringify(scrap) }),
      },
    ],
  });
}
