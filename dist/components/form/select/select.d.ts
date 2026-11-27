import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
/**
 * Select — compound API built on @radix-ui/react-select.
 *
 *   <Select value={v} onValueChange={setV}>
 *     <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
 *     <SelectContent>
 *       <SelectGroup>
 *         <SelectLabel>Group</SelectLabel>
 *         <SelectItem value="a">A</SelectItem>
 *       </SelectGroup>
 *     </SelectContent>
 *   </Select>
 *
 * Radix supplies positioning + collision detection, keyboard navigation
 * (Arrow keys, typeahead, Home/End), focus trap, dismissal, ARIA, and
 * form submission via name + value.
 *
 * Or data-driven, the shape the Solid and vanilla bindings take — pass
 * `options` and the trigger, list, label and error message are drawn for you:
 *
 *   <Select
 *     label="Country"
 *     placeholder="Choose a country"
 *     options={[{ value: "us", label: "United States" }, { value: "ca", label: "Canada" }]}
 *     value={country}
 *     onChange={setCountry}   // the value string, or null
 *   />
 *
 * Without `options` it is exactly the Radix root it always was, so the compound
 * form above keeps working.
 *
 * Note: Radix Select is **single-select**. For multi-select use a Combobox
 * primitive (deferred — see todo.md).
 */
/** One choice. `label` may be any node; a string is what typeahead matches. */
export interface SelectOption {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
}
/** The data-driven form: the same props as the Solid and vanilla `Select`. */
export interface SelectProps {
    options: SelectOption[];
    value?: string;
    defaultValue?: string;
    /** The chosen value string, or null when cleared. */
    onChange?: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    className?: string;
    /** A label above the trigger, associated with it. */
    label?: string;
    /** An error under the trigger; marks it invalid and describes it. */
    errorMessage?: string;
    /** Marked invalid without a message (the form shows its own): aria-invalid and the error border. */
    invalid?: boolean;
    /** Open the list when the select mounts, as an inline editor does. */
    defaultOpen?: boolean;
    /** The list opened or closed. */
    onOpenChange?: (open: boolean) => void;
    /** Lands on the trigger, so `<label htmlFor={id}>` names the control. */
    id?: string;
    /** Names the control when no visible `label` does. Lands on the trigger. */
    "aria-label"?: string;
}
type SelectRootProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & {
    /** Marked invalid without a message (the form shows its own): the trigger's aria-invalid and the error border. */
    invalid?: boolean;
    options?: undefined;
};
/**
 * Radix's Root, plus `invalid`: marked invalid without a message (the form
 * shows its own), so the trigger carries aria-invalid and the error border.
 * Given `options`, the whole control instead — see OptionsSelect.
 */
declare const Select: {
    (props: SelectRootProps | SelectProps): React.JSX.Element;
    displayName: string;
};
declare const SelectGroup: React.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & React.RefAttributes<HTMLDivElement>>;
declare const SelectValue: React.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & React.RefAttributes<HTMLSpanElement>>;
declare const SelectTrigger: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & {
    /** Marked invalid: aria-invalid and the error border. Also set by `<Select invalid>`. */
    invalid?: boolean;
} & React.RefAttributes<HTMLButtonElement>>;
declare const SelectScrollUpButton: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollUpButtonProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectScrollDownButton: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollDownButtonProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectContent: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectLabel: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectItem: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SelectSeparator: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton, };
//# sourceMappingURL=select.d.ts.map