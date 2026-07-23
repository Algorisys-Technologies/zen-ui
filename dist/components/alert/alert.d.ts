import { type JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
/**
 * Alert — feedback / message banner. Compound API:
 *
 *   <Alert color="info" variant="soft">
 *     <AlertIcon><InfoIcon /></AlertIcon>
 *     <AlertContent>
 *       <AlertTitle>Heads up</AlertTitle>
 *       <AlertDescription>Your trial expires in 3 days.</AlertDescription>
 *     </AlertContent>
 *     <AlertActions>
 *       <button type="button">Action</button>
 *     </AlertActions>
 *     <AlertClose onClick={dismiss} />
 *   </Alert>
 *
 * Variants:
 *   color   — destructive | info | neutral | primary | success | warning
 *   variant — soft (default) | outline
 *
 * Role="alert" announces immediately to screen readers; pass
 * `role="status"` for less-urgent messages.
 */
declare const alertVariants: (props?: ({
    color?: "primary" | "neutral" | "info" | "success" | "warning" | "destructive" | null | undefined;
    variant?: "outline" | "soft" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type AlertProps = VariantProps<typeof alertVariants> & Omit<JSX.HTMLAttributes<HTMLDivElement>, "color" | "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const Alert: (rawProps: AlertProps) => JSX.Element;
type SectionProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
type ParagraphProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AlertIcon: (props: SpanProps) => JSX.Element;
export declare const AlertContent: (props: SectionProps) => JSX.Element;
export declare const AlertTitle: (props: ParagraphProps) => JSX.Element;
export declare const AlertDescription: (props: ParagraphProps) => JSX.Element;
export declare const AlertActions: (props: SectionProps) => JSX.Element;
export type AlertCloseProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class"> & {
    class?: string;
};
export declare const AlertClose: (props: AlertCloseProps) => JSX.Element;
export { alertVariants };
//# sourceMappingURL=alert.d.ts.map