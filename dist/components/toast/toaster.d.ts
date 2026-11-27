/**
 * Toaster — mount once near the root of the app. Reads from the
 * module-scoped toast store (see ./use-toast.tsx) and renders every
 * open toast.
 *
 *   // app.tsx
 *   <App>
 *     <Routes>...</Routes>
 *     <Toaster />
 *   </App>
 *
 *   // anywhere in the tree
 *   import { toast } from "@algorisys/zen-ui-react";
 *   toast({ title: "Saved" });
 *   toast.success("Saved");          // the Solid binding's call works too
 *
 *   <Toaster position="bottom-right" />
 */
export type ToasterPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export interface ToasterProps {
    /** Where the toasts stack. Default "top-right", as it always was. */
    position?: ToasterPosition;
}
declare const Toaster: ({ position }?: ToasterProps) => import("react").JSX.Element;
export { Toaster };
//# sourceMappingURL=toaster.d.ts.map