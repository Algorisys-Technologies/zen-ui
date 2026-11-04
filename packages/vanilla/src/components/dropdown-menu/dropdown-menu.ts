import {
  Disposer,
  toNodes,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { dismissable } from "../../lib/dismissable";
import { portal } from "../../lib/portal";
import {
  createMenuEngine,
  focusablesIn,
  placePanel,
  type DropdownMenuAlign,
  type DropdownMenuItemSpec,
  type DropdownMenuSide,
  type PanelHandle,
} from "./menu-engine";

/**
 * DropdownMenu — an action-menu on a trigger (kebab / user / context menus).
 *
 *   const dd = DropdownMenu({
 *     trigger: Button({ variant: "outline", children: "Options" }),
 *     items: [
 *       { label: "Profile", onSelect: () => …},
 *       { type: "separator" },
 *       { label: "Sign out", variant: "destructive", onSelect: () => …},
 *     ],
 *   });
 *   document.body.append(dd.el);
 *
 * This is NOT a form-input replacement — for that use `Select`.
 *
 * ## The divergence, and why this side of it
 *
 * React exposes Radix's compound parts — `<DropdownMenu>` / `<DropdownMenuTrigger
 * asChild>` / `<DropdownMenuContent>` / `<DropdownMenuItem>` / `…SubTrigger` /
 * `…CheckboxItem>` — wired to each other through React context. With no framework
 * there is no tree and no context, so the same shape would force the caller to
 * hand-thread the root into every part purely to look like React. That is
 * syntax-porting, which LOOPS XXXVI forbids, and it is the same call `select.ts`
 * and `popover.ts` made against the same primitive.
 *
 * So this takes the parts as data on one factory. Every capability of the compound
 * API survives: `trigger` is React's `DropdownMenuTrigger` (the `asChild` case is
 * the only case here), and the `items` array carries each item's kind — a plain
 * action, a `label`, a `separator`, a `checkbox`, a `radio` group, or a nested
 * `sub` menu — the same set React's sub-components expose.
 *
 * Radix supplies positioning, collision detection, keyboard navigation
 * (Arrow/Home/End), focus, dismissal and ARIA to the React binding. With no
 * primitive library this one writes them: `portal` mounts each panel to <body>
 * (so no ancestor's `overflow`/`transform`/`z-index` can clip or trap it),
 * `dismissable` gives Escape + click-outside, `rovingFocus` the arrow keys, and
 * the placement/flip logic below is Radix's floating middleware at the size this
 * library needs.
 *
 * These exports belong on check-parity's DIVERGENT list for the same reason
 * Select's and Popover's do.
 */

export type {
  DropdownMenuSide,
  DropdownMenuAlign,
  DropdownMenuActionItem,
  DropdownMenuLabelItem,
  DropdownMenuSeparatorItem,
  DropdownMenuCheckboxItemSpec,
  DropdownMenuRadioOption,
  DropdownMenuRadioGroupSpec,
  DropdownMenuSubSpec,
  DropdownMenuItemSpec,
} from "./menu-engine";

export interface DropdownMenuProps {
  /** The element that opens the menu. React's DropdownMenuTrigger (asChild). */
  trigger: Child;
  /** The menu contents, in order. */
  items: DropdownMenuItemSpec[];
  /** Preferred side of the trigger. Flips when it would leave the viewport. Default "bottom". */
  side?: DropdownMenuSide;
  /** Alignment along the chosen side. Default "start". */
  align?: DropdownMenuAlign;
  /** Gap between the trigger and the panel, in px. Default 4. */
  sideOffset?: number;
  /** Controlled open state. Present -> the caller owns it. */
  open?: boolean;
  /** Uncontrolled initial state. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Merged onto the content panel. React's DropdownMenuContent className. */
  class?: string;
  id?: string;
  [key: `data-${string}`]: unknown;
}

export interface DropdownMenuHandle extends ZenComponent<DropdownMenuProps> {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

/** Pull the interactive element out of a trigger child (a component's `.el` or a raw node). */
function elementOf(child: Child): HTMLElement {
  const el = toNodes(child).find((n): n is HTMLElement => n instanceof HTMLElement);
  if (!el) throw new Error("DropdownMenu trigger must render an element");
  return el;
}

let uid = 0;

export function DropdownMenu(props: DropdownMenuProps): DropdownMenuHandle {
  let current: DropdownMenuProps = { ...props };
  const id = current.id ?? `zen-dropdown-menu-${++uid}`;
  const contentId = `${id}-content`;

  const p = portal();

  // The wrapper stays inline where the caller drops it and holds the trigger.
  // Every panel lives in the portal, not here.
  const wrapper = document.createElement("span");
  wrapper.className = "zen-inline-flex";

  const triggerEl = elementOf(current.trigger);
  triggerEl.setAttribute("aria-haspopup", "menu");
  triggerEl.setAttribute("aria-expanded", "false");
  triggerEl.setAttribute("aria-controls", contentId);
  triggerEl.setAttribute("data-state", "closed");
  wrapper.append(triggerEl);

  const engine = createMenuEngine({ portal: p, closeAll: () => state.set(false) });
  const { ignoreList, layout } = engine;

  let rootHandle: PanelHandle | null = null;
  let mounted = false;
  let session: Disposer | null = null;
  /** Where to land focus on the next open: keyboard-up opens on the last row. */
  let pendingFocus: "first" | "last" = "first";

  const state = controllable<boolean>({
    value: current.open,
    defaultValue: current.defaultOpen ?? false,
    onChange: (o) => current.onOpenChange?.(o),
  });

  const doOpen = () => {
    if (mounted) return;
    mounted = true;
    ignoreList.length = 0;
    layout.length = 0;
    // The trigger toggles the menu itself; a press on it must not also read as an
    // outside click, or the two cancel and the menu never opens.
    ignoreList.push(triggerEl);

    rootHandle = engine.mountMenu(
      current.items,
      triggerEl,
      current.side ?? "bottom",
      current.align ?? "start",
      current.sideOffset ?? 4,
      current.class,
      undefined,
    );
    rootHandle.panel.id = contentId;

    triggerEl.setAttribute("aria-expanded", "true");
    triggerEl.setAttribute("data-state", "open");

    session = new Disposer();
    const onReflow = () => {
      for (const l of layout) placePanel(l.anchor, l.panel, l.side, l.align, l.offset);
    };
    window.addEventListener("scroll", onReflow, { capture: true, passive: true });
    window.addEventListener("resize", onReflow);
    session.add(() =>
      window.removeEventListener("scroll", onReflow, { capture: true } as EventListenerOptions),
    );
    session.add(() => window.removeEventListener("resize", onReflow));
    session.add(
      dismissable(rootHandle.panel, {
        ignore: ignoreList,
        onDismiss: () => state.set(false),
      }),
    );

    const rows = focusablesIn(rootHandle.panel);
    (pendingFocus === "last" ? rows[rows.length - 1] : rows[0])?.focus();
    pendingFocus = "first";
  };

  const doClose = () => {
    if (!mounted) return;
    mounted = false;
    session?.dispose();
    session = null;
    rootHandle?.close();
    rootHandle = null;
    ignoreList.length = 0;
    layout.length = 0;
    triggerEl.setAttribute("aria-expanded", "false");
    triggerEl.setAttribute("data-state", "closed");
    triggerEl.focus();
  };

  const disposer = new Disposer();
  disposer.add(state.subscribe((o) => (o ? doOpen() : doClose())));

  const onTriggerClick = () => {
    pendingFocus = "first";
    state.set(!mounted);
  };
  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pendingFocus = "first";
      state.set(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      pendingFocus = "last";
      state.set(true);
    }
  };
  triggerEl.addEventListener("click", onTriggerClick);
  triggerEl.addEventListener("keydown", onTriggerKey);
  disposer.add(() => triggerEl.removeEventListener("click", onTriggerClick));
  disposer.add(() => triggerEl.removeEventListener("keydown", onTriggerKey));
  disposer.add(() => session?.dispose());

  // Honour defaultOpen / a controlled open=true on first build.
  if (state.get()) doOpen();

  const api: DropdownMenuHandle = {
    el: wrapper,
    get isOpen() {
      return mounted;
    },
    open() {
      state.set(true);
    },
    close() {
      state.set(false);
    },
    update(next) {
      current = { ...current, ...next };
      if (next.open !== undefined) state.sync(next.open);
      if (mounted) {
        // The simplest correct re-render for a menu whose contents changed: close
        // and reopen it, so every listener and submenu is rebuilt from `current`.
        doClose();
        doOpen();
      }
    },
    destroy() {
      disposer.dispose();
      p.destroy();
      wrapper.remove();
    },
  };

  return api;
}
