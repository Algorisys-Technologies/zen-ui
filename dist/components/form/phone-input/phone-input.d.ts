import * as React from "react";
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
    countries?: {
        dialCode: string;
        name: string;
        iso?: string;
    }[];
    placeholder?: string;
    disabled?: boolean;
    name?: string;
    className?: string;
}
declare const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps & React.RefAttributes<HTMLInputElement>>;
export { PhoneInput };
//# sourceMappingURL=phone-input.d.ts.map