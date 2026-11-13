import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type VariantProps } from "class-variance-authority";
/**
 * Sheet — slide-in side panel built on Radix Dialog. Use when a Dialog
 * is too modal for the task: long-form filter panels, edit screens that
 * need the underlying list visible as reference, KYC document review,
 * help / onboarding tour content. Slides in from any edge.
 *
 *   <Sheet>
 *     <SheetTrigger asChild>
 *       <Button>Filters</Button>
 *     </SheetTrigger>
 *     <SheetContent side="right">
 *       <SheetHeader>
 *         <SheetTitle>Filters</SheetTitle>
 *         <SheetDescription>Narrow the dashboard.</SheetDescription>
 *       </SheetHeader>
 *       …
 *       <SheetFooter>
 *         <Button>Apply</Button>
 *         <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
 *       </SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 *
 * `side` controls which edge the panel slides from:
 *   - right (default) — desktop filters / details / edit forms
 *   - left — secondary navigation drawer
 *   - top — banner-style notifications, command palettes
 *   - bottom — mobile bottom-sheet (responsive: pair with media-query
 *     prop on the consumer side)
 *
 * Differences from Dialog:
 *   - Slides instead of fading + scaling.
 *   - The overlay still dims the rest of the page (Dialog semantics) so
 *     the user knows the sheet is the focus. For a non-modal slide-in
 *     panel that lets the page stay interactive, use Popover instead.
 */
declare const Sheet: React.FC<DialogPrimitive.DialogProps>;
declare const SheetTrigger: React.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const SheetClose: React.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React.RefAttributes<HTMLButtonElement>>;
declare const SheetPortal: React.FC<DialogPrimitive.DialogPortalProps>;
declare const SheetOverlay: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const sheetContentVariants: (props?: ({
    side?: "bottom" | "left" | "right" | "top" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof sheetContentVariants> {
    /** Show a built-in close ✕ in the top-right. Default true. */
    showCloseButton?: boolean;
}
declare const SheetContent: React.ForwardRefExoticComponent<SheetContentProps & React.RefAttributes<HTMLDivElement>>;
declare const SheetHeader: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
declare const SheetFooter: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
declare const SheetTitle: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
declare const SheetDescription: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, sheetContentVariants, };
//# sourceMappingURL=sheet.d.ts.map