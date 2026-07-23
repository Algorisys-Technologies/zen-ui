import { type JSX } from "solid-js";
/**
 * Select — Solid port built on Kobalte Select.
 *
 *   <Select
 *     options={[
 *       { value: "a", label: "Option A" },
 *       { value: "b", label: "Option B" },
 *     ]}
 *     value={v()}
 *     onChange={setV}
 *     placeholder="Pick one"
 *   />
 *
 * API delta from the React (Radix) binding: Kobalte Select is
 * data-driven — pass an `options` array instead of composing
 * <SelectItem> children manually. For the rare case where you need
 * the full compound API (groups, custom item rendering), Kobalte's
 * own Select.Item / Section primitives are re-exported as
 * SelectGroup, SelectItemPrimitive, etc. (advanced users).
 */
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export type SelectProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "onChange"> & {
    options: SelectOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    class?: string;
    /** Optional accessible label rendered above the trigger. */
    label?: string;
    /** Optional error message shown below the trigger. */
    errorMessage?: string;
};
export declare const Select: (props: SelectProps) => JSX.Element;
//# sourceMappingURL=select.d.ts.map