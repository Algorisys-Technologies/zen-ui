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
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * OeeGauge — OEE as a half-circle gauge, with its three factors underneath.
 *
 *   OeeGauge({ value: 0.724 })
 *   OeeGauge({ value: r.oee, factors: r })          // r = oeeFromCounts(...)
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * Values are fractions (0.724, not 72.4). The number is always printed and the
 * band is always named in words: the arc's colour repeats them. A value over
 * 100% fills the arc and prints as it is — a gauge that clamped it would hide
 * the bad ideal cycle time that produced it. `null` is "no data": an empty
 * track and a dash, never a 0.
 */

export type OeeGaugeSize = "sm" | "md" | "lg";

export interface OeeGaugeProps extends Omit<BaseProps, "children"> {
  /** OEE as a fraction, or null when there is nothing to show. */
  value: number | null;
  /** Availability, Performance and Quality, listed under the gauge when given. */
  factors?: OeeFactors;
  /** Where "near" and "on target" start. Defaults to 65% and 85%. */
  bands?: OeeBands;
  /** Names the gauge, visibly and for assistive tech. Defaults to "OEE". */
  label?: string;
  size?: OeeGaugeSize;
}

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

const SVG_NS = "http://www.w3.org/2000/svg";
const DASH = "—"; // i18n-ignore (a dash for "no value", not a word)

const arc = (d: string, fill: string): SVGPathElement => {
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", d);
  path.style.fill = fill;
  return path;
};

export function OeeGauge(props: OeeGaugeProps): ZenComponent<OeeGaugeProps> {
  let current: OeeGaugeProps = { ...props };
  const loc = useLocale();
  const el = document.createElement("div");
  el.setAttribute("role", "meter");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { value, factors, bands: bandsProp, label: labelProp, size, class: className, ...rest } = current;
    const bands = bandsProp ?? DEFAULT_OEE_BANDS;
    const band = oeeBand(value, bands);
    const label = labelProp ?? loc.t("oee.label");
    const fmt = new Intl.NumberFormat(loc.locale, { style: "percent", maximumFractionDigits: 1 });
    const percent = (v: number) => fmt.format(v);
    const shown = value === null ? DASH : percent(value);
    const bandText = band ? loc.t(BAND_KEY[band]) : loc.t("oee.noData");

    el.setAttribute("aria-label", label);
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", "100");
    // aria-valuenow must stay inside min..max, so an impossible 103% is clamped
    // there; the true figure is in aria-valuetext, which is what is spoken.
    if (value === null) el.removeAttribute("aria-valuenow");
    else el.setAttribute("aria-valuenow", String(Math.min(100, Math.max(0, Math.round(value * 1000) / 10))));
    el.setAttribute(
      "aria-valuetext",
      value === null
        ? loc.t("oee.valueTextNoData", { label })
        : loc.t("oee.valueText", { label, value: shown, band: bandText }),
    );
    el.setAttribute("data-band", band ?? "none");
    el.className = cn("zen-inline-flex zen-flex-col zen-items-center zen-gap-1", WIDTH[size ?? "md"], className);

    const name = document.createElement("span");
    name.className = "zen-text-sm zen-font-medium zen-text-zen-muted-fg";
    name.textContent = label;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 120 66");
    svg.setAttribute("class", "zen-block zen-w-full");
    svg.setAttribute("aria-hidden", "true");
    const zones = [
      { band: "poor" as const, from: 0, to: bands.fair },
      { band: "fair" as const, from: bands.fair, to: bands.good },
      { band: "good" as const, from: bands.good, to: 1 },
    ];
    for (const z of zones) {
      svg.append(arc(arcPath(CX, CY, ZONE_OUT, ZONE_IN, gaugeAngle(z.from), gaugeAngle(z.to)), BAND_COLOR[z.band]));
    }
    svg.append(arc(arcPath(CX, CY, TRACK_OUT, TRACK_IN, -90, 90), "var(--zen-color-muted)"));
    if (value !== null && value > 0 && band) {
      svg.append(arc(arcPath(CX, CY, TRACK_OUT, TRACK_IN, -90, gaugeAngle(value)), BAND_COLOR[band]));
    }
    const figure = document.createElementNS(SVG_NS, "text");
    figure.setAttribute("x", String(CX));
    figure.setAttribute("y", String(CY - 4));
    figure.setAttribute("text-anchor", "middle");
    figure.style.fill = "var(--zen-color-foreground)";
    figure.style.fontSize = "17px";
    figure.style.fontWeight = "600";
    figure.textContent = shown;
    svg.append(figure);

    const bandEl = document.createElement("span");
    bandEl.className = "zen-text-sm zen-text-zen-foreground";
    bandEl.textContent = bandText;

    const children: Element[] = [name, svg, bandEl];

    if (factors) {
      const dl = document.createElement("dl");
      dl.className = "zen-mt-2 zen-grid zen-w-full zen-gap-1.5 zen-text-xs";
      const rows = [
        { key: "oee.availability" as const, v: factors.availability },
        { key: "oee.performance" as const, v: factors.performance },
        { key: "oee.quality" as const, v: factors.quality },
      ];
      for (const row of rows) {
        // A <div> in a <dl> may hold only <dt> and <dd>, so the bar lives
        // inside the <dd>, positioned under the whole row.
        const item = document.createElement("div");
        item.className = "zen-relative zen-flex zen-items-center zen-justify-between zen-gap-2 zen-pb-2";
        const dt = document.createElement("dt");
        dt.className = "zen-text-zen-muted-fg";
        dt.textContent = loc.t(row.key);
        const dd = document.createElement("dd");
        dd.className = "zen-m-0 zen-font-medium zen-tabular-nums";
        dd.textContent = row.v === null ? DASH : percent(row.v);
        const track = document.createElement("span");
        track.className = "zen-absolute zen-bottom-0 zen-left-0 zen-right-0 zen-h-1 zen-rounded-zen-full zen-bg-zen-muted";
        track.setAttribute("aria-hidden", "true");
        if (row.v !== null && row.v > 0) {
          const fill = document.createElement("span");
          fill.className = "zen-block zen-h-full zen-rounded-zen-full zen-bg-zen-foreground";
          fill.style.width = `${Math.min(1, row.v) * 100}%`;
          track.append(fill);
        }
        dd.append(track);
        item.append(dt, dd);
        dl.append(item);
      }
      children.push(dl);
    }

    el.replaceChildren(...children);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
