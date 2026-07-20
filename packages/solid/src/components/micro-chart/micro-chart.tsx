import { For, Show, mergeProps } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Micro charts — trend marks small enough to live inside something else.
 *
 *   <MicroLineChart values={[3, 5, 2, 8, 6]} />
 *   <MicroBulletChart value={72} target={80} />
 *
 * These are not small versions of `Chart`. `Chart` answers "what happened" and
 * owns axes, a legend, a tooltip and a container to put them in. A micro chart
 * answers "up or down, and roughly how much" in the space of a table cell, and
 * everything that would explain it lives in the row or card around it. That is
 * why there is no axis, no legend and no tooltip here, and why adding them
 * would turn it into the wrong component.
 *
 * Fiori ships nine of these. Five are built: the four shapes that answer
 * genuinely different questions (a series, a series with discrete bars, one
 * value against a target, one value as a proportion) plus delta, which is a
 * comparison of exactly two. Harvey ball, comparison and stacked-bar are
 * restatements of radial and bar with fewer affordances.
 *
 * Everything is inline SVG sized in px: these sit in text flow, so a
 * percentage width would collapse in a table cell that has not been measured.
 * Colour comes from `currentColor`, so a caller can also just wrap them in
 * anything that sets a text colour.
 *
 * Tracks and ticks use `var(--zen-color-*)` directly rather than a utility.
 * `zen-fill-*` / `zen-stroke-*` do not generate under this preset — measured,
 * the bullet track came back computed black and the radial ring `none`, which
 * is invisible rather than obviously broken.
 */

export type MicroChartColor = "primary" | "success" | "warning" | "error" | "info" | "muted";

const COLOR_CLASS: Record<MicroChartColor, string> = {
  primary: "zen-text-zen-primary",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info",
  muted: "zen-text-zen-muted-fg",
};

interface MicroChartBase {
  /** Pixel width. Default varies by chart. */
  width?: number;
  /** Pixel height. Default varies by chart. */
  height?: number;
  color?: MicroChartColor;
  /**
   * What the chart says, for assistive tech. Each chart derives a sensible one
   * from its own data; override when the surrounding text does not already say
   * what this is measuring.
   */
  label?: string;
  class?: string;
}

/** Shared wrapper: role=img + a label, because an unlabelled chart is decoration. */
const Frame = (props: {
  width: number;
  height: number;
  color: MicroChartColor;
  label: string;
  class?: string;
  children: import("solid-js").JSX.Element;
}) => (
  <svg
    role="img"
    aria-label={props.label}
    width={props.width}
    height={props.height}
    viewBox={`0 0 ${props.width} ${props.height}`}
    class={cn("zen-inline-block zen-align-middle", COLOR_CLASS[props.color], props.class)}
  >
    {props.children}
  </svg>
);

/** Map values onto 0..1. A flat series sits in the middle rather than at zero. */
const normalise = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  return values.map((v) => (span === 0 ? 0.5 : (v - min) / span));
};

const trend = (values: number[]) => {
  if (values.length < 2) return "flat";
  const first = values[0];
  const last = values[values.length - 1];
  return last > first ? "rising" : last < first ? "falling" : "flat";
};

/* ------------------------------ line ------------------------------ */

export interface MicroLineChartProps extends MicroChartBase {
  values: number[];
  /** Fill the area under the line. Off by default — at this size it muddies it. */
  area?: boolean;
}

export const MicroLineChart = (rawProps: MicroLineChartProps) => {
  const props = mergeProps({ width: 80, height: 24, color: "primary" as MicroChartColor }, rawProps);
  const pad = 2;
  const points = () => {
    const vs = props.values ?? [];
    if (vs.length === 0) return [];
    const n = normalise(vs);
    const w = props.width - pad * 2;
    const h = props.height - pad * 2;
    const step = vs.length === 1 ? 0 : w / (vs.length - 1);
    // SVG y grows downward, so 1 (the max) has to become the SMALLEST y.
    return n.map((v, i) => [pad + i * step, pad + (1 - v) * h] as const);
  };
  const label = () =>
    props.label ??
    `Line chart, ${props.values?.length ?? 0} points, ${trend(props.values ?? [])}`;

  return (
    <Show when={points().length > 0}>
      <Frame
        width={props.width}
        height={props.height}
        color={props.color}
        label={label()}
        class={props.class}
      >
        <Show when={props.area}>
          <polygon
            points={[
              `${points()[0][0]},${props.height - pad}`,
              ...points().map(([x, y]) => `${x},${y}`),
              `${points()[points().length - 1][0]},${props.height - pad}`,
            ].join(" ")}
            fill="currentColor"
            opacity="0.15"
          />
        </Show>
        <polyline
          points={points().map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Frame>
    </Show>
  );
};

/* ------------------------------- bar ------------------------------ */

export interface MicroBarChartProps extends MicroChartBase {
  values: number[];
}

export const MicroBarChart = (rawProps: MicroBarChartProps) => {
  const props = mergeProps({ width: 80, height: 24, color: "primary" as MicroChartColor }, rawProps);
  const gap = 2;
  const bars = () => {
    const vs = props.values ?? [];
    if (vs.length === 0) return [];
    const n = normalise(vs);
    const barW = Math.max(1, (props.width - gap * (vs.length - 1)) / vs.length);
    return n.map((v, i) => {
      // A minimum height keeps the smallest value visible as a value rather
      // than as a gap the reader has to notice is missing.
      const h = Math.max(2, v * props.height);
      return { x: i * (barW + gap), y: props.height - h, w: barW, h };
    });
  };

  return (
    <Show when={bars().length > 0}>
      <Frame
        width={props.width}
        height={props.height}
        color={props.color}
        label={props.label ?? `Bar chart, ${props.values?.length ?? 0} bars`}
        class={props.class}
      >
        <For each={bars()}>
          {(b) => <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="currentColor" rx="1" />}
        </For>
      </Frame>
    </Show>
  );
};

/* ----------------------------- bullet ----------------------------- */

export interface MicroBulletChartProps extends MicroChartBase {
  value: number;
  /** The number you were aiming at; drawn as a tick, not a bar. */
  target?: number;
  min?: number;
  max?: number;
}

export const MicroBulletChart = (rawProps: MicroBulletChartProps) => {
  const props = mergeProps(
    { width: 80, height: 12, color: "primary" as MicroChartColor, min: 0, max: 100 },
    rawProps,
  );
  const frac = (n: number) => {
    const span = props.max - props.min;
    return span === 0 ? 0 : Math.min(1, Math.max(0, (n - props.min) / span));
  };
  const label = () =>
    props.label ??
    `${props.value} of ${props.max}` +
      (props.target !== undefined ? `, target ${props.target}` : "");

  return (
    <Frame
      width={props.width}
      height={props.height}
      color={props.color}
      label={label()}
      class={props.class}
    >
      {/* track */}
      <rect
        x="0"
        y={props.height / 2 - 3}
        width={props.width}
        height="6"
        rx="3"
        fill="var(--zen-color-muted)"
      />
      <rect
        x="0"
        y={props.height / 2 - 3}
        width={frac(props.value) * props.width}
        height="6"
        rx="3"
        fill="currentColor"
      />
      <Show when={props.target !== undefined}>
        {/* A tick, not a second bar: the target is a line you crossed or did
            not, and drawing it as a bar invites reading it as a quantity. */}
        <rect
          x={Math.min(props.width - 2, frac(props.target!) * props.width)}
          y="0"
          width="2"
          height={props.height}
          fill="var(--zen-color-foreground)"
        />
      </Show>
    </Frame>
  );
};

/* ------------------------------ delta ----------------------------- */

export interface MicroDeltaChartProps extends MicroChartBase {
  from: number;
  to: number;
}

export const MicroDeltaChart = (rawProps: MicroDeltaChartProps) => {
  const props = mergeProps({ width: 80, height: 24 }, rawProps);
  const delta = () => props.to - props.from;
  /* Colour is DERIVED, not passed: the whole point of a delta is the direction,
   * and letting a caller paint a fall green would defeat it. Override `color`
   * only when up is bad — cost, error rate, latency. */
  const color = (): MicroChartColor =>
    props.color ?? (delta() > 0 ? "success" : delta() < 0 ? "error" : "muted");
  const peak = () => Math.max(Math.abs(props.from), Math.abs(props.to), 1);
  const barH = (v: number) => Math.max(2, (Math.abs(v) / peak()) * (props.height - 6));
  const w = () => (props.width - 8) / 2;

  return (
    <Frame
      width={props.width}
      height={props.height}
      color={color()}
      label={
        props.label ??
        `${props.from} to ${props.to}, ${delta() > 0 ? "up" : delta() < 0 ? "down" : "unchanged"} ${Math.abs(delta())}`
      }
      class={props.class}
    >
      <rect
        x="0"
        y={props.height - barH(props.from)}
        width={w()}
        height={barH(props.from)}
        rx="1"
        fill="var(--zen-color-muted-fg)"
        opacity="0.5"
      />
      <rect
        x={w() + 8}
        y={props.height - barH(props.to)}
        width={w()}
        height={barH(props.to)}
        rx="1"
        fill="currentColor"
      />
    </Frame>
  );
};

/* ----------------------------- radial ----------------------------- */

export interface MicroRadialChartProps extends MicroChartBase {
  value: number;
  max?: number;
  /** Print the percentage in the middle. Off below ~32px, where it cannot fit. */
  showValue?: boolean;
}

export const MicroRadialChart = (rawProps: MicroRadialChartProps) => {
  const props = mergeProps(
    { width: 40, height: 40, color: "primary" as MicroChartColor, max: 100 },
    rawProps,
  );
  const pct = () => (props.max === 0 ? 0 : Math.min(1, Math.max(0, props.value / props.max)));
  const size = () => Math.min(props.width, props.height);
  const r = () => size() / 2 - 3;
  const circ = () => 2 * Math.PI * r();

  return (
    <Frame
      width={props.width}
      height={props.height}
      color={props.color}
      label={props.label ?? `${Math.round(pct() * 100)} percent`}
      class={props.class}
    >
      <g transform={`rotate(-90 ${props.width / 2} ${props.height / 2})`}>
        <circle
          cx={props.width / 2}
          cy={props.height / 2}
          r={r()}
          fill="none"
          stroke-width="3"
          stroke="var(--zen-color-muted)"
        />
        <circle
          cx={props.width / 2}
          cy={props.height / 2}
          r={r()}
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray={`${circ() * pct()} ${circ()}`}
        />
      </g>
      <Show when={props.showValue && size() >= 32}>
        <text
          x={props.width / 2}
          y={props.height / 2}
          text-anchor="middle"
          dominant-baseline="central"
          font-size={String(Math.round(size() / 3.5))}
          fill="currentColor"
        >
          {Math.round(pct() * 100)}
        </text>
      </Show>
    </Frame>
  );
};
