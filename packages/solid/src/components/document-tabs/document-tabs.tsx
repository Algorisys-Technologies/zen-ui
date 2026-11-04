import { type JSX, For, Show, createEffect, createSignal, on, onCleanup, onMount, splitProps, untrack } from "solid-js";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../dropdown-menu/dropdown-menu";
import { useLocale } from "../locale/locale";

/**
 * DocumentTabs — a workspace's open documents, as closable, pinnable tabs.
 *
 *   <DocumentTabs
 *     tabs={[{ id: "a", label: "SI/26/00012", description: "Sales Invoice", dirty: true }]}
 *     activeId="a"
 *     onSelect={(id) => …}
 *     onClose={(id) => …}
 *     onPinChange={(id, pinned) => …}
 *   />
 *
 * Unlike Tabs, the panels are the consumer's: each document lives in its own
 * subtree (kept alive while hidden), so this renders the strip only and
 * reports intent. `tabs` is data, as with Toolbar, because the strip needs
 * every tab's label for the "all tabs" menu.
 *
 * Keyboard (WAI-ARIA tabs, manual activation, since opening a document is
 * work): ←/→ move focus, Home/End jump, Enter or Space opens, Delete closes.
 * A middle-click closes, as in a browser. The close and pin buttons are out
 * of the tab order (the keys above cover them) and labelled for pointers and
 * screen readers.
 *
 * When the tabs do not fit, the strip scrolls sideways (the active tab is
 * kept in view) and an "all tabs" menu appears at its end.
 *
 * Solid first; the React, vanilla and web-components ports follow (see
 * todo.md), and check:parity reports it until they land.
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

// onSelect and onClose are this strip's, not the DOM events of the same names.
export type DocumentTabsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onSelect" | "onClose"> & {
  tabs: DocumentTab[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  onClose?: (id: string) => void;
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
};

export const DocumentTabs = (props: DocumentTabsProps) => {
  const loc = useLocale();
  const [local, rest] = splitProps(props, [
    "tabs",
    "activeId",
    "onSelect",
    "onClose",
    "onPinChange",
    "panelId",
    "label",
    "allTabsLabel",
    "closeLabel",
    "class",
  ]);

  let scroller: HTMLDivElement | undefined;
  const tabRefs = new Map<string, HTMLButtonElement>();
  const [overflowing, setOverflowing] = createSignal(false);
  // Which tab takes Tab-key focus: the active one, else the first.
  const focusId = () => (local.tabs.some((t) => t.id === local.activeId) ? local.activeId : local.tabs[0]?.id);

  const measure = () => {
    if (scroller) setOverflowing(scroller.scrollWidth > scroller.clientWidth + 1);
  };
  // Scrolls the STRIP only. scrollIntoView would also scroll every ancestor,
  // jumping the page under the user whenever a tab was selected.
  const reveal = (id: string | null | undefined) => {
    const tab = id ? tabRefs.get(id)?.parentElement : undefined;
    if (!tab || !scroller) return;
    const left = tab.offsetLeft, right = left + tab.offsetWidth;
    if (left < scroller.scrollLeft) scroller.scrollLeft = left;
    else if (right > scroller.scrollLeft + scroller.clientWidth) scroller.scrollLeft = right - scroller.clientWidth;
  };
  // Watches the strip (the window, the all-tabs button appearing) and every
  // tab (a font loading, a label changing): any of them moves the active tab.
  const ro = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => {
    measure();
    reveal(untrack(() => local.activeId));
  });
  onMount(() => {
    measure();
    if (scroller) ro?.observe(scroller);
  });
  onCleanup(() => ro?.disconnect());

  // Keep the active tab in view, and re-measure, as tabs come and go.
  createEffect(
    on(
      () => [local.activeId, local.tabs.length] as const,
      ([activeId]) => {
        // After the strip has drawn the change; the id is read here, tracked.
        queueMicrotask(() => {
          measure();
          reveal(activeId);
        });
      },
    ),
  );

  const close = (t: DocumentTab) => {
    if (!t.pinned) local.onClose?.(t.id);
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const tabs = local.tabs;
    const move = (j: number) => {
      const t = tabs[(j + tabs.length) % tabs.length];
      if (t) tabRefs.get(t.id)?.focus();
    };
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); move(i + 1); break;
      case "ArrowLeft": e.preventDefault(); move(i - 1); break;
      case "Home": e.preventDefault(); move(0); break;
      case "End": e.preventDefault(); move(tabs.length - 1); break;
      case "Delete": {
        const t = tabs[i];
        if (t && !t.pinned && local.onClose) {
          e.preventDefault();
          // Focus the neighbour first: the closed tab's button goes away.
          move(i + 1 < tabs.length ? i + 1 : i - 1);
          close(t);
        }
        break;
      }
    }
  };

  const iconButton =
    "zen-inline-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent " +
    "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground zen-cursor-pointer";

  return (
    <div class={cn("zen-flex zen-w-full zen-items-stretch zen-border-b zen-border-zen-border", local.class)} {...rest}>
      <div
        ref={scroller}
        role="tablist"
        aria-label={local.label ?? loc.t("documentTabs.openDocuments")}
        aria-orientation="horizontal"
        // relative: tabs' offsetLeft is measured from the strip (reveal).
        class="zen-relative zen-flex zen-min-w-0 zen-flex-1 zen-items-stretch zen-overflow-x-auto"
        style={{ "scrollbar-width": "thin" }}
      >
        <For each={local.tabs}>
          {(t, i) => {
            const active = () => t.id === local.activeId;
            let wrapper: HTMLDivElement | undefined;
            onMount(() => { if (wrapper) ro?.observe(wrapper); });
            // A closed tab must not outlive it in the map or the observer.
            onCleanup(() => {
              tabRefs.delete(t.id);
              if (wrapper) ro?.unobserve(wrapper);
            });
            return (
              <div
                ref={wrapper}
                role="presentation"
                data-active={active() ? "" : undefined}
                data-pinned={t.pinned ? "" : undefined}
                class={cn(
                  "zen-group zen-relative zen-flex zen-shrink-0 zen-items-center zen-gap-1 zen-pl-3 zen-pr-1",
                  "-zen-mb-px zen-border-b-2 zen-border-transparent zen-text-sm",
                  "zen-max-w-[16rem]",
                  active()
                    ? "zen-border-zen-primary zen-text-zen-foreground zen-bg-zen-background"
                    : "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted/50",
                )}
                onAuxClick={(e) => {
                  if (e.button === 1) { e.preventDefault(); close(t); }
                }}
                onMouseDown={(e) => {
                  // Stops the browser's autoscroll cursor on a middle-click.
                  if (e.button === 1) e.preventDefault();
                }}
              >
                <button
                  ref={(el) => tabRefs.set(t.id, el)}
                  type="button"
                  role="tab"
                  id={`zen-doc-tab-${t.id}`}
                  aria-selected={active() ? "true" : "false"}
                  aria-controls={local.panelId?.(t.id)}
                  tabIndex={t.id === focusId() ? 0 : -1}
                  title={t.description ? `${t.label} · ${t.description}` : t.label}
                  class={cn(
                    "zen-flex zen-min-w-0 zen-items-center zen-gap-1.5 zen-py-2 zen-border-0 zen-bg-transparent zen-text-inherit zen-cursor-pointer",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset zen-rounded-zen-sm",
                  )}
                  onClick={() => local.onSelect(t.id)}
                  onKeyDown={(e) => onKeyDown(e, i())}
                >
                  {/* With a pin control, its pressed state marks the tab; drawn twice it was noise. */}
                  <Show when={t.pinned && !local.onPinChange}>
                    <Icon name="pin" size={12} aria-hidden="true" class="zen-shrink-0" />
                  </Show>
                  <Show when={t.description}>
                    <span class="zen-shrink-0 zen-text-xs zen-text-zen-muted-fg">{t.description}</span>
                  </Show>
                  <span class={cn("zen-truncate", active() && "zen-font-medium")}>{t.label}</span>
                  <Show when={t.dirty}>
                    <span class="zen-h-1.5 zen-w-1.5 zen-shrink-0 zen-rounded-full zen-bg-zen-primary" aria-hidden="true" />
                    <span class="zen-sr-only">, unsaved changes</span>
                  </Show>
                </button>
                <Show when={local.onPinChange}>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={t.pinned ? `Unpin ${t.label}` : `Pin ${t.label}`}
                    aria-pressed={t.pinned ? "true" : "false"}
                    title={t.pinned ? "Unpin" : "Pin"}
                    class={cn(iconButton, t.pinned ? "zen-text-zen-primary" : "zen-opacity-0 group-hover:zen-opacity-100 group-focus-within:zen-opacity-100")}
                    onClick={() => local.onPinChange?.(t.id, !t.pinned)}
                  >
                    <Icon name="pin" size={12} />
                  </button>
                </Show>
                <Show when={local.onClose && !t.pinned}>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={loc.t("documentTabs.closeTab", { label: t.label })}
                    title={local.closeLabel?.(t) ?? loc.t("documentTabs.close")}
                    class={cn(iconButton, !active() && !t.dirty && "zen-opacity-0 group-hover:zen-opacity-100 group-focus-within:zen-opacity-100")}
                    onClick={() => close(t)}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
      <Show when={overflowing()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            aria-label={local.allTabsLabel ?? `All open documents (${local.tabs.length})`}
            title={local.allTabsLabel ?? loc.t("documentTabs.allOpenDocuments")}
            class={cn(iconButton, "zen-h-auto zen-w-8 zen-rounded-none zen-border-l zen-border-zen-border")}
          >
            <Icon name="chevron-down" size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <For each={local.tabs}>
              {(t) => (
                <DropdownMenuItem onSelect={() => local.onSelect(t.id)}>
                  <span class={cn("zen-truncate", t.id === local.activeId && "zen-font-medium")}>
                    {t.description ? `${t.description} · ` : ""}{t.label}{t.dirty ? " •" : ""}
                  </span>
                </DropdownMenuItem>
              )}
            </For>
          </DropdownMenuContent>
        </DropdownMenu>
      </Show>
    </div>
  );
};
