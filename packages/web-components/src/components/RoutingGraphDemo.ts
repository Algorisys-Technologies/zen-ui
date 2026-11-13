import type { RoutingLink, RoutingStep, RoutingStepStatus } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * RoutingGraph — the web-components port, section for section with the
 * vanilla demo. Each graph is a <zen-routing-graph>; listening for
 * `zen-links-change` is what makes one editable, and the page applies the
 * proposal by setting `links` again.
 */

type GraphEl = HTMLElement & Record<string, unknown>;

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

/** A <zen-routing-graph> with its data set as properties. */
const graphOf = (testid: string, props: { steps: RoutingStep[]; links: RoutingLink[] }): GraphEl => {
  const el = document.createElement("zen-routing-graph") as GraphEl;
  el.dataset.testid = testid;
  Object.assign(el, props);
  return el;
};
const onLinks = (el: HTMLElement, fn: (next: RoutingLink[]) => void) =>
  el.addEventListener("zen-links-change", (e) => fn((e as CustomEvent<RoutingLink[]>).detail));

/** Section 1: the links are the page's; the graph only proposes them. */
function editing(): HTMLElement {
  const count = document.createElement("span");
  count.className = "zen-text-sm zen-tabular-nums";
  count.dataset.testid = "links";
  const graph = graphOf("edit", { steps, links: designed });
  const set = (next: RoutingLink[]) => {
    graph.links = next;
    count.textContent = String(next.length) + " links";
  };
  onLinks(graph, set);
  count.textContent = String(designed.length) + " links";
  const reset = document.createElement("zen-button");
  reset.setAttribute("variant", "outline");
  reset.textContent = "Reset";
  reset.addEventListener("click", () => set(designed));
  const row = document.createElement("div");
  row.className = "zen-flex zen-items-center zen-gap-3";
  row.append(reset, count);
  return stack(graph, row);
}

/** Section 3: an empty template, so the first edit writes the chain out. */
function chained(): HTMLElement {
  const count = document.createElement("span");
  count.className = "zen-text-sm zen-tabular-nums";
  count.dataset.testid = "chain-links";
  count.textContent = "0 links stored";
  const graph = graphOf("chain", { steps: first4, links: [] });
  onLinks(graph, (next) => {
    graph.links = next;
    count.textContent = String(next.length) + " links stored";
  });
  return stack(graph, count);
}

export default function RoutingGraphDemo(): HTMLElement {
  return DemoPage({
    title: "RoutingGraph",
    description:
      "A process's steps and which must finish before which. Laid out left to right by longest path, so a step sits after everything it waits for and parallel branches line up.",
    sections: [
      {
        title: "1. Editing a routing",
        codeTitle: "links and zen-links-change; select a step to edit what it runs after",
        codeDescription:
          "Bend and drill run in parallel after cutting; welding waits for both branches. Select Pack and try to make it run before cutting: the picker never offers a step that would close a loop. Everything works from the keyboard — Tab to a step, Enter to select it.",
        code: `<zen-routing-graph id="routing"></zen-routing-graph>
<script>
  const graph = document.getElementById("routing");
  graph.steps = steps;
  graph.links = links;
  graph.addEventListener("zen-links-change", (e) => (graph.links = e.detail));
</script>`,
        render: () => editing(),
      },
      {
        title: "2. On the shop floor",
        codeTitle: "read-only, with each step's status",
        code: `<zen-routing-graph steps='[{ "id": "cut", "label": "Laser cut", "status": "done" }, …]'
                   links='[…]'></zen-routing-graph>`,
        render: () => graphOf("floor", { steps: running, links: designed }),
      },
      {
        title: "3. A new template",
        codeTitle: "no links: the steps run in order, drawn dashed",
        codeDescription:
          "The first edit writes the chain out as real links, then applies itself — so adding one link does not quietly drop the others.",
        code: `<zen-routing-graph id="template" links="[]"></zen-routing-graph>
<script>
  template.addEventListener("zen-links-change", (e) => (template.links = e.detail));
</script>`,
        render: () => chained(),
      },
    ],
  });
}
