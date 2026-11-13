import { OeeGauge } from "./oee-gauge/oee-gauge";
import { oeeFromCounts } from "@algorisys/zen-ui-core/oee";
import { DemoPage, DemoSection } from "./demo-helpers";

const ROW = { display: "flex", "flex-wrap": "wrap", gap: "32px", "align-items": "flex-start" } as const;

// 480 min planned, 420 run, ideal 1 min/part, 380 made, 361 good.
const shift = oeeFromCounts({ plannedTime: 480, runTime: 420, idealCycleTime: 1, totalCount: 380, goodCount: 361 });
const neverRan = oeeFromCounts({ plannedTime: 480, runTime: 0, idealCycleTime: 1, totalCount: 0, goodCount: 0 });
const overspeed = oeeFromCounts({ plannedTime: 480, runTime: 450, idealCycleTime: 1.5, totalCount: 340, goodCount: 330 });

const NewOeeGaugeDemo = () => (
  <DemoPage
    title="OeeGauge"
    description={
      <>
        Overall Equipment Effectiveness as a half-circle gauge: Availability × Performance ×
        Quality. The number is always printed and the band always named in words, so the
        colour repeats them rather than carrying them alone.
      </>
    }
  >
    <DemoSection
      title="1. The three bands, and no data"
      codeTitle="value is a fraction; null means nothing to show"
      codeDescription={
        <>
          The ring outside the track marks where the bands change. <code>null</code> draws an
          empty track and a dash — never a 0, which would read as the worst shift of the year
          for one nobody measured.
        </>
      }
      code={`<OeeGauge value={0.52} />
<OeeGauge value={0.724} />
<OeeGauge value={0.88} />
<OeeGauge value={null} />`}
      previewStyle={ROW}
    >
      <OeeGauge value={0.52} />
      <OeeGauge value={0.724} />
      <OeeGauge value={0.88} />
      <OeeGauge value={null} />
    </DemoSection>

    <DemoSection
      title="2. From counts and times"
      codeTitle="oeeFromCounts gives OEE and its factors; pass both"
      code={`const r = oeeFromCounts({
  plannedTime: 480,   // minutes scheduled
  runTime: 420,       // minutes it actually ran
  idealCycleTime: 1,  // fastest minutes per part
  totalCount: 380,
  goodCount: 361,
});

<OeeGauge label="Press 4" value={r.oee} factors={r} />`}
      previewStyle={ROW}
    >
      <OeeGauge label="Press 4" value={shift.oee} factors={shift} />
    </DemoSection>

    <DemoSection
      title="3. What it will not hide"
      codeTitle="unknown factors are dashes; Performance over 100% is printed as it is"
      codeDescription={
        <>
          A machine that never ran has an OEE of 0 but no Performance or Quality — there was
          no run to measure. On the right, the ideal cycle time is set slower than the machine
          really runs, so Performance reads 113% and OEE an impossible 103%. The gauge fills
          its arc and prints both as they are, rather than clamping to 100%, because those
          numbers are how anyone finds the bad master data.
        </>
      }
      code={`oeeFromCounts({ plannedTime: 480, runTime: 0, idealCycleTime: 1, totalCount: 0, goodCount: 0 });
// { availability: 0, performance: null, quality: null, oee: 0 }`}
      previewStyle={ROW}
    >
      <OeeGauge label="Never ran" value={neverRan.oee} factors={neverRan} />
      <OeeGauge label="Ideal cycle too slow" value={overspeed.oee} factors={overspeed} />
    </DemoSection>

    <DemoSection
      title="4. Sizes"
      codeTitle="sm for a tile, md by default, lg for a wall board"
      code={`<OeeGauge size="sm" value={0.724} />
<OeeGauge size="lg" value={0.724} />`}
      previewStyle={{ ...ROW, "align-items": "flex-end" }}
    >
      <OeeGauge size="sm" value={0.724} />
      <OeeGauge size="md" value={0.724} />
      <OeeGauge size="lg" value={0.724} />
    </DemoSection>

    <DemoSection
      title="5. A plant's own targets"
      codeTitle="bands moves where near and on target start"
      codeDescription={
        <>
          85% and 65% are the figures usually quoted, not a standard. The same 72.4% is on
          target for a plant whose goal is 70%.
        </>
      }
      code={`<OeeGauge value={0.724} bands={{ fair: 0.55, good: 0.7 }} />`}
      previewStyle={ROW}
    >
      <OeeGauge label="Default targets" value={0.724} />
      <OeeGauge label="Target 70%" value={0.724} bands={{ fair: 0.55, good: 0.7 }} />
    </DemoSection>
  </DemoPage>
);

export default NewOeeGaugeDemo;
