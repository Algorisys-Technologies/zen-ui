import { type JSX } from "solid-js";
import * as KDialog from "@kobalte/core/dialog";
import { type VariantProps } from "class-variance-authority";
/**
 * Sheet — slide-in side panel built on Kobalte Dialog. Use when a Dialog
 * is too modal: long-form filter panels, edit screens that need the
 * underlying list visible, KYC document review, help / onboarding tour.
 *
 *   <Sheet>
 *     <SheetTrigger as={Button}>Filters</SheetTrigger>
 *     <SheetContent side="right">
 *       <SheetHeader>
 *         <SheetTitle>Filters</SheetTitle>
 *         <SheetDescription>Narrow the dashboard.</SheetDescription>
 *       </SheetHeader>
 *       …
 *       <SheetFooter>
 *         <Button>Apply</Button>
 *         <SheetClose as={Button} variant="outline">Cancel</SheetClose>
 *       </SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 *
 * Namespace-imported for the same reason as [dialog.tsx]: Kobalte's `Dialog`
 * and `AlertDialog` objects are the same mutated root, so `.Content` reached
 * through them depends on which module loaded last.
 */
export declare const Sheet: typeof KDialog.Root;
export declare const SheetTrigger: typeof KDialog.Trigger;
export declare const SheetClose: typeof KDialog.CloseButton;
export declare const SheetPortal: typeof KDialog.Portal;
export type SheetOverlayProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const SheetOverlay: (props: SheetOverlayProps) => JSX.Element;
declare const sheetContentVariants: (props?: ({
    side?: "bottom" | "left" | "right" | "top" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type SheetContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & VariantProps<typeof sheetContentVariants> & {
    class?: string;
    children?: JSX.Element;
    /** Show a built-in close ✕ in the top-right. Default true. */
    showCloseButton?: boolean;
};
export declare const SheetContent: (props: SheetContentProps) => JSX.Element;
export type SheetHeaderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const SheetHeader: (props: SheetHeaderProps) => JSX.Element;
export type SheetFooterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const SheetFooter: (props: SheetFooterProps) => JSX.Element;
export type SheetTitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const SheetTitle: (props: SheetTitleProps) => JSX.Element;
export type SheetDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const SheetDescription: (props: SheetDescriptionProps) => JSX.Element;
export { sheetContentVariants };
//# sourceMappingURL=sheet.d.ts.map