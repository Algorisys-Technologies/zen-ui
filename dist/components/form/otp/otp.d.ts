import { type JSX } from "solid-js";
import "./otp.css";
/**
 * InputOTP — Solid port. One `<input>` per digit, zero dependencies.
 *
 *   <InputOTP value={code()} onValueChange={setCode} maxLength={6} />
 *
 * Custom layout (compound API):
 *
 *   <InputOTP value={code()} onValueChange={setCode} maxLength={6}>
 *     <InputOTPGroup>...</InputOTPGroup>
 *   </InputOTP>
 */
export type InputOTPProps = {
    value?: string;
    defaultValue?: string;
    /** Primary change handler. */
    onValueChange?: (value: string) => void;
    /** @deprecated Use `onValueChange`. */
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    maxLength?: number;
    groupSizes?: number[];
    separator?: JSX.Element;
    children?: JSX.Element;
    class?: string;
    containerClass?: string;
    disabled?: boolean;
    /** Transform pasted text before extracting digits. */
    pasteTransformer?: (text: string) => string;
    /** CSS color for the default slot border. Defaults to `--zen-color-border`. */
    borderColor?: string;
    /** CSS color for the focused slot border. Defaults to `--zen-color-primary`. */
    focusBorderColor?: string;
    /** Extra classes applied to every digit input. */
    slotClass?: string;
};
export declare const InputOTP: (rawProps: InputOTPProps) => JSX.Element;
export type InputOTPGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const InputOTPGroup: (props: InputOTPGroupProps) => JSX.Element;
export type InputOTPSlotProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "class"> & {
    index: number;
    class?: string;
    disabled?: boolean;
};
export declare const InputOTPSlot: (rawProps: InputOTPSlotProps) => JSX.Element;
export type InputOTPSeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
};
export declare const InputOTPSeparator: (props: InputOTPSeparatorProps) => JSX.Element;
//# sourceMappingURL=otp.d.ts.map