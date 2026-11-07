import * as React from "react";
import { type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { type InputProps } from "../form/input/input";
import { type TextareaProps } from "../form/input/textarea";
export interface BoundInputProps<TFields extends FieldValues = FieldValues> extends Omit<InputProps, "name" | "id"> {
    name: Path<TFields>;
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    rules?: RegisterOptions<TFields, Path<TFields>>;
    fieldClassName?: string;
}
export declare function BoundInput<TFields extends FieldValues = FieldValues>({ name, label, description, required, rules, fieldClassName, className, ...rest }: BoundInputProps<TFields>): React.JSX.Element;
export interface BoundTextareaProps<TFields extends FieldValues = FieldValues> extends Omit<TextareaProps, "name" | "id"> {
    name: Path<TFields>;
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    rules?: RegisterOptions<TFields, Path<TFields>>;
    fieldClassName?: string;
}
export declare function BoundTextarea<TFields extends FieldValues = FieldValues>({ name, label, description, required, rules, fieldClassName, className, ...rest }: BoundTextareaProps<TFields>): React.JSX.Element;
export interface SelectOption {
    value: string;
    label: React.ReactNode;
    disabled?: boolean;
}
export interface BoundSelectProps<TFields extends FieldValues = FieldValues> {
    name: Path<TFields>;
    options: SelectOption[];
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    rules?: RegisterOptions<TFields, Path<TFields>>;
    placeholder?: string;
    disabled?: boolean;
    fieldClassName?: string;
}
export declare function BoundSelect<TFields extends FieldValues = FieldValues>({ name, options, label, description, required, rules, placeholder, disabled, fieldClassName, }: BoundSelectProps<TFields>): React.JSX.Element;
export interface BoundCheckboxProps<TFields extends FieldValues = FieldValues> {
    name: Path<TFields>;
    label?: React.ReactNode;
    description?: React.ReactNode;
    rules?: RegisterOptions<TFields, Path<TFields>>;
    disabled?: boolean;
    fieldClassName?: string;
}
export declare function BoundCheckbox<TFields extends FieldValues = FieldValues>({ name, label, description, rules, disabled, fieldClassName, }: BoundCheckboxProps<TFields>): React.JSX.Element;
export interface BoundSwitchProps<TFields extends FieldValues = FieldValues> {
    name: Path<TFields>;
    label?: React.ReactNode;
    description?: React.ReactNode;
    rules?: RegisterOptions<TFields, Path<TFields>>;
    disabled?: boolean;
    fieldClassName?: string;
}
export declare function BoundSwitch<TFields extends FieldValues = FieldValues>({ name, label, description, rules, disabled, fieldClassName, }: BoundSwitchProps<TFields>): React.JSX.Element;
export interface BoundRadioGroupProps<TFields extends FieldValues = FieldValues> {
    name: Path<TFields>;
    options: SelectOption[];
    label?: React.ReactNode;
    description?: React.ReactNode;
    required?: boolean;
    rules?: RegisterOptions<TFields, Path<TFields>>;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    fieldClassName?: string;
}
export declare function BoundRadioGroup<TFields extends FieldValues = FieldValues>({ name, options, label, description, required, rules, orientation, disabled, fieldClassName, }: BoundRadioGroupProps<TFields>): React.JSX.Element;
export interface BoundSliderProps<TFields extends FieldValues = FieldValues> {
    name: Path<TFields>;
    label?: React.ReactNode;
    description?: React.ReactNode;
    rules?: RegisterOptions<TFields, Path<TFields>>;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    fieldClassName?: string;
}
export declare function BoundSlider<TFields extends FieldValues = FieldValues>({ name, label, description, rules, min, max, step, disabled, fieldClassName, }: BoundSliderProps<TFields>): React.JSX.Element;
//# sourceMappingURL=bound-fields.d.ts.map