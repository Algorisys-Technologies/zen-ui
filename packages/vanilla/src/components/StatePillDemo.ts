import { StatePill } from "./state-pill/state-pill";
import {
  MACHINE_STATES,
  isAvailabilityLoss,
  machineStateCategory,
  machineStateTone,
} from "@algorisys/zen-ui-core/machine-state";
import { DemoPage } from "./demo-helpers";

const row = (...children: Node[]): HTMLElement => {
  const div = document.createElement("div");
  Object.assign(div.style, { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" });
  div.append(...children);
  return div;
};

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export default function StatePillDemo(): HTMLElement {
  return DemoPage({
    title: "StatePill",
    description:
      "A machine's state as a labelled pill. The states come from one shared vocabulary in core, which also says how OEE counts each one, so a board and an OEE report cannot disagree about what a colour means. The label is always drawn: colour alone must not carry the state.",
    sections: [
      {
        title: "1. Every state",
        codeTitle: "state gives the colour and the label",
        codeDescription:
          "Stopped, fault and waiting share the down tone: a starved machine is quiet, and quiet reads as fine, but it is lost time. unknown is an outline with no fill, because nothing has been heard from the machine.",
        code: `StatePill({ state: "running" })
StatePill({ state: "stopped" })
StatePill({ state: "unknown" })   // "No data"`,
        render: () => row(...MACHINE_STATES.map((s) => StatePill({ state: s }).el)),
      },
      {
        title: "2. Sizes",
        codeTitle: "size sm for table cells and dense boards, md by default",
        code: `StatePill({ state: "running", size: "sm" })
StatePill({ state: "running" })`,
        render: () =>
          row(
            StatePill({ state: "running", size: "sm" }).el,
            StatePill({ state: "setup", size: "sm" }).el,
            StatePill({ state: "fault", size: "sm" }).el,
            StatePill({ state: "running" }).el,
            StatePill({ state: "setup" }).el,
            StatePill({ state: "fault" }).el,
          ),
      },
      {
        title: "3. Saying why",
        codeTitle: "children replace the label; the colour still comes from state",
        code: `StatePill({ state: "stopped", children: "Jam at infeed" })
StatePill({ state: "maintenance", children: "PM — spindle bearings" })`,
        render: () =>
          row(
            StatePill({ state: "stopped", children: "Jam at infeed" }).el,
            StatePill({ state: "maintenance", children: "PM — spindle bearings" }).el,
            StatePill({ state: "setup", children: "Changeover to SKU 4471" }).el,
          ),
      },
      {
        title: "4. A vocabulary that is not ours",
        codeTitle: "tone + a label, for PackML or a plant's own states",
        codeDescription: "Nothing has to be squeezed into the nine states. Pass a tone and the label you use.",
        code: `StatePill({ tone: "planned", children: "Held" })
StatePill({ tone: "down", children: "Suspended" })
StatePill({ tone: "running", children: "Execute" })`,
        render: () =>
          row(
            StatePill({ tone: "running", children: "Execute" }).el,
            StatePill({ tone: "planned", children: "Held" }).el,
            StatePill({ tone: "down", children: "Suspended" }).el,
            StatePill({ tone: "down", children: "Aborted" }).el,
            StatePill({ tone: "idle", children: "Idle" }).el,
          ),
      },
      {
        title: "5. A plant's own colours",
        codeTitle: "override a tone's tokens; form errors keep theirs",
        codeDescription:
          "Each tone is a --zen-state-* token family that aliases a semantic colour by default. Here planned stops are violet, as some andon standards draw them.",
        code: `:root {
  --zen-state-planned: #6250d6;
  --zen-state-planned-soft: #eeebfb;
  --zen-state-planned-soft-fg: #4a3ba8;
}`,
        render: () => {
          const r = row(StatePill({ state: "cleaning" }).el, StatePill({ state: "maintenance" }).el);
          r.style.setProperty("--zen-state-planned", "#6250d6");
          r.style.setProperty("--zen-state-planned-soft", "#eeebfb");
          r.style.setProperty("--zen-state-planned-soft-fg", "#4a3ba8");
          return r;
        },
      },
      {
        title: "6. How each state counts",
        codeTitle: "machineStateTone, machineStateCategory, isAvailabilityLoss",
        codeDescription:
          "The same table drives every shop-floor component, and it is exported, so an OEE calculation in your app can read it rather than keep its own copy.",
        code: `import { machineStateCategory, isAvailabilityLoss } from "@algorisys/zen-ui-vanilla";

machineStateCategory("setup");   // "changeover"
isAvailabilityLoss("setup");     // true
isAvailabilityLoss("cleaning");  // false — a planned stop`,
        render: () => {
          const table = el("table", "zen-w-full zen-text-sm");
          const head = el("tr", "zen-text-left zen-text-zen-muted-fg");
          head.append(
            el("th", "zen-py-1 zen-pr-4 zen-font-medium", "State"),
            el("th", "zen-py-1 zen-pr-4 zen-font-medium", "Tone"),
            el("th", "zen-py-1 zen-pr-4 zen-font-medium", "OEE category"),
            el("th", "zen-py-1 zen-font-medium", "Availability loss"),
          );
          const thead = document.createElement("thead");
          thead.append(head);
          const tbody = document.createElement("tbody");
          for (const s of MACHINE_STATES) {
            const tr = el("tr", "zen-border-t zen-border-zen-border");
            const pillCell = el("td", "zen-py-1.5 zen-pr-4");
            pillCell.append(StatePill({ state: s, size: "sm" }).el);
            tr.append(
              pillCell,
              el("td", "zen-py-1.5 zen-pr-4 zen-font-mono zen-text-xs", machineStateTone(s)),
              el("td", "zen-py-1.5 zen-pr-4 zen-font-mono zen-text-xs", machineStateCategory(s)),
              el("td", "zen-py-1.5", isAvailabilityLoss(s) ? "Yes" : "No"),
            );
            tbody.append(tr);
          }
          table.append(thead, tbody);
          return table;
        },
      },
    ],
  });
}
