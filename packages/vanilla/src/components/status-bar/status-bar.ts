import { statusBarCollapse, statusBarSides, type StatusBarAlign } from "@algorisys/zen-ui-core/status-bar";
import { statusBarItemVariants, statusBarSeparatorClass, statusBarVariants } from "@algorisys/zen-ui-core/variants";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import { Icon, type IconName } from "../icon/icon";
import { useLocale } from "../locale/locale";

/**
 * StatusBar — the strip along the bottom of an app, an editor or a panel.
 *
 *   const bar = StatusBar({ items: [
 *     { id: "branch", icon: "flag", label: "main" },
 *     { id: "errors", icon: "error", label: "2", color: "error", onSelect: openProblems, align: "end", priority: 5 },
 *   ] });
 *   bar.update({ items: next });   // rebuild the array freely; the DOM is kept
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * Items give way lowest `priority` first when the bar is too narrow, and among
 * equals the one later in the list. Slots are kept by position across
 * `update()`, and inside a slot only what changed is touched — so an
 * `announce` item's live region CHANGES rather than being re-inserted, which a
 * screen reader would ignore.
 */

export type StatusBarColor = "info" | "success" | "warning" | "error";

export interface StatusBarItem {
  id: string;
  label?: Child;
  icon?: IconName;
  /** Tooltip, and part of the accessible name ("Problems 2"); the whole name of an icon-only item. */
  title?: string;
  /** Shows the item as a soft chip in that colour. */
  color?: StatusBarColor;
  /** Makes the item a button. */
  onSelect?: () => void;
  disabled?: boolean;
  /** Default "start". */
  align?: StatusBarAlign;
  /** Higher stays longer when the bar is narrow. Default 0. */
  priority?: number;
  hidden?: boolean;
  /** Draws a divider before the item. */
  separatorBefore?: boolean;
  /** Announces changes to this item's text to screen readers (a polite live region). */
  announce?: boolean;
}

export interface StatusBarProps extends Omit<BaseProps, "children"> {
  items: StatusBarItem[];
  variant?: "default" | "muted" | "accent";
  size?: "sm" | "md";
  /** The bar's accessible name. Default "Status bar". */
  label?: string;
  /** Called with the ids that gave way, whenever that set changes. */
  onCollapse?: (ids: string[]) => void;
}

interface Slot {
  wrap: HTMLElement;
  sep: HTMLElement;
  inner: HTMLElement;
  icon?: ReturnType<typeof Icon>;
  iconKey?: string;
  srTitle: HTMLElement;
  text: HTMLElement;
  item: StatusBarItem;
}

const isEmpty = (label: Child) => label === undefined || label === null || label === "" || label === false;

export function StatusBar(props: StatusBarProps): ZenComponent<StatusBarProps> {
  let current: StatusBarProps = { ...props };
  const loc = useLocale();
  const el = document.createElement("div");
  el.setAttribute("role", "group");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const slots: Slot[] = [];
  let ordered: StatusBarItem[] = [];
  let collapsed: string[] = [];
  // Last measured width per id. A collapsed item cannot be measured, so the
  // bar remembers what it measured while the item was showing.
  const widths: Record<string, number> = {};

  const ro = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => recompute());
  ro?.observe(el);
  disposer.add(() => ro?.disconnect());

  const makeInner = (button: boolean, slot: Partial<Slot>): HTMLElement => {
    const inner = document.createElement(button ? "button" : "span");
    if (button) {
      (inner as HTMLButtonElement).type = "button";
      inner.addEventListener("click", () => slot.item?.onSelect?.());
    }
    return inner;
  };

  const paintSlot = (slot: Slot, it: StatusBarItem) => {
    slot.item = it;
    const { size } = current;
    const button = !!it.onSelect;
    if ((slot.inner.tagName === "BUTTON") !== button) {
      const inner = makeInner(button, slot);
      inner.append(...slot.inner.childNodes);
      slot.inner.replaceWith(inner);
      slot.inner = inner;
    }
    const iconOnly = isEmpty(it.label);
    const inner = slot.inner;
    inner.className = statusBarItemVariants({ color: it.color ?? "none", interactive: button });
    if (it.title) inner.title = it.title;
    else inner.removeAttribute("title");
    if (button) {
      (inner as HTMLButtonElement).disabled = !!it.disabled;
      if (iconOnly && it.title) inner.setAttribute("aria-label", it.title);
      else inner.removeAttribute("aria-label");
    }

    // Icon: rebuilt only when the glyph or its size changes.
    const iconKey = it.icon ? `${it.icon}:${size === "sm" ? 12 : 14}` : undefined;
    if (iconKey !== slot.iconKey) {
      slot.icon?.destroy();
      slot.icon = it.icon ? Icon({ name: it.icon, size: size === "sm" ? 12 : 14 }) : undefined;
      if (slot.icon) inner.prepend(slot.icon.el);
      slot.iconKey = iconKey;
    }

    // The title is part of the name, not only a tooltip: a button that says
    // "2" means nothing to a screen reader; "Problems 2" does.
    const showTitle = !!it.title && !(iconOnly && button);
    if (showTitle) {
      if (slot.srTitle.textContent !== it.title) slot.srTitle.textContent = it.title!;
      if (!slot.srTitle.isConnected) slot.text.before(slot.srTitle);
    } else slot.srTitle.remove();
    if (!slot.text.parentNode || slot.text.parentNode !== inner) inner.append(slot.text);

    // Label, written only when it differs, so the live region speaks on a real change.
    slot.text.hidden = iconOnly;
    if (it.announce) slot.text.setAttribute("role", "status");
    else slot.text.removeAttribute("role");
    const label = it.label;
    if (typeof label === "string" || typeof label === "number") {
      const s = String(label);
      if (slot.text.childNodes.length !== 1 || slot.text.firstChild?.nodeType !== Node.TEXT_NODE || slot.text.textContent !== s) {
        slot.text.textContent = s;
      }
    } else if (!iconOnly) {
      const next = toNodes(label);
      const same = next.length === slot.text.childNodes.length && next.every((n, i) => n === slot.text.childNodes[i]);
      if (!same) slot.text.replaceChildren(...next);
    } else if (slot.text.childNodes.length) slot.text.replaceChildren();

    slot.sep.hidden = !it.separatorBefore;
    slot.wrap.dataset.statusItem = it.id;
  };

  const createSlot = (): Slot => {
    const wrap = document.createElement("span");
    const sep = document.createElement("span");
    sep.setAttribute("aria-hidden", "true");
    sep.className = statusBarSeparatorClass;
    const partial: Partial<Slot> = {};
    const inner = makeInner(false, partial);
    const srTitle = document.createElement("span");
    srTitle.className = "zen-sr-only";
    const text = document.createElement("span");
    text.className = "zen-truncate";
    inner.append(text);
    wrap.append(sep, inner);
    const slot = Object.assign(partial, { wrap, sep, inner, srTitle, text }) as Slot;
    ro?.observe(wrap);
    return slot;
  };

  // Collapse state and the end side's push, without touching item content.
  const paintLayout = () => {
    const firstEnd = statusBarSides(current.items).end.find((it) => !collapsed.includes(it.id))?.id;
    ordered.forEach((it, i) => {
      const wrap = slots[i].wrap;
      const isCollapsed = collapsed.includes(it.id);
      wrap.className = cn(
        isCollapsed ? "zen-hidden" : "zen-inline-flex zen-h-full zen-shrink-0 zen-items-center zen-gap-1",
        firstEnd === it.id && "zen-ms-auto",
      );
      if (isCollapsed) wrap.setAttribute("data-collapsed", "");
      else wrap.removeAttribute("data-collapsed");
    });
  };

  function recompute() {
    if (!el.isConnected) return;
    const cs = getComputedStyle(el);
    const room = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const gap = parseFloat(cs.columnGap) || 0;
    ordered.forEach((it, i) => {
      if (!collapsed.includes(it.id)) widths[it.id] = slots[i].wrap.getBoundingClientRect().width;
    });
    const next = statusBarCollapse(current.items, widths, room, gap);
    if (next.length === collapsed.length && next.every((x, i) => x === collapsed[i])) return;
    collapsed = next;
    paintLayout();
    current.onCollapse?.(next);
  }

  const render = () => {
    const { items, variant, size, label, onCollapse: _o, class: className, ...rest } = current;
    el.className = cn(statusBarVariants({ variant, size }), className);
    el.setAttribute("aria-label", label ?? loc.t("statusBar.label"));

    const sides = statusBarSides(items);
    ordered = [...sides.start, ...sides.end];
    while (slots.length > ordered.length) {
      const s = slots.pop()!;
      ro?.unobserve(s.wrap);
      s.icon?.destroy();
      s.wrap.remove();
    }
    ordered.forEach((it, i) => {
      if (!slots[i]) {
        slots[i] = createSlot();
        el.append(slots[i].wrap);
      }
      paintSlot(slots[i], it);
    });
    paintLayout();

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => slots.forEach((s) => s.icon?.destroy()));

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
      recompute();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
