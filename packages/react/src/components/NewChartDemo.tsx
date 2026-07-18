import { Chart } from "./chart/chart";
import { CodeExample } from "./demo-helpers";

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

const NewChartDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Chart</h1>
    <p className="lede">
      Thin wrapper over <code>recharts</code> (an <strong>optional</strong> peer
      dependency, lazy-loaded on first render). Series colours default to the
      zen palette. Install <code>recharts</code> to use it.
      {" "}The pie and donut maths lives in{" "}
      <code>@algorisys/zen-ui-core/chart</code>, shared with the Solid binding —
      which draws its charts with hand-built SVG, so that module is the only
      thing keeping the two agreeing about what a percentage is.
    </p>

    <section className="demo-section">
      <h2>1. Line</h2>
      <CodeExample
        title={`type="line"`}
        code={`<Chart type="line" data={data} xKey="month"
  series={[{ key: "spend", label: "Spend" }, { key: "budget", label: "Budget" }]} />`}
      >
        <div style={{ width: "100%" }}>
          <Chart type="line" data={DATA} xKey="month" series={SERIES} height={280} />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Area</h2>
      <CodeExample title={`type="area"`} code={`<Chart type="area" data={data} xKey="month" series={series} />`}>
        <div style={{ width: "100%" }}>
          <Chart type="area" data={DATA} xKey="month" series={SERIES} height={280} />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Bar</h2>
      <CodeExample title={`type="bar"`} code={`<Chart type="bar" data={data} xKey="month" series={series} />`}>
        <div style={{ width: "100%" }}>
          <Chart type="bar" data={DATA} xKey="month" series={SERIES} height={280} />
        </div>
      </CodeExample>
    </section>
    <section className="demo-section">
      <h2>4. Pie</h2>
      <CodeExample
        title={`type="pie"`}
        description="A pie asks parts-of-a-whole rather than value-over-a-range, so every row is a slice — but it needs no new props for that: xKey already names the label and the first series already names the value. A second series would be a second pie, so only the first is read."
        code={`const RESPONSES = [
  { answer: "Strongly agree", n: 42 },
  { answer: "Agree", n: 68 },
  …
];

<Chart type="pie" data={RESPONSES} xKey="answer" series={[{ key: "n" }]} />`}
      >
        <div style={{ width: "100%" }}>
          <Chart type="pie" data={RESPONSES} xKey="answer" series={[{ key: "n" }]} height={300} />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Donut</h2>
      <CodeExample
        title={`type="donut"`}
        description="A donut is a pie with a hole, and the hole is the only difference — so it is implied by the type rather than a radius to get wrong. Pass colors to map slices onto meaning: below, agreement is green through red rather than whatever the palette happened to hand out."
        code={`<Chart
  type="donut"
  data={RESPONSES}
  xKey="answer"
  series={[{ key: "n" }]}
  colors={["var(--zen-color-success)", "var(--zen-color-info)", "var(--zen-color-neutral)", "var(--zen-color-warning)", "var(--zen-color-error)"]}
/>`}
      >
        <div style={{ width: "100%" }}>
          <Chart
            type="donut"
            data={RESPONSES}
            xKey="answer"
            series={[{ key: "n" }]}
            colors={[
              "var(--zen-color-success)",
              "var(--zen-color-info)",
              "var(--zen-color-neutral)",
              "var(--zen-color-warning)",
              "var(--zen-color-error)",
            ]}
            height={300}
          />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. What a screen reader gets</h2>
      <CodeExample
        title="Every pie ships a data table"
        description="A pie chart is the least accessible thing in a dashboard: the shape carries all of the meaning and none of it survives into audio. An aria-label can say 'Agree 39%, Neutral 18%' — but a listener cannot navigate a sentence, compare two numbers inside it, or come back to one. So the slice data is also published as a real, visually-hidden table. It is in the DOM above; inspect it, or listen to it."
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
        <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          The pies above each carry one. Nothing to switch on — an accessible
          chart that is opt-in is a chart that is inaccessible.
        </p>
      </CodeExample>
    </section>
  </div>
);

export default NewChartDemo;
