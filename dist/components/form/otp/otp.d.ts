import * as React from "react";
/**
 * InputOTP — one `<input>` per digit. Drop-in:
 *
 *   <InputOTP value={code} onValueChange={setCode} maxLength={6} />
 *
 * Custom layout (compound API):
 *
 *   <InputOTP value={code} onValueChange={setCode} maxLength={6}>
 *     <InputOTPGroup>...</InputOTPGroup>
 *   </InputOTP>
 */
export interface InputOTPProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "defaultValue" | "onChange" | "children"> {
    value?: string;
    defaultValue?: string;
    /** Primary change handler. */
    onValueChange?: (value: string) => void;
    /** @deprecated Use `onValueChange`. */
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    maxLength?: number;
    groupSizes?: number[];
    separator?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    disabled?: boolean;
    /** Transform pasted text before extracting digits. */
    pasteTransformer?: (text: string) => string;
    /**
     * CSS color for the default slot border. Defaults to `--zen-color-border`
     * (theme-aware — visible in dark mode).
     */
    borderColor?: string;
    /**
     * CSS color for the focused slot border. Defaults to `--zen-color-primary`.
     */
    focusBorderColor?: string;
    /** Extra classes applied to every digit input. */
    slotClassName?: string;
}
export declare const InputOTP: React.ForwardRefExoticComponent<InputOTPProps & React.RefAttributes<HTMLInputElement>>;
export declare const InputOTPGroup: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export declare const InputOTPSlot: React.ForwardRefExoticComponent<Omit<Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "ref">, "value"> & {
    index: number;
} & React.RefAttributes<HTMLInputElement>>;
export declare const InputOTPSeparator: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=otp.d.ts.map