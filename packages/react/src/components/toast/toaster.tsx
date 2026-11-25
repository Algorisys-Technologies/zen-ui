import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToast } from "./use-toast";

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

/** Where the stack sits — the Solid binding's `position` values. */
const POSITION_CLASS: Record<ToasterPosition, string> = {
  "top-left": "zen-top-0 zen-left-0 zen-right-auto",
  "top-center": "zen-top-0 zen-left-1/2 zen-right-auto -zen-translate-x-1/2",
  "top-right": "zen-top-0 zen-right-0",
  "bottom-left": "zen-top-auto zen-bottom-0 zen-left-0 zen-right-auto",
  "bottom-center": "zen-top-auto zen-bottom-0 zen-left-1/2 zen-right-auto -zen-translate-x-1/2",
  "bottom-right": "zen-top-auto zen-bottom-0 zen-right-0",
};

export interface ToasterProps {
  /** Where the toasts stack. Default "top-right", as it always was. */
  position?: ToasterPosition;
}

/** `toast.loading()`'s spinner. Decorative: the title says what is happening. */
const Spinner = () => (
  <svg
    aria-hidden="true"
    className="zen-mt-0.5 zen-h-4 zen-w-4 zen-shrink-0 zen-animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const Toaster = ({ position = "top-right" }: ToasterProps = {}) => {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, loading, ...props }) => (
        <Toast key={id} {...props}>
          {loading ? <Spinner /> : null}
          <div style={{ display: "grid", gap: 4, flex: 1, minWidth: 0 }}>
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? (
              <ToastDescription>{description}</ToastDescription>
            ) : null}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className={POSITION_CLASS[position]} />
    </ToastProvider>
  );
};

export { Toaster };
