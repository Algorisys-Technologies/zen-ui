import * as React from "react";
import { cn } from "../../../lib/cn";
import { Input } from "../input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select/select";
import { COUNTRY_CODES, COUNTRY_NAMES } from "./phone-input.constants";

/**
 * PhoneInput — composition of the new Select (country dial-code) and Input
 * (national number). No specialty god-component. Forwards a ref to the
 * national-number input. Themed via --zen-* tokens.
 *
 *   const [phone, setPhone] = useState({ country: "+91", number: "" });
 *   <PhoneInput value={phone} onValueChange={setPhone} />
 *
 * `value.country` is the dial code (e.g. "+91"); use COUNTRY_CODES /
 * COUNTRY_NAMES from phone-input.constants to translate to / from ISO codes.
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
  className?: string;
}

const COUNTRY_LIST: { dialCode: string; name: string }[] = Object.entries(
  COUNTRY_NAMES,
).map(([iso, name]) => {
  const dial = (COUNTRY_CODES as Record<string, string>)[iso] ?? "";
  return { dialCode: dial ? `+${dial}` : "", name };
});

const DEFAULT_COUNTRIES = COUNTRY_LIST.filter((c) => c.dialCode);

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      countries = DEFAULT_COUNTRIES,
      placeholder = "Phone number",
      disabled,
      name,
      className,
    },
    ref,
  ) => {
    const initial: PhoneValue =
      defaultValue ?? value ?? { country: countries[0]?.dialCode ?? "+1", number: "" };
    const [internal, setInternal] = React.useState<PhoneValue>(initial);
    const isControlled = value !== undefined;
    const current = isControlled ? (value as PhoneValue) : internal;

    const update = (next: PhoneValue) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    return (
      <div className={cn("zen-flex zen-items-stretch zen-gap-2", className)}>
        <div style={{ width: 120 }}>
          <Select
            value={current.country}
            onValueChange={(country) => update({ ...current, country })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c, idx) => (
                <SelectItem
                  key={`${c.dialCode}-${idx}`}
                  value={c.dialCode}
                >
                  {c.dialCode} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          placeholder={placeholder}
          value={current.number}
          disabled={disabled}
          name={name}
          onChange={(e) =>
            update({ ...current, number: e.target.value.replace(/[^\d\s-]/g, "") })
          }
        />
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
