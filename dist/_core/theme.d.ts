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
export type ThemeName = "default" | "zen-theme" | "dark";
export interface ThemeDescriptor {
    name: ThemeName;
    label: string;
    description: string;
    preview: [string, string, string];
}
export declare const THEMES: ThemeDescriptor[];
export declare const THEME_STORAGE_KEY = "zen-ui-theme";
export declare const THEME_EVENT_NAME = "zen:theme-change";
export declare const isThemeName: (v: unknown) => v is ThemeName;
export declare function getInitialTheme(): ThemeName;
export declare function applyTheme(name: ThemeName): void;
