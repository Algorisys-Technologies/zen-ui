import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
// Design tokens (defines --zen-color-* / --zen-radius-* / --zen-shadow-* per
// data-theme). MUST load before any UnoCSS utility (bg-zen-*, text-zen-*, …)
// is evaluated, otherwise those classes resolve to var(--zen-color-…) → empty.
import "@algorisys/zen-ui-core/tokens.css";
import "@algorisys/zen-ui-core/preflight.css";
import App from "./App";
import { applyTheme, getInitialTheme } from "./lib/theme";
import "virtual:uno.css";

// Migrate the legacy localStorage key from the pre-rename era. Without
// this, a stored value from an old build would leave <html data-theme=…>
// on first paint pointing at a name the new tokens.css has no rule for →
// no --zen-color-* vars get defined → everything renders unstyled.
// Unknown values (including any retired theme names) fall back to default.
try {
  const legacyStored = window.localStorage.getItem("jet-theme");
  if (legacyStored !== null) {
    if (window.localStorage.getItem("zen-ui-theme") === null) {
      const valid = ["default", "zen-theme", "dark"];
      const migrated = valid.includes(legacyStored) ? legacyStored : "default";
      window.localStorage.setItem("zen-ui-theme", migrated);
    }
    window.localStorage.removeItem("jet-theme");
  }
} catch {
  // ignore quota / private-mode errors
}

// Apply the persisted theme BEFORE React renders to avoid a flash of default
// styling on first paint when the user has previously picked Zen or Dark.
applyTheme(getInitialTheme());

// The router's basename must match the base the app is actually SERVED under,
// or no route matches on a direct visit or a refresh. Derived from Vite's
// BASE_URL rather than hardcoded to "/builder", because the base is not fixed:
// it is "/builder/" under dev:all and "/zen-ui/builder/" on GitHub Pages, where
// a hardcoded "/builder" would match nothing and render a blank page. BASE_URL
// is baked in at build time and always has a trailing slash; basename must not.
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={BASENAME}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
