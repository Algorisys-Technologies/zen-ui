import { DemoPage } from "./demo-helpers";

const COLORS = ["primary", "neutral", "info", "success", "warning", "error"];
const SIZES = ["sm", "md", "lg"];

function bar(attrs: Record<string, string>): HTMLElement {
  const b = document.createElement("zen-progress");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  return b;
}

/** A max-width column so the bars do not stretch edge to edge. */
function column(gap: string, ...children: Node[]): HTMLElement {
  const box = document.createElement("div");
  box.style.width = "100%";
  box.style.maxWidth = "480px";
  box.style.display = "grid";
  box.style.gap = gap;
  box.append(...children);
  return box;
}

export default function ProgressDemo(): HTMLElement {
  return DemoPage({
    title: "Progress",
    description:
      "Determinate progress indicator. The web-components port renders the same role=progressbar with aria-valuenow / aria-valuemax, and translates the fill exactly as the Radix binding does.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "value 0–100",
        code: `<zen-progress value="42"></zen-progress>`,
        render: () => {
          const box = document.createElement("div");
          box.style.width = "100%";
          box.style.maxWidth = "480px";
          box.append(bar({ value: "42" }));
          return box;
        },
      },
      {
        title: "2. Colors",
        codeTitle: "primary · neutral · info · success · warning · error",
        code: `<zen-progress value="70" color="primary"></zen-progress>
<zen-progress value="70" color="success"></zen-progress>
<zen-progress value="70" color="warning"></zen-progress>
<zen-progress value="70" color="error"></zen-progress>`,
        render: () => column("0.375rem", ...COLORS.map((color) => bar({ value: "70", color }))),
      },
      {
        title: "3. Sizes",
        codeTitle: "sm · md · lg",
        code: `<zen-progress value="55" size="sm"></zen-progress>
<zen-progress value="55" size="md"></zen-progress>
<zen-progress value="55" size="lg"></zen-progress>`,
        render: () => column("0.375rem", ...SIZES.map((size) => bar({ value: "55", size }))),
      },
      {
        title: "4. Animated",
        codeTitle: "Drive value through the attribute — a targeted aria-valuenow write",
        code: `const bar = document.querySelector("zen-progress");
let v = 0;
setInterval(() => {
  v = v >= 100 ? 0 : v + 7;
  bar.value = v;
}, 400);`,
        render: () => {
          const el = bar({ value: "13" });
          const label = document.createElement("span");
          label.style.fontSize = "0.8125rem";
          label.style.color = "var(--zen-color-muted-fg)";
          let v = 13;
          const paint = () => (label.textContent = `value: ${v}%`);
          paint();
          setInterval(() => {
            v = v >= 100 ? 0 : v + 7;
            (el as unknown as { value: number }).value = v;
            paint();
          }, 400);
          return column("0.5rem", el, label);
        },
      },
      {
        title: "5. Indeterminate",
        codeTitle: "Omit value for an unknown-duration bar",
        codeDescription:
          "With no value the bar drops aria-valuenow and parks the fill off-screen — a pending state with no known percentage.",
        code: `<zen-progress color="info"></zen-progress>   <!-- no value -->`,
        render: () => {
          const box = document.createElement("div");
          box.style.width = "100%";
          box.style.maxWidth = "480px";
          box.append(bar({ color: "info" }));
          return box;
        },
      },
      {
        title: "6. With label",
        codeTitle: "Combine with surrounding markup",
        code: `<div style="display:flex;justify-content:space-between">
  <span>Uploading dataset.csv</span>
  <span>68%</span>
</div>
<zen-progress value="68" color="info"></zen-progress>`,
        render: () => {
          const box = document.createElement("div");
          box.style.width = "100%";
          box.style.maxWidth = "480px";
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.justifyContent = "space-between";
          row.style.fontSize = "0.8125rem";
          row.style.marginBottom = "6px";
          const a = document.createElement("span");
          a.textContent = "Uploading dataset.csv";
          const b = document.createElement("span");
          b.textContent = "68%";
          row.append(a, b);
          box.append(row, bar({ value: "68", color: "info" }));
          return box;
        },
      },
    ],
  });
}
