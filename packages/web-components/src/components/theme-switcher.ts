import { applyTheme, getInitialTheme, THEMES, THEME_EVENT_NAME, type ThemeName } from "@algorisys/zen-ui-core/theme";
import { Button, cn } from "../index";

/**
 * ThemeSwitcher — the demo shell's palette picker, matching the React demo's
 * "Theme · {label}" swatch dropdown.
 *
 * Demo chrome, not a library component — the React binding's equivalent lives in
 * the demo too (src/components/theme-switcher.tsx), because it is built ON the
 * library rather than part of it. Same idea here: the trigger is a real zen-ui
 * Button (the vanilla factory, re-exported from this package), and the menu is
 * dismissed with the same escape/click-outside logic the Select and Dialog use.
 * The demo asking people to use these components should be using them.
 *
 * The vanilla demo pulls `Disposer` and `dismissable` from its own `src/lib`;
 * this binding does not re-export those internal primitives, so the two are
 * inlined verbatim below to keep behaviour identical.
 */

type Cleanup = () => void;

/** Collects cleanups for destroy(). Inlined from vanilla's src/lib/component.ts. */
class Disposer {
  private fns: Cleanup[] = [];
  private done = false;

  add(fn: Cleanup | void): void {
    if (typeof fn === "function") this.fns.push(fn);
  }

  dispose(): void {
    if (this.done) return;
    this.done = true;
    // Reverse order: a later cleanup may depend on something an earlier one set up.
    for (const fn of this.fns.reverse()) fn();
    this.fns.length = 0;
  }
}

/** Escape-to-close and click-outside. Inlined from vanilla's src/lib/dismissable.ts. */
function dismissable(
  root: HTMLElement,
  opts: { onDismiss: () => void; ignore?: Array<HTMLElement | null | undefined> },
): () => void {
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || e.defaultPrevented) return;
    e.preventDefault();
    opts.onDismiss();
  };

  // POINTERDOWN, not click: a press that starts inside and releases outside (a
  // drag) must not dismiss, and pointerdown runs before focus moves.
  const onPointerDown = (e: PointerEvent) => {
    const target = e.target as Node | null;
    if (!target) return;
    if (root.contains(target)) return;
    if (opts.ignore?.some((el) => el?.contains(target))) return;
    opts.onDismiss();
  };

  document.addEventListener("keydown", onKeydown);
  // Capture phase: a page handler that stops propagation would otherwise leave
  // the layer open with no way to close it by clicking away.
  document.addEventListener("pointerdown", onPointerDown, true);

  return () => {
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("pointerdown", onPointerDown, true);
  };
}

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
      "zen-flex zen-w-full zen-items-start zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-start",
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
