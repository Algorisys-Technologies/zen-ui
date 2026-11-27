import * as React from "react";
import { type VariantProps } from "class-variance-authority";
/**
 * Alert — feedback / message banner. Compound API.
 *
 *   <Alert color="info" variant="soft">
 *     <AlertIcon><InfoIcon /></AlertIcon>
 *     <AlertContent>
 *       <AlertTitle>Heads up</AlertTitle>
 *       <AlertDescription>
 *         Your trial expires in 3 days.
 *       </AlertDescription>
 *     </AlertContent>
 *     <AlertActions>
 *       <button type="button">Action 1</button>
 *       <button type="button">Action 2</button>
 *     </AlertActions>
 *     <AlertClose onClick={dismiss} />
 *   </Alert>
 *
 * Zen theme parts (all opt-in via composition):
 *   icon  ·  title  ·  description (body)  ·  actions  ·  close button
 *
 * Variants per the Zen theme artifact:
 *   color   — error | info | neutral | primary | success | warning
 *               (`destructive` is a deprecated alias for `error`)
 *   variant — soft (default, light tinted bg) | outline (white bg + colored border)
 *
 * Role="alert" announces immediately to screen readers; pass
 * `role="status"` for less-urgent messages.
 */
declare const alertVariants: (props?: ({
    color?: "primary" | "neutral" | "info" | "success" | "warning" | "error" | "destructive" | null | undefined;
    variant?: "outline" | "soft" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, VariantProps<typeof alertVariants> {
}
declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
declare const AlertIcon: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
declare const AlertContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const AlertTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const AlertDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const AlertActions: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export type AlertCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
declare const AlertClose: React.ForwardRefExoticComponent<AlertCloseProps & React.RefAttributes<HTMLButtonElement>>;
export { Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription, AlertActions, AlertClose, alertVariants, };
//# sourceMappingURL=alert.d.ts.map