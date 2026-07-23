import { createComponent as r } from "solid-js/web";
import { Toaster as t } from "./index135.js";
import { toast as a } from "./index136.js";
const d = (o) => r(t, {
  get position() {
    return o.position ?? "top-right";
  },
  toastOptions: {
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
      "font-size": "0.875rem"
    }
  }
}), i = a;
export {
  d as Toaster,
  i as toast
};
//# sourceMappingURL=index63.js.map
