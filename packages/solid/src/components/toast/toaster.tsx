import { Toaster as SolidToaster, toast as solidToast } from "solid-toast";

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

export const Toaster = (props: { position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" }) => (
  <SolidToaster
    position={props.position ?? "top-right"}
    toastOptions={{
      // solid-toast uses a single options object for all toast types
      // (unlike react-hot-toast). Per-type icon themes can be passed at
      // the call site: `toast.success("Saved", { iconTheme: {...} })`.
      style: {
        background: "var(--zen-color-background)",
        color: "var(--zen-color-foreground)",
        border: "1px solid var(--zen-color-border)",
        "border-radius": "var(--zen-radius-md)",
        // solid-toast takes a style object, not classes, so these use the
        // spacing tokens directly. The values were authored as `0.75rem 1rem`
        // / `0.875rem` — the standard 12/16px and 14px steps — but the app used
        // to force `html { font-size: 62.5% }`, which silently rendered them at
        // 7.5/10px with an unreadable 8.75px font. With that rule gone they now
        // mean what they say.
        padding: "var(--zen-space-3) var(--zen-space-4)",
        "box-shadow": "var(--zen-shadow-md)",
        "font-size": "0.875rem",
      },
    }}
  />
);

export const toast = solidToast;
