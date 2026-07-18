import {
  CHART_PALETTE,
  arcPath,
  describeSlices,
  formatPercent,
  toSlices,
  type Slice,
} from "@algorisys/zen-ui-core/chart";
import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";

/**
 * Chart — line / area / bar / pie / donut rendered as plain SVG. No dependency.
 *
 * The React binding wraps `recharts`, which is React-only. Rather than pull a
 * React runtime into a binding with no framework at all, this renders the same
 * chart types from the same public props with hand-built SVG — so `Chart` works
 * out of the box with nothing to install. It mirrors the Solid binding, which
 * makes the identical choice for the identical reason.
 *
 * That means the three bindings share no axis renderer, which is exactly why the
 * pie/donut maths lives in @algorisys/zen-ui-core/chart rather than here: it is
 * the only place the three can agree about what a percentage is.
 *
 *   const chart = Chart({
 *     type: "line",
 *     data: rows,
 *     xKey: "month",
 *     series: [{ key: "spend", label: "Spend" }, { key: "budget" }],
 *   });
 *   document.querySelector("#panel").append(chart.el);
 *
 * `pie` and `donut` ask a different question from the other three — every row is
 * a slice rather than a point on an axis — but they need no new props for it:
 * `xKey` already names the label and the first series already names the value.
 *
 *   Chart({ type: "donut", data: rows, xKey: "answer", series: [{ key: "n" }] });
 */

export interface ChartSeries {
  /** key into each data row */
  key: string;
  /** legend / tooltip label (defaults to `key`) */
  label?: string;
  /** override colour (any CSS colour; defaults to the zen palette) */
  color?: string;
}

export interface ChartProps {
  type?: "line" | "area" | "bar" | "pie" | "donut";
  data: Array<Record<string, unknown>>;
  /**
   * For line/area/bar: one entry per plotted series.
   *
   * For pie/donut: only the FIRST entry is read — it names the value on each
   * row. A pie has one number per slice; a second series would be a second pie.
   */
  series: ChartSeries[];
  /** key on each row used for the x-axis — or, for pie/donut, the slice label */
  xKey: string;
  /**
   * Slice colours for pie/donut, in row order, wrapping if short. Defaults to
   * the zen palette. (Per-series `color` cannot express this: a pie is one
   * series and many colours.)
   */
  colors?: string[];
  height?: number;
  class?: string;
}

/** Shared with the other bindings, so the three cannot drift apart. */
const PALETTE = CHART_PALETTE;

/** SVG-space geometry, in px. Not CSS lengths — no token applies. */
const PAD = { top: 12, right: 12, bottom: 24, left: 44 };
const LEGEND_H = 28;
const TICK_COUNT = 5;

/** Pie/donut geometry, in the 0–100 viewBox the browser scales for us. */
const R_OUTER = 40;
const R_INNER = 22;

const SVG_NS = "http://www.w3.org/2000/svg";

const isPie = (t: ChartProps["type"]) => t === "pie" || t === "donut";

/** Create a namespaced SVG element and set string attributes on it. */
function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
  children?: Node[],
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (children) el.append(...children);
  return el;
}

const niceNum = (range: number, round: boolean): number => {
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  else nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nice * Math.pow(10, exp);
};

/** Axis domain rounded out to human-readable tick boundaries. */
const niceScale = (rawMin: number, rawMax: number) => {
  let min = rawMin;
  let max = rawMax;
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min === max) {
    // Flat series: open the domain so the line does not sit on an edge.
    min = min === 0 ? 0 : min - Math.abs(min) * 0.5;
    max = max === 0 ? 1 : max + Math.abs(max) * 0.5;
  }
  const step = niceNum(niceNum(max - min, false) / (TICK_COUNT - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    // Kill float drift from repeated addition (0.30000000000000004).
    ticks.push(Number(v.toPrecision(12)));
  }
  return { min: niceMin, max: niceMax, ticks };
};

const formatTick = (v: number): string => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${Number((v / 1_000_000_000).toPrecision(3))}B`;
  if (abs >= 1_000_000) return `${Number((v / 1_000_000).toPrecision(3))}M`;
  if (abs >= 1_000) return `${Number((v / 1_000).toPrecision(3))}k`;
  return `${Number(v.toPrecision(6))}`;
};

const colorOf = (s: ChartSeries, i: number) => s.color ?? PALETTE[i % PALETTE.length];
const labelOf = (s: ChartSeries) => s.label ?? s.key;
const valueAt = (row: Record<string, unknown> | undefined, key: string): number | null => {
  const raw = Number(row?.[key]);
  return Number.isFinite(raw) ? raw : null;
};

/**
 * The screen-reader table every pie ships.
 *
 * Visually hidden rather than absent: an aria-label can say "Agree 50%, Neutral
 * 30%", but a listener cannot navigate a sentence, compare two numbers in it, or
 * come back to one. A table they can. This is the difference between a pie chart
 * being described and being readable. Mirrors the React and Solid bindings.
 */
function sliceTable(slices: Slice[], labelHeader: string): HTMLTableElement {
  const table = document.createElement("table");
  table.className = "zen-sr-only";

  const caption = document.createElement("caption");
  caption.textContent = "Chart data";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const text of [labelHeader, "Value", "Share"]) {
    const th = document.createElement("th");
    th.setAttribute("scope", "col");
    th.textContent = text;
    headRow.append(th);
  }
  thead.append(headRow);

  const tbody = document.createElement("tbody");
  for (const s of slices) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.setAttribute("scope", "row");
    th.textContent = s.label;
    const value = document.createElement("td");
    value.textContent = String(s.value);
    const share = document.createElement("td");
    share.textContent = formatPercent(s.percent);
    tr.append(th, value, share);
    tbody.append(tr);
  }

  table.append(caption, thead, tbody);
  return table;
}

/**
 * The axis chart's series legend. `items` are [label, colour] pairs in series
 * order. Fixed height so `svgH()` can subtract it — the pie builds its own,
 * because its legend also drives the slice hover.
 */
function axisLegend(items: Array<[string, string]>): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-4";
  wrap.style.height = `${LEGEND_H}px`;

  for (const [label, color] of items) {
    const span = document.createElement("span");
    span.className = "zen-inline-flex zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg";

    const swatch = document.createElement("span");
    swatch.setAttribute("aria-hidden", "true");
    swatch.className = "zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full";
    swatch.style.backgroundColor = color;

    const text = document.createElement("span");
    text.textContent = label;

    span.append(swatch, text);
    wrap.append(span);
  }
  return wrap;
}

export function Chart(props: ChartProps): ZenComponent<ChartProps> {
  // Defaults live here, so every read below sees a concrete type/height. React
  // defaults these in its parameter list; there is no equivalent, so it is done
  // once on the way in and re-pinned in update().
  let current: ChartProps & { type: NonNullable<ChartProps["type"]>; height: number } = {
    ...props,
    type: props.type ?? "line",
    height: props.height ?? 300,
  };

  const el = document.createElement("div");
  const disposer = new Disposer();

  // Per-render listeners (pie slice hover, etc.) are cleared each render so a
  // rebuild cannot strand handlers on detached nodes.
  let renderCleanups: Array<() => void> = [];
  const clearRenderCleanups = () => {
    for (const fn of renderCleanups) fn();
    renderCleanups = [];
  };

  let width = 0;
  let hover: number | null = null;

  // Width is measured, not declared: mirrors recharts' ResponsiveContainer. Only
  // the axis charts need it; the pie draws in a scale-invariant viewBox.
  const ro = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect.width ?? el.clientWidth;
    if (w !== width) {
      width = w;
      render();
    }
  });
  ro.observe(el);
  disposer.add(() => ro.disconnect());
  disposer.add(clearRenderCleanups);

  // --- axis-chart geometry, closed over `current`/`width`/`hover` ------------

  const svgH = () => Math.max(0, current.height - LEGEND_H);
  const plotW = () => Math.max(0, width - PAD.left - PAD.right);
  const plotH = () => Math.max(0, svgH() - PAD.top - PAD.bottom);

  const scaleOf = () => {
    const values: number[] = [];
    for (const row of current.data) {
      for (const s of current.series) {
        const v = valueAt(row, s.key);
        if (v !== null) values.push(v);
      }
    }
    if (values.length === 0) return niceScale(0, 1);
    // Bars and areas are read against a zero baseline; a line is not.
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const zeroBased = current.type !== "line";
    return niceScale(
      zeroBased ? Math.min(0, dataMin) : dataMin,
      zeroBased ? Math.max(0, dataMax) : dataMax,
    );
  };

  const yOf = (scale: { min: number; max: number }, v: number) => {
    const span = scale.max - scale.min || 1;
    return PAD.top + plotH() * (1 - (v - scale.min) / span);
  };

  const bandW = () => (current.data.length > 0 ? plotW() / current.data.length : plotW());

  /** Centre of the slot for row `i` on the x-axis. */
  const xOf = (i: number) => {
    const n = current.data.length;
    if (current.type === "bar") return PAD.left + bandW() * (i + 0.5);
    if (n <= 1) return PAD.left + plotW() / 2;
    return PAD.left + (plotW() * i) / (n - 1);
  };

  const linePath = (scale: { min: number; max: number }, key: string): string => {
    let d = "";
    let pen = false;
    current.data.forEach((row, i) => {
      const v = valueAt(row, key);
      if (v === null) {
        // Gap in the series: lift the pen rather than interpolate across it.
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${xOf(i)} ${yOf(scale, v)} `;
      pen = true;
    });
    return d.trim();
  };

  const areaPath = (scale: { min: number; max: number }, key: string): string => {
    const pts = current.data
      .map((row, i) => ({ i, v: valueAt(row, key) }))
      .filter((p): p is { i: number; v: number } => p.v !== null);
    if (pts.length === 0) return "";
    const base = yOf(scale, Math.min(Math.max(0, scale.min), scale.max));
    const top = pts.map((p, k) => `${k === 0 ? "M" : "L"}${xOf(p.i)} ${yOf(scale, p.v)}`).join(" ");
    return `${top} L${xOf(pts[pts.length - 1].i)} ${base} L${xOf(pts[0].i)} ${base} Z`;
  };

  /** Drop x labels until they stop colliding (~60px each). */
  const labelStride = () => {
    const n = current.data.length;
    if (n === 0) return 1;
    const fits = Math.max(1, Math.floor(plotW() / 60));
    return Math.max(1, Math.ceil(n / fits));
  };

  const indexFromPointer = (clientX: number): number | null => {
    if (current.data.length === 0) return null;
    const rel = clientX - el.getBoundingClientRect().left;
    const n = current.data.length;
    if (current.type === "bar") {
      const i = Math.floor((rel - PAD.left) / (bandW() || 1));
      return i >= 0 && i < n ? i : null;
    }
    if (n === 1) return 0;
    const i = Math.round(((rel - PAD.left) / (plotW() || 1)) * (n - 1));
    return Math.min(n - 1, Math.max(0, i));
  };

  // Pointer tracking lives on the persistent container, registered once. It only
  // acts for axis types; a pie hovers its own slices.
  const onMove = (e: MouseEvent) => {
    if (isPie(current.type)) return;
    const next = indexFromPointer(e.clientX);
    if (next !== hover) {
      hover = next;
      render();
    }
  };
  const onLeave = () => {
    if (hover !== null) {
      hover = null;
      render();
    }
  };
  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
  disposer.add(() => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseleave", onLeave);
  });

  // --- renderers -------------------------------------------------------------

  function renderAxis(): void {
    el.className = cn("zen-relative zen-w-full", current.class);
    el.style.height = `${current.height}px`;

    if (width <= 0) return; // wait for the ResizeObserver's first measurement.

    const scale = scaleOf();
    const kids: SVGElement[] = [];

    // horizontal grid + y ticks
    for (const t of scale.ticks) {
      kids.push(
        svg("line", {
          x1: PAD.left,
          x2: PAD.left + plotW(),
          y1: yOf(scale, t),
          y2: yOf(scale, t),
          stroke: "var(--zen-color-border)",
          "stroke-dasharray": "3 3",
        }),
      );
      const label = svg("text", {
        x: PAD.left - 8,
        y: yOf(scale, t),
        "text-anchor": "end",
        "dominant-baseline": "middle",
        "font-size": "12",
        fill: "var(--zen-color-muted-fg)",
      });
      label.textContent = formatTick(t);
      kids.push(label);
    }

    // x axis line + labels
    kids.push(
      svg("line", {
        x1: PAD.left,
        x2: PAD.left + plotW(),
        y1: PAD.top + plotH(),
        y2: PAD.top + plotH(),
        stroke: "var(--zen-color-border)",
      }),
    );
    const stride = labelStride();
    current.data.forEach((row, i) => {
      if (i % stride !== 0) return;
      const label = svg("text", {
        x: xOf(i),
        y: PAD.top + plotH() + 16,
        "text-anchor": "middle",
        "font-size": "12",
        fill: "var(--zen-color-muted-fg)",
      });
      label.textContent = String(row[current.xKey] ?? "");
      kids.push(label);
    });

    // hover guide (not for bars)
    if (hover !== null && current.type !== "bar") {
      kids.push(
        svg("line", {
          x1: xOf(hover),
          x2: xOf(hover),
          y1: PAD.top,
          y2: PAD.top + plotH(),
          stroke: "var(--zen-color-border)",
        }),
      );
    }

    // series
    current.series.forEach((s, si) => {
      const color = colorOf(s, si);
      if (current.type === "bar") {
        const slot = (bandW() * 0.7) / Math.max(1, current.series.length);
        const zero = yOf(scale, Math.min(Math.max(0, scale.min), scale.max));
        current.data.forEach((row, i) => {
          const v = valueAt(row, s.key);
          if (v === null) return;
          const bx = xOf(i) - (bandW() * 0.7) / 2 + slot * si;
          kids.push(
            svg("rect", {
              x: bx,
              y: Math.min(yOf(scale, v), zero),
              width: Math.max(0, slot),
              height: Math.abs(zero - yOf(scale, v)),
              fill: color,
            }),
          );
        });
        return;
      }
      if (current.type === "area") {
        kids.push(
          svg("path", {
            d: areaPath(scale, s.key),
            fill: color,
            "fill-opacity": "0.2",
            stroke: "none",
          }),
        );
      }
      kids.push(
        svg("path", {
          d: linePath(scale, s.key),
          fill: "none",
          stroke: color,
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        }),
      );
    });

    // point markers on the hovered row (not for bars)
    if (hover !== null && current.type !== "bar") {
      current.series.forEach((s, si) => {
        const v = valueAt(current.data[hover as number], s.key);
        if (v === null) return;
        kids.push(
          svg("circle", {
            cx: xOf(hover as number),
            cy: yOf(scale, v),
            r: "3.5",
            fill: colorOf(s, si),
            stroke: "var(--zen-color-background)",
            "stroke-width": "1.5",
          }),
        );
      });
    }

    const svgEl = svg(
      "svg",
      {
        width,
        height: svgH(),
        role: "img",
        "aria-label": `${current.type} chart`,
      },
      kids,
    );
    el.append(svgEl);

    // legend
    el.append(
      axisLegend(current.series.map((s, si) => [labelOf(s), colorOf(s, si)] as [string, string])),
    );

    // tooltip
    if (hover !== null) {
      const row = current.data[hover];
      if (row) {
        const tip = document.createElement("div");
        tip.className =
          "zen-pointer-events-none zen-absolute zen-top-2 zen-z-10 zen-min-w-24 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-2 zen-text-xs zen-shadow-md";
        // Flip to the left of the guide once past the midpoint so the tooltip
        // never runs off the container.
        const gx = xOf(hover);
        if (gx > width / 2) {
          tip.style.right = `${Math.max(0, width - gx + 12)}px`;
          tip.style.left = "auto";
        } else {
          tip.style.left = `${Math.min(gx + 12, Math.max(0, width - 8))}px`;
          tip.style.right = "auto";
        }

        const heading = document.createElement("div");
        heading.className = "zen-mb-1 zen-font-medium zen-text-zen-foreground";
        heading.textContent = String(row[current.xKey] ?? "");
        tip.append(heading);

        current.series.forEach((s, si) => {
          const line = document.createElement("div");
          line.className = "zen-flex zen-items-center zen-gap-1.5 zen-text-zen-muted-fg";
          const swatch = document.createElement("span");
          swatch.className = "zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full";
          swatch.style.backgroundColor = colorOf(s, si);
          const name = document.createElement("span");
          name.textContent = labelOf(s);
          const val = document.createElement("span");
          val.className = "zen-ml-auto zen-font-medium zen-text-zen-foreground";
          const raw = row[s.key];
          val.textContent = raw === undefined || raw === null ? "—" : String(raw);
          line.append(swatch, name, val);
          tip.append(line);
        });
        el.append(tip);
      }
    }
  }

  function renderPie(): void {
    el.className = cn("zen-relative zen-w-full", current.class);
    el.style.height = `${current.height}px`;

    const slices = current.series[0]
      ? toSlices(current.data, current.xKey, current.series[0].key, current.colors ?? PALETTE)
      : [];
    const label = current.type === "donut" ? "Donut chart" : "Pie chart";

    const paths: SVGPathElement[] = [];
    slices.forEach((s, i) => {
      const path = svg("path", {
        d: arcPath(50, 50, R_OUTER, current.type === "donut" ? R_INNER : 0, s.startAngle, s.endAngle),
        fill: s.color,
        // The gap between slices is the page showing through, not a colour — so
        // it stays right in any theme.
        stroke: "var(--zen-color-background)",
        "stroke-width": "0.75",
        opacity: "1",
      });
      const enter = () => setSliceHover(i);
      const leave = () => setSliceHover(null);
      path.addEventListener("mouseenter", enter);
      path.addEventListener("mouseleave", leave);
      renderCleanups.push(() => {
        path.removeEventListener("mouseenter", enter);
        path.removeEventListener("mouseleave", leave);
      });
      paths.push(path);
    });

    const svgEl = svg(
      "svg",
      {
        width: "100%",
        height: Math.max(0, current.height - LEGEND_H),
        viewBox: "0 0 100 100",
        role: "img",
        "aria-label": describeSlices(slices, label),
      },
      paths,
    );
    el.append(svgEl);

    // tooltip (positioned above the pie, centred)
    const tip = document.createElement("div");
    tip.className = cn(
      "zen-pointer-events-none zen-absolute zen-left-1/2 zen-top-2 -zen-translate-x-1/2",
      "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
      "zen-px-2 zen-py-1 zen-text-xs zen-text-zen-foreground zen-shadow-md",
    );
    tip.style.display = "none";
    el.append(tip);

    // legend, whose entries also drive the hover
    const legendEl = document.createElement("div");
    legendEl.className = "zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-3 zen-text-xs";
    const legendSpans: HTMLElement[] = [];
    slices.forEach((s, i) => {
      const span = document.createElement("span");
      span.className = "zen-inline-flex zen-cursor-default zen-items-center zen-gap-1.5";
      const swatch = document.createElement("span");
      swatch.setAttribute("aria-hidden", "true");
      swatch.className = "zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full";
      swatch.style.backgroundColor = s.color;
      const text = document.createElement("span");
      text.className = "zen-text-zen-muted-fg";
      text.textContent = s.label;
      span.append(swatch, text);
      const enter = () => setSliceHover(i);
      const leave = () => setSliceHover(null);
      span.addEventListener("mouseenter", enter);
      span.addEventListener("mouseleave", leave);
      renderCleanups.push(() => {
        span.removeEventListener("mouseenter", enter);
        span.removeEventListener("mouseleave", leave);
      });
      legendSpans.push(span);
      legendEl.append(span);
    });
    el.append(legendEl);

    el.append(sliceTable(slices, current.xKey));

    // A pie's hover only dims arcs and moves a tooltip — a whole rebuild would be
    // wasteful and would fight the mouse. Mutate the existing nodes instead.
    function setSliceHover(next: number | null): void {
      hover = next;
      paths.forEach((p, i) => {
        p.setAttribute("opacity", next === null || next === i ? "1" : "0.45");
      });
      if (next === null || !slices[next]) {
        tip.style.display = "none";
        return;
      }
      const s = slices[next];
      tip.replaceChildren();
      const name = document.createElement("span");
      name.className = "zen-font-medium";
      name.textContent = s.label;
      const rest = document.createElement("span");
      rest.className = "zen-text-zen-muted-fg";
      rest.textContent = ` ${s.value} · ${formatPercent(s.percent)}`;
      tip.append(name, rest);
      tip.style.display = "";
    }
  }

  function render(): void {
    clearRenderCleanups();
    el.replaceChildren();
    if (isPie(current.type)) renderPie();
    else renderAxis();
  }

  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      // A caller can pass type/height as undefined; re-pin the defaults so a read
      // below never sees undefined.
      current.type = current.type ?? "line";
      current.height = current.height ?? 300;
      // The hovered index means a different thing across a type change, so drop
      // it rather than carry a stale one.
      hover = null;
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
Chart.displayName = "Chart";
