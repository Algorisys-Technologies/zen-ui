import { ProductionProgress } from "./production-progress/production-progress";
import { DemoPage, DemoSection } from "./demo-helpers";

const STACK = { display: "grid", gap: "20px", width: "100%", "max-width": "36rem" } as const;

const NewProductionProgressDemo = () => (
  <DemoPage
    title="ProductionProgress"
    description={
      <>
        A work order's good and scrap counts against its target. Colour says what the parts
        are — good or scrap — not how far along the order is: whether 60% is on time is the
        schedule's question, not the bar's.
      </>
    }
  >
    <DemoSection
      title="1. Good, scrap and what is left"
      codeTitle="scrap is drawn, and does not count toward the target"
      codeDescription={
        <>
          The second order has made 480 parts, but 40 were scrap: 60 to go, not 20.
        </>
      }
      code={`<ProductionProgress label="WO-10042 · Bracket" target={500} good={361} scrap={19} />`}
      previewStyle={STACK}
    >
      <ProductionProgress label="WO-10042 · Bracket" target={500} good={361} scrap={19} />
      <ProductionProgress label="WO-10043 · Hinge plate" target={500} good={440} scrap={40} />
    </DemoSection>

    <DemoSection
      title="2. The ends"
      codeTitle="not started, barely started, done, and over"
      codeDescription={
        <>
          3 of 5,000 still gets a 2px sliver: an empty bar means nobody has begun, which is a
          different fact. Past the target the bar is full and the line says by how much.
        </>
      }
      code={`<ProductionProgress target={5000} good={3} />
<ProductionProgress target={500} good={512} scrap={8} />`}
      previewStyle={STACK}
    >
      <ProductionProgress label="Not started" target={5000} good={0} />
      <ProductionProgress label="Barely started" target={5000} good={3} />
      <ProductionProgress label="Done" target={500} good={500} scrap={6} />
      <ProductionProgress label="Over target" target={500} good={512} scrap={8} />
    </DemoSection>

    <DemoSection
      title="3. Counting cartons"
      codeTitle="segments: a row of units the good count fills"
      code={`<ProductionProgress
  label="WO-10042 · packing"
  target={500} good={361}
  segments={{ size: 12, count: 42, unit: "cartons" }}
/>`}
      previewStyle={STACK}
    >
      <ProductionProgress label="WO-10042 · packing" target={500} good={361} segments={{ size: 12, count: 42, unit: "cartons" }} />
    </DemoSection>

    <DemoSection
      title="4. In a table row"
      codeTitle="size sm with hideText; the counts stay in the accessible text"
      code={`<ProductionProgress size="sm" hideText target={500} good={361} scrap={19} />`}
      previewStyle={STACK}
    >
      <ProductionProgress size="sm" hideText label="WO-10042" target={500} good={361} scrap={19} />
    </DemoSection>
  </DemoPage>
);

export default NewProductionProgressDemo;
