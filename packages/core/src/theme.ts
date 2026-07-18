/**
 * Theme registry + DOM primitives.
 *
 * Themes are CSS-driven: each entry in THEMES corresponds to a
 * `:root[data-theme="<name>"]` block in ../styles/tokens.css.
 * Switching is just toggling the `data-theme` attribute on <html>; no
 * framework re-render is required (CSS variables cascade). Each binding
 * (React, Solid, …) layers its own reactive hook on top of these
 * primitives.
 *
 * Persistence: the chosen theme is saved to localStorage under
 * `zen-ui-theme` and restored on mount. A custom event
 * (`zen:theme-change`) is dispatched so multiple listeners stay in sync.
 */

export type ThemeName = "default" | "zen-ui" | "zen-theme" | "dark";

export interface ThemeDescriptor {
  name: ThemeName;
  label: string;
  description: string;
  preview: [string, string, string];
}

export const THEMES: ThemeDescriptor[] = [
  {
    name: "default",
    label: "Default",
    description: "Algorisys brand palette — blue + red",
    preview: ["#1C43B9", "#CE1010", "#F5F5F5"],
  },
  {
    name: "zen-ui",
    label: "Zen UI",
    description: "SAP Fiori (Quartz Light) — SAP blue on a light shell",
    preview: ["#0A6ED1", "#107E3E", "#F5F6F7"],
  },
  {
    name: "zen-theme",
    label: "Zen",
    description: "Algorisys Zen theme — classic blue + full 10-step shade scale",
    preview: ["#214698", "#E23318", "#F3F3F4"],
  },
  {
    name: "dark",
    label: "Dark",
    description: "Inverted surfaces for low-light environments",
    preview: ["#6B8FE8", "#F26464", "#0F172A"],
  },
];

export const THEME_STORAGE_KEY = "zen-ui-theme";
export const THEME_EVENT_NAME = "zen:theme-change";

export const isThemeName = (v: unknown): v is ThemeName =>
  v === "default" || v === "zen-ui" || v === "zen-theme" || v === "dark";

export function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeName(stored) ? stored : "default";
}

export function applyTheme(name: ThemeName) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", name);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, name);
  } catch {
    // ignore quota / private-mode errors
  }
  window.dispatchEvent(new CustomEvent<ThemeName>(THEME_EVENT_NAME, { detail: name }));
}
