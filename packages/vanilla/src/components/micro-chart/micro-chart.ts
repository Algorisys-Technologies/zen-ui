import { cn } from "../../lib/cn";
import type { BaseProps, ZenComponent } from "../../lib/component";

/**
 * Micro charts — trend marks small enough to live inside something else.
 *
 *   MicroLineChart({ values: [3, 5, 2, 8, 6] }).el
 *   MicroBulletChart({ value: 72, target: 80 }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * SVG elements MUST be created with `createElementNS`. `document.createElement`
 * makes an HTMLUnknownElement that happens to be spelled "svg" — it parses,
 * attaches, reports a size of 0×0 and draws nothing, with no error anywhere.
 * That is the whole hazard of hand-building SVG without a framework, so every
 * node here goes through `svg()`.
 */

const NS = "http://www.w3.org/2000/svg";

export type MicroChartColor = "primary" | "success" | "warning" | "error" | "info" | "muted";

const COLOR_CLASS: Record<MicroChartColor, string> = {
  primary: "zen-text-zen-primary",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info",
  muted: "zen-text-zen-muted-fg",
};

export interface MicroChartBaseProps extends BaseProps {
  width?: number;
  height?: number;
  color?: MicroChartColor;
  /** What the chart says, for assistive tech. Derived when omitted. */
  label?: string;
}

const svg = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] => {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};

const frame = (
  width: number,
  height: number,
  color: MicroChartColor,
  label: string,
  cls?: string,
): SVGSVGElement => {
  const root = svg("svg", {
    role: "img",
    "aria-label": label,
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
  });
  // `class` on an SVG element is an ATTRIBUTE, not the HTML className property.
  root.setAttribute("class", cn("zen-inline-block zen-align-middle", COLOR_CLASS[color], cls));
  return root;
};

/** Map values onto 0..1. A flat series sits in the middle rather than at zero. */
const normalise = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  return values.map((v) => (span === 0 ? 0.5 : (v - min) / span));
};

const trend = (values: number[]) => {
  if (values.length < 2) return "flat";
  const a = values[0];
  const b = values[values.length - 1];
  return b > a ? "rising" : b < a ? "falling" : "flat";
};

/** Every chart is a rebuild-on-update factory; they are a few nodes each. */
const make = <P extends MicroChartBaseProps>(
  props: P,
  draw: (p: P) => SVGSVGElement,
): ZenComponent<P> => {
  let current = { ...props };
  let el = draw(current);
  return {
    get el() {
      return el as unknown as HTMLElement;
    },
    update(next) {
      current = { ...current, ...next };
      const replacement = draw(current);
      el.replaceWith(replacement);
      el = replacement;
    },
    destroy() {
      el.remove();
    },
  };
};

/* ------------------------------ line ------------------------------ */

export interface MicroLineChartProps extends MicroChartBaseProps {
  values: number[];
  area?: boolean;
}

export function MicroLineChart(props: MicroLineChartProps): ZenComponent<MicroLineChartProps> {
  return make(props, (p) => {
    const width = p.width ?? 80;
    const height = p.height ?? 24;
    const vs = p.values ?? [];
    const root = frame(
      width,
      height,
      p.color ?? "primary",
      p.label ?? `Line chart, ${vs.length} points, ${trend(vs)}`,
      p.class,
    );
    if (vs.length === 0) return root;

    const pad = 2;
    const n = normalise(vs);
    const w = width - pad * 2;
    const h = height - pad * 2;
    const step = vs.length === 1 ? 0 : w / (vs.length - 1);
    // SVG y grows downward, so 1 (the max) becomes the SMALLEST y.
    const pts = n.map((v, i) => [pad + i * step, pad + (1 - v) * h] as const);

    if (p.area) {
      root.append(
        svg("polygon", {
          points: [
            `${pts[0][0]},${height - pad}`,
            ...pts.map(([x, y]) => `${x},${y}`),
            `${pts[pts.length - 1][0]},${height - pad}`,
          ].join(" "),
          fill: "currentColor",
          opacity: "0.15",
        }),
      );
    }
    root.append(
      svg("polyline", {
        points: pts.map(([x, y]) => `${x},${y}`).join(" "),
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.5",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
    return root;
  });
}

/* ------------------------------- bar ------------------------------ */

export interface MicroBarChartProps extends MicroChartBaseProps {
  values: number[];
}

export function MicroBarChart(props: MicroBarChartProps): ZenComponent<MicroBarChartProps> {
  return make(props, (p) => {
    const width = p.width ?? 80;
    const height = p.height ?? 24;
    const vs = p.values ?? [];
    const root = frame(
      width,
      height,
      p.color ?? "primary",
      p.label ?? `Bar chart, ${vs.length} bars`,
      p.class,
    );
    if (vs.length === 0) return root;

    const gap = 2;
    const n = normalise(vs);
    const barW = Math.max(1, (width - gap * (vs.length - 1)) / vs.length);
    n.forEach((v, i) => {
      // A minimum height keeps the smallest value visible as a value rather
      // than as a gap the reader has to notice is missing.
      const bh = Math.max(2, v * height);
      root.append(
        svg("rect", {
          x: i * (barW + gap),
          y: height - bh,
          width: barW,
          height: bh,
          fill: "currentColor",
          rx: "1",
        }),
      );
    });
    return root;
  });
}

/* ----------------------------- bullet ----------------------------- */

export interface MicroBulletChartProps extends MicroChartBaseProps {
  value: number;
  /** The number you were aiming at; drawn as a tick, not a bar. */
  target?: number;
  min?: number;
  max?: number;
}

export function MicroBulletChart(props: MicroBulletChartProps): ZenComponent<MicroBulletChartProps> {
  return make(props, (p) => {
    const width = p.width ?? 80;
    const height = p.height ?? 12;
    const min = p.min ?? 0;
    const max = p.max ?? 100;
    const frac = (n: number) => {
      const span = max - min;
      return span === 0 ? 0 : Math.min(1, Math.max(0, (n - min) / span));
    };
    const root = frame(
      width,
      height,
      p.color ?? "primary",
      p.label ??
        `${p.value} of ${max}` + (p.target !== undefined ? `, target ${p.target}` : ""),
      p.class,
    );
    root.append(
      svg("rect", {
        x: 0,
        y: height / 2 - 3,
        width,
        height: 6,
        rx: 3,
        fill: "var(--zen-color-muted)",
      }),
      svg("rect", {
        x: 0,
        y: height / 2 - 3,
        width: frac(p.value) * width,
        height: 6,
        rx: 3,
        fill: "currentColor",
      }),
    );
    if (p.target !== undefined) {
      // A tick, not a second bar: the target is a line you crossed or did not,
      // and drawing it as a bar invites reading it as a quantity.
      root.append(
        svg("rect", {
          x: Math.min(width - 2, frac(p.target) * width),
          y: 0,
          width: 2,
          height,
          fill: "var(--zen-color-foreground)",
        }),
      );
    }
    return root;
  });
}

/* ------------------------------ delta ----------------------------- */

export interface MicroDeltaChartProps extends MicroChartBaseProps {
  from: number;
  to: number;
}

export function MicroDeltaChart(props: MicroDeltaChartProps): ZenComponent<MicroDeltaChartProps> {
  return make(props, (p) => {
    const width = p.width ?? 80;
    const height = p.height ?? 24;
    const delta = p.to - p.from;
    /* Colour is DERIVED, not passed: the whole point of a delta is the
     * direction, and letting a caller paint a fall green would defeat it.
     * Override `color` only when up is bad — cost, error rate, latency. */
    const color: MicroChartColor =
      p.color ?? (delta > 0 ? "success" : delta < 0 ? "error" : "muted");
    const peak = Math.max(Math.abs(p.from), Math.abs(p.to), 1);
    const barH = (v: number) => Math.max(2, (Math.abs(v) / peak) * (height - 6));
    const w = (width - 8) / 2;

    const root = frame(
      width,
      height,
      color,
      p.label ??
        `${p.from} to ${p.to}, ${delta > 0 ? "up" : delta < 0 ? "down" : "unchanged"} ${Math.abs(delta)}`,
      p.class,
    );
    root.append(
      svg("rect", {
        x: 0,
        y: height - barH(p.from),
        width: w,
        height: barH(p.from),
        rx: 1,
        fill: "var(--zen-color-muted-fg)",
        opacity: "0.5",
      }),
      svg("rect", {
        x: w + 8,
        y: height - barH(p.to),
        width: w,
        height: barH(p.to),
        rx: 1,
        fill: "currentColor",
      }),
    );
    return root;
  });
}

/* ----------------------------- radial ----------------------------- */

export interface MicroRadialChartProps extends MicroChartBaseProps {
  value: number;
  max?: number;
  /** Print the percentage in the middle. Off below ~32px, where it cannot fit. */
  showValue?: boolean;
}

export function MicroRadialChart(props: MicroRadialChartProps): ZenComponent<MicroRadialChartProps> {
  return make(props, (p) => {
    const width = p.width ?? 40;
    const height = p.height ?? 40;
    const max = p.max ?? 100;
    const pct = max === 0 ? 0 : Math.min(1, Math.max(0, p.value / max));
    const size = Math.min(width, height);
    const r = size / 2 - 3;
    const circ = 2 * Math.PI * r;

    const root = frame(
      width,
      height,
      p.color ?? "primary",
      p.label ?? `${Math.round(pct * 100)} percent`,
      p.class,
    );
    const g = svg("g", { transform: `rotate(-90 ${width / 2} ${height / 2})` });
    g.append(
      svg("circle", {
        cx: width / 2,
        cy: height / 2,
        r,
        fill: "none",
        "stroke-width": 3,
        stroke: "var(--zen-color-muted)",
      }),
      svg("circle", {
        cx: width / 2,
        cy: height / 2,
        r,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 3,
        "stroke-linecap": "round",
        "stroke-dasharray": `${circ * pct} ${circ}`,
      }),
    );
    root.append(g);

    if (p.showValue && size >= 32) {
      const t = svg("text", {
        x: width / 2,
        y: height / 2,
        "text-anchor": "middle",
        "dominant-baseline": "central",
        "font-size": Math.round(size / 3.5),
        fill: "currentColor",
      });
      t.textContent = String(Math.round(pct * 100));
      root.append(t);
    }
    return root;
  });
}
