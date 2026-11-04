import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { Icon } from "../icon/icon";
import { DropdownMenu, type DropdownMenuHandle, type DropdownMenuItemSpec } from "../dropdown-menu/dropdown-menu";
import { useLocale } from "../locale/locale";

/**
 * DocumentTabs — a workspace's open documents, as closable, pinnable tabs.
 *
 *   const strip = DocumentTabs({
 *     tabs: [{ id: "a", label: "SI/26/00012", description: "Sales Invoice", dirty: true }],
 *     activeId: "a",
 *     onSelect: (id) => strip.update({ activeId: id }),
 *     onClose: (id) => strip.update({ tabs: tabs.filter((t) => t.id !== id) }),
 *     onPinChange: (id, pinned) => …,
 *   });
 *
 * Unlike Tabs, the panels are the consumer's: each document lives in its own
 * subtree (kept alive while hidden), so this renders the strip only and
 * reports intent. `tabs` and `activeId` are the caller's (controlled, as in
 * React): a select or a close is reported, and the caller answers with
 * `update()`. `tabs` is data, as with Toolbar, because the strip needs every
 * tab's label for the "all tabs" menu.
 *
 * `update({ tabs })` reconciles BY TAB ID: a tab whose id survives keeps its
 * elements (only what changed is rewritten, and it is moved only when its
 * position changed), so a re-render never takes focus away from the tab the
 * user is on. New ids get new elements; gone ids are removed and unobserved.
 *
 * Keyboard (WAI-ARIA tabs, manual activation, since opening a document is
 * work): ←/→ move focus (wrapping), Home/End jump, Enter or Space opens,
 * Delete closes. A middle-click closes, as in a browser. The close and pin
 * buttons are out of the tab order (the keys above cover them) and labelled
 * for pointers and screen readers.
 *
 * When the tabs do not fit, the strip scrolls sideways (the active tab is
 * kept in view, scrolling the STRIP only) and an "all tabs" menu appears at
 * its end.
 *
 * Ported from the React binding (the API reference); Solid is the behaviour
 * origin.
 */

export interface DocumentTab {
  id: string;
  /** The document's name, shown on the tab. */
  label: string;
  /** A second, quieter line or prefix: the document's type. */
  description?: string;
  /** Kept at the strip's start and not closable until unpinned. */
  pinned?: boolean;
  /** Has unsaved changes: shown as a dot, announced as "unsaved changes". */
  dirty?: boolean;
}

export interface DocumentTabsProps extends Omit<BaseProps, "children"> {
  tabs: DocumentTab[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  /** Present: every unpinned tab gets a close button, Delete and middle-click. */
  onClose?: (id: string) => void;
  /** Present: every tab gets a pin toggle. */
  onPinChange?: (id: string, pinned: boolean) => void;
  /** The id of the panel a tab controls (aria-controls), when there is one. */
  panelId?: (id: string) => string;
  /** Accessible name of the strip. */
  label?: string;
  allTabsLabel?: string;
  /**
   * The close button's tooltip, per tab: say how else to close it, e.g.
   * `() => "Close (Alt+W)"`. Default "Close". Its accessible name stays
   * "Close <tab label>", so it is clear which tab it closes.
   */
  closeLabel?: (tab: DocumentTab) => string;
}

const ICON_BUTTON =
  "zen-inline-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent " +
  "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground zen-cursor-pointer";
const REVEAL_ON_HOVER = "zen-opacity-0 group-hover:zen-opacity-100 group-focus-within:zen-opacity-100";

/** One tab's elements, kept for as long as its id is in `tabs`. */
interface TabView {
  tab: DocumentTab;
  wrapper: HTMLDivElement;
  button: HTMLButtonElement;
  pin: HTMLButtonElement | null;
  close: HTMLButtonElement | null;
  /** What the button's content was last drawn from, so an unchanged tab is not redrawn. */
  drawn: string;
  dispose: () => void;
}

export function DocumentTabs(props: DocumentTabsProps): ZenComponent<DocumentTabsProps> {
  // Read the provider building this strip now: its words are written later too (update, overflow).
  const loc = useLocale();
  let current: DocumentTabsProps = { ...props };
  const disposer = new Disposer();

  const el = document.createElement("div");
  const strip = document.createElement("div");
  strip.setAttribute("role", "tablist");
  strip.setAttribute("aria-orientation", "horizontal");
  // relative: tabs' offsetLeft is measured from the strip (reveal).
  strip.className = "zen-relative zen-flex zen-min-w-0 zen-flex-1 zen-items-stretch zen-overflow-x-auto";
  strip.style.setProperty("scrollbar-width", "thin");
  el.append(strip);

  const views = new Map<string, TabView>();
  let overflowing = false;
  let menu: DropdownMenuHandle | null = null;
  let menuTrigger: HTMLButtonElement | null = null;
  let removeProps: (() => void) | undefined;

  const tabs = () => current.tabs;
  const focusId = () => (tabs().some((t) => t.id === current.activeId) ? current.activeId : tabs()[0]?.id);

  // Scrolls the STRIP only. scrollIntoView would also scroll every ancestor,
  // jumping the page under the user whenever a tab was selected.
  const reveal = (id: string | null | undefined) => {
    const tab = id ? views.get(id)?.wrapper : undefined;
    if (!tab) return;
    const left = tab.offsetLeft, right = left + tab.offsetWidth;
    if (left < strip.scrollLeft) strip.scrollLeft = left;
    else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = right - strip.clientWidth;
  };

  // Watches the strip (the window, the all-tabs button appearing) and every
  // tab (a font loading, a label changing): any of them moves the active tab.
  const ro =
    typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(() => {
          measure();
          reveal(current.activeId);
        });
  ro?.observe(strip);
  disposer.add(() => ro?.disconnect());

  const close = (t: DocumentTab) => {
    if (!t.pinned) current.onClose?.(t.id);
  };

  const onKeyDown = (e: KeyboardEvent, id: string) => {
    const list = tabs();
    const i = list.findIndex((t) => t.id === id);
    if (i < 0) return;
    const move = (j: number) => {
      const t = list[(j + list.length) % list.length];
      if (t) views.get(t.id)?.button.focus();
    };
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); move(i + 1); break;
      case "ArrowLeft": e.preventDefault(); move(i - 1); break;
      case "Home": e.preventDefault(); move(0); break;
      case "End": e.preventDefault(); move(list.length - 1); break;
      // Enter and Space are the button's own: they click it, which selects.
      case "Delete": {
        const t = list[i];
        if (t && !t.pinned && current.onClose) {
          e.preventDefault();
          // Focus the neighbour first: the closed tab's button goes away.
          move(i + 1 < list.length ? i + 1 : i - 1);
          close(t);
        }
        break;
      }
    }
  };

  const makeView = (t: DocumentTab): TabView => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("role", "presentation");
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    wrapper.append(button);
    const view: TabView = { tab: t, wrapper, button, pin: null, close: null, drawn: "", dispose: () => {} };

    const onClick = () => current.onSelect(view.tab.id);
    const onKey = (e: KeyboardEvent) => onKeyDown(e, view.tab.id);
    const onAux = (e: MouseEvent) => {
      if (e.button === 1) { e.preventDefault(); close(view.tab); }
    };
    // Stops the browser's autoscroll cursor on a middle-click.
    const onDown = (e: MouseEvent) => {
      if (e.button === 1) e.preventDefault();
    };
    button.addEventListener("click", onClick);
    button.addEventListener("keydown", onKey);
    wrapper.addEventListener("auxclick", onAux);
    wrapper.addEventListener("mousedown", onDown);
    view.dispose = () => {
      button.removeEventListener("click", onClick);
      button.removeEventListener("keydown", onKey);
      wrapper.removeEventListener("auxclick", onAux);
      wrapper.removeEventListener("mousedown", onDown);
      ro?.unobserve(wrapper);
      wrapper.remove();
    };
    ro?.observe(wrapper);
    return view;
  };

  const iconButton = (name: "pin" | "x", onClick: (view: TabView) => void, view: TabView) => {
    const b = document.createElement("button");
    b.type = "button";
    b.tabIndex = -1;
    b.append(Icon({ name, size: 12 }).el);
    // Reads the view's CURRENT tab, so an update needs no rebinding.
    b.addEventListener("click", () => onClick(view));
    return b;
  };

  /** Write one tab's state onto its (kept) elements. */
  const drawView = (view: TabView) => {
    const t = view.tab;
    const active = t.id === current.activeId;
    const { wrapper, button } = view;

    if (active) wrapper.setAttribute("data-active", "");
    else wrapper.removeAttribute("data-active");
    if (t.pinned) wrapper.setAttribute("data-pinned", "");
    else wrapper.removeAttribute("data-pinned");
    wrapper.className = cn(
      "zen-group zen-relative zen-flex zen-shrink-0 zen-items-center zen-gap-1 zen-pl-3 zen-pr-1",
      "-zen-mb-px zen-border-b-2 zen-border-transparent zen-text-sm",
      "zen-max-w-[16rem]",
      active
        ? "zen-border-zen-primary zen-text-zen-foreground zen-bg-zen-background"
        : "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted/50",
    );

    button.id = `zen-doc-tab-${t.id}`;
    button.setAttribute("aria-selected", active ? "true" : "false");
    const controls = current.panelId?.(t.id);
    if (controls) button.setAttribute("aria-controls", controls);
    else button.removeAttribute("aria-controls");
    button.tabIndex = t.id === focusId() ? 0 : -1;
    button.title = t.description ? `${t.label} · ${t.description}` : t.label;
    button.className = cn(
      "zen-flex zen-min-w-0 zen-items-center zen-gap-1.5 zen-py-2 zen-border-0 zen-bg-transparent zen-text-inherit zen-cursor-pointer",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset zen-rounded-zen-sm",
    );

    // The content is redrawn only when what it shows changed. The button itself
    // is kept, so a focused tab stays focused through any update.
    const withPin = Boolean(current.onPinChange);
    const key = JSON.stringify([t.label, t.description, t.dirty, t.pinned, active, withPin]);
    if (key !== view.drawn) {
      view.drawn = key;
      const kids: Node[] = [];
      // With a pin control, its pressed state marks the tab; drawn twice it was noise.
      if (t.pinned && !withPin) kids.push(Icon({ name: "pin", size: 12, class: "zen-shrink-0" }).el);
      if (t.description) {
        const d = document.createElement("span");
        d.className = "zen-shrink-0 zen-text-xs zen-text-zen-muted-fg";
        d.textContent = t.description;
        kids.push(d);
      }
      const name = document.createElement("span");
      name.className = cn("zen-truncate", active && "zen-font-medium");
      name.textContent = t.label;
      kids.push(name);
      if (t.dirty) {
        const dot = document.createElement("span");
        dot.className = "zen-h-1.5 zen-w-1.5 zen-shrink-0 zen-rounded-full zen-bg-zen-primary";
        dot.setAttribute("aria-hidden", "true");
        const sr = document.createElement("span");
        sr.className = "zen-sr-only";
        sr.textContent = loc.t("documentTabs.unsaved");
        kids.push(dot, sr);
      }
      button.replaceChildren(...kids);
    }

    // Pin toggle: present while onPinChange is.
    if (withPin) {
      view.pin ??= iconButton("pin", (v) => current.onPinChange?.(v.tab.id, !v.tab.pinned), view);
      const pin = view.pin;
      pin.setAttribute("aria-label", loc.t(t.pinned ? "documentTabs.unpinTab" : "documentTabs.pinTab", { label: t.label }));
      pin.setAttribute("aria-pressed", t.pinned ? "true" : "false");
      pin.title = loc.t(t.pinned ? "documentTabs.unpin" : "documentTabs.pin");
      pin.className = cn(ICON_BUTTON, t.pinned ? "zen-text-zen-primary" : REVEAL_ON_HOVER);
      if (pin.previousElementSibling !== button) button.after(pin);
    } else if (view.pin) {
      view.pin.remove();
      view.pin = null;
    }

    // Close: present while onClose is, and the tab is not pinned.
    if (current.onClose && !t.pinned) {
      view.close ??= iconButton("x", (v) => close(v.tab), view);
      const x = view.close;
      x.setAttribute("aria-label", loc.t("documentTabs.closeTab", { label: t.label }));
      x.title = current.closeLabel?.(t) ?? loc.t("documentTabs.close");
      x.className = cn(ICON_BUTTON, !active && !t.dirty && REVEAL_ON_HOVER);
      if (x.parentElement !== wrapper || x.nextElementSibling) wrapper.append(x);
    } else if (view.close) {
      view.close.remove();
      view.close = null;
    }
  };

  /** Reconcile the strip with `tabs`, by id. */
  const drawTabs = () => {
    const ids = new Set(tabs().map((t) => t.id));
    // Gone tabs first, so the survivors are already in order and need not move.
    for (const [id, view] of views) {
      if (ids.has(id)) continue;
      // A closed tab must not outlive it in the map or the observer.
      view.dispose();
      views.delete(id);
    }
    tabs().forEach((t, i) => {
      let view = views.get(t.id);
      if (!view) {
        view = makeView(t);
        views.set(t.id, view);
      }
      view.tab = t;
      drawView(view);
      // Move a tab only when it is out of place (a pin reorders): moving a
      // node drops its focus, which is then given back.
      const at = strip.children[i];
      if (at !== view.wrapper) {
        const focused = view.wrapper.contains(document.activeElement) ? (document.activeElement as HTMLElement) : null;
        strip.insertBefore(view.wrapper, at ?? null);
        focused?.focus();
      }
    });
  };

  const menuItems = (): DropdownMenuItemSpec[] =>
    tabs().map((t) => {
      const label = document.createElement("span");
      label.className = cn("zen-truncate", t.id === current.activeId && "zen-font-medium");
      label.textContent = `${t.description ? `${t.description} · ` : ""}${t.label}${t.dirty ? " •" : ""}`;
      return { label, onSelect: () => current.onSelect(t.id) };
    });

  const drawMenu = () => {
    if (!overflowing) {
      if (menu) {
        menu.destroy();
        menuTrigger?.remove();
        menu = null;
        menuTrigger = null;
      }
      return;
    }
    if (!menu) {
      menuTrigger = document.createElement("button");
      menuTrigger.type = "button";
      menuTrigger.className = cn(ICON_BUTTON, "zen-h-auto zen-w-8 zen-rounded-none zen-border-l zen-border-zen-border");
      menuTrigger.append(Icon({ name: "chevron-down", size: 14 }).el);
      menu = DropdownMenu({
        trigger: menuTrigger,
        items: menuItems(),
        align: "end",
        // An open menu is not rebuilt under the user (DropdownMenu re-opens to
        // apply new items, moving focus); it catches up as it closes.
        onOpenChange: (open) => {
          if (!open) queueMicrotask(() => { if (menu && !menu.isOpen) menu.update({ items: menuItems() }); });
        },
      });
      // The trigger sits right after the strip, as in the other bindings: it
      // is taken out of DropdownMenu's inline wrapper (which only holds it; the
      // menu's listeners are on the trigger and its panel is portalled).
      el.append(menuTrigger);
    } else if (!menu.isOpen) {
      menu.update({ items: menuItems() });
    }
    menuTrigger!.setAttribute(
      "aria-label",
      current.allTabsLabel ?? loc.t("documentTabs.allOpenDocumentsCount", { count: tabs().length }),
    );
    menuTrigger!.title = current.allTabsLabel ?? loc.t("documentTabs.allOpenDocuments");
  };

  function measure() {
    const next = strip.scrollWidth > strip.clientWidth + 1;
    if (next === overflowing) return;
    overflowing = next;
    drawMenu();
  }

  const render = () => {
    const {
      tabs: _tabs, activeId: _a, onSelect: _s, onClose: _c, onPinChange: _p, panelId: _pi,
      label, allTabsLabel: _al, closeLabel: _cl, class: className, ...rest
    } = current;
    el.className = cn("zen-flex zen-w-full zen-items-stretch zen-border-b zen-border-zen-border", className);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
    strip.setAttribute("aria-label", label ?? loc.t("documentTabs.openDocuments"));
    drawTabs();
    if (menu) drawMenu();
    // Keep the active tab in view, and re-measure, as tabs come and go. The
    // reads force layout, so this sees the strip as just drawn.
    measure();
    reveal(current.activeId);
  };

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const view of views.values()) view.dispose();
    views.clear();
    menu?.destroy();
    menu = null;
  });

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
