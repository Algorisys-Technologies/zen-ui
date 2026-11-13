import * as React from "react";
import { arcPath } from "@algorisys/zen-ui-core/chart";
import {
  DEFAULT_OEE_BANDS,
  gaugeAngle,
  oeeBand,
  type OeeBand,
  type OeeBands,
  type OeeFactors,
} from "@algorisys/zen-ui-core/oee";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * OeeGauge — OEE as a half-circle gauge, with its three factors underneath.
 *
 *   <OeeGauge value={0.724} />
 *   <OeeGauge value={r.oee} factors={r} />          // r = oeeFromCounts(...)
 *
 * Values are fractions (0.724, not 72.4). The number is always printed and the
 * band is always named in words ("Near target"): the arc's colour repeats them
 * and is never the only place they are. A value over 100% fills the arc and
 * prints as it is — Performance over 100% means the ideal cycle time is wrong,
 * and a gauge that clamped it would hide that.
 *
 * `null` is "no data": an empty track and a dash, never a 0, which would read as
 * the worst shift of the year for one nobody measured.
 */

export type OeeGaugeSize = "sm" | "md" | "lg";

export type OeeGaugeProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** OEE as a fraction, or null when there is nothing to show. */
  value: number | null;
  /** Availability, Performance and Quality, listed under the gauge when given. */
  factors?: OeeFactors;
  /** Where "near" and "on target" start. Defaults to 65% and 85%. */
  bands?: OeeBands;
  /** Names the gauge, visibly and for assistive tech. Defaults to "OEE". */
  label?: string;
  size?: OeeGaugeSize;
};

const BAND_COLOR: Record<OeeBand, string> = {
  poor: "var(--zen-color-error)",
  fair: "var(--zen-color-warning)",
  good: "var(--zen-color-success)",
};

const BAND_KEY = {
  poor: "oee.band.poor",
  fair: "oee.band.fair",
  good: "oee.band.good",
} as const;

const WIDTH: Record<OeeGaugeSize, string> = {
  sm: "zen-w-28",
  md: "zen-w-44",
  lg: "zen-w-60",
};

// Geometry, in viewBox units. The hub sits on the bottom edge; the zone ring
// marks where the bands change, outside the track it describes.
const CX = 60;
const CY = 62;
const TRACK_OUT = 52;
const TRACK_IN = 38;
const ZONE_OUT = 57.5;
const ZONE_IN = 55.5;

export const OeeGauge = React.forwardRef<HTMLDivElement, OeeGaugeProps>(
  ({ value, factors, bands: bandsProp, label: labelProp, size, className, ...rest }, ref) => {
    const loc = useLocale();
    const bands = bandsProp ?? DEFAULT_OEE_BANDS;
    const band = oeeBand(value, bands);
    const label = labelProp ?? loc.t("oee.label");
    const percent = (v: number) =>
      new Intl.NumberFormat(loc.locale, { style: "percent", maximumFractionDigits: 1 }).format(v);
    const shown = value === null ? "—" : percent(value);
    const bandText = band ? loc.t(BAND_KEY[band]) : loc.t("oee.noData");

    const zones = [
      { band: "poor" as const, from: 0, to: bands.fair },
      { band: "fair" as const, from: bands.fair, to: bands.good },
      { band: "good" as const, from: bands.good, to: 1 },
    ];

    return (
      <div
        ref={ref}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        // aria-valuenow must stay inside min..max, so an impossible 103% is
        // clamped there; the true figure is in aria-valuetext, which is what a
        // screen reader speaks.
        aria-valuenow={value === null ? undefined : Math.min(100, Math.max(0, Math.round(value * 1000) / 10))}
        aria-valuetext={
          value === null
            ? loc.t("oee.valueTextNoData", { label })
            : loc.t("oee.valueText", { label, value: shown, band: bandText })
        }
        data-band={band ?? "none"}
        className={cn("zen-inline-flex zen-flex-col zen-items-center zen-gap-1", WIDTH[size ?? "md"], className)}
        {...rest}
      >
        <span className="zen-text-sm zen-font-medium zen-text-zen-muted-fg">{label}</span>
        <svg viewBox="0 0 120 66" className="zen-block zen-w-full" aria-hidden="true">
          {zones.map((z) => (
            <path
              key={z.band}
              d={arcPath(CX, CY, ZONE_OUT, ZONE_IN, gaugeAngle(z.from), gaugeAngle(z.to))}
              style={{ fill: BAND_COLOR[z.band] }}
            />
          ))}
          <path d={arcPath(CX, CY, TRACK_OUT, TRACK_IN, -90, 90)} style={{ fill: "var(--zen-color-muted)" }} />
          {value !== null && value > 0 && band ? (
            <path
              d={arcPath(CX, CY, TRACK_OUT, TRACK_IN, -90, gaugeAngle(value))}
              style={{ fill: BAND_COLOR[band] }}
            />
          ) : null}
          <text
            x={CX}
            y={CY - 4}
            textAnchor="middle"
            style={{ fill: "var(--zen-color-foreground)", fontSize: "17px", fontWeight: 600 }}
          >
            {shown}
          </text>
        </svg>
        <span className="zen-text-sm zen-text-zen-foreground">{bandText}</span>

        {factors ? (
          <dl className="zen-mt-2 zen-grid zen-w-full zen-gap-1.5 zen-text-xs">
            {[
              { key: "oee.availability" as const, v: factors.availability },
              { key: "oee.performance" as const, v: factors.performance },
              { key: "oee.quality" as const, v: factors.quality },
            ].map((row) => (
              // A <div> in a <dl> may hold only <dt> and <dd>, so the bar
              // lives inside the <dd>, positioned under the whole row.
              <div key={row.key} className="zen-relative zen-flex zen-items-center zen-justify-between zen-gap-2 zen-pb-2">
                <dt className="zen-text-zen-muted-fg">{loc.t(row.key)}</dt>
                <dd className="zen-m-0 zen-font-medium zen-tabular-nums">
                  {row.v === null ? "—" : percent(row.v)}
                  <span
                    className="zen-absolute zen-bottom-0 zen-left-0 zen-right-0 zen-h-1 zen-rounded-zen-full zen-bg-zen-muted"
                    aria-hidden="true"
                  >
                    {row.v !== null && row.v > 0 ? (
                      <span
                        className="zen-block zen-h-full zen-rounded-zen-full zen-bg-zen-foreground"
                        style={{ width: `${Math.min(1, row.v) * 100}%` }}
                      />
                    ) : null}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    );
  },
);
OeeGauge.displayName = "OeeGauge";
