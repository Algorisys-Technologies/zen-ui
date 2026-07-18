import { DemoPage } from "./demo-helpers";

/**
 * Chart demo — the web-components port. <zen-chart> draws hand-built SVG from
 * public props: `type`, `x-key` and `height` are attributes, while `data`,
 * `series` and `colors` are JS-property arrays (they cannot be plain attributes).
 * The pie / donut maths lives in @algorisys/zen-ui-core/chart, shared with the
 * other bindings.
 */

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

const RESPONSES = [
  { answer: "Strongly agree", n: 42 },
  { answer: "Agree", n: 68 },
  { answer: "Neutral", n: 31 },
  { answer: "Disagree", n: 14 },
  { answer: "Strongly disagree", n: 5 },
];

const DONUT_COLORS = [
  "var(--zen-color-success)",
  "var(--zen-color-info)",
  "var(--zen-color-neutral)",
  "var(--zen-color-warning)",
  "var(--zen-color-error)",
];

function chart(opts: {
  type: string;
  xKey: string;
  height: number;
  data: unknown[];
  series: unknown[];
  colors?: string[];
}): HTMLElement {
  const c = document.createElement("zen-chart") as HTMLElement & {
    data: unknown[];
    series: unknown[];
    colors?: string[];
  };
  c.setAttribute("type", opts.type);
  c.setAttribute("x-key", opts.xKey);
  c.setAttribute("height", String(opts.height));
  c.data = opts.data;
  c.series = opts.series;
  if (opts.colors) c.colors = opts.colors;

  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.append(c);
  return wrap;
}

export default function ChartDemo(): HTMLElement {
  return DemoPage({
    title: "Chart",
    description:
      "The React binding wraps recharts (a React-only, optional peer dependency). With no framework to lean on, this binding draws the same chart types from the same public props with hand-built SVG — nothing to install. The pie and donut maths lives in @algorisys/zen-ui-core/chart, shared with the other bindings, so that module is the only thing keeping the three agreeing about what a percentage is.",
    sections: [
      {
        title: "1. Line",
        codeTitle: 'type="line"',
        code: `<zen-chart type="line" x-key="month" height="280"></zen-chart>

const c = document.querySelector("zen-chart");
c.data = data;
c.series = [{ key: "spend", label: "Spend" }, { key: "budget", label: "Budget" }];`,
        render: () => chart({ type: "line", xKey: "month", height: 280, data: DATA, series: SERIES }),
      },
      {
        title: "2. Area",
        codeTitle: 'type="area"',
        code: `<zen-chart type="area" x-key="month" height="280"></zen-chart>
c.data = data; c.series = series;`,
        render: () => chart({ type: "area", xKey: "month", height: 280, data: DATA, series: SERIES }),
      },
      {
        title: "3. Bar",
        codeTitle: 'type="bar"',
        code: `<zen-chart type="bar" x-key="month" height="280"></zen-chart>
c.data = data; c.series = series;`,
        render: () => chart({ type: "bar", xKey: "month", height: 280, data: DATA, series: SERIES }),
      },
      {
        title: "4. Pie",
        codeTitle: 'type="pie"',
        codeDescription:
          "A pie asks parts-of-a-whole rather than value-over-a-range, so every row is a slice — but it needs no new props for that: x-key already names the label and the first series already names the value. A second series would be a second pie, so only the first is read.",
        code: `c.data = [
  { answer: "Strongly agree", n: 42 },
  { answer: "Agree", n: 68 },
  …
];
c.series = [{ key: "n" }];   // <zen-chart type="pie" x-key="answer">`,
        render: () => chart({ type: "pie", xKey: "answer", height: 300, data: RESPONSES, series: [{ key: "n" }] }),
      },
      {
        title: "5. Donut",
        codeTitle: 'type="donut"',
        codeDescription:
          "A donut is a pie with a hole, and the hole is the only difference — so it is implied by the type rather than a radius to get wrong. Pass colors to map slices onto meaning: below, agreement is green through red rather than whatever the palette happened to hand out.",
        code: `// <zen-chart type="donut" x-key="answer">
c.data = RESPONSES;
c.series = [{ key: "n" }];
c.colors = [
  "var(--zen-color-success)",
  "var(--zen-color-info)",
  "var(--zen-color-neutral)",
  "var(--zen-color-warning)",
  "var(--zen-color-error)",
];`,
        render: () =>
          chart({ type: "donut", xKey: "answer", height: 300, data: RESPONSES, series: [{ key: "n" }], colors: DONUT_COLORS }),
      },
      {
        title: "6. What a screen reader gets",
        codeTitle: "Every pie ships a data table",
        codeDescription:
          "A pie chart is the least accessible thing in a dashboard: the shape carries all of the meaning and none of it survives into audio. An aria-label can say 'Agree 39%, Neutral 18%' — but a listener cannot navigate a sentence, compare two numbers inside it, or come back to one. So the slice data is also published as a real, visually-hidden table. It is in the DOM above; inspect it, or listen to it.",
        code: `<!-- rendered by <zen-chart type="pie">, visually hidden: -->
<table class="zen-sr-only">
  <caption>Chart data</caption>
  <thead><tr><th>answer</th><th>Value</th><th>Share</th></tr></thead>
  <tbody>
    <tr><th scope="row">Agree</th><td>68</td><td>42.5%</td></tr>
    …
  </tbody>
</table>`,
        render: () => {
          const p = document.createElement("p");
          p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          p.textContent =
            "The pies above each carry one. Nothing to switch on — an accessible chart that is opt-in is a chart that is inaccessible.";
          return p;
        },
      },
    ],
  });
}
