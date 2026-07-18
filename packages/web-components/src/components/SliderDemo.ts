import { DemoPage } from "./demo-helpers";

/**
 * Slider demo — the web-components port. <zen-slider>'s `value` is ALWAYS an
 * array ([n] single-thumb, [lo, hi] range); `defaultValue` and `marks` are set as
 * JS properties. `zen-value-change` fires with the value array.
 */

interface Mark {
  value: number;
  label?: string;
}
interface SliderSpec {
  defaultValue: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: "vertical";
  marks?: Mark[];
  class?: string;
}

function slider(spec: SliderSpec, onChange?: (v: number[]) => void): HTMLElement {
  const s = document.createElement("zen-slider");
  if (spec.min != null) s.setAttribute("min", String(spec.min));
  if (spec.max != null) s.setAttribute("max", String(spec.max));
  if (spec.step != null) s.setAttribute("step", String(spec.step));
  if (spec.disabled) s.setAttribute("disabled", "");
  if (spec.orientation) s.setAttribute("orientation", spec.orientation);
  if (spec.class) s.className = spec.class;
  Object.assign(s, { defaultValue: spec.defaultValue, ...(spec.marks ? { marks: spec.marks } : {}) });
  if (onChange) s.addEventListener("zen-value-change", (e) => onChange((e as CustomEvent).detail as number[]));
  return s;
}

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
        code: `const s = document.createElement("zen-slider");
s.setAttribute("min", "1"); s.setAttribute("max", "5"); s.setAttribute("step", "1");
s.defaultValue = [3];
s.marks = [
  { value: 1, label: "Never" }, { value: 2 }, { value: 3, label: "Sometimes" },
  { value: 4 }, { value: 5, label: "Always" },
];`,
        render: () => {
          const out = readout("value → 3");
          out.style.fontSize = "0.75rem";
          out.style.marginTop = "2rem";
          return wrap(
            460,
            slider(
              {
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
              },
              (v) => (out.textContent = `value → ${v[0]}`),
            ),
            out,
          );
        },
      },
      {
        title: "1. Basic (single-thumb)",
        codeTitle: "value as a [number] tuple",
        code: `const s = document.createElement("zen-slider");
s.setAttribute("max", "100"); s.setAttribute("step", "1");
s.defaultValue = [50];
s.addEventListener("zen-value-change", (e) => (out.textContent = String(e.detail[0])));`,
        render: () => {
          const out = readout("volume: 50");
          return wrap(
            360,
            slider({ defaultValue: [50], max: 100, step: 1 }, (v) => (out.textContent = `volume: ${v[0]}`)),
            out,
          );
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "defaultValue",
        code: `const s = document.createElement("zen-slider");
s.setAttribute("max", "100"); s.setAttribute("step", "1");
s.defaultValue = [33];`,
        render: () => wrap(360, slider({ defaultValue: [33], max: 100, step: 1 })),
      },
      {
        title: "3. Range (multi-thumb)",
        codeTitle: "defaultValue with two numbers becomes a range",
        code: `s.defaultValue = [20, 80];   // min 0, max 100, step 5`,
        render: () => {
          const out = readout("range: 20 – 80");
          return wrap(
            360,
            slider({ defaultValue: [20, 80], min: 0, max: 100, step: 5 }, (v) => (out.textContent = `range: ${v[0]} – ${v[1]}`)),
            out,
          );
        },
      },
      {
        title: "4. Custom step",
        codeTitle: "step=10 snaps to multiples of 10",
        code: `<zen-slider min="0" max="100" step="10"></zen-slider>   // s.defaultValue = [40]`,
        render: () => wrap(360, slider({ defaultValue: [40], min: 0, max: 100, step: 10 })),
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled prop",
        code: `<zen-slider disabled></zen-slider>   // s.defaultValue = [60]`,
        render: () => wrap(360, slider({ defaultValue: [60], disabled: true })),
      },
      {
        title: "6. Custom colors via class",
        codeTitle: "Override the range fill",
        code: `<zen-slider class="[&_[data-orientation=horizontal]>span]:zen-bg-zen-success [&_[role=slider]]:zen-border-zen-success"></zen-slider>`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.width = "100%";
          grid.style.maxWidth = "360px";
          grid.style.display = "grid";
          grid.style.gap = "0.75rem";
          grid.append(
            slider({
              defaultValue: [60],
              class:
                "[&_[data-orientation=horizontal]>span]:zen-bg-zen-success [&_[role=slider]]:zen-border-zen-success",
            }),
            slider({
              defaultValue: [40],
              class:
                "[&_[data-orientation=horizontal]>span]:zen-bg-zen-warning [&_[role=slider]]:zen-border-zen-warning",
            }),
            slider({
              defaultValue: [80],
              class:
                "[&_[data-orientation=horizontal]>span]:zen-bg-zen-error [&_[role=slider]]:zen-border-zen-error",
            }),
          );
          return grid;
        },
      },
      {
        title: "7. Vertical orientation",
        codeTitle: 'orientation: "vertical"',
        codeDescription: "Container must give the slider an explicit height.",
        code: `<div style="height:200px">
  <zen-slider orientation="vertical"></zen-slider>   // s.defaultValue = [40]
</div>`,
        render: () => {
          const box = document.createElement("div");
          box.style.height = "180px";
          box.style.display = "flex";
          box.style.alignItems = "center";
          box.style.justifyContent = "center";
          box.style.padding = "0 0.75rem";
          const s = slider({ orientation: "vertical", defaultValue: [40] });
          // The host wraps the slider, so it must stretch to the box height for the
          // inner `h-full` to resolve.
          s.style.alignSelf = "stretch";
          box.append(s);
          return box;
        },
      },
    ],
  });
}
