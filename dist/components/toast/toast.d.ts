import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { type VariantProps } from "class-variance-authority";
/**
 * Toast — transient notification on @radix-ui/react-toast.
 *
 * Usage (compound):
 *   <ToastProvider>
 *     <Toast open={open} onOpenChange={setOpen}>
 *       <div>
 *         <ToastTitle>Saved</ToastTitle>
 *         <ToastDescription>Profile updated.</ToastDescription>
 *       </div>
 *       <ToastClose />
 *     </Toast>
 *     <ToastViewport />
 *   </ToastProvider>
 *
 * For most cases the imperative `useToast()` hook + `<Toaster />`
 * (./toaster.tsx) is friendlier:
 *
 *   const { toast } = useToast();
 *   toast({ title: "Saved", description: "Profile updated." });
 *
 * Radix handles queuing, swipe-to-dismiss, hover-to-pause-the-timer,
 * keyboard focus on hot-key, ARIA live region.
 */
declare const ToastProvider: React.FC<ToastPrimitive.ToastProviderProps>;
declare const ToastViewport: React.ForwardRefExoticComponent<Omit<ToastPrimitive.ToastViewportProps & React.RefAttributes<HTMLOListElement>, "ref"> & React.RefAttributes<HTMLOListElement>>;
declare const toastVariants: (props?: ({
    variant?: "default" | "info" | "success" | "warning" | "destructive" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>, VariantProps<typeof toastVariants> {
}
declare const Toast: React.ForwardRefExoticComponent<ToastProps & React.RefAttributes<HTMLLIElement>>;
declare const ToastAction: React.ForwardRefExoticComponent<Omit<ToastPrimitive.ToastActionProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
declare const ToastClose: React.ForwardRefExoticComponent<Omit<ToastPrimitive.ToastCloseProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
declare const ToastTitle: React.ForwardRefExoticComponent<Omit<ToastPrimitive.ToastTitleProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const ToastDescription: React.ForwardRefExoticComponent<Omit<ToastPrimitive.ToastDescriptionProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, toastVariants, };
//# sourceMappingURL=toast.d.ts.map