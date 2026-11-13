import type * as React from "react";
import { StatePill } from "./state-pill/state-pill";
import {
  MACHINE_STATES,
  isAvailabilityLoss,
  machineStateCategory,
  machineStateTone,
} from "@algorisys/zen-ui-core/machine-state";
import { CodeExample } from "./demo-helpers";

const ROW: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" };

const NewStatePillDemo: React.FC = () => (
  <div className="demo-page">
    <h1>StatePill</h1>
    <p className="lede">
      A machine's state as a labelled pill. The states come from one shared vocabulary in
      core, which also says how OEE counts each one, so a board and an OEE report cannot
      disagree about what a colour means. The label is always drawn: colour alone must not
      carry the state.
    </p>

    <section className="demo-section">
      <h2>1. Every state</h2>
      <CodeExample
        title="state gives the colour and the label"
        description="Stopped, fault and waiting share the down tone: a starved machine is quiet, and quiet reads as fine, but it is lost time. unknown is an outline with no fill, because nothing has been heard from the machine."
        code={`<StatePill state="running" />
<StatePill state="stopped" />
<StatePill state="unknown" />   // "No data"`}
        previewStyle={ROW}
      >
        {MACHINE_STATES.map((s) => (
          <StatePill key={s} state={s} />
        ))}
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Sizes</h2>
      <CodeExample
        title="size sm for table cells and dense boards, md by default"
        code={`<StatePill state="running" size="sm" />
<StatePill state="running" />`}
        previewStyle={ROW}
      >
        <StatePill state="running" size="sm" />
        <StatePill state="setup" size="sm" />
        <StatePill state="fault" size="sm" />
        <StatePill state="running" />
        <StatePill state="setup" />
        <StatePill state="fault" />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Saying why</h2>
      <CodeExample
        title="children replace the label; the colour still comes from state"
        code={`<StatePill state="stopped">Jam at infeed</StatePill>
<StatePill state="maintenance">PM — spindle bearings</StatePill>`}
        previewStyle={ROW}
      >
        <StatePill state="stopped">Jam at infeed</StatePill>
        <StatePill state="maintenance">PM — spindle bearings</StatePill>
        <StatePill state="setup">Changeover to SKU 4471</StatePill>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. A vocabulary that is not ours</h2>
      <CodeExample
        title="tone + a label, for PackML or a plant's own states"
        description="Nothing has to be squeezed into the nine states. Pass a tone and the label you use."
        code={`<StatePill tone="planned">Held</StatePill>
<StatePill tone="down">Suspended</StatePill>
<StatePill tone="running">Execute</StatePill>`}
        previewStyle={ROW}
      >
        <StatePill tone="running">Execute</StatePill>
        <StatePill tone="planned">Held</StatePill>
        <StatePill tone="down">Suspended</StatePill>
        <StatePill tone="down">Aborted</StatePill>
        <StatePill tone="idle">Idle</StatePill>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. A plant's own colours</h2>
      <CodeExample
        title="override a tone's tokens; form errors keep theirs"
        description="Each tone is a --zen-state-* token family that aliases a semantic colour by default. Here planned stops are violet, as some andon standards draw them."
        code={`:root {
  --zen-state-planned: #6250d6;
  --zen-state-planned-soft: #eeebfb;
  --zen-state-planned-soft-fg: #4a3ba8;
}`}
        previewStyle={
          {
            ...ROW,
            "--zen-state-planned": "#6250d6",
            "--zen-state-planned-soft": "#eeebfb",
            "--zen-state-planned-soft-fg": "#4a3ba8",
          } as React.CSSProperties
        }
      >
        <StatePill state="cleaning" />
        <StatePill state="maintenance" />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. How each state counts</h2>
      <CodeExample
        title="machineStateTone, machineStateCategory, isAvailabilityLoss"
        description="The same table drives every shop-floor component, and it is exported, so an OEE calculation in your app can read it rather than keep its own copy."
        code={`import { machineStateCategory, isAvailabilityLoss } from "@algorisys/zen-ui-react";

machineStateCategory("setup");   // "changeover"
isAvailabilityLoss("setup");     // true
isAvailabilityLoss("cleaning");  // false — a planned stop`}
      >
        <table className="zen-w-full zen-text-sm">
          <thead>
            <tr className="zen-text-left zen-text-zen-muted-fg">
              <th className="zen-py-1 zen-pr-4 zen-font-medium">State</th>
              <th className="zen-py-1 zen-pr-4 zen-font-medium">Tone</th>
              <th className="zen-py-1 zen-pr-4 zen-font-medium">OEE category</th>
              <th className="zen-py-1 zen-font-medium">Availability loss</th>
            </tr>
          </thead>
          <tbody>
            {MACHINE_STATES.map((s) => (
              <tr key={s} className="zen-border-t zen-border-zen-border">
                <td className="zen-py-1.5 zen-pr-4">
                  <StatePill state={s} size="sm" />
                </td>
                <td className="zen-py-1.5 zen-pr-4 zen-font-mono zen-text-xs">{machineStateTone(s)}</td>
                <td className="zen-py-1.5 zen-pr-4 zen-font-mono zen-text-xs">{machineStateCategory(s)}</td>
                <td className="zen-py-1.5">{isAvailabilityLoss(s) ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CodeExample>
    </section>
  </div>
);

export default NewStatePillDemo;
