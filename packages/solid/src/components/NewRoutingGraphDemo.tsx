import { createSignal } from "solid-js";
import { RoutingGraph, type RoutingStep } from "./routing-graph/routing-graph";
import type { RoutingLink } from "@algorisys/zen-ui-core/routing";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

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

const NewRoutingGraphDemo = () => {
  const [links, setLinks] = createSignal<RoutingLink[]>(designed);
  const [chain, setChain] = createSignal<RoutingLink[]>([]);
  return (
    <DemoPage
      title="RoutingGraph"
      description={
        <>
          A process's steps and which must finish before which. Laid out left to right by
          longest path, so a step sits after everything it waits for and parallel branches line
          up.
        </>
      }
    >
      <DemoSection
        title="1. Editing a routing"
        codeTitle="links and onLinksChange; select a step to edit what it runs after"
        codeDescription={
          <>
            Bend and drill run in parallel after cutting; welding waits for both branches. Select
            Pack and try to make it run before cutting: the picker never offers a step that
            would close a loop. Everything works from the keyboard — Tab to a step, Enter to
            select it.
          </>
        }
        code={`<RoutingGraph steps={steps} links={links()} onLinksChange={setLinks} />`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
          <RoutingGraph steps={steps} links={links()} onLinksChange={setLinks} data-testid="edit" />
          <div class="zen-flex zen-items-center zen-gap-3">
            <Button variant="outline" onClick={() => setLinks(designed)}>Reset</Button>
            <span class="zen-text-sm zen-tabular-nums" data-testid="links">{links().length} links</span>
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="2. On the shop floor"
        codeTitle="read-only, with each step's status"
        code={`<RoutingGraph steps={stepsWithStatus} links={links} />`}
      >
        <RoutingGraph steps={running} links={designed} data-testid="floor" />
      </DemoSection>

      <DemoSection
        title="3. A new template"
        codeTitle="no links: the steps run in order, drawn dashed"
        codeDescription={<>The first edit writes the chain out as real links, then applies itself — so adding one link does not quietly drop the others.</>}
        code={`<RoutingGraph steps={steps} links={[]} onLinksChange={setLinks} />`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-2">
          <RoutingGraph steps={steps.slice(0, 4)} links={chain()} onLinksChange={setChain} data-testid="chain" />
          <span class="zen-text-sm zen-tabular-nums" data-testid="chain-links">{chain().length} links stored</span>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewRoutingGraphDemo;
