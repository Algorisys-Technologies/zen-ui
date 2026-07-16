import { applyTheme, getInitialTheme, THEMES, THEME_EVENT_NAME, type ThemeName } from "@algorisys/zen-ui-core/theme";
import { cn } from "../lib/cn";
import { Disposer } from "../lib/component";
import { dismissable } from "../lib/dismissable";
import { Button } from "./button/button";

/**
 * ThemeSwitcher — the demo shell's palette picker, matching the React demo's
 * "Theme · {label}" swatch dropdown.
 *
 * Demo chrome, not a library component — the React binding's equivalent lives in
 * the demo too (src/components/theme-switcher.tsx), because it is built ON the
 * library rather than part of it. Same idea here: the trigger is a real zen-ui
 * Button, and the menu is positioned with the same `dismissable` primitive the
 * Select and Dialog use. The demo asking people to use these components should be
 * using them.
 */

const swatches = (preview: readonly [string, string, string]): HTMLElement => {
  const wrap = document.createElement("span");
  wrap.setAttribute("aria-hidden", "true");
  wrap.style.cssText =
    "display:inline-flex;align-items:center;border-radius:9999px;overflow:hidden;border:1px solid var(--zen-color-border)";
  for (const c of preview) {
    const s = document.createElement("span");
    s.style.cssText = `display:block;width:10px;height:14px;background:${c}`;
    wrap.append(s);
  }
  return wrap;
};

export function ThemeSwitcher(): { el: HTMLElement; destroy(): void } {
  const disposer = new Disposer();
  const root = document.createElement("div");
  root.style.position = "relative";

  let current: ThemeName = getInitialTheme();
  const labelOf = (n: ThemeName) => THEMES.find((t) => t.name === n)?.label ?? "Default";
  const previewOf = (n: ThemeName) => THEMES.find((t) => t.name === n)?.preview ?? THEMES[0].preview;

  const trigger = Button({
    variant: "outline",
    color: "neutral",
    size: "sm",
    iconLeft: swatches(previewOf(current)),
    children: `Theme · ${labelOf(current)}`,
  });
  trigger.el.setAttribute("aria-haspopup", "menu");
  trigger.el.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.setAttribute("role", "menu");
  menu.className = cn(
    "zen-absolute zen-right-0 zen-top-full zen-mt-1 zen-z-50 zen-min-w-64",
    "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-zen-md",
    "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
  );
  menu.hidden = true;

  const heading = document.createElement("p");
  heading.className = "zen-px-2 zen-py-1.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg";
  heading.textContent = "Demo theme";
  menu.append(heading);

  let cleanupDismiss: (() => void) | undefined;
  let open = false;

  const close = () => {
    if (!open) return;
    open = false;
    menu.hidden = true;
    trigger.el.setAttribute("aria-expanded", "false");
    cleanupDismiss?.();
    cleanupDismiss = undefined;
  };

  const openMenu = () => {
    if (open) return;
    open = true;
    menu.hidden = false;
    trigger.el.setAttribute("aria-expanded", "true");
    cleanupDismiss = dismissable(menu, { ignore: [trigger.el], onDismiss: close });
  };

  const paint = () => {
    trigger.update({ iconLeft: swatches(previewOf(current)), children: `Theme · ${labelOf(current)}` });
    for (const item of menu.querySelectorAll<HTMLElement>("[role=menuitemradio]")) {
      item.setAttribute("aria-checked", String(item.dataset.theme === current));
    }
  };

  for (const t of THEMES) {
    const item = document.createElement("button");
    item.type = "button";
    item.setAttribute("role", "menuitemradio");
    item.dataset.theme = t.name;
    item.className = cn(
      "zen-flex zen-w-full zen-items-start zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-left",
      "zen-bg-transparent zen-border-0 zen-cursor-pointer",
      "hover:zen-bg-zen-muted focus-visible:zen-bg-zen-muted focus-visible:zen-outline-none",
    );
    const col = document.createElement("span");
    col.style.cssText = "display:flex;flex-direction:column;gap:2px";
    const top = document.createElement("span");
    top.style.cssText = "display:flex;align-items:center;gap:8px";
    top.append(swatches(t.preview));
    const nm = document.createElement("span");
    nm.className = "zen-text-sm zen-font-medium";
    nm.textContent = t.label;
    top.append(nm);
    const desc = document.createElement("span");
    desc.className = "zen-text-xs zen-text-zen-muted-fg";
    desc.textContent = t.description;
    col.append(top, desc);
    item.append(col);
    item.addEventListener("click", () => {
      current = t.name;
      applyTheme(current);
      paint();
      close();
    });
    menu.append(item);
  }

  trigger.el.addEventListener("click", () => (open ? close() : openMenu()));

  // Another tab or listener may change the theme; keep the label in sync.
  const onExternal = (e: Event) => {
    const next = (e as CustomEvent<ThemeName>).detail;
    if (next && next !== current) {
      current = next;
      paint();
    }
  };
  window.addEventListener(THEME_EVENT_NAME, onExternal);

  root.append(trigger.el, menu);
  paint();

  disposer.add(() => window.removeEventListener(THEME_EVENT_NAME, onExternal));
  disposer.add(() => cleanupDismiss?.());
  disposer.add(() => trigger.destroy());

  return { el: root, destroy: () => disposer.dispose() };
}
