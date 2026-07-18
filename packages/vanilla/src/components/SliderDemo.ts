import { Slider } from "./form/slider/slider";
import { DemoPage } from "./demo-helpers";

const wrap = (maxWidth: number, node: Node, note?: Node) => {
  const w = document.createElement("div");
  w.style.width = "100%";
  w.style.maxWidth = `${maxWidth}px`;
  w.style.paddingBottom = "8px";
  w.append(node);
  if (note) w.append(note);
  return w;
};

const readout = (text: string) => {
  const p = document.createElement("div");
  p.style.marginTop = "8px";
  p.style.fontSize = "0.8125rem";
  p.style.color = "var(--zen-color-muted-fg)";
  p.textContent = text;
  return p;
};

export default function SliderDemo(): HTMLElement {
  return DemoPage({
    title: "Slider",
    description:
      "Single-thumb or multi-thumb range slider. Radix hands React pointer drag, keyboard control (Arrow / PgUp / PgDn / Home / End), ARIA and vertical orientation for free; with no primitive library those are the port's own job, written out rather than reinvented. The value is always an array — a single thumb is [n], a range is [lo, hi] — and the shape decides the thumb count.",
    sections: [
      {
        title: "0. Marks",
        codeTitle: "Ticks along the track, with optional labels",
        codeDescription:
          "Marks are decoration over the scale, not the scale itself — step still decides which values are reachable, so a mark at a value step cannot land on would draw a tick the thumb can never sit on. A mark with no label is just a tick. Horizontal only.",
        code: `Slider({
  defaultValue: [3],
  min: 1,
  max: 5,
  step: 1,
  marks: [
    { value: 1, label: "Never" },
    { value: 2 },
    { value: 3, label: "Sometimes" },
    { value: 4 },
    { value: 5, label: "Always" },
  ],
})`,
        render: () => {
          const out = readout("value → 3");
          out.style.fontSize = "0.75rem";
          out.style.marginTop = "2rem";
          return wrap(
            460,
            Slider({
              defaultValue: [3],
              min: 1,
              max: 5,
              step: 1,
              onValueChange: (v) => (out.textContent = `value → ${v[0]}`),
              marks: [
                { value: 1, label: "Never" },
                { value: 2 },
                { value: 3, label: "Sometimes" },
                { value: 4 },
                { value: 5, label: "Always" },
              ],
            }).el,
            out,
          );
        },
      },
      {
        title: "1. Basic (single-thumb)",
        codeTitle: "value as a [number] tuple",
        code: `const out = document.querySelector("#vol");
Slider({
  defaultValue: [50],
  max: 100,
  step: 1,
  onValueChange: (v) => (out.textContent = String(v[0])),
})`,
        render: () => {
          const out = readout("volume: 50");
          return wrap(
            360,
            Slider({
              defaultValue: [50],
              max: 100,
              step: 1,
              onValueChange: (v) => (out.textContent = `volume: ${v[0]}`),
            }).el,
            out,
          );
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "defaultValue",
        code: `Slider({ defaultValue: [33], max: 100, step: 1 })`,
        render: () => wrap(360, Slider({ defaultValue: [33], max: 100, step: 1 }).el),
      },
      {
        title: "3. Range (multi-thumb)",
        codeTitle: "defaultValue with two numbers becomes a range",
        code: `Slider({
  defaultValue: [20, 80],
  min: 0,
  max: 100,
  step: 5,
  onValueChange: (v) => console.log(v),
})`,
        render: () => {
          const out = readout("range: 20 – 80");
          return wrap(
            360,
            Slider({
              defaultValue: [20, 80],
              min: 0,
              max: 100,
              step: 5,
              onValueChange: (v) => (out.textContent = `range: ${v[0]} – ${v[1]}`),
            }).el,
            out,
          );
        },
      },
      {
        title: "4. Custom step",
        codeTitle: "step=10 snaps to multiples of 10",
        code: `Slider({ defaultValue: [40], min: 0, max: 100, step: 10 })`,
        render: () => wrap(360, Slider({ defaultValue: [40], min: 0, max: 100, step: 10 }).el),
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled prop",
        code: `Slider({ defaultValue: [60], disabled: true })`,
        render: () => wrap(360, Slider({ defaultValue: [60], disabled: true }).el),
      },
      {
        title: "6. Custom colors via class",
        codeTitle: "Override the range fill",
        code: `Slider({
  defaultValue: [60],
  class: "[&_[data-orientation=horizontal]>span]:zen-bg-zen-success [&_[role=slider]]:zen-border-zen-success",
})`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.width = "100%";
          grid.style.maxWidth = "360px";
          grid.style.display = "grid";
          grid.style.gap = "0.75rem";
          grid.append(
            Slider({
              defaultValue: [60],
              class:
                "[&_[data-orientation=horizontal]>span]:zen-bg-zen-success [&_[role=slider]]:zen-border-zen-success",
            }).el,
            Slider({
              defaultValue: [40],
              class:
                "[&_[data-orientation=horizontal]>span]:zen-bg-zen-warning [&_[role=slider]]:zen-border-zen-warning",
            }).el,
            Slider({
              defaultValue: [80],
              class:
                "[&_[data-orientation=horizontal]>span]:zen-bg-zen-error [&_[role=slider]]:zen-border-zen-error",
            }).el,
          );
          return grid;
        },
      },
      {
        title: "7. Vertical orientation",
        codeTitle: 'orientation: "vertical"',
        codeDescription: "Container must give the slider an explicit height.",
        code: `const box = document.createElement("div");
box.style.height = "200px";
box.append(Slider({ orientation: "vertical", defaultValue: [40] }).el);`,
        render: () => {
          const box = document.createElement("div");
          box.style.height = "180px";
          box.style.display = "flex";
          box.style.alignItems = "center";
          box.style.justifyContent = "center";
          box.style.padding = "0 0.75rem";
          box.append(Slider({ orientation: "vertical", defaultValue: [40] }).el);
          return box;
        },
      },
    ],
  });
}
