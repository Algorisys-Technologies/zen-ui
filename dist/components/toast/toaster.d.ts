/**
 * Toaster + imperative `toast()` API — backed by solid-toast (the
 * Solid equivalent of react-hot-toast, which is what the React binding
 * uses).
 *
 *   import { Toaster, toast } from "@algorisys/zen-ui-solid";
 *   render(() => (<><App /><Toaster /></>), document.body);
 *
 *   toast.success("Saved");
 *   toast.error("Couldn't save");
 *   toast("Generic message");
 *
 * The Toaster component is themed via --zen-* CSS variables passed
 * through toastOptions.style.
 */
export declare const Toaster: (props: {
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}) => import("solid-js").JSX.Element;
export declare const toast: {
    (message: import("solid-toast").Message, opts?: import("solid-toast").ToastOptions): string;
    error: import("solid-toast").ToastHandler;
    success: import("solid-toast").ToastHandler;
    loading: import("solid-toast").ToastHandler;
    custom: import("solid-toast").ToastHandler;
    dismiss(toastId?: string): void;
    promise<T>(promise: Promise<T>, msgs: {
        loading: import("solid-toast").Renderable;
        success: import("solid-toast").ValueOrFunction<import("solid-toast").Renderable, T>;
        error: import("solid-toast").ValueOrFunction<import("solid-toast").Renderable, any>;
    }, opts?: import("solid-toast").DefaultToastOptions): Promise<T>;
    remove(toastId?: string): void;
};
//# sourceMappingURL=toaster.d.ts.map