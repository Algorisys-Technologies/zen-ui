import * as React from "react";
import { Button } from "./button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu/dropdown-menu";
import { useTheme, type ThemeName } from "../lib/theme";

/**
 * ThemeSwitcher — demo-shell dropdown for picking which `--zen-*` palette
 * is active. Built on the new DropdownMenu + Button primitives.
 *
 * Persists choice via useTheme (localStorage `zen-theme`). Used in App.tsx
 * header. Consumers integrating the library elsewhere can ignore this and
 * either set `data-theme` on <html> themselves or import { useTheme }
 * from "@algorisys/zen-ui-react" once we export it.
 */

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();
  const active = themes.find((t) => t.name === theme) ?? themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" color="neutral" size="sm" iconLeft={<Swatches preview={active.preview} />}>
          Theme · {active.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="zen-min-w-64">
        <DropdownMenuLabel>Demo theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as ThemeName)}
        >
          {themes.map((t) => (
            <DropdownMenuRadioItem key={t.name} value={t.name}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginLeft: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Swatches preview={t.preview} />
                  <span style={{ fontWeight: 500 }}>{t.label}</span>
                </div>
                <span className="zen-text-xs zen-text-zen-muted-fg">
                  {t.description}
                </span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Swatches: React.FC<{ preview: readonly [string, string, string] }> = ({ preview }) => (
  <span
    aria-hidden
    style={{
      display: "inline-flex",
      alignItems: "center",
      borderRadius: 9999,
      overflow: "hidden",
      border: "1px solid var(--zen-color-border)",
    }}
  >
    {preview.map((c, i) => (
      <span
        key={i}
        style={{
          display: "block",
          width: 10,
          height: 14,
          background: c,
        }}
      />
    ))}
  </span>
);

export default ThemeSwitcher;
