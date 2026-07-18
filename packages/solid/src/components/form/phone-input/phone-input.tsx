import { createMemo, createSignal, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";
import { Input } from "../input/input";
import { Select, type SelectOption } from "../select/select";
import { COUNTRY_CODES, COUNTRY_NAMES } from "./phone-input.constants";

/**
 * PhoneInput — composition of Select (country dial-code) and Input
 * (national number). Forwards changes via a `{ country, number }` value.
 *
 *   const [phone, setPhone] = createSignal({ country: "+91", number: "" });
 *   <PhoneInput value={phone()} onValueChange={setPhone} />
 *
 * `value.country` is the dial code (e.g. "+91"). Use COUNTRY_CODES /
 * COUNTRY_NAMES from phone-input.constants to translate to ISO codes.
 */

export interface PhoneValue {
  country: string;
  number: string;
}

export type PhoneInputProps = {
  value?: PhoneValue;
  defaultValue?: PhoneValue;
  onValueChange?: (next: PhoneValue) => void;
  countries?: { dialCode: string; name: string; iso?: string }[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  class?: string;
};

const COUNTRY_LIST: { dialCode: string; name: string }[] = Object.entries(
  COUNTRY_NAMES,
).map(([iso, name]) => {
  const dial = (COUNTRY_CODES as Record<string, string>)[iso] ?? "";
  return { dialCode: dial ? `+${dial}` : "", name };
});

const DEFAULT_COUNTRIES = COUNTRY_LIST.filter((c) => c.dialCode);

export const PhoneInput = (rawProps: PhoneInputProps) => {
  const [props] = splitProps(rawProps, [
    "value",
    "defaultValue",
    "onValueChange",
    "countries",
    "placeholder",
    "disabled",
    "name",
    "class",
  ]);
  const countries = createMemo(() => props.countries ?? DEFAULT_COUNTRIES);
  const initial = (): PhoneValue =>
    props.defaultValue ?? props.value ?? {
      country: countries()[0]?.dialCode ?? "+1",
      number: "",
    };
  const isControlled = () => props.value !== undefined;
  const [inner, setInner] = createSignal<PhoneValue>(initial());
  const current = createMemo<PhoneValue>(() =>
    isControlled() ? (props.value as PhoneValue) : inner(),
  );

  const update = (next: PhoneValue) => {
    if (!isControlled()) setInner(next);
    props.onValueChange?.(next);
  };

  const options = createMemo<SelectOption[]>(() =>
    countries().map((c) => ({
      value: c.dialCode,
      label: `${c.dialCode} — ${c.name}`,
    })),
  );

  return (
    <div class={cn("zen-flex zen-items-stretch zen-gap-2", props.class)}>
      {/* Explicit px, mirroring the React binding's `style={{ width: 120 }}`.
          A layout constant, not a design-token value — and unaffected by any
          rem-base convention. */}
      <div style={{ width: "100px" }}>
        <Select
          options={options()}
          value={current().country}
          onChange={(country) =>
            update({ ...current(), country: country ?? current().country })
          }
          disabled={props.disabled}
        />
      </div>
      <div class="zen-flex-1">
        <Input
          type="tel"
          inputMode="tel"
          placeholder={props.placeholder ?? "Phone number"}
          value={current().number}
          onInput={(e) => update({ ...current(), number: e.currentTarget.value })}
          disabled={props.disabled}
          name={props.name}
        />
      </div>
    </div>
  );
};

export { COUNTRY_CODES, COUNTRY_NAMES };
