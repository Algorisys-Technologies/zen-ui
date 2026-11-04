import * as React from "react";
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
 * Ported from the Solid binding, which is the behaviour reference.
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
export type DocumentTabsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "onClose"> & {
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

const iconButton =
  "zen-inline-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent " +
  "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground zen-cursor-pointer";

export const DocumentTabs = React.forwardRef<HTMLDivElement, DocumentTabsProps>(
  (
    { tabs, activeId, onSelect, onClose, onPinChange, panelId, label, allTabsLabel, closeLabel, className, ...props },
    ref,
  ) => {
    const loc = useLocale();
    const scrollerRef = React.useRef<HTMLDivElement>(null);
    const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());
    const [overflowing, setOverflowing] = React.useState(false);
    // The observer's callback outlives renders: it reads the latest active id from here.
    const activeRef = React.useRef(activeId);
    activeRef.current = activeId;
    // Which tab takes Tab-key focus: the active one, else the first.
    const focusId = tabs.some((t) => t.id === activeId) ? activeId : tabs[0]?.id;

    const measure = React.useCallback(() => {
      const s = scrollerRef.current;
      if (s) setOverflowing(s.scrollWidth > s.clientWidth + 1);
    }, []);
    // Scrolls the STRIP only. scrollIntoView would also scroll every ancestor,
    // jumping the page under the user whenever a tab was selected.
    const reveal = React.useCallback((id: string | null | undefined) => {
      const s = scrollerRef.current;
      const tab = id ? tabRefs.current.get(id)?.parentElement : undefined;
      if (!tab || !s) return;
      const left = tab.offsetLeft, right = left + tab.offsetWidth;
      if (left < s.scrollLeft) s.scrollLeft = left;
      else if (right > s.scrollLeft + s.clientWidth) s.scrollLeft = right - s.clientWidth;
    }, []);

    // Watches the strip (the window, the all-tabs button appearing) and every
    // tab (a font loading, a label changing): any of them moves the active tab.
    // Made and disconnected in one effect, so a remount (StrictMode) gets a
    // live observer; tabs that attached first are picked up from the map.
    const roRef = React.useRef<ResizeObserver | null>(null);
    const wrapperNodes = React.useRef(new Map<string, HTMLDivElement>());
    React.useLayoutEffect(() => {
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => {
        measure();
        reveal(activeRef.current);
      });
      roRef.current = ro;
      if (scrollerRef.current) ro.observe(scrollerRef.current);
      wrapperNodes.current.forEach((n) => ro.observe(n));
      return () => {
        ro.disconnect();
        roRef.current = null;
      };
    }, [measure, reveal]);

    // Keep the active tab in view, and re-measure, as tabs come and go. A
    // layout effect runs after the strip has drawn the change.
    React.useLayoutEffect(() => {
      measure();
      reveal(activeId);
    }, [activeId, tabs.length, measure, reveal]);

    // One ref callback per tab id, so React does not detach and reattach it on
    // every render. A closed tab must not outlive it in the map or the observer.
    const wrapperRefs = React.useRef(new Map<string, (el: HTMLDivElement | null) => void>());
    const wrapperRef = (id: string) => {
      let fn = wrapperRefs.current.get(id);
      if (!fn) {
        fn = (el) => {
          const prev = wrapperNodes.current.get(id);
          if (prev && prev !== el) {
            roRef.current?.unobserve(prev);
            wrapperNodes.current.delete(id);
          }
          if (el) {
            wrapperNodes.current.set(id, el);
            roRef.current?.observe(el);
          } else {
            tabRefs.current.delete(id);
            wrapperRefs.current.delete(id);
          }
        };
        wrapperRefs.current.set(id, fn);
      }
      return fn;
    };
    const tabRef = (id: string) => (el: HTMLButtonElement | null) => {
      if (el) tabRefs.current.set(id, el);
    };

    const close = (t: DocumentTab) => {
      if (!t.pinned) onClose?.(t.id);
    };

    const onKeyDown = (e: React.KeyboardEvent, i: number) => {
      const move = (j: number) => {
        const t = tabs[(j + tabs.length) % tabs.length];
        if (t) tabRefs.current.get(t.id)?.focus();
      };
      switch (e.key) {
        case "ArrowRight": e.preventDefault(); move(i + 1); break;
        case "ArrowLeft": e.preventDefault(); move(i - 1); break;
        case "Home": e.preventDefault(); move(0); break;
        case "End": e.preventDefault(); move(tabs.length - 1); break;
        case "Delete": {
          const t = tabs[i];
          if (t && !t.pinned && onClose) {
            e.preventDefault();
            // Focus the neighbour first: the closed tab's button goes away.
            move(i + 1 < tabs.length ? i + 1 : i - 1);
            close(t);
          }
          break;
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn("zen-flex zen-w-full zen-items-stretch zen-border-b zen-border-zen-border", className)}
        {...props}
      >
        <div
          ref={scrollerRef}
          role="tablist"
          aria-label={label ?? loc.t("documentTabs.openDocuments")}
          aria-orientation="horizontal"
          // relative: tabs' offsetLeft is measured from the strip (reveal).
          className="zen-relative zen-flex zen-min-w-0 zen-flex-1 zen-items-stretch zen-overflow-x-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {tabs.map((t, i) => {
            const active = t.id === activeId;
            return (
              <div
                key={t.id}
                ref={wrapperRef(t.id)}
                role="presentation"
                data-active={active ? "" : undefined}
                data-pinned={t.pinned ? "" : undefined}
                className={cn(
                  "zen-group zen-relative zen-flex zen-shrink-0 zen-items-center zen-gap-1 zen-pl-3 zen-pr-1",
                  "-zen-mb-px zen-border-b-2 zen-border-transparent zen-text-sm",
                  "zen-max-w-[16rem]",
                  active
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
                  ref={tabRef(t.id)}
                  type="button"
                  role="tab"
                  id={`zen-doc-tab-${t.id}`}
                  aria-selected={active ? "true" : "false"}
                  aria-controls={panelId?.(t.id)}
                  tabIndex={t.id === focusId ? 0 : -1}
                  title={t.description ? `${t.label} · ${t.description}` : t.label}
                  className={cn(
                    "zen-flex zen-min-w-0 zen-items-center zen-gap-1.5 zen-py-2 zen-border-0 zen-bg-transparent zen-text-inherit zen-cursor-pointer",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset zen-rounded-zen-sm",
                  )}
                  onClick={() => onSelect(t.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  {/* With a pin control, its pressed state marks the tab; drawn twice it was noise. */}
                  {t.pinned && !onPinChange && <Icon name="pin" size={12} aria-hidden="true" className="zen-shrink-0" />}
                  {t.description && <span className="zen-shrink-0 zen-text-xs zen-text-zen-muted-fg">{t.description}</span>}
                  <span className={cn("zen-truncate", active && "zen-font-medium")}>{t.label}</span>
                  {t.dirty && (
                    <>
                      <span className="zen-h-1.5 zen-w-1.5 zen-shrink-0 zen-rounded-full zen-bg-zen-primary" aria-hidden="true" />
                      <span className="zen-sr-only">{loc.t("documentTabs.unsaved")}</span>
                    </>
                  )}
                </button>
                {onPinChange && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={loc.t(t.pinned ? "documentTabs.unpinTab" : "documentTabs.pinTab", { label: t.label })}
                    aria-pressed={t.pinned ? "true" : "false"}
                    title={loc.t(t.pinned ? "documentTabs.unpin" : "documentTabs.pin")}
                    className={cn(iconButton, t.pinned ? "zen-text-zen-primary" : "zen-opacity-0 group-hover:zen-opacity-100 group-focus-within:zen-opacity-100")}
                    onClick={() => onPinChange(t.id, !t.pinned)}
                  >
                    <Icon name="pin" size={12} />
                  </button>
                )}
                {onClose && !t.pinned && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={loc.t("documentTabs.closeTab", { label: t.label })}
                    title={closeLabel?.(t) ?? loc.t("documentTabs.close")}
                    className={cn(iconButton, !active && !t.dirty && "zen-opacity-0 group-hover:zen-opacity-100 group-focus-within:zen-opacity-100")}
                    onClick={() => close(t)}
                  >
                    <Icon name="x" size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {overflowing && (
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              aria-label={allTabsLabel ?? loc.t("documentTabs.allOpenDocumentsCount", { count: tabs.length })}
              title={allTabsLabel ?? loc.t("documentTabs.allOpenDocuments")}
              className={cn(iconButton, "zen-h-auto zen-w-8 zen-rounded-none zen-border-l zen-border-zen-border")}
            >
              <Icon name="chevron-down" size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {tabs.map((t) => (
                <DropdownMenuItem key={t.id} onSelect={() => onSelect(t.id)}>
                  <span className={cn("zen-truncate", t.id === activeId && "zen-font-medium")}>
                    {t.description ? `${t.description} · ` : ""}{t.label}{t.dirty ? " •" : ""}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  },
);
DocumentTabs.displayName = "DocumentTabs";
