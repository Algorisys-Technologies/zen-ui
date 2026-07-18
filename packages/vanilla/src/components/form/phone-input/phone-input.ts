import { cn } from "../../../lib/cn";
import { Disposer, applyProps, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";
import { Input } from "../input/input";
import { Select } from "../select/select";
import { COUNTRY_CODES, COUNTRY_NAMES } from "./phone-input.constants";

/**
 * PhoneInput — composition of the vanilla Select (country dial-code) and Input
 * (national number). No specialty god-component: the same building blocks used
 * anywhere else, wired together. Themed via --zen-* tokens.
 *
 *   const phone = PhoneInput({
 *     value: { country: "+91", number: "" },
 *     onValueChange: (next) => …,
 *   });
 *   document.body.append(phone.el);
 *
 * `value.country` is the dial code (e.g. "+91"); use COUNTRY_CODES / COUNTRY_NAMES
 * from phone-input.constants to translate to / from ISO codes.
 *
 * ## Note on the Select shape
 *
 * React builds this from Radix's compound Select (SelectTrigger / SelectItem …);
 * vanilla's Select is data-driven (`options`), the known React/Solid divergence.
 * The behaviour is identical — a country list on a trigger — so this composes the
 * vanilla Select exactly as React composes the Radix one, mapping the country
 * list to `options` rather than to compound children.
 */

export interface PhoneValue {
  /** Dial code with leading "+" (e.g. "+91"). */
  country: string;
  /** Local national number (no country prefix). */
  number: string;
}

export interface PhoneInputProps {
  value?: PhoneValue;
  defaultValue?: PhoneValue;
  onValueChange?: (next: PhoneValue) => void;
  /** Restrict the selectable country list. Defaults to all entries in COUNTRY_CODES. */
  countries?: { dialCode: string; name: string; iso?: string }[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  class?: string;
  [key: `data-${string}`]: unknown;
}

const COUNTRY_LIST: { dialCode: string; name: string }[] = Object.entries(
  COUNTRY_NAMES,
).map(([iso, name]) => {
  const dial = (COUNTRY_CODES as Record<string, string>)[iso] ?? "";
  return { dialCode: dial ? `+${dial}` : "", name };
});

const DEFAULT_COUNTRIES = COUNTRY_LIST.filter((c) => c.dialCode);

const sameValue = (a: PhoneValue, b: PhoneValue) =>
  a.country === b.country && a.number === b.number;

export function PhoneInput(props: PhoneInputProps): ZenComponent<PhoneInputProps> {
  let current: PhoneInputProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const countriesOf = (p: PhoneInputProps) => p.countries ?? DEFAULT_COUNTRIES;
  const initialCountries = countriesOf(current);

  const initial: PhoneValue =
    current.defaultValue ??
    current.value ?? { country: initialCountries[0]?.dialCode ?? "+1", number: "" };

  const state = controllable<PhoneValue>({
    value: current.value,
    defaultValue: initial,
    onChange: (v) => current.onValueChange?.(v),
    equals: sameValue,
  });

  const selectWrap = document.createElement("div");
  selectWrap.style.width = "120px";

  const select = Select({
    options: countriesOf(current).map((c) => ({
      value: c.dialCode,
      label: `${c.dialCode} — ${c.name}`,
    })),
    value: state.get().country,
    disabled: current.disabled,
    onValueChange: (country) => state.set({ ...state.get(), country }),
  });
  selectWrap.append(select.el);

  const input = Input({
    type: "tel",
    inputMode: "numeric",
    placeholder: current.placeholder ?? "Phone number",
    value: state.get().number,
    disabled: current.disabled,
    name: current.name,
    onInput: (e) => {
      const raw = (e.target as HTMLInputElement).value;
      const cleaned = raw.replace(/[^\d\s-]/g, "");
      // Strip the rejected characters live rather than waiting for a re-render.
      if (input.el.value !== cleaned) input.el.value = cleaned;
      state.set({ ...state.get(), number: cleaned });
    },
  });

  el.append(selectWrap, input.el);

  const render = () => {
    const { class: className, ...rest } = current;
    // Only the leftover data-*/aria-* land on the root; the interpreted props are
    // pushed to the two children below.
    const {
      value: _v,
      defaultValue: _dv,
      onValueChange: _ov,
      countries: _c,
      placeholder: _p,
      disabled: _d,
      name: _n,
      ...attrs
    } = rest;

    el.className = cn("zen-flex zen-items-stretch zen-gap-2", className);

    removeProps?.();
    removeProps = applyProps(el, attrs as Record<string, unknown>);
  };

  // Push the model into both children whenever it changes.
  const paint = () => {
    const v = state.get();
    select.update({ value: v.country });
    input.update({ value: v.number });
  };

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => select.destroy());
  disposer.add(() => input.destroy());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);

      if (next.countries !== undefined) {
        select.update({
          options: countriesOf(current).map((c) => ({
            value: c.dialCode,
            label: `${c.dialCode} — ${c.name}`,
          })),
        });
      }
      if (next.disabled !== undefined) {
        select.update({ disabled: current.disabled });
        input.update({ disabled: current.disabled });
      }
      if (next.placeholder !== undefined) {
        input.update({ placeholder: current.placeholder ?? "Phone number" });
      }
      if (next.name !== undefined) input.update({ name: current.name });

      render();
      paint();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
