import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
/**
 * Dialog — modal overlay on @radix-ui/react-dialog.
 *
 *   <Dialog>
 *     <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Confirm delete</DialogTitle>
 *         <DialogDescription>This cannot be undone.</DialogDescription>
 *       </DialogHeader>
 *       <DialogFooter>
 *         <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
 *         <Button color="error" onClick={onConfirm}>Delete</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Radix supplies focus trap, scroll lock, Esc-to-close, click-outside
 * dismissal, portal rendering, and a11y (aria-modal, labelled/described
 * via the Title + Description).
 *
 * For confirm-style dialogs that should block all dismissal until the
 * user answers (no Esc, no click-outside), use <AlertDialog> from
 * ./alert-dialog.tsx instead.
 */
declare const Dialog: React.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: React.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const DialogPortal: React.FC<DialogPrimitive.DialogPortalProps>;
declare const DialogClose: React.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React.RefAttributes<HTMLButtonElement>>;
declare const DialogOverlay: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    /**
     * `paper` turns the panel into a document sheet — see <Paper>. Default
     * `default`, so existing dialogs are byte-identical.
     *
     * It is not a restyle, and that is why it is a variant rather than a class
     * you could pass yourself. A document is TOP-ANCHORED: centring a long sheet
     * vertically and then scrolling it inside 85vh puts the first line somewhere
     * different on every screen, and the reader's eye has nowhere to rest. Paper
     * mode drops the vertical centring, scrolls the VIEWPORT rather than the
     * panel, and widens the cap so the measure has room to do its work.
     */
    variant?: "default" | "paper";
}
declare const DialogContent: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>;
declare const DialogHeader: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
declare const DialogFooter: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
declare const DialogTitle: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
declare const DialogDescription: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
export { Dialog, DialogTrigger, DialogPortal, DialogClose, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, };
//# sourceMappingURL=dialog.d.ts.map