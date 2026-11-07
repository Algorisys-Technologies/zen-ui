import * as React from "react";
import type { ToastProps } from "./toast";
/**
 * useToast — imperative toast API on top of the compound Toast primitives.
 *
 *   const { toast } = useToast();
 *   toast({ title: "Saved", description: "Profile updated." });
 *   toast({ variant: "destructive", title: "Couldn't save", description: err.message });
 *
 * Pair with <Toaster /> from ./toaster.tsx mounted once near the root.
 *
 * Subscribe pattern (module-scoped store) — adapted from the shadcn
 * reference impl. Multiple useToast() consumers stay in sync via the
 * shared listener list.
 */
export interface ToastDescriptor {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    variant?: ToastProps["variant"];
    /** Time before auto-dismiss, ms. Default 5_000. Pass `Infinity` for sticky. */
    duration?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export interface ToastInput {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    variant?: ToastProps["variant"];
    duration?: number;
}
export declare function toast(input: ToastInput): {
    id: string;
    update: (next: ToastInput) => void;
    dismiss: () => void;
};
export declare function useToast(): {
    toasts: ToastDescriptor[];
    toast: typeof toast;
    dismiss: (id?: string) => void;
};
//# sourceMappingURL=use-toast.d.ts.map