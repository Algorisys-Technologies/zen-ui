import { RoutingGraph, type RoutingStep, type RoutingStepStatus } from "./routing-graph/routing-graph";
import type { RoutingLink } from "@algorisys/zen-ui-core/routing";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

const steps: RoutingStep[] = [
  { id: "cut", label: "Laser cut", detail: "Laser 2" },
  { id: "bend", label: "Bend", detail: "Press brake 1" },
  { id: "drill", label: "Drill", detail: "Drill 3" },
  { id: "deburr", label: "Deburr", detail: "Bench" },
  { id: "weld", label: "Weld", detail: "Weld cell A" },
  { id: "paint", label: "Powder coat", detail: "Paint line" },
  { id: "pack", label: "Pack", detail: "Packing" },
];
const designed: RoutingLink[] = [
  { from: "cut", to: "bend" },
  { from: "cut", to: "drill" },
  { from: "drill", to: "deburr" },
  { from: "bend", to: "weld" },
  { from: "deburr", to: "weld" },
  { from: "weld", to: "paint" },
  { from: "paint", to: "pack" },
];
const FLOOR: Record<string, RoutingStepStatus> = {
  cut: "done",
  bend: "done",
  drill: "done",
  deburr: "active",
  weld: "pending",
  paint: "pending",
  pack: "pending",
};
const running: RoutingStep[] = steps.map((s) => ({ ...s, detail: undefined, status: FLOOR[s.id] }));
const first4 = steps.slice(0, 4);

const stack = (...children: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";
  d.append(...children);
  return d;
};

/** Section 1: the links are the page's; the graph only proposes them. */
function editing(): HTMLElement {
  let links = designed;
  const count = document.createElement("span");
  count.className = "zen-text-sm zen-tabular-nums";
  count.dataset.testid = "links";
  const set = (next: RoutingLink[]) => {
    links = next;
    graph.update({ links });
    count.textContent = String(links.length) + " links";
  };
  const graph = RoutingGraph({ steps, links, onLinksChange: set, "data-testid": "edit" });
  count.textContent = String(links.length) + " links";
  const row = document.createElement("div");
  row.className = "zen-flex zen-items-center zen-gap-3";
  row.append(Button({ variant: "outline", children: "Reset", onClick: () => set(designed) }).el, count);
  return stack(graph.el, row);
}

/** Section 3: an empty template, so the first edit writes the chain out. */
function chained(): HTMLElement {
  const count = document.createElement("span");
  count.className = "zen-text-sm zen-tabular-nums";
  count.dataset.testid = "chain-links";
  count.textContent = "0 links stored";
  const graph = RoutingGraph({
    steps: first4,
    links: [],
    "data-testid": "chain",
    onLinksChange: (next) => {
      graph.update({ links: next });
      count.textContent = String(next.length) + " links stored";
    },
  });
  return stack(graph.el, count);
}

export default function RoutingGraphDemo(): HTMLElement {
  return DemoPage({
    title: "RoutingGraph",
    description:
      "A process's steps and which must finish before which. Laid out left to right by longest path, so a step sits after everything it waits for and parallel branches line up.",
    sections: [
      {
        title: "1. Editing a routing",
        codeTitle: "links and onLinksChange; select a step to edit what it runs after",
        codeDescription:
          "Bend and drill run in parallel after cutting; welding waits for both branches. Select Pack and try to make it run before cutting: the picker never offers a step that would close a loop. Everything works from the keyboard — Tab to a step, Enter to select it.",
        code: `const graph = RoutingGraph({
  steps, links,
  onLinksChange: (next) => graph.update({ links: next }),
});`,
        render: () => editing(),
      },
      {
        title: "2. On the shop floor",
        codeTitle: "read-only, with each step's status",
        code: `RoutingGraph({ steps: stepsWithStatus, links }).el`,
        render: () => RoutingGraph({ steps: running, links: designed, "data-testid": "floor" }).el,
      },
      {
        title: "3. A new template",
        codeTitle: "no links: the steps run in order, drawn dashed",
        codeDescription:
          "The first edit writes the chain out as real links, then applies itself — so adding one link does not quietly drop the others.",
        code: `RoutingGraph({ steps, links: [], onLinksChange: (next) => graph.update({ links: next }) })`,
        render: () => chained(),
      },
    ],
  });
}
