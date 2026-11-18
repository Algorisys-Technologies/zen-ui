import { DemoPage } from "./demo-helpers";

const REVENUE = [12, 15, 11, 18, 16, 22, 19, 25];
const CHURN = [8, 7, 9, 6, 7, 5, 6, 4];

const ROWS = [
  { name: "EMEA", series: [12, 15, 11, 18, 16, 22], quota: 82, target: 75, from: 40, to: 52 },
  { name: "Americas", series: [20, 18, 21, 17, 15, 14], quota: 61, target: 75, from: 55, to: 47 },
  { name: "APAC", series: [5, 8, 9, 12, 14, 19], quota: 94, target: 75, from: 22, to: 38 },
];


/** Build a <zen-micro-*> element; arrays go on as JS properties. */
function mc(tag: string, attrs: Record<string, string | number | boolean> = {}, values?: number[]): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false) continue;
    el.setAttribute(k, v === true ? "" : String(v));
  }
  if (values) (el as unknown as { values: number[] }).values = values;
  return el;
}

/** label under a chart, so the five shapes are identifiable side by side */
function labelled(node: Node, text: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-items-center zen-gap-1";
  const cap = document.createElement("span");
  cap.className = "zen-text-xs zen-text-zen-muted-fg";
  cap.textContent = text;
  wrap.append(node, cap);
  return wrap;
}

function row(...nodes: Node[]): HTMLElement {
  const d = document.createElement("div");
  d.className = "zen-flex zen-flex-wrap zen-items-center zen-gap-8";
  d.append(...nodes);
  return d;
}

export default function MicroChartDemo(): HTMLElement {
  return DemoPage({
    title: "Micro charts",
    description:
      "Declarative <zen-micro-*> elements over the vanilla factories. Trend marks small enough to live inside something else \u2014 a table cell, a card, a list row. Not small versions of Chart: there is no axis, no legend and no tooltip, because everything that would explain the number is already in the row around it.",
    sections: [
      {
        title: "1. The five shapes",
        codeTitle: "Each answers a different question",
        codeDescription:
          "Line for a series you read as a shape; bar for a series where the individual values matter; bullet for one value against a target; delta for a comparison of exactly two; radial for one value as a proportion of a whole. Fiori ships nine \u2014 Harvey ball, comparison and stacked bar are restatements of radial and bar with fewer affordances, so they are not here.",
        code: `MicroLineChart({ values: [12, 15, 11, 18, 16, 22] }).el
MicroBarChart({ values: [12, 15, 11, 18, 16, 22] }).el
mc("zen-micro-bullet-chart", { value: 82, target: 75 })
mc("zen-micro-delta-chart", { from: 40, to: 52 })
mc("zen-micro-radial-chart", { value: 72, "show-value": true })`,
        render: () =>
          row(
            labelled(mc("zen-micro-line-chart", {}, REVENUE), "line"),
            labelled(mc("zen-micro-bar-chart", {}, REVENUE), "bar"),
            labelled(mc("zen-micro-bullet-chart", { value: 82, target: 75 }), "bullet"),
            labelled(mc("zen-micro-delta-chart", { from: 40, to: 52 }), "delta"),
            labelled(mc("zen-micro-radial-chart", { value: 72, "show-value": true }), "radial"),
          ),
      },
      {
        title: "2. Delta colours itself",
        codeTitle: "Direction is the point, so the caller does not paint it",
        codeDescription:
          "A rise is success and a fall is error, derived from the numbers rather than passed in \u2014 letting a caller paint a fall green would defeat the component. Pass color explicitly only when up is bad: cost, error rate, latency, churn. That is the one case where the default would lie.",
        code: `<zen-micro-delta-chart from="40" to="52"></zen-micro-delta-chart>  <!-- up   -> success -->
<zen-micro-delta-chart from="55" to="47"></zen-micro-delta-chart>  <!-- down -> error -->

<!-- up is bad here, so say so: -->
<zen-micro-delta-chart from="2.1" to="3.4" color="error"></zen-micro-delta-chart>`,
        render: () =>
          row(
            labelled(mc("zen-micro-delta-chart", { from: 40, to: 52 }), "40 \u2192 52"),
            labelled(mc("zen-micro-delta-chart", { from: 55, to: 47 }), "55 \u2192 47"),
            labelled(mc("zen-micro-delta-chart", { from: 2.1, to: 3.4, color: "error" }), "churn up (bad)"),
          ),
      },
      {
        title: "3. Where they actually go",
        codeTitle: "Inside a table cell",
        codeDescription:
          "This is the case micro charts exist for. They are sized in px and sit in text flow, so they align on the baseline of the row without stretching the cell. A percentage width would collapse in a cell that has not been measured, which is why there isn't one.",
        code: `td.append(mc("zen-micro-line-chart", { width: 64, height: 20 }, r.series));
td.append(MicroBulletChart({ value: r.quota, target: 75, width: 64 }).el);`,
        render: () => {
          const table = document.createElement("table");
          table.className = "zen-w-full zen-text-sm";
          const thead = document.createElement("thead");
          const htr = document.createElement("tr");
          htr.className = "zen-border-b zen-border-zen-border zen-text-xs zen-text-zen-muted-fg";
          for (const h of ["Region", "Trend", "Quota", "Change"]) {
            const th = document.createElement("th");
            th.className = "zen-px-2 zen-py-2 zen-text-start";
            th.textContent = h;
            htr.append(th);
          }
          thead.append(htr);
          const tbody = document.createElement("tbody");
          for (const r of ROWS) {
            const tr = document.createElement("tr");
            tr.className = "zen-border-b zen-border-zen-border last:zen-border-0";
            const cell = (node: Node | string) => {
              const td = document.createElement("td");
              td.className = "zen-px-2 zen-py-3";
              td.append(node);
              return td;
            };
            tr.append(
              cell(r.name),
              cell(mc("zen-micro-line-chart", { width: 64, height: 20 }, r.series)),
              cell(mc("zen-micro-bullet-chart", { value: r.quota, target: r.target, width: 64 })),
              cell(mc("zen-micro-delta-chart", { from: r.from, to: r.to, width: 48, height: 20 })),
            );
            tbody.append(tr);
          }
          table.append(thead, tbody);
          return table;
        },
      },
      {
        title: "4. Colour and area",
        codeTitle: "color takes the semantic scale, not a hex",
        codeDescription:
          "The same six words the rest of the library uses \u2014 primary, success, warning, error, info, muted \u2014 so a micro chart cannot drift away from the theme. Fill comes from currentColor, so wrapping one in anything that sets a text colour works too. area fills under a line; it is off by default because at this size it muddies the shape more than it helps.",
        code: `<zen-micro-line-chart color="success"></zen-micro-line-chart>
<zen-micro-line-chart area></zen-micro-line-chart>`,
        render: () =>
          row(
            mc("zen-micro-line-chart", { color: "success" }, REVENUE),
            mc("zen-micro-line-chart", { color: "error" }, CHURN),
            mc("zen-micro-line-chart", { area: true }, REVENUE),
            mc("zen-micro-bar-chart", { color: "warning" }, CHURN),
            mc("zen-micro-radial-chart", { value: 40, color: "warning", "show-value": true }),
            mc("zen-micro-radial-chart", { value: 95, color: "success", "show-value": true }),
          ),
      },
      {
        title: "5. Screen readers get the number",
        codeTitle: "role='img' with a derived label",
        codeDescription:
          "Each chart builds its own label from its data \u2014 'Line chart, 8 points, rising', '82 of 100, target 75', '40 to 52, up 12'. An unlabelled chart is decoration, and a sighted-only trend mark in a table cell is a column a screen-reader user cannot read at all. Override label when the surrounding text does not already say what is being measured.",
        code: `<zen-micro-bullet-chart value="82" target="75"></zen-micro-bullet-chart>
<!-- -> aria-label="82 of 100, target 75" -->

<zen-micro-line-chart label="Revenue, last 8 quarters"></zen-micro-line-chart>`,
        render: () => {
          const p = document.createElement("p");
          p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          p.textContent =
            "Inspect any chart on this page \u2014 every one carries role=\"img\" and an aria-label.";
          return p;
        },
      },
    ],
  });
}
