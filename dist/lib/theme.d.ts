import { THEMES, applyTheme, getInitialTheme, type ThemeName } from "../_core/theme";
export { THEMES, applyTheme, getInitialTheme };
export type { ThemeName, ThemeDescriptor } from "../_core/theme";
/**
 * React hook layered on top of the core theme primitives. Mirrors the
 * persisted theme as React state so UI like the theme switcher can
 * reflect the active value, and listens for `zen:theme-change` events
 * so multiple useTheme() consumers stay in sync.
 */
export declare function useTheme(): {
    theme: ThemeName;
    setTheme: (next: ThemeName) => void;
    themes: import("../_core/index").ThemeDescriptor[];
};
//# sourceMappingURL=theme.d.ts.map