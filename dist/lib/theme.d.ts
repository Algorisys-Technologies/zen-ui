import { THEMES, applyTheme, getInitialTheme, type ThemeName } from "@algorisys/zen-ui-core/theme";
export { THEMES, applyTheme, getInitialTheme };
export type { ThemeName, ThemeDescriptor } from "@algorisys/zen-ui-core/theme";
/**
 * Solid hook layered on the core theme primitives. Mirrors the
 * persisted theme as a signal so UI like the theme switcher can
 * reflect the active value, and listens for `zen:theme-change` events
 * so multiple useTheme() consumers stay in sync.
 */
export declare function useTheme(): {
    theme: import("solid-js").Accessor<ThemeName>;
    setTheme: (next: ThemeName) => void;
    themes: import("@algorisys/zen-ui-core").ThemeDescriptor[];
};
//# sourceMappingURL=theme.d.ts.map