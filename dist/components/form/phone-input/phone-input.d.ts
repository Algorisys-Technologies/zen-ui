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
    countries?: {
        dialCode: string;
        name: string;
        iso?: string;
    }[];
    placeholder?: string;
    disabled?: boolean;
    name?: string;
    class?: string;
};
export declare const PhoneInput: (rawProps: PhoneInputProps) => import("solid-js").JSX.Element;
export { COUNTRY_CODES, COUNTRY_NAMES };
//# sourceMappingURL=phone-input.d.ts.map