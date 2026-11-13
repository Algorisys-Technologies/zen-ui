import { parseNumber } from "@algorisys/zen-ui-core/number-format";
import {
  judgeMeasurement,
  measurementScale,
  type MeasurementJudgement,
  type MeasurementSpec,
} from "@algorisys/zen-ui-core/measurement";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale, type MessageKey } from "../locale/locale";
import { Icon, type IconHandle } from "../icon/icon";

/**
 * MeasurementInput — a reading checked against its limits as it is typed.
 *
 *   const bore = MeasurementInput({
 *     label: "Bore diameter", unit: "mm", precision: 2,
 *     spec: { nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 },
 *     onChange: (value, j) => record(value, j.verdict),
 *   });
 *
 * The verdict is in words ("Above the upper limit") with an icon, and a scale
 * under the field shows where the reading sits: the tolerance band, the
 * warning band inside it, the nominal, and the reading. The scale is built from
 * the limits — a typo of 1000 against 10 ± 0.1 is pinned to the end and marked
 * off the scale rather than squashing the band to nothing.
 *
 * Input is read in the user's locale ("10,05" in German). The verdict updates as
 * you type; a screen reader hears it when the reading is committed (Enter or
 * leaving the field), not after every keystroke on the way to it. The commit is
 * the native `change` event, as in Solid — React rebuilds it from focus and
 * blur only because its own onChange is per keystroke.
 *
 * The field's text is the component's own; `update({ value })` rewrites it
 * unless the number is the one already typed, so "10,0" being typed is not
 * reformatted under the cursor to "10,00".
 */
export interface MeasurementInputProps extends Omit<BaseProps, "children"> {
  spec: MeasurementSpec;
  label: string;
  /** Shown after the field and the limits ("mm", "Nm"). */
  unit?: string;
  /** Decimals for the limits shown. Defaults to what the spec needs. */
  precision?: number;
  value?: number | null;
  defaultValue?: number | null;
  /** Every valid change, with its judgement; null when the field is empty or not a number. */
  onChange?: (value: number | null, judgement: MeasurementJudgement) => void;
  disabled?: boolean;
}

export type MeasurementInputHandle = ZenComponent<MeasurementInputProps, HTMLDivElement>;

const VERDICT_KEY = {
  pass: "measurement.pass",
  "warn-low": "measurement.warnLow",
  "warn-high": "measurement.warnHigh",
  "fail-low": "measurement.failLow",
  "fail-high": "measurement.failHigh",
} as const satisfies Record<string, MessageKey>;

const decimalsOf = (spec: MeasurementSpec) =>
  Math.max(
    0,
    ...[spec.nominal, spec.lower, spec.upper, spec.warnLower, spec.warnUpper]
      .filter((n): n is number => typeof n === "number")
      .map((n) => (String(n).split(".")[1] ?? "").length),
  );

const INPUT_CLASS = [
  "zen-h-12 zen-w-40 zen-rounded-zen-md zen-border-2 zen-border-solid zen-bg-zen-background zen-px-3 zen-text-end zen-font-mono zen-text-lg zen-tabular-nums",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
].join(" ");

let uid = 0;

export function MeasurementInput(props: MeasurementInputProps): MeasurementInputHandle {
  let current: MeasurementInputProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  const id = `zen-measurement-${++uid}`;
  const specId = `${id}-spec`;
  const verdictId = `${id}-verdict`;

  const digits = () => current.precision ?? decimalsOf(current.spec);
  const fmt = (n: number, d = digits()) =>
    new Intl.NumberFormat(loc.locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  // A READING is never rounded to the spec's precision — 0.05 against a limit
  // of 0.2 must not display as 0.1. At least the spec's decimals, never fewer
  // than its own.
  const fmtReading = (n: number) =>
    new Intl.NumberFormat(loc.locale, { minimumFractionDigits: digits(), maximumFractionDigits: 12, useGrouping: false }).format(n);

  // The starting text, read once; a later `value` arrives through update().
  const start = current.value ?? current.defaultValue;
  let text = start === null || start === undefined ? "" : fmtReading(start);
  const parsed = () => parseNumber(text, { locale: loc.locale });
  const reading = () => {
    const v = parsed();
    return typeof v === "number" ? v : null;
  };
  const invalid = () => parsed() === "invalid";
  const judgement = () => judgeMeasurement(reading(), current.spec);
  const tone = () => (invalid() ? "fail" : judgement().verdict);
  const withUnit = (s: string) => (current.unit ? `${s} ${current.unit}` : s);
  const verdictText = () => {
    if (invalid()) return loc.t("measurement.invalid");
    const j = judgement();
    if (!j.verdict) return "";
    const key = j.verdict === "pass" ? "pass" : (`${j.verdict}-${j.side}` as keyof typeof VERDICT_KEY);
    return loc.t(VERDICT_KEY[key]);
  };
  const specText = () => {
    const { nominal, lower, upper } = current.spec;
    if (nominal !== undefined && lower !== undefined && upper !== undefined && Math.abs(nominal - lower - (upper - nominal)) < 1e-9) {
      return withUnit(loc.t("measurement.specTolerance", { nominal: fmt(nominal), tolerance: fmt(upper - nominal) }));
    }
    if (lower !== undefined && upper !== undefined) return withUnit(loc.t("measurement.specRange", { lower: fmt(lower), upper: fmt(upper) }));
    if (lower !== undefined) return withUnit(loc.t("measurement.specMin", { lower: fmt(lower) }));
    if (upper !== undefined) return withUnit(loc.t("measurement.specMax", { upper: fmt(upper) }));
    return "";
  };

  // ── DOM ──────────────────────────────────────────────────────────────
  const el = document.createElement("div");

  const labelEl = document.createElement("label");
  labelEl.htmlFor = id;
  labelEl.className = "zen-text-sm zen-font-medium zen-text-zen-foreground";

  const row = document.createElement("div");
  row.className = "zen-flex zen-items-center zen-gap-2";

  const input = document.createElement("input");
  input.id = id;
  input.type = "text";
  input.inputMode = "decimal";
  input.autocomplete = "off";
  input.value = text;
  input.setAttribute("aria-describedby", [specId, verdictId].join(" "));

  const unitEl = document.createElement("span");
  unitEl.className = "zen-text-base zen-text-zen-foreground";

  const verdict = document.createElement("span");
  verdict.id = verdictId;

  const specEl = document.createElement("span");
  specEl.id = specId;
  specEl.className = "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg";

  const track = document.createElement("div");
  track.className =
    "zen-relative zen-mt-1 zen-h-3 zen-w-full zen-max-w-md zen-overflow-visible zen-rounded-zen-sm zen-bg-zen-error-soft";
  track.setAttribute("aria-hidden", "true");

  const live = document.createElement("span");
  live.className = "zen-sr-only";
  live.setAttribute("aria-live", "polite");

  row.append(input, unitEl, verdict);
  el.append(labelEl, row, specEl, track, live);

  let icon: IconHandle | undefined;
  let iconName: string | undefined;

  const at = (f: number | null) => (f === null ? "" : `${f * 100}%`);
  const band = (from: number | null, to: number | null, cls: string) => {
    const s = document.createElement("span");
    s.className = cn("zen-absolute zen-inset-y-0", cls);
    s.style.insetInlineStart = at(from ?? 0);
    s.style.width = `${((to ?? 1) - (from ?? 0)) * 100}%`;
    return s;
  };

  let removeProps: (() => void) | undefined;

  const render = () => {
    const {
      spec: _spec,
      label,
      unit,
      precision: _precision,
      value: _value,
      defaultValue: _defaultValue,
      onChange: _onChange,
      disabled,
      class: className,
      ...rest
    } = current;
    const t = tone();
    const scale = measurementScale(current.spec, reading());

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-1.5", className);
    labelEl.textContent = label;

    input.disabled = Boolean(disabled);
    if (t === "fail") input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    input.className = cn(
      INPUT_CLASS,
      t === "fail" ? "zen-border-zen-error" : t === "warn" ? "zen-border-zen-warning-soft-fg" : t === "pass" ? "zen-border-zen-success" : "zen-border-zen-border",
    );

    unitEl.textContent = unit ?? "";
    unitEl.hidden = !unit;

    verdict.className = cn(
      "zen-ms-2 zen-inline-flex zen-items-center zen-gap-1.5 zen-text-sm zen-font-semibold",
      t === "fail" ? "zen-text-zen-error" : t === "warn" ? "zen-text-zen-warning-soft-fg" : "zen-text-zen-success-soft-fg",
    );
    // The icon is kept while the tone holds, so typing does not churn an <svg> per key.
    const nextIcon = t ? (t === "pass" ? "check-circle" : t === "warn" ? "warn" : "x-circle") : undefined;
    if (nextIcon !== iconName) {
      icon?.destroy();
      icon = nextIcon ? Icon({ name: nextIcon, size: 18 }) : undefined;
      iconName = nextIcon;
    }
    const parts: Node[] = [];
    if (icon) parts.push(icon.el);
    parts.push(document.createTextNode(verdictText()));
    if (scale.offScale && !invalid()) {
      const off = document.createElement("span");
      off.className = "zen-font-normal zen-text-zen-muted-fg";
      off.textContent = ` (${loc.t("measurement.offScale")})`;
      parts.push(off);
    }
    verdict.replaceChildren(...parts);

    specEl.textContent = specText();

    track.hidden = !(scale.max > scale.min);
    const marks: Node[] = [
      band(scale.lower, scale.upper, "zen-bg-zen-warning-soft"),
      band(scale.warnLower ?? scale.lower, scale.warnUpper ?? scale.upper, "zen-bg-zen-success-soft"),
    ];
    if (scale.nominal !== null) {
      const nominal = document.createElement("span");
      nominal.className = "zen-absolute zen-inset-y-0 zen-w-px zen-bg-zen-muted-fg";
      nominal.style.insetInlineStart = at(scale.nominal);
      marks.push(nominal);
    }
    if (scale.value !== null) {
      const marker = document.createElement("span");
      marker.dataset.part = "marker";
      if (scale.offScale) marker.dataset.offScale = "";
      marker.className = cn(
        "zen-absolute -zen-inset-y-1 zen-w-1 -zen-translate-x-1/2 zen-rounded-zen-full rtl:zen-translate-x-1/2",
        // Error red, else foreground: a yellow marker on the yellow
        // warning band would be the one reading nobody can see.
        t === "fail" ? "zen-bg-zen-error" : "zen-bg-zen-foreground",
      );
      marker.style.insetInlineStart = at(scale.value);
      marks.push(marker);
    }
    track.replaceChildren(...marks);

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  const onInput = () => {
    text = input.value;
    const v = parsed();
    render();
    if (v !== "invalid") current.onChange?.(v, judgeMeasurement(v, current.spec));
  };
  const commit = () => {
    const v = reading();
    live.textContent =
      v === null
        ? invalid()
          ? `${current.label}: ${loc.t("measurement.invalid")}`
          : ""
        : loc.t("measurement.announce", { label: current.label, value: withUnit(fmtReading(v)), verdict: verdictText() });
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") commit();
  };
  input.addEventListener("input", onInput);
  input.addEventListener("change", commit);
  input.addEventListener("keydown", onKeyDown);
  disposer.add(() => input.removeEventListener("input", onInput));
  disposer.add(() => input.removeEventListener("change", commit));
  disposer.add(() => input.removeEventListener("keydown", onKeyDown));
  disposer.add(() => removeProps?.());
  disposer.add(() => icon?.destroy());

  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      // A controlled value from outside rewrites the field — unless it is the
      // number already typed.
      if ("value" in next && next.value !== undefined && next.value !== reading()) {
        text = next.value === null ? "" : fmtReading(next.value);
        input.value = text;
      }
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
