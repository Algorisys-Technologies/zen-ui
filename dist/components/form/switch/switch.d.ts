import { type JSX } from "solid-js";
/**
 * Switch — Solid port built on Kobalte's Switch primitive.
 *
 *   <Switch checked={value()} onChange={setValue} />
 *
 * Kobalte supplies controlled/uncontrolled state (`checked` /
 * `defaultChecked`), the `name` / `value` hidden input for native form
 * submission, keyboard (space), and ARIA (role="switch",
 * aria-checked). Theming via --zen-* tokens; size is a record-keyed
 * variant.
 */
export type SwitchSize = "sm" | "md" | "lg";
export type SwitchProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "onChange"> & {
    size?: SwitchSize;
    class?: string;
    /**
     * Forwarded to the underlying input so an external `<label for>` can toggle
     * it — React's Switch has always accepted this. BoundSwitch needs it to
     * render the settings-row layout with the label outside the control.
     */
    id?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    /** Optional inline label rendered to the right of the switch. */
    label?: JSX.Element;
};
export declare const Switch: (props: SwitchProps) => JSX.Element;
//# sourceMappingURL=switch.d.ts.map