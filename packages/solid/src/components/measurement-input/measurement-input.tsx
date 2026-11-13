import { type JSX, Show, createEffect, createMemo, createSignal, createUniqueId, on, splitProps, untrack } from "solid-js";
import { parseNumber } from "@algorisys/zen-ui-core/number-format";
import {
  judgeMeasurement,
  measurementScale,
  type MeasurementJudgement,
  type MeasurementSpec,
} from "@algorisys/zen-ui-core/measurement";
import type { MessageKey } from "@algorisys/zen-ui-core/messages";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { Icon } from "../icon/icon";

/**
 * MeasurementInput — a reading checked against its limits as it is typed.
 *
 *   <MeasurementInput
 *     label="Bore diameter" unit="mm" precision={2}
 *     spec={{ nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 }}
 *     onChange={(value, j) => record(value, j.verdict)}
 *   />
 *
 * The verdict is in words ("Above the upper limit") with an icon, and a scale
 * under the field shows where the reading sits: the tolerance band, the
 * warning band inside it, the nominal, and the reading. The scale is built from
 * the limits — a typo of 1000 against 10 ± 0.1 is pinned to the end and marked
 * off the scale rather than squashing the band to nothing.
 *
 * Input is read in the user's locale ("10,05" in German). The verdict updates as
 * you type; a screen reader hears it when the reading is committed (Enter or
 * leaving the field), not after every keystroke on the way to it.
 */

export type MeasurementInputProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
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
};

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

export const MeasurementInput = (props: MeasurementInputProps) => {
  const [local, rest] = splitProps(props, [
    "spec",
    "label",
    "unit",
    "precision",
    "value",
    "defaultValue",
    "onChange",
    "disabled",
    "class",
  ]);
  const loc = useLocale();
  const id = createUniqueId();
  const digits = () => local.precision ?? decimalsOf(local.spec);
  const fmt = (n: number, d = digits()) =>
    new Intl.NumberFormat(loc.locale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  // A READING is never rounded to the spec's precision — 0.05 against a limit
  // of 0.2 must not display as 0.1. At least the spec's decimals, never fewer
  // than its own.
  const fmtReading = (n: number) =>
    new Intl.NumberFormat(loc.locale(), { minimumFractionDigits: digits(), maximumFractionDigits: 12, useGrouping: false }).format(n);

  // The starting text, read once; a later `value` arrives through the effect below.
  const [text, setText] = createSignal(
    untrack(() => {
      const start = local.value ?? local.defaultValue;
      return start === null || start === undefined ? "" : fmtReading(start);
    }),
  );
  const parsed = () => parseNumber(text(), { locale: loc.locale() });
  const reading = () => {
    const v = parsed();
    return typeof v === "number" ? v : null;
  };
  // A controlled value that changes from outside rewrites the field — unless it
  // is the number already typed, so "10,0" being typed is not reformatted under
  // the cursor to "10,00".
  createEffect(
    on(
      () => local.value,
      (v) => {
        if (v === undefined || v === reading()) return;
        setText(v === null ? "" : fmtReading(v));
      },
      { defer: true },
    ),
  );
  const invalid = () => parsed() === "invalid";
  const judgement = createMemo(() => judgeMeasurement(reading(), local.spec));
  const scale = createMemo(() => measurementScale(local.spec, reading()));
  const [announced, setAnnounced] = createSignal("");

  const verdictText = () => {
    if (invalid()) return loc.t("measurement.invalid");
    const j = judgement();
    if (!j.verdict) return "";
    const key = j.verdict === "pass" ? "pass" : (`${j.verdict}-${j.side}` as keyof typeof VERDICT_KEY);
    return loc.t(VERDICT_KEY[key]);
  };
  const tone = () => (invalid() ? "fail" : judgement().verdict);
  const withUnit = (s: string) => (local.unit ? `${s} ${local.unit}` : s);
  const specText = () => {
    const { nominal, lower, upper } = local.spec;
    if (nominal !== undefined && lower !== undefined && upper !== undefined && Math.abs(nominal - lower - (upper - nominal)) < 1e-9) {
      return withUnit(loc.t("measurement.specTolerance", { nominal: fmt(nominal), tolerance: fmt(upper - nominal) }));
    }
    if (lower !== undefined && upper !== undefined) return withUnit(loc.t("measurement.specRange", { lower: fmt(lower), upper: fmt(upper) }));
    if (lower !== undefined) return withUnit(loc.t("measurement.specMin", { lower: fmt(lower) }));
    if (upper !== undefined) return withUnit(loc.t("measurement.specMax", { upper: fmt(upper) }));
    return "";
  };

  const onInput = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
    setText(e.currentTarget.value);
    const v = parsed();
    if (v !== "invalid") local.onChange?.(v, judgeMeasurement(v, local.spec));
  };
  const commit = () => {
    const v = reading();
    setAnnounced(
      v === null
        ? invalid()
          ? `${local.label}: ${loc.t("measurement.invalid")}`
          : ""
        : loc.t("measurement.announce", { label: local.label, value: withUnit(fmtReading(v)), verdict: verdictText() }),
    );
  };

  const at = (f: number | null) => (f === null ? undefined : `${f * 100}%`);
  const band = (from: number | null, to: number | null, cls: string) => (
    <span
      class={cn("zen-absolute zen-inset-y-0", cls)}
      style={{ "inset-inline-start": at(from ?? 0), width: `${((to ?? 1) - (from ?? 0)) * 100}%` }}
    />
  );

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-1.5", local.class)} {...rest}>
      <label for={id} class="zen-text-sm zen-font-medium zen-text-zen-foreground">
        {local.label}
      </label>
      <div class="zen-flex zen-items-center zen-gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autocomplete="off"
          disabled={local.disabled}
          value={text()}
          aria-invalid={tone() === "fail" ? true : undefined}
          aria-describedby={`${id}-spec ${id}-verdict`}
          class={cn(
            "zen-h-12 zen-w-40 zen-rounded-zen-md zen-border-2 zen-border-solid zen-bg-zen-background zen-px-3 zen-text-end zen-font-mono zen-text-lg zen-tabular-nums",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
            tone() === "fail" ? "zen-border-zen-error" : tone() === "warn" ? "zen-border-zen-warning-soft-fg" : tone() === "pass" ? "zen-border-zen-success" : "zen-border-zen-border",
          )}
          onInput={onInput}
          onChange={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
        />
        <Show when={local.unit}>
          <span class="zen-text-base zen-text-zen-foreground">{local.unit}</span>
        </Show>
        <span
          id={`${id}-verdict`}
          class={cn(
            "zen-ms-2 zen-inline-flex zen-items-center zen-gap-1.5 zen-text-sm zen-font-semibold",
            tone() === "fail" ? "zen-text-zen-error" : tone() === "warn" ? "zen-text-zen-warning-soft-fg" : "zen-text-zen-success-soft-fg",
          )}
        >
          <Show when={tone()}>
            <Icon name={tone() === "pass" ? "check-circle" : tone() === "warn" ? "warn" : "x-circle"} size={18} />
          </Show>
          {verdictText()}
          <Show when={scale().offScale && !invalid()}>
            <span class="zen-font-normal zen-text-zen-muted-fg"> ({loc.t("measurement.offScale")})</span>
          </Show>
        </span>
      </div>
      <span id={`${id}-spec`} class="zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
        {specText()}
      </span>

      <Show when={scale().max > scale().min}>
        <div class="zen-relative zen-mt-1 zen-h-3 zen-w-full zen-max-w-md zen-overflow-visible zen-rounded-zen-sm zen-bg-zen-error-soft" aria-hidden="true">
          {band(scale().lower, scale().upper, "zen-bg-zen-warning-soft")}
          {band(scale().warnLower ?? scale().lower, scale().warnUpper ?? scale().upper, "zen-bg-zen-success-soft")}
          <Show when={scale().nominal !== null}>
            <span class="zen-absolute zen-inset-y-0 zen-w-px zen-bg-zen-muted-fg" style={{ "inset-inline-start": at(scale().nominal) }} />
          </Show>
          <Show when={scale().value !== null}>
            <span
              data-part="marker"
              data-off-scale={scale().offScale ? "" : undefined}
              class={cn(
                "zen-absolute -zen-inset-y-1 zen-w-1 -zen-translate-x-1/2 zen-rounded-zen-full rtl:zen-translate-x-1/2",
                // Error red, else foreground: a yellow marker on the yellow
                // warning band would be the one reading nobody can see.
                tone() === "fail" ? "zen-bg-zen-error" : "zen-bg-zen-foreground",
              )}
              style={{ "inset-inline-start": at(scale().value) }}
            />
          </Show>
        </div>
      </Show>
      <span class="zen-sr-only" aria-live="polite">
        {announced()}
      </span>
    </div>
  );
};
