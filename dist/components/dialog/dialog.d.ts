import { type JSX } from "solid-js";
import * as KDialog from "@kobalte/core/dialog";
/**
 * Dialog — Solid port of the modal overlay primitive, built on
 * Kobalte Dialog.
 *
 *   <Dialog>
 *     <DialogTrigger as={Button}>Open</DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Confirm delete</DialogTitle>
 *         <DialogDescription>This cannot be undone.</DialogDescription>
 *       </DialogHeader>
 *       <DialogFooter>
 *         <DialogClose as={Button} variant="ghost">Cancel</DialogClose>
 *         <Button color="error" onClick={onConfirm}>Delete</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Kobalte supplies focus trap, scroll lock, Esc-to-close, click-outside
 * dismissal, portal rendering, and a11y. For confirm-style dialogs that
 * should block all dismissal until the user answers, use AlertDialog.
 *
 * Imported as a module namespace rather than via Kobalte's `Dialog` object:
 * both `dialog` and `alert-dialog` build their namespace with
 * `Object.assign(DialogRoot, …)` on the SAME root function, so importing both
 * in one bundle leaves `Dialog === AlertDialog` and whichever module evaluates
 * last owns `.Content`. That silently gave every plain Dialog here
 * role="alertdialog". The `Root`/`Content` named exports are per-module and
 * unaffected. (Kobalte 0.13.11 — re-check on upgrade.)
 */
export declare const Dialog: typeof KDialog.Root;
export declare const DialogTrigger: typeof KDialog.Trigger;
export declare const DialogPortal: typeof KDialog.Portal;
export declare const DialogClose: typeof KDialog.CloseButton;
export type DialogOverlayProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const DialogOverlay: (props: DialogOverlayProps) => JSX.Element;
export type DialogContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
    /** Render the ✕ close affordance in the top-right corner. Default true. */
    showCloseButton?: boolean;
};
export declare const DialogContent: (props: DialogContentProps) => JSX.Element;
export type DialogHeaderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const DialogHeader: (props: DialogHeaderProps) => JSX.Element;
export type DialogFooterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const DialogFooter: (props: DialogFooterProps) => JSX.Element;
export type DialogTitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const DialogTitle: (props: DialogTitleProps) => JSX.Element;
export type DialogDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const DialogDescription: (props: DialogDescriptionProps) => JSX.Element;
//# sourceMappingURL=dialog.d.ts.map