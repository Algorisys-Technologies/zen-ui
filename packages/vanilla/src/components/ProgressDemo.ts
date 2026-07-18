import { Progress, type ProgressColor, type ProgressSize } from "./progress/progress";
import { DemoPage } from "./demo-helpers";

const COLORS: ProgressColor[] = ["primary", "neutral", "info", "success", "warning", "error"];
const SIZES: ProgressSize[] = ["sm", "md", "lg"];

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
      "Determinate progress indicator. The vanilla port renders the same role=progressbar with aria-valuenow / aria-valuemax, and translates the fill exactly as the Radix binding does.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "value 0–100",
        code: `const bar = Progress({ value: 42 });
document.body.append(bar.el);`,
        render: () => {
          const box = document.createElement("div");
          box.style.width = "100%";
          box.style.maxWidth = "480px";
          box.append(Progress({ value: 42 }).el);
          return box;
        },
      },
      {
        title: "2. Colors",
        codeTitle: "primary · neutral · info · success · warning · error",
        code: `Progress({ value: 70, color: "primary" });
Progress({ value: 70, color: "success" });
Progress({ value: 70, color: "warning" });
Progress({ value: 70, color: "error" });`,
        render: () => column("0.375rem", ...COLORS.map((color) => Progress({ value: 70, color }).el)),
      },
      {
        title: "3. Sizes",
        codeTitle: "sm · md · lg",
        code: `Progress({ value: 55, size: "sm" });
Progress({ value: 55, size: "md" });
Progress({ value: 55, size: "lg" });`,
        render: () => column("0.375rem", ...SIZES.map((size) => Progress({ value: 55, size }).el)),
      },
      {
        title: "4. Animated",
        codeTitle: "Drive value through update() — no re-render, a targeted aria-valuenow write",
        code: `const bar = Progress({ value: 0 });
let v = 0;
setInterval(() => {
  v = v >= 100 ? 0 : v + 7;
  bar.update({ value: v });
}, 400);`,
        render: () => {
          const bar = Progress({ value: 13 });
          const label = document.createElement("span");
          label.style.fontSize = "0.8125rem";
          label.style.color = "var(--zen-color-muted-fg)";
          let v = 13;
          const paint = () => (label.textContent = `value: ${v}%`);
          paint();
          setInterval(() => {
            v = v >= 100 ? 0 : v + 7;
            bar.update({ value: v });
            paint();
          }, 400);
          return column("0.5rem", bar.el, label);
        },
      },
      {
        title: "5. Indeterminate",
        codeTitle: "Omit value (or pass null) for an unknown-duration bar",
        codeDescription:
          "With no value the bar drops aria-valuenow and parks the fill off-screen — a pending state with no known percentage.",
        code: `Progress();            // no value
Progress({ value: null }); // explicit`,
        render: () => {
          const box = document.createElement("div");
          box.style.width = "100%";
          box.style.maxWidth = "480px";
          box.append(Progress({ value: null, color: "info" }).el);
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
Progress({ value: 68, color: "info" });`,
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
          box.append(row, Progress({ value: 68, color: "info" }).el);
          return box;
        },
      },
    ],
  });
}
