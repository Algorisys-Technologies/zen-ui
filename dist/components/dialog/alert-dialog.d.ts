import { type JSX } from "solid-js";
import * as KAlertDialog from "@kobalte/core/alert-dialog";
/**
 * AlertDialog — destructive-confirm modal built on Kobalte AlertDialog.
 *
 *   <AlertDialog>
 *     <AlertDialogTrigger as={Button} color="error">Delete</AlertDialogTrigger>
 *     <AlertDialogContent>
 *       <AlertDialogHeader>
 *         <AlertDialogTitle>Delete account?</AlertDialogTitle>
 *         <AlertDialogDescription>Removes all data permanently.</AlertDialogDescription>
 *       </AlertDialogHeader>
 *       <AlertDialogFooter>
 *         <AlertDialogCancel as={Button} variant="ghost">Cancel</AlertDialogCancel>
 *         <Button color="error" onClick={onConfirm}>Delete</Button>
 *       </AlertDialogFooter>
 *     </AlertDialogContent>
 *   </AlertDialog>
 *
 * Differs from Dialog: click-outside is blocked. Escape still closes
 * for keyboard a11y. role="alertdialog" announces immediately.
 *
 * API delta from React binding: Kobalte unifies AlertDialog.Action and
 * AlertDialog.Cancel under CloseButton — use the Action label visually
 * but wire the destructive callback via your own onClick (the Cancel
 * affordance is what we expose as <AlertDialogCancel>).
 *
 * Namespace-imported for the same reason as [dialog.tsx]: Kobalte's `Dialog`
 * and `AlertDialog` objects are one and the same (both `Object.assign` the
 * shared root), so reaching `.Content` through them is load-order roulette.
 */
export declare const AlertDialog: typeof KAlertDialog.Root;
export declare const AlertDialogTrigger: typeof KAlertDialog.Trigger;
export declare const AlertDialogPortal: typeof KAlertDialog.Portal;
export declare const AlertDialogCancel: typeof KAlertDialog.CloseButton;
export declare const AlertDialogAction: typeof KAlertDialog.CloseButton;
export type AlertDialogOverlayProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AlertDialogOverlay: (props: AlertDialogOverlayProps) => JSX.Element;
export type AlertDialogContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AlertDialogContent: (props: AlertDialogContentProps) => JSX.Element;
export type AlertDialogHeaderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AlertDialogHeader: (props: AlertDialogHeaderProps) => JSX.Element;
export type AlertDialogFooterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AlertDialogFooter: (props: AlertDialogFooterProps) => JSX.Element;
export type AlertDialogTitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AlertDialogTitle: (props: AlertDialogTitleProps) => JSX.Element;
export type AlertDialogDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const AlertDialogDescription: (props: AlertDialogDescriptionProps) => JSX.Element;
//# sourceMappingURL=alert-dialog.d.ts.map