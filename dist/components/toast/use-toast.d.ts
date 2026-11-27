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
    /** Work in progress — `toast.loading()`: a spinner beside the title. */
    loading?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export interface ToastInput {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    variant?: ToastProps["variant"];
    duration?: number;
    /** Work in progress: a spinner beside the title. */
    loading?: boolean;
}
/**
 * Per-call options for the Solid-style calls — the parts of solid-toast's
 * options that carry across. Reusing an `id` replaces that toast, which is
 * how a "Saving…" toast becomes "Saved" in place.
 */
export interface ToastOptions {
    id?: string;
    /** ms. Default 5_000; `toast.loading` defaults to sticky. */
    duration?: number;
}
/** What `toast.promise` shows for each stage; a function gets the value or error. */
export interface ToastPromiseMessages<T> {
    loading: React.ReactNode;
    success: React.ReactNode | ((value: T) => React.ReactNode);
    error: React.ReactNode | ((error: unknown) => React.ReactNode);
}
/** Add a toast, or — with an id that is already showing — replace it in place. */
declare function show(input: ToastInput, id?: string): {
    id: string;
    update: (next: ToastInput) => void;
    dismiss: () => void;
};
/**
 * Show a toast. Two call shapes, one store:
 *
 *   toast({ title: "Saved", description: "Profile updated." })   // → { id, update, dismiss }
 *   toast("Saved")                                               // → id, as in the Solid binding
 *   toast.success("Profile updated");  toast.error("Couldn't save");
 *   const id = toast.loading("Saving…");  …  toast.success("Saved", { id });
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Couldn't save" });
 *   toast.dismiss(id);
 *
 * The second shape is the Solid binding's (solid-toast's), so a call written
 * for one binding works in the other.
 */
declare function toastFn(input: ToastInput): ReturnType<typeof show>;
declare function toastFn(text: React.ReactNode, options?: ToastOptions): string;
export declare const toast: typeof toastFn & {
    success: (text: React.ReactNode, options?: ToastOptions) => string;
    error: (text: React.ReactNode, options?: ToastOptions) => string;
    /** Sticky until replaced (pass its id to success/error) or dismissed — solid-toast's default. */
    loading: (text: React.ReactNode, options?: ToastOptions) => string;
    /** Close one toast, or every toast with no id. It animates out. */
    dismiss: (id?: string) => void;
    /** Remove at once, with no exit animation. */
    remove: (id?: string) => void;
    /** A loading toast that becomes success or error when the promise settles. Returns the promise. */
    promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions) => Promise<T>;
};
export declare function useToast(): {
    toasts: ToastDescriptor[];
    toast: typeof toastFn & {
        success: (text: React.ReactNode, options?: ToastOptions) => string;
        error: (text: React.ReactNode, options?: ToastOptions) => string;
        /** Sticky until replaced (pass its id to success/error) or dismissed — solid-toast's default. */
        loading: (text: React.ReactNode, options?: ToastOptions) => string;
        /** Close one toast, or every toast with no id. It animates out. */
        dismiss: (id?: string) => void;
        /** Remove at once, with no exit animation. */
        remove: (id?: string) => void;
        /** A loading toast that becomes success or error when the promise settles. Returns the promise. */
        promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions) => Promise<T>;
    };
    dismiss: (id?: string) => void;
};
export {};
//# sourceMappingURL=use-toast.d.ts.map