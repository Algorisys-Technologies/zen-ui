import { createSignal } from "solid-js";
import { MeasurementInput } from "./measurement-input/measurement-input";
import { LocaleProvider } from "./locale/locale";
import type { MeasurementJudgement } from "@algorisys/zen-ui-core/measurement";
import { DemoPage, DemoSection } from "./demo-helpers";

const STACK = { display: "grid", gap: "24px", width: "100%" } as const;
const bore = { nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 };

const NewMeasurementInputDemo = () => {
  const [last, setLast] = createSignal<{ value: number | null; j: MeasurementJudgement }>();
  return (
    <DemoPage
      title="MeasurementInput"
      description={
        <>
          An inspection reading checked against its limits as it is typed. The verdict is in
          words with an icon, and a scale shows the tolerance band, the warning band inside
          it, the nominal and the reading.
        </>
      }
    >
      <DemoSection
        title="1. Two-sided with a warning band"
        codeTitle="spec: nominal, limits, and an optional warning band"
        codeDescription={
          <>
            Try <code>10.02</code> (within tolerance), <code>10.07</code> (near the upper
            limit), <code>10.12</code> (out), and <code>1000</code>: the scale is built from the
            limits, so a typo is pinned to the end and marked off the scale instead of
            squashing the band to nothing.
          </>
        }
        code={`<MeasurementInput
  label="Bore diameter" unit="mm"
  spec={{ nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 }}
  onChange={(value, j) => record(value, j.verdict)}
/>`}
        previewStyle={STACK}
      >
        <MeasurementInput label="Bore diameter" unit="mm" spec={bore} defaultValue={10.02} onChange={(value, j) => setLast({ value, j })} />
        <p class="zen-m-0 zen-text-sm zen-tabular-nums">
          onChange: {last() ? `${last()?.value} → ${last()?.j.verdict ?? "no verdict"}` : "—"}
        </p>
      </DemoSection>

      <DemoSection
        title="2. One-sided specs"
        codeTitle="a minimum or a maximum alone"
        code={`<MeasurementInput label="Bolt torque" unit="Nm" spec={{ lower: 40 }} />
<MeasurementInput label="Burr height" unit="mm" spec={{ upper: 0.2, nominal: 0 }} />`}
        previewStyle={STACK}
      >
        <MeasurementInput label="Bolt torque" unit="Nm" spec={{ lower: 40 }} defaultValue={38} />
        <MeasurementInput label="Burr height" unit="mm" spec={{ upper: 0.2, nominal: 0 }} defaultValue={0.05} />
      </DemoSection>

      <DemoSection
        title="3. Decimals in the user's locale"
        codeTitle="input and limits follow LocaleProvider"
        codeDescription={<>In German the decimal separator is a comma: type <code>10,07</code>.</>}
        code={`<LocaleProvider locale="de-DE">
  <MeasurementInput label="Bohrung" unit="mm" spec={bore} />
</LocaleProvider>`}
        previewStyle={STACK}
      >
        <LocaleProvider locale="de-DE">
          <MeasurementInput label="Bohrung" unit="mm" spec={bore} />
        </LocaleProvider>
      </DemoSection>
    </DemoPage>
  );
};

export default NewMeasurementInputDemo;
