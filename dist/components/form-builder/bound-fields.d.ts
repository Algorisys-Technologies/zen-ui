import { type JSX } from "solid-js";
import { type InputProps, type TextareaProps } from "../form/input/input";
import { type SelectOption } from "../form/select/select";
type AnyField = any;
type FieldValues = Record<string, unknown>;
type FieldPath<T> = keyof T & string;
type FormStore<_T = unknown> = any;
type BoundCommon<TFields extends FieldValues> = {
    of: FormStore<TFields>;
    Field: AnyField;
    name: FieldPath<TFields>;
    label?: JSX.Element;
    description?: JSX.Element;
    required?: boolean;
    fieldClass?: string;
};
export type BoundInputProps<TFields extends FieldValues = FieldValues> = BoundCommon<TFields> & Omit<InputProps, "name" | "id">;
export declare function BoundInput<TFields extends FieldValues = FieldValues>(props: BoundInputProps<TFields>): JSX.Element;
export type BoundTextareaProps<TFields extends FieldValues = FieldValues> = BoundCommon<TFields> & Omit<TextareaProps, "name" | "id">;
export declare function BoundTextarea<TFields extends FieldValues = FieldValues>(props: BoundTextareaProps<TFields>): JSX.Element;
export type { SelectOption as BoundSelectOption };
export type BoundSelectProps<TFields extends FieldValues = FieldValues> = BoundCommon<TFields> & {
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
};
export declare function BoundSelect<TFields extends FieldValues = FieldValues>(props: BoundSelectProps<TFields>): JSX.Element;
export type BoundCheckboxProps<TFields extends FieldValues = FieldValues> = BoundCommon<TFields> & {
    inlineLabel?: JSX.Element;
    disabled?: boolean;
};
export declare function BoundCheckbox<TFields extends FieldValues = FieldValues>(props: BoundCheckboxProps<TFields>): JSX.Element;
export type BoundSwitchProps<TFields extends FieldValues = FieldValues> = BoundCommon<TFields> & {
    inlineLabel?: JSX.Element;
    disabled?: boolean;
};
export declare function BoundSwitch<TFields extends FieldValues = FieldValues>(props: BoundSwitchProps<TFields>): JSX.Element;
export type BoundRadioGroupProps<TFields extends FieldValues = FieldValues> = BoundCommon<TFields> & {
    options: {
        value: string;
        label: JSX.Element;
    }[];
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
};
export declare function BoundRadioGroup<TFields extends FieldValues = FieldValues>(props: BoundRadioGroupProps<TFields>): JSX.Element;
export type BoundSliderProps<TFields extends FieldValues = FieldValues> = BoundCommon<TFields> & {
    minValue?: number;
    maxValue?: number;
    step?: number;
    disabled?: boolean;
};
export declare function BoundSlider<TFields extends FieldValues = FieldValues>(props: BoundSliderProps<TFields>): JSX.Element;
//# sourceMappingURL=bound-fields.d.ts.map