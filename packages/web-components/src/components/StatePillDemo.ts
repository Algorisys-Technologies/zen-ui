import {
  MACHINE_STATES,
  isAvailabilityLoss,
  machineStateCategory,
  machineStateTone,
} from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * StatePill demo — the web-components port. <zen-state-pill> is three string
 * attributes and a text child; with no child the pill names its state itself.
 */

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

function pill(attrs: Record<string, string>, text?: string): HTMLElement {
  const p = document.createElement("zen-state-pill");
  for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, v);
  if (text !== undefined) p.textContent = text;
  return p;
}

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
        code: `<zen-state-pill state="running"></zen-state-pill>
<zen-state-pill state="stopped"></zen-state-pill>
<zen-state-pill state="unknown"></zen-state-pill>   <!-- "No data" -->`,
        render: () => row(...MACHINE_STATES.map((s) => pill({ state: s }))),
      },
      {
        title: "2. Sizes",
        codeTitle: "size sm for table cells and dense boards, md by default",
        code: `<zen-state-pill state="running" size="sm"></zen-state-pill>
<zen-state-pill state="running"></zen-state-pill>`,
        render: () =>
          row(
            pill({ state: "running", size: "sm" }),
            pill({ state: "setup", size: "sm" }),
            pill({ state: "fault", size: "sm" }),
            pill({ state: "running" }),
            pill({ state: "setup" }),
            pill({ state: "fault" }),
          ),
      },
      {
        title: "3. Saying why",
        codeTitle: "children replace the label; the colour still comes from state",
        code: `<zen-state-pill state="stopped">Jam at infeed</zen-state-pill>
<zen-state-pill state="maintenance">PM — spindle bearings</zen-state-pill>`,
        render: () =>
          row(
            pill({ state: "stopped" }, "Jam at infeed"),
            pill({ state: "maintenance" }, "PM — spindle bearings"),
            pill({ state: "setup" }, "Changeover to SKU 4471"),
          ),
      },
      {
        title: "4. A vocabulary that is not ours",
        codeTitle: "tone + a label, for PackML or a plant's own states",
        codeDescription: "Nothing has to be squeezed into the nine states. Pass a tone and the label you use.",
        code: `<zen-state-pill tone="planned">Held</zen-state-pill>
<zen-state-pill tone="down">Suspended</zen-state-pill>
<zen-state-pill tone="running">Execute</zen-state-pill>`,
        render: () =>
          row(
            pill({ tone: "running" }, "Execute"),
            pill({ tone: "planned" }, "Held"),
            pill({ tone: "down" }, "Suspended"),
            pill({ tone: "down" }, "Aborted"),
            pill({ tone: "idle" }, "Idle"),
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
          const r = row(pill({ state: "cleaning" }), pill({ state: "maintenance" }));
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
        code: `import { machineStateCategory, isAvailabilityLoss } from "@algorisys/zen-ui-web-components";

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
            pillCell.append(pill({ state: s, size: "sm" }));
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
