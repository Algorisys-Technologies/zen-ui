import * as React from "react";
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
 * `zen-fill-*` / `zen-stroke-*` do not generate under this preset — measured in
 * the Solid binding, the bullet track came back computed black and the radial
 * ring `none`, which is invisible rather than obviously broken.
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
  className?: string;
}

/** Shared wrapper: role=img + a label, because an unlabelled chart is decoration. */
const Frame = ({
  width,
  height,
  color,
  label,
  className,
  children,
}: {
  width: number;
  height: number;
  color: MicroChartColor;
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <svg
    role="img"
    aria-label={label}
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    className={cn("zen-inline-block zen-align-middle", COLOR_CLASS[color], className)}
  >
    {children}
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

export const MicroLineChart = ({
  values,
  area,
  width = 80,
  height = 24,
  color = "primary",
  label,
  className,
}: MicroLineChartProps) => {
  const vs = values ?? [];
  if (vs.length === 0) return null;
  const pad = 2;
  const n = normalise(vs);
  const w = width - pad * 2;
  const h = height - pad * 2;
  const step = vs.length === 1 ? 0 : w / (vs.length - 1);
  // SVG y grows downward, so 1 (the max) has to become the SMALLEST y.
  const points = n.map((v, i) => [pad + i * step, pad + (1 - v) * h] as const);

  return (
    <Frame
      width={width}
      height={height}
      color={color}
      label={label ?? `Line chart, ${vs.length} points, ${trend(vs)}`}
      className={className}
    >
      {area && (
        <polygon
          points={[
            `${points[0][0]},${height - pad}`,
            ...points.map(([x, y]) => `${x},${y}`),
            `${points[points.length - 1][0]},${height - pad}`,
          ].join(" ")}
          fill="currentColor"
          opacity="0.15"
        />
      )}
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
};

/* ------------------------------- bar ------------------------------ */

export interface MicroBarChartProps extends MicroChartBase {
  values: number[];
}

export const MicroBarChart = ({
  values,
  width = 80,
  height = 24,
  color = "primary",
  label,
  className,
}: MicroBarChartProps) => {
  const vs = values ?? [];
  if (vs.length === 0) return null;
  const gap = 2;
  const n = normalise(vs);
  const barW = Math.max(1, (width - gap * (vs.length - 1)) / vs.length);
  const bars = n.map((v, i) => {
    // A minimum height keeps the smallest value visible as a value rather than
    // as a gap the reader has to notice is missing.
    const bh = Math.max(2, v * height);
    return { x: i * (barW + gap), y: height - bh, w: barW, h: bh };
  });

  return (
    <Frame
      width={width}
      height={height}
      color={color}
      label={label ?? `Bar chart, ${vs.length} bars`}
      className={className}
    >
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="currentColor" rx="1" />
      ))}
    </Frame>
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

export const MicroBulletChart = ({
  value,
  target,
  min = 0,
  max = 100,
  width = 80,
  height = 12,
  color = "primary",
  label,
  className,
}: MicroBulletChartProps) => {
  const frac = (n: number) => {
    const span = max - min;
    return span === 0 ? 0 : Math.min(1, Math.max(0, (n - min) / span));
  };

  return (
    <Frame
      width={width}
      height={height}
      color={color}
      label={label ?? `${value} of ${max}` + (target !== undefined ? `, target ${target}` : "")}
      className={className}
    >
      <rect
        x="0"
        y={height / 2 - 3}
        width={width}
        height="6"
        rx="3"
        fill="var(--zen-color-muted)"
      />
      <rect
        x="0"
        y={height / 2 - 3}
        width={frac(value) * width}
        height="6"
        rx="3"
        fill="currentColor"
      />
      {target !== undefined && (
        /* A tick, not a second bar: the target is a line you crossed or did
           not, and drawing it as a bar invites reading it as a quantity. */
        <rect
          x={Math.min(width - 2, frac(target) * width)}
          y="0"
          width="2"
          height={height}
          fill="var(--zen-color-foreground)"
        />
      )}
    </Frame>
  );
};

/* ------------------------------ delta ----------------------------- */

export interface MicroDeltaChartProps extends MicroChartBase {
  from: number;
  to: number;
}

export const MicroDeltaChart = ({
  from,
  to,
  width = 80,
  height = 24,
  color,
  label,
  className,
}: MicroDeltaChartProps) => {
  const delta = to - from;
  /* Colour is DERIVED, not passed: the whole point of a delta is the direction,
   * and letting a caller paint a fall green would defeat it. Override `color`
   * only when up is bad — cost, error rate, latency. */
  const resolved: MicroChartColor =
    color ?? (delta > 0 ? "success" : delta < 0 ? "error" : "muted");
  const peak = Math.max(Math.abs(from), Math.abs(to), 1);
  const barH = (v: number) => Math.max(2, (Math.abs(v) / peak) * (height - 6));
  const w = (width - 8) / 2;

  return (
    <Frame
      width={width}
      height={height}
      color={resolved}
      label={
        label ??
        `${from} to ${to}, ${delta > 0 ? "up" : delta < 0 ? "down" : "unchanged"} ${Math.abs(delta)}`
      }
      className={className}
    >
      <rect
        x="0"
        y={height - barH(from)}
        width={w}
        height={barH(from)}
        rx="1"
        fill="var(--zen-color-muted-fg)"
        opacity="0.5"
      />
      <rect
        x={w + 8}
        y={height - barH(to)}
        width={w}
        height={barH(to)}
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

export const MicroRadialChart = ({
  value,
  max = 100,
  showValue,
  width = 40,
  height = 40,
  color = "primary",
  label,
  className,
}: MicroRadialChartProps) => {
  const pct = max === 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const size = Math.min(width, height);
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;

  return (
    <Frame
      width={width}
      height={height}
      color={color}
      label={label ?? `${Math.round(pct * 100)} percent`}
      className={className}
    >
      <g transform={`rotate(-90 ${width / 2} ${height / 2})`}>
        <circle
          cx={width / 2}
          cy={height / 2}
          r={r}
          fill="none"
          strokeWidth="3"
          stroke="var(--zen-color-muted)"
        />
        <circle
          cx={width / 2}
          cy={height / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
        />
      </g>
      {showValue && size >= 32 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.round(size / 3.5)}
          fill="currentColor"
        >
          {Math.round(pct * 100)}
        </text>
      )}
    </Frame>
  );
};
