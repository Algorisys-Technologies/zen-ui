import { For } from "solid-js";
import { StatePill } from "./state-pill/state-pill";
import {
  MACHINE_STATES,
  isAvailabilityLoss,
  machineStateCategory,
  machineStateTone,
} from "@algorisys/zen-ui-core/machine-state";
import { DemoPage, DemoSection } from "./demo-helpers";

const ROW = { display: "flex", "flex-wrap": "wrap", gap: "8px", "align-items": "center" } as const;

const NewStatePillDemo = () => (
  <DemoPage
    title="StatePill"
    description={
      <>
        A machine's state as a labelled pill. The states come from one shared vocabulary in
        core, which also says how OEE counts each one, so a board and an OEE report cannot
        disagree about what a colour means. The label is always drawn: colour alone must not
        carry the state.
      </>
    }
  >
    <DemoSection
      title="1. Every state"
      codeTitle="state gives the colour and the label"
      codeDescription={
        <>
          Stopped, fault and waiting share the down tone: a starved machine is quiet, and
          quiet reads as fine, but it is lost time. <code>unknown</code> is an outline with
          no fill, because nothing has been heard from the machine.
        </>
      }
      code={`<StatePill state="running" />
<StatePill state="stopped" />
<StatePill state="unknown" />   // "No data"`}
      previewStyle={ROW}
    >
      <For each={MACHINE_STATES}>{(s) => <StatePill state={s} />}</For>
    </DemoSection>

    <DemoSection
      title="2. Sizes"
      codeTitle="size sm for table cells and dense boards, md by default"
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
    </DemoSection>

    <DemoSection
      title="3. Saying why"
      codeTitle="children replace the label; the colour still comes from state"
      code={`<StatePill state="stopped">Jam at infeed</StatePill>
<StatePill state="maintenance">PM — spindle bearings</StatePill>`}
      previewStyle={ROW}
    >
      <StatePill state="stopped">Jam at infeed</StatePill>
      <StatePill state="maintenance">PM — spindle bearings</StatePill>
      <StatePill state="setup">Changeover to SKU 4471</StatePill>
    </DemoSection>

    <DemoSection
      title="4. A vocabulary that is not ours"
      codeTitle="tone + a label, for PackML or a plant's own states"
      codeDescription={
        <>
          Nothing has to be squeezed into the nine states. Pass a <code>tone</code> and the
          label you use.
        </>
      }
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
    </DemoSection>

    <DemoSection
      title="5. A plant's own colours"
      codeTitle="override a tone's tokens; form errors keep theirs"
      codeDescription={
        <>
          Each tone is a <code>--zen-state-*</code> token family that aliases a semantic
          colour by default. Here planned stops are violet, as some andon standards draw them.
        </>
      }
      code={`:root {
  --zen-state-planned: #6250d6;
  --zen-state-planned-soft: #eeebfb;
  --zen-state-planned-soft-fg: #4a3ba8;
}`}
      previewStyle={{
        ...ROW,
        "--zen-state-planned": "#6250d6",
        "--zen-state-planned-soft": "#eeebfb",
        "--zen-state-planned-soft-fg": "#4a3ba8",
      }}
    >
      <StatePill state="cleaning" />
      <StatePill state="maintenance" />
    </DemoSection>

    <DemoSection
      title="6. How each state counts"
      codeTitle="machineStateTone, machineStateCategory, isAvailabilityLoss"
      codeDescription={
        <>
          The same table drives every shop-floor component, and it is exported, so an OEE
          calculation in your app can read it rather than keep its own copy.
        </>
      }
      code={`import { machineStateCategory, isAvailabilityLoss } from "@algorisys/zen-ui-solid";

machineStateCategory("setup");   // "changeover"
isAvailabilityLoss("setup");     // true
isAvailabilityLoss("cleaning");  // false — a planned stop`}
    >
      <table class="zen-w-full zen-text-sm">
        <thead>
          <tr class="zen-text-left zen-text-zen-muted-fg">
            <th class="zen-py-1 zen-pr-4 zen-font-medium">State</th>
            <th class="zen-py-1 zen-pr-4 zen-font-medium">Tone</th>
            <th class="zen-py-1 zen-pr-4 zen-font-medium">OEE category</th>
            <th class="zen-py-1 zen-font-medium">Availability loss</th>
          </tr>
        </thead>
        <tbody>
          <For each={MACHINE_STATES}>
            {(s) => (
              <tr class="zen-border-t zen-border-zen-border">
                <td class="zen-py-1.5 zen-pr-4">
                  <StatePill state={s} size="sm" />
                </td>
                <td class="zen-py-1.5 zen-pr-4 zen-font-mono zen-text-xs">{machineStateTone(s)}</td>
                <td class="zen-py-1.5 zen-pr-4 zen-font-mono zen-text-xs">{machineStateCategory(s)}</td>
                <td class="zen-py-1.5">{isAvailabilityLoss(s) ? "Yes" : "No"}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </DemoSection>
  </DemoPage>
);

export default NewStatePillDemo;
