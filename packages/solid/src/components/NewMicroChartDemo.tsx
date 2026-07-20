import {
  MicroBarChart,
  MicroBulletChart,
  MicroDeltaChart,
  MicroLineChart,
  MicroRadialChart,
} from "./micro-chart/micro-chart";
import { For } from "solid-js";
import { DemoPage, DemoSection } from "./demo-helpers";

const REVENUE = [12, 15, 11, 18, 16, 22, 19, 25];
const CHURN = [8, 7, 9, 6, 7, 5, 6, 4];

const ROWS = [
  { name: "EMEA", series: [12, 15, 11, 18, 16, 22], quota: 82, target: 75, from: 40, to: 52 },
  { name: "Americas", series: [20, 18, 21, 17, 15, 14], quota: 61, target: 75, from: 55, to: 47 },
  { name: "APAC", series: [5, 8, 9, 12, 14, 19], quota: 94, target: 75, from: 22, to: 38 },
];

const NewMicroChartDemo = () => (
  <DemoPage
    title="Micro charts"
    description={
      <>
        Trend marks small enough to live inside something else — a table cell, a
        card, a list row. Not small versions of <code>Chart</code>: there is no
        axis, no legend and no tooltip, because everything that would explain
        the number is already in the row around it.
      </>
    }
  >
    <DemoSection
      title="1. The five shapes"
      codeTitle="Each answers a different question"
      codeDescription="Line for a series you read as a shape; bar for a series where the individual values matter; bullet for one value against a target; delta for a comparison of exactly two; radial for one value as a proportion of a whole. Fiori ships nine — Harvey ball, comparison and stacked bar are restatements of radial and bar with fewer affordances, so they are not here."
      code={`<MicroLineChart   values={[12, 15, 11, 18, 16, 22]} />
<MicroBarChart    values={[12, 15, 11, 18, 16, 22]} />
<MicroBulletChart value={82} target={75} />
<MicroDeltaChart  from={40} to={52} />
<MicroRadialChart value={72} showValue />`}
    >
      <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-8">
        <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
          <MicroLineChart values={REVENUE} />
          <span class="zen-text-xs zen-text-zen-muted-fg">line</span>
        </div>
        <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
          <MicroBarChart values={REVENUE} />
          <span class="zen-text-xs zen-text-zen-muted-fg">bar</span>
        </div>
        <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
          <MicroBulletChart value={82} target={75} />
          <span class="zen-text-xs zen-text-zen-muted-fg">bullet</span>
        </div>
        <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
          <MicroDeltaChart from={40} to={52} />
          <span class="zen-text-xs zen-text-zen-muted-fg">delta</span>
        </div>
        <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
          <MicroRadialChart value={72} showValue />
          <span class="zen-text-xs zen-text-zen-muted-fg">radial</span>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="2. Delta colours itself"
      codeTitle="Direction is the point, so the caller does not paint it"
      codeDescription="A rise is success and a fall is error, derived from the numbers rather than passed in — letting a caller paint a fall green would defeat the component. Pass `color` explicitly only when up is bad: cost, error rate, latency, churn. That is the one case where the default would lie."
      code={`<MicroDeltaChart from={40} to={52} />              // up   -> success
<MicroDeltaChart from={55} to={47} />              // down -> error

// up is bad here, so say so:
<MicroDeltaChart from={2.1} to={3.4} color="error" />`}
    >
      <div class="zen-flex zen-flex-wrap zen-items-end zen-gap-8">
        <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
          <MicroDeltaChart from={40} to={52} />
          <span class="zen-text-xs zen-text-zen-muted-fg">40 → 52</span>
        </div>
        <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
          <MicroDeltaChart from={55} to={47} />
          <span class="zen-text-xs zen-text-zen-muted-fg">55 → 47</span>
        </div>
        <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
          <MicroDeltaChart from={2.1} to={3.4} color="error" />
          <span class="zen-text-xs zen-text-zen-muted-fg">churn up (bad)</span>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="3. Where they actually go"
      codeTitle="Inside a table cell"
      codeDescription="This is the case micro charts exist for. They are sized in px and sit in text flow, so they align on the baseline of the row without stretching the cell. A percentage width would collapse in a cell that has not been measured, which is why there isn't one."
      code={`<td><MicroLineChart values={row.series} width={64} height={20} /></td>
<td><MicroBulletChart value={row.quota} target={75} width={64} /></td>`}
    >
      <table class="zen-w-full zen-text-sm">
        <thead>
          <tr class="zen-border-b zen-border-zen-border zen-text-xs zen-text-zen-muted-fg">
            <th class="zen-px-2 zen-py-2 zen-text-start">Region</th>
            <th class="zen-px-2 zen-py-2 zen-text-start">Trend</th>
            <th class="zen-px-2 zen-py-2 zen-text-start">Quota</th>
            <th class="zen-px-2 zen-py-2 zen-text-start">Change</th>
          </tr>
        </thead>
        <tbody>
          <For each={ROWS}>
            {(r) => (
            <tr class="zen-border-b zen-border-zen-border last:zen-border-0">
              <td class="zen-px-2 zen-py-3">{r.name}</td>
              <td class="zen-px-2 zen-py-3">
                <MicroLineChart values={r.series} width={64} height={20} />
              </td>
              <td class="zen-px-2 zen-py-3">
                <MicroBulletChart value={r.quota} target={r.target} width={64} />
              </td>
              <td class="zen-px-2 zen-py-3">
                <MicroDeltaChart from={r.from} to={r.to} width={48} height={20} />
              </td>
            </tr>
            )}
          </For>
        </tbody>
      </table>
    </DemoSection>

    <DemoSection
      title="4. Colour and area"
      codeTitle="`color` takes the semantic scale, not a hex"
      codeDescription="The same six words the rest of the library uses — primary, success, warning, error, info, muted — so a micro chart cannot drift away from the theme. Fill comes from currentColor, so wrapping one in anything that sets a text colour works too. `area` fills under a line; it is off by default because at this size it muddies the shape more than it helps."
      code={`<MicroLineChart values={data} color="success" />
<MicroLineChart values={data} area />

// or just inherit:
<span class="zen-text-zen-warning"><MicroBarChart values={data} /></span>`}
    >
      <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-6">
        <MicroLineChart values={REVENUE} color="success" />
        <MicroLineChart values={CHURN} color="error" />
        <MicroLineChart values={REVENUE} area />
        <MicroBarChart values={CHURN} color="warning" />
        <MicroRadialChart value={40} color="warning" showValue />
        <MicroRadialChart value={95} color="success" showValue />
      </div>
    </DemoSection>

    <DemoSection
      title="5. Screen readers get the number"
      codeTitle="role='img' with a derived label"
      codeDescription="Each chart builds its own label from its data — 'Line chart, 8 points, rising', '82 of 100, target 75', '40 to 52, up 12'. An unlabelled chart is decoration, and a sighted-only trend mark in a table cell is a column a screen-reader user cannot read at all. Override `label` when the surrounding text does not already say what is being measured."
      code={`<MicroBulletChart value={82} target={75} />
// -> aria-label="82 of 100, target 75"

<MicroLineChart values={data} label="Revenue, last 8 quarters" />`}
    >
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
        Inspect any chart on this page — every one carries{" "}
        <code>role='img'</code> and an <code>aria-label</code>.
      </p>
    </DemoSection>
  </DemoPage>
);

export default NewMicroChartDemo;
