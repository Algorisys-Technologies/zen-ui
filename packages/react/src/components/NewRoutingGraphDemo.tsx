import * as React from "react";
import { RoutingGraph, type RoutingStep } from "./routing-graph/routing-graph";
import type { RoutingLink } from "@algorisys/zen-ui-core/routing";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

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
const running: RoutingStep[] = steps.map((s) => ({
  ...s,
  detail: undefined,
  status: (({ cut: "done", bend: "done", drill: "done", deburr: "active", weld: "pending", paint: "pending", pack: "pending" }) as const)[s.id as "cut"],
}));
const first4 = steps.slice(0, 4);

const NewRoutingGraphDemo = () => {
  const [links, setLinks] = React.useState<RoutingLink[]>(designed);
  const [chain, setChain] = React.useState<RoutingLink[]>([]);
  return (
    <div className="demo-page">
      <h1>RoutingGraph</h1>
      <p className="lede">
        A process's steps and which must finish before which. Laid out left to right by
        longest path, so a step sits after everything it waits for and parallel branches line
        up.
      </p>

      <section className="demo-section">
        <h2>1. Editing a routing</h2>
        <CodeExample
          title="links and onLinksChange; select a step to edit what it runs after"
          description="Bend and drill run in parallel after cutting; welding waits for both branches. Select Pack and try to make it run before cutting: the picker never offers a step that would close a loop. Everything works from the keyboard — Tab to a step, Enter to select it."
          code={`<RoutingGraph steps={steps} links={links} onLinksChange={setLinks} />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <RoutingGraph steps={steps} links={links} onLinksChange={setLinks} data-testid="edit" />
            <div className="zen-flex zen-items-center zen-gap-3">
              <Button variant="outline" onClick={() => setLinks(designed)}>
                Reset
              </Button>
              <span className="zen-text-sm zen-tabular-nums" data-testid="links">
                {links.length} links
              </span>
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. On the shop floor</h2>
        <CodeExample title="read-only, with each step's status" code={`<RoutingGraph steps={stepsWithStatus} links={links} />`}>
          <RoutingGraph steps={running} links={designed} data-testid="floor" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. A new template</h2>
        <CodeExample
          title="no links: the steps run in order, drawn dashed"
          description="The first edit writes the chain out as real links, then applies itself — so adding one link does not quietly drop the others."
          code={`<RoutingGraph steps={steps} links={[]} onLinksChange={setLinks} />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <RoutingGraph steps={first4} links={chain} onLinksChange={setChain} data-testid="chain" />
            <span className="zen-text-sm zen-tabular-nums" data-testid="chain-links">
              {chain.length} links stored
            </span>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewRoutingGraphDemo;
