import {
  type Component,
  type JSX,
  Show,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { Portal } from "solid-js/web";
import { PivotFilterVirtualList } from "./internal/pivot-filter-virtual-list";
import { Loading } from "../loading/loading";
import type {
  PivotFilterOptionsBody,
  PivotFilterSelection,
  SortDirection,
} from "@algorisys/zen-ui-core/pivot";
import { isFilterActive } from "@algorisys/zen-ui-core/pivot";
import { usePivotFilterOptions } from "./internal/use-pivot-filter-options";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

export interface PivotFilterMenuProps {
  columnKey: string;
  label: string;
  selection: () => PivotFilterSelection | undefined;
  sortDirection?: SortDirection;
  formatValue?: (value: string) => string;
  onChange: (selection: PivotFilterSelection | null) => void;
  onSort?: (direction: SortDirection | null) => void;
  loadOptions?: (
    columnKey: string,
    optionSearch: string,
    pagination?: { offset: number; limit: number },
  ) => Promise<PivotFilterOptionsBody>;
  triggerClass?: string;
  triggerChildren?: JSX.Element;
  singleSelect?: boolean;
}

const PANEL_WIDTH_PX = 288;
const PANEL_VIEWPORT_MARGIN_PX = 8;
const PANEL_ANCHOR_GAP_PX = 4;

function getFixedTopChromeBottom(): number {
  if (typeof document === "undefined") {
    return 0;
  }
  const header = document.querySelector("header");
  if (header instanceof HTMLElement) {
    return header.getBoundingClientRect().bottom;
  }
  return 0;
}

function isFilterAnchorVisible(anchor: DOMRect): boolean {
  const topChromeBottom = getFixedTopChromeBottom();
  if (topChromeBottom > 0 && anchor.bottom <= topChromeBottom) {
    return false;
  }
  if (anchor.top >= window.innerHeight) {
    return false;
  }
  return true;
}

export const PivotFilterMenu: Component<PivotFilterMenuProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const [position, setPosition] = createSignal({ top: 0, left: 0 });
  let buttonRef: HTMLButtonElement | undefined;
  let panelRef: HTMLDivElement | undefined;
  let searchInputRef: HTMLInputElement | undefined;

  const {
    loading,
    loadingWindow,
    optionsWindows,
    totalCount,
    handleVisibleRange,
    scheduleFetch,
    openPanelFetch,
    loadError,
  } = usePivotFilterOptions({
    // Getters, not values. Read plainly, these capture whatever columnKey and
    // loadOptions were at setup — so a chip reused for a different field would
    // keep fetching the old one's members. Reading through props is the whole
    // contract of a Solid props object.
    get columnKey() {
      return props.columnKey;
    },
    isOpen: open,
    getOptionSearch: search,
    get loadOptions() {
      return props.loadOptions;
    },
  });

  const filterActive = () => isFilterActive(props.selection());
  const formatValue = (value: string) =>
    props.formatValue ? props.formatValue(value) : value;

  function applySort(direction: SortDirection) {
    props.onSort?.(props.sortDirection === direction ? null : direction);
    setOpen(false);
  }

  function clampedLeft(anchorLeft: number): number {
    const maxLeft =
      window.innerWidth - PANEL_WIDTH_PX - PANEL_VIEWPORT_MARGIN_PX;
    return Math.min(Math.max(anchorLeft, PANEL_VIEWPORT_MARGIN_PX), maxLeft);
  }

  function updatePosition() {
    if (!buttonRef) {
      return;
    }
    const anchor = buttonRef.getBoundingClientRect();
    const minTop = getFixedTopChromeBottom() + PANEL_VIEWPORT_MARGIN_PX;
    let top = anchor.bottom + PANEL_ANCHOR_GAP_PX;
    const panelHeight = panelRef?.offsetHeight ?? 0;
    const overflowsBottom =
      panelHeight > 0 &&
      top + panelHeight > window.innerHeight - PANEL_VIEWPORT_MARGIN_PX;
    if (overflowsBottom) {
      top = Math.max(
        minTop,
        anchor.top - PANEL_ANCHOR_GAP_PX - panelHeight,
      );
    }
    setPosition({ top, left: clampedLeft(anchor.left) });
  }

  function openPanel() {
    if (!buttonRef) {
      return;
    }
    const anchor = buttonRef.getBoundingClientRect();
    setPosition({
      top: anchor.bottom + PANEL_ANCHOR_GAP_PX,
      left: clampedLeft(anchor.left),
    });
    const sel = props.selection();
    const initialSearch = sel?.kind === "all" ? (sel.optionSearch ?? "") : "";
    setSearch(initialSearch);
    setOpen(true);
    openPanelFetch();
  }

  function toggleValue(value: string) {
    if (props.singleSelect) {
      const sel = props.selection();
      const current = sel?.kind === "include" ? sel.values : [];
      if (current.length === 1 && current[0] === value) {
        props.onChange(null);
      } else {
        props.onChange({ kind: "include", values: [value] });
      }
      return;
    }

    const sel = props.selection();
    if (!sel || sel.kind === "all") {
      const exclude = sel?.kind === "all" ? sel.exclude : [];
      const nextExclude = exclude.includes(value)
        ? exclude.filter((current) => current !== value)
        : [...exclude, value];
      
      if (nextExclude.length === 0 && (!sel || sel.kind !== "all" || !sel.optionSearch)) {
         props.onChange(null);
         return;
      }
      
      props.onChange({
        kind: "all",
        ...(sel?.kind === "all" && sel.optionSearch ? { optionSearch: sel.optionSearch } : {}),
        exclude: nextExclude,
      });
      return;
    }
    const current = sel.kind === "include" ? sel.values : [];
    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];
    props.onChange({ kind: "include", values: next });
  }

  // Fully checked only when every value in the current all-mode scope is kept.
  const selectAllChecked = () => {
    const sel = props.selection();
    if (!sel) return true;
    return sel.kind === "all" && sel.exclude.length === 0;
  };
  const selectAllPartial = () => {
    const sel = props.selection();
    if (!sel) return false;
    if (sel.kind === "include") {
      return sel.values.length > 0;
    }
    return sel.exclude.length > 0;
  };

  function toggleSelectAll() {
    const sel = props.selection();
    const currentSearch = search().trim();
    const willClear =
      !sel ||
      (sel.kind === "all" &&
      (sel.optionSearch ?? "") === currentSearch &&
      sel.exclude.length === 0);
      
    if (willClear) {
      props.onChange({ kind: "include", values: [] });
      return;
    }
    
    if (currentSearch) {
      props.onChange({
        kind: "all",
        optionSearch: currentSearch,
        exclude: [],
      });
    } else {
      props.onChange(null);
    }
  }

  createEffect(() => {
    if (!open()) {
      return;
    }
    filterActive();
    loading();
    loadingWindow();
    totalCount();
    optionsWindows();
    updatePosition();
  });

  createEffect(() => {
    if (!open()) {
      return;
    }
    searchInputRef?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef?.contains(target) || panelRef?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef?.focus();
      }
    };
    const handleScrollOrResize = () => {
      if (!buttonRef) {
        return;
      }
      const anchor = buttonRef.getBoundingClientRect();
      if (!isFilterAnchorVisible(anchor)) {
        setOpen(false);
        return;
      }
      updatePosition();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    onCleanup(() => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    });
  });

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        class={props.triggerClass ?? cn(
          "zen-inline-flex zen-min-h-11 zen-min-w-11 zen-cursor-pointer zen-items-center zen-justify-center zen-gap-1 zen-rounded-sm zen-p-2 zen-text-zen-muted-fg zen-transition-colors hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50",
          (filterActive() || props.sortDirection) && "zen-text-zen-primary",
        )}
        aria-label={`Sort or filter ${props.label}`}
        aria-haspopup="dialog"
        aria-expanded={open()}
        onClick={(event) => {
          event.stopPropagation();
          if (open()) {
            setOpen(false);
          } else {
            openPanel();
          }
        }}
      >
        <Show when={props.triggerChildren} fallback={
          <>
            <Icon name="chevron-down" class="zen-size-3.5" aria-hidden="true" />
            <Show when={filterActive()}>
              <Icon name="filter" class="zen-size-3.5" aria-hidden="true" />
            </Show>
            <Show when={props.sortDirection === "asc"}>
              <Icon name="arrow-up" class="zen-size-3" aria-hidden="true" />
            </Show>
            <Show when={props.sortDirection === "desc"}>
              <Icon name="arrow-down" class="zen-size-3" aria-hidden="true" />
            </Show>
          </>
        }>
          {props.triggerChildren}
        </Show>
      </button>
      <Show when={open()}>
        <Portal>
          <div
            ref={panelRef}
            role="dialog"
            aria-label={`${props.label} filter`}
            class="zen-fixed zen-z-50 zen-flex zen-w-72 zen-flex-col zen-rounded-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-md"
            style={{
              top: `${position().top}px`,
              left: `${position().left}px`,
            }}
          >
            <Show when={props.onSort}>
              <div class="zen-flex zen-flex-col zen-border-b zen-border-zen-border zen-p-1">
                <button
                  type="button"
                  class={cn(
                    "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50",
                    props.sortDirection === "asc" && "zen-font-medium zen-text-zen-primary",
                  )}
                  onClick={() => {
                    applySort("asc");
                  }}
                >
                  <Icon name="arrow-up" class="zen-size-3.5" aria-hidden="true" />
                  <span>Sort ascending</span>
                  <Show when={props.sortDirection === "asc"}>
                    <Icon name="check" class="zen-ml-auto zen-size-3.5" aria-hidden="true" />
                  </Show>
                </button>
                <button
                  type="button"
                  class={cn(
                    "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50",
                    props.sortDirection === "desc" &&
                      "zen-font-medium zen-text-zen-primary",
                  )}
                  onClick={() => {
                    applySort("desc");
                  }}
                >
                  <Icon name="arrow-down" class="zen-size-3.5" aria-hidden="true" />
                  <span>Sort descending</span>
                  <Show when={props.sortDirection === "desc"}>
                    <Icon name="check" class="zen-ml-auto zen-size-3.5" aria-hidden="true" />
                  </Show>
                </button>
              </div>
            </Show>
            <div class="zen-border-b zen-border-zen-border zen-px-3 zen-py-2">
              <input
                ref={searchInputRef}
                type="text"
                class="zen-h-7 zen-w-full zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-font-normal placeholder:zen-text-zen-muted-fg"
                placeholder={`Search ${props.label.toLowerCase()}…`}
                aria-label={`Search ${props.label.toLowerCase()} values`}
                value={search()}
                onInput={(event) => {
                  setSearch(event.currentTarget.value);
                  scheduleFetch(event.currentTarget.value);
                }}
              />
            </div>
            <Show when={totalCount() > 0 && !props.singleSelect}>
              <div class="zen-border-b zen-border-zen-border zen-p-1">
                <button
                  type="button"
                  class="zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-font-medium zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50"
                  onClick={toggleSelectAll}
                >
                  <span
                    class={cn(
                      "zen-flex zen-size-4 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-sm zen-border zen-border-zen-border zen-text-zen-primary-fg",
                      (selectAllChecked() || selectAllPartial()) &&
                        "zen-border-zen-primary zen-bg-zen-primary",
                    )}
                    aria-hidden="true"
                  >
                    <Show when={selectAllChecked()}>
                      <Icon name="check" class="zen-size-3" />
                    </Show>
                    <Show when={!selectAllChecked() && selectAllPartial()}>
                      <Icon name="minus" class="zen-size-3" />
                    </Show>
                  </span>
                  <span>Select all</span>
                </button>
              </div>
            </Show>
            <Show when={loading() && totalCount() === 0}>
              <div
                role="listbox"
                aria-label={`${props.label} values`}
                aria-busy="true"
                class="zen-max-h-64 zen-overflow-y-auto zen-p-1"
              >
                <div class="zen-flex zen-flex-col zen-items-center zen-justify-center zen-gap-2 zen-px-2 zen-py-6">
                  <Loading size="sm" label="Loading values…" />
                </div>
              </div>
            </Show>
            {/* A failed fetch is NOT an empty result. loadError was computed and
                dropped before it reached here, so a network error rendered as
                "No matching values" — which sends someone looking for data that
                is not missing. */}
            <Show when={!loading() && loadError()}>
              <div class="zen-flex zen-flex-col zen-items-start zen-gap-1 zen-px-2 zen-py-3" role="alert">
                <p class="zen-m-0 zen-text-sm zen-text-zen-error">Could not load values.</p>
                <button
                  type="button"
                  class="zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline"
                  onClick={() => openPanelFetch()}
                >
                  Try again
                </button>
              </div>
            </Show>
            <Show when={!loading() && !loadError() && totalCount() === 0}>
              <div
                role="listbox"
                aria-label={`${props.label} values`}
                class="zen-max-h-64 zen-overflow-y-auto zen-p-1"
              >
                <p class="zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg">
                  No matching values
                </p>
              </div>
            </Show>
            <Show when={totalCount() > 0 ? totalCount() : false} keyed>
              {(count) => (
                <PivotFilterVirtualList
                  label={props.label}
                  totalCount={count}
                  optionsWindows={optionsWindows()}
                  loadingWindow={loadingWindow()}
                  selection={props.selection}
                  formatValue={formatValue}
                  onToggleValue={toggleValue}
                  onVisibleRange={handleVisibleRange}
                  singleSelect={props.singleSelect}
                />
              )}
            </Show>
            <Show when={filterActive()}>
              <div class="zen-border-t zen-border-zen-border zen-p-1">
                <button
                  type="button"
                  class="zen-w-full zen-cursor-pointer zen-rounded-md zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-text-zen-muted-fg zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50"
                  onClick={() => {
                    props.onChange(null);
                  }}
                >
                  Clear filter
                </button>
              </div>
            </Show>
          </div>
        </Portal>
      </Show>
    </>
  );
};
