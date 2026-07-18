import { Chart } from "./chart/chart";
import { DemoPage, DemoSection } from "./demo-helpers";

const DATA = [
  { month: "Jan", spend: 4200, budget: 5000 },
  { month: "Feb", spend: 3800, budget: 5000 },
  { month: "Mar", spend: 5100, budget: 5000 },
  { month: "Apr", spend: 4600, budget: 5200 },
  { month: "May", spend: 6100, budget: 5200 },
  { month: "Jun", spend: 5400, budget: 5500 },
];

const SERIES = [
  { key: "spend", label: "Spend" },
  { key: "budget", label: "Budget" },
];

/** A pie asks a different question, so it gets a different shape of data. */
const RESPONSES = [
  { answer: "Strongly agree", n: 42 },
  { answer: "Agree", n: 68 },
  { answer: "Neutral", n: 31 },
  { answer: "Disagree", n: 14 },
  { answer: "Strongly disagree", n: 5 },
];

const AGREEMENT = [
  "var(--zen-color-success)",
  "var(--zen-color-info)",
  "var(--zen-color-neutral)",
  "var(--zen-color-warning)",
  "var(--zen-color-error)",
];

const NewChartDemo = () => (
  <DemoPage
    title="Chart"
    description="Line / area / bar / pie / donut, rendered as plain SVG — no dependency to install. The React binding wraps recharts, which is React-only; rather than pull a React runtime into the Solid binding, this renders the same chart types from the same public props. The two therefore share no renderer at all, which is why the pie maths lives in @algorisys/zen-ui-core/chart — it is the only thing keeping the bindings agreeing about what a percentage is. Series colours default to the zen palette."
  >
    <DemoSection
      title="1. Line"
      codeTitle={`type="line"`}
      code={`<Chart type="line" data={data} xKey="month"
  series={[{ key: "spend", label: "Spend" }, { key: "budget", label: "Budget" }]} />`}
    >
      <div class="zen-w-full">
        <Chart type="line" data={DATA} xKey="month" series={SERIES} height={280} />
      </div>
    </DemoSection>

    <DemoSection
      title="2. Area"
      codeTitle={`type="area"`}
      code={`<Chart type="area" data={data} xKey="month" series={series} />`}
    >
      <div class="zen-w-full">
        <Chart type="area" data={DATA} xKey="month" series={SERIES} height={280} />
      </div>
    </DemoSection>

    <DemoSection
      title="3. Bar"
      codeTitle={`type="bar"`}
      code={`<Chart type="bar" data={data} xKey="month" series={series} />`}
    >
      <div class="zen-w-full">
        <Chart type="bar" data={DATA} xKey="month" series={SERIES} height={280} />
      </div>
    </DemoSection>
    <DemoSection
      title="4. Pie"
      codeTitle={`type="pie"`}
      codeDescription="A pie asks parts-of-a-whole rather than value-over-a-range, so every row is a slice — but it needs no new props for that: xKey already names the label and the first series already names the value. A second series would be a second pie, so only the first is read."
      code={`const RESPONSES = [
  { answer: "Strongly agree", n: 42 },
  { answer: "Agree", n: 68 },
  …
];

<Chart type="pie" data={RESPONSES} xKey="answer" series={[{ key: "n" }]} />`}
    >
      <div class="zen-w-full">
        <Chart type="pie" data={RESPONSES} xKey="answer" series={[{ key: "n" }]} height={300} />
      </div>
    </DemoSection>

    <DemoSection
      title="5. Donut"
      codeTitle={`type="donut"`}
      codeDescription="A donut is a pie with a hole, and the hole is the only difference — so it is implied by the type rather than a radius to get wrong. Pass colors to map slices onto meaning: below, agreement is green through red rather than whatever the palette happened to hand out."
      code={`<Chart
  type="donut"
  data={RESPONSES}
  xKey="answer"
  series={[{ key: "n" }]}
  colors={["var(--zen-color-success)", "var(--zen-color-info)", "var(--zen-color-neutral)", "var(--zen-color-warning)", "var(--zen-color-error)"]}
/>`}
    >
      <div class="zen-w-full">
        <Chart
          type="donut"
          data={RESPONSES}
          xKey="answer"
          series={[{ key: "n" }]}
          colors={AGREEMENT}
          height={300}
        />
      </div>
    </DemoSection>

    <DemoSection
      title="6. What a screen reader gets"
      codeTitle="Every pie ships a data table"
      codeDescription="A pie chart is the least accessible thing in a dashboard: the shape carries all of the meaning and none of it survives into audio. An aria-label can say 'Agree 39%, Neutral 18%' — but a listener cannot navigate a sentence, compare two numbers inside it, or come back to one. So the slice data is also published as a real, visually-hidden table. It is in the DOM above; inspect it, or listen to it."
      code={`// rendered by <Chart type="pie" …>, visually hidden:
<table class="zen-sr-only">
  <caption>Chart data</caption>
  <thead><tr><th>answer</th><th>Value</th><th>Share</th></tr></thead>
  <tbody>
    <tr><th scope="row">Agree</th><td>68</td><td>42.5%</td></tr>
    …
  </tbody>
</table>`}
    >
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
        The pies above each carry one. Nothing to switch on — an accessible chart
        that is opt-in is a chart that is inaccessible.
      </p>
    </DemoSection>
  </DemoPage>
);

export default NewChartDemo;
