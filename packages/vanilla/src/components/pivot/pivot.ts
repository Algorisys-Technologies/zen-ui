import {
  availableFields as availableFieldsIn,
  createEmptyLayout,
  defaultAggregationForField,
  describeFilterSelection,
  describeMove,
  fieldLabel,
  hasActiveFilters,
  isFilterActive,
  isLayoutRenderable,
  isValueSelected,
  moveFieldToZone,
  PIVOT_ZONES,
  updateValueAggregation,
  zoneLabel,
  type PivotAggregation,
  type PivotField,
  type PivotFilterOptionsBody,
  type PivotFilterSelection,
  type PivotFilters,
  type PivotLayout,
  type PivotMembersRequest,
  type PivotMembersResult,
  type PivotZone,
} from "@algorisys/zen-ui-core/pivot";
import {
  alignWindowStart,
  pickNearestWindowStart,
  pivotFilterMissingWindowStarts,
  pivotFilterWindowValueAt,
  prunePivotFilterWindows,
  PIVOT_FILTER_LEADING_OVERSCAN_SLACK,
  VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS,
  VIRTUAL_SCROLL_WINDOW_PAGE_SIZE,
  type PivotFilterOptionsWindow,
} from "@algorisys/zen-ui-core/virtual-window";
import { cn } from "../../lib/cn";
import {
  Disposer,
  toNodes,
  type AnyZenComponent,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "../alert/alert";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { DropdownMenu, type DropdownMenuItemSpec } from "../dropdown-menu/dropdown-menu";
import { Icon, type IconName } from "../icon/icon";
import { Input } from "../form/input/input";
import { Loading } from "../loading/loading";
import { Popover } from "../popover/popover";
import {
  VirtualizedItems,
  type VirtualizedItemsSparseProps,
} from "../listbox/virtualized-items";

/**
 * Pivot — drag fields into zones, press View Data, get a layout; then a grid that
 * windows in both directions.
 *
 * The model is @algorisys/zen-ui-core/pivot and the window maths is
 * @algorisys/zen-ui-core/virtual-window — the SAME code React and Solid call, so
 * the three bindings cannot disagree about what a drop means or which page to
 * fetch. What differs is only the renderer: React drags with @dnd-kit, Solid with
 * @thisbeyond/solid-dnd, and this binding with native HTML5 drag-and-drop. No drag
 * library, no new runtime dependency.
 *
 * The public surface mirrors React's: PivotWorkbench, PivotGrid, PivotDropZone,
 * PivotFieldChip, PivotFilterMenu. `class` for `className`, `children` as a Child,
 * and each factory returns the `{ el, update, destroy }` handle.
 */

/* -------------------------------------------------------------------------- */
/* small DOM helper                                                            */
/* -------------------------------------------------------------------------- */

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

/** Set an element's box to a fixed width in px (width/min/max together). */
function fixWidth(el: HTMLElement, px: number): void {
  el.style.width = `${px}px`;
  el.style.minWidth = `${px}px`;
  el.style.maxWidth = `${px}px`;
}

/** Set an element's box to a fixed height in px (height/min/max together). */
function fixHeight(el: HTMLElement, px: number): void {
  el.style.height = `${px}px`;
  el.style.minHeight = `${px}px`;
  el.style.maxHeight = `${px}px`;
}

/* -------------------------------------------------------------------------- */
/* PivotDropZone                                                               */
/* -------------------------------------------------------------------------- */

export interface PivotDropZoneProps {
  id: PivotZone;
  title: string;
  icon?: IconName;
  hideTitle?: boolean;
  class?: string;
  horizontal?: boolean;
  children?: Child;
  isEmpty?: boolean;
}

const DROP_ZONE_BASE =
  "zen-min-h-5 zen-min-w-5 zen-border zen-border-zen-border zen-bg-zen-muted/30 zen-p-2 zen-align-top zen-transition-colors";
const DROP_ZONE_OVER =
  "zen-border zen-border-dashed zen-border-zen-primary/40 zen-bg-zen-muted";

/**
 * PivotDropZone — one of the four bins a field can live in.
 *
 * It owns the DOM and the drop-target affordance (it calls `preventDefault` on
 * dragover, which is what makes an element droppable at all, and paints the
 * dashed hover state). The actual move is wired by the workbench, which listens
 * for `drop` on this element and reads the model — never parsing a zone out of a
 * DOM id, the bug the core model's comments warn against.
 */
export function PivotDropZone(props: PivotDropZoneProps): ZenComponent<PivotDropZoneProps> {
  let current: PivotDropZoneProps = { ...props };
  const disposer = new Disposer();

  const root = h("div");
  const body = h("div");
  let iconComp: AnyZenComponent | null = null;

  const setOver = (over: boolean) => {
    root.className = cn(DROP_ZONE_BASE, current.class, over && DROP_ZONE_OVER);
  };

  const render = () => {
    iconComp?.destroy();
    iconComp = null;
    root.dataset.zone = current.id;
    setOver(false);
    root.replaceChildren();

    if (!current.hideTitle) {
      const head = h("div", "zen-mb-1.5 zen-flex zen-items-center zen-justify-between");
      const titleWrap = h(
        "div",
        "zen-flex zen-select-none zen-items-center zen-gap-2 zen-text-sm zen-font-semibold zen-text-zen-foreground",
      );
      if (current.icon) {
        iconComp = Icon({ name: current.icon, class: "zen-h-4 zen-w-4" });
        titleWrap.append(iconComp.el);
      }
      titleWrap.append(document.createTextNode(current.title));
      head.append(titleWrap);
      root.append(head);
    }

    body.className = cn(
      "zen-flex zen-min-h-0 zen-min-w-0 zen-flex-1 zen-content-start zen-gap-1.5",
      current.horizontal
        ? "zen-flex-row zen-flex-wrap zen-items-center"
        : "zen-flex-col zen-items-stretch",
    );
    body.replaceChildren(...toNodes(current.children));
    if (current.isEmpty) {
      const hint = h(
        "div",
        "zen-pointer-events-none zen-select-none zen-py-0.5 zen-text-xs zen-italic zen-text-zen-muted-fg/50",
      );
      hint.textContent = "Drop fields here";
      body.append(hint);
    }
    root.append(body);
  };

  // dragenter-count guard: dragleave also fires when the pointer crosses onto a
  // child, so a naive toggle flickers. Track whether the pointer is still inside.
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    setOver(true);
  };
  const onDragLeave = (e: DragEvent) => {
    if (!root.contains(e.relatedTarget as Node)) setOver(false);
  };
  const onDrop = () => setOver(false);
  root.addEventListener("dragover", onDragOver);
  root.addEventListener("dragleave", onDragLeave);
  root.addEventListener("drop", onDrop);
  disposer.add(() => {
    root.removeEventListener("dragover", onDragOver);
    root.removeEventListener("dragleave", onDragLeave);
    root.removeEventListener("drop", onDrop);
  });
  disposer.add(() => iconComp?.destroy());

  render();

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      root.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* PivotFilterMenu                                                             */
/* -------------------------------------------------------------------------- */

export interface PivotFilterMenuProps {
  columnKey: string;
  label: string;
  selection?: PivotFilterSelection;
  formatValue?: (value: string) => string;
  onChange: (selection: PivotFilterSelection | null) => void;
  loadOptions?: (
    columnKey: string,
    optionSearch: string,
    pagination?: { offset: number; limit: number },
  ) => Promise<PivotFilterOptionsBody>;
  triggerClass?: string;
  triggerChildren?: Child;
  singleSelect?: boolean;
}

/**
 * The state machine that pages options in as a list scrolls and prunes the ones
 * that scrolled away. The index arithmetic — alignment, which pages are missing,
 * what to prune, which to fetch first — is all in core's virtual-window, shared
 * with the other bindings. What is left here is the part that cannot be shared:
 * the debounce, the sequence guard against an overtaken fetch, and the "same page
 * never in flight twice" set. A hand-written port of React's
 * use-windowed-option-pages.
 */
interface OptionPages {
  readonly optionsWindows: PivotFilterOptionsWindow[];
  readonly totalCount: number;
  readonly loading: boolean;
  readonly loadError: boolean;
  handleVisibleRange(minIndex: number, maxIndex: number): void;
  openPanelFetch(): void;
  setActive(active: boolean): void;
  setSearch(search: string): void;
  destroy(): void;
}

function createOptionPages(config: {
  pageSize: number;
  loadPage: (offset: number, limit: number, search: string) => Promise<PivotFilterOptionsBody>;
  onUpdate: () => void;
}): OptionPages {
  let optionsWindows: PivotFilterOptionsWindow[] = [];
  let totalCount = 0;
  let loading = false;
  let loadError = false;
  let active = false;
  let search = "";

  let seq = 0;
  const inFlight = new Set<number>();
  let range = { minIndex: 0, maxIndex: 0 };
  let debounce: ReturnType<typeof setTimeout> | null = null;
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  const emit = () => config.onUpdate();

  const reset = () => {
    seq += 1; // orphan anything in flight
    inFlight.clear();
    optionsWindows = [];
    totalCount = 0;
    loadError = false;
  };

  const fetchWindow = async (start: number, isFirstPage: boolean) => {
    if (inFlight.has(start)) return;
    inFlight.add(start);
    const mySeq = seq;
    if (isFirstPage) {
      loading = true;
      emit();
    }
    try {
      const res = await config.loadPage(start, config.pageSize, search);
      // Overtaken: the search changed, or the panel closed and reopened. Painting
      // this would show the previous question's answers.
      if (mySeq !== seq) return;
      loadError = false;
      totalCount = res.total;
      const next = optionsWindows
        .filter((w) => w.startIndex !== start)
        .concat({ startIndex: start, values: res.values });
      next.sort((a, b) => a.startIndex - b.startIndex);
      // Windows are memory: a long list scrolled end to end would otherwise hold
      // every page it ever showed.
      optionsWindows = prunePivotFilterWindows(next, range.minIndex, range.maxIndex, config.pageSize);
    } catch {
      if (mySeq !== seq) return;
      loadError = true;
    } finally {
      inFlight.delete(start);
      if (mySeq === seq && isFirstPage) loading = false;
      emit();
    }
  };

  const fetchMissing = () => {
    if (!active) return;
    const { minIndex, maxIndex } = range;
    const missing = pivotFilterMissingWindowStarts(
      optionsWindows,
      minIndex,
      maxIndex,
      config.pageSize,
    ).filter((s) => !inFlight.has(s));
    if (!missing.length) return;
    // Nearest to what the user is actually looking at, not first in the array.
    const mid = (minIndex + maxIndex) / 2;
    const next = pickNearestWindowStart(missing, mid, config.pageSize);
    if (next !== undefined) void fetchWindow(next, optionsWindows.length === 0);
  };

  const scheduleFetch = () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(fetchMissing, VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS);
  };

  return {
    get optionsWindows() {
      return optionsWindows;
    },
    get totalCount() {
      return totalCount;
    },
    get loading() {
      return loading;
    },
    get loadError() {
      return loadError;
    },
    handleVisibleRange(minIndex, maxIndex) {
      // Slack, so a one-row scroll does not re-fetch the page you are on.
      range = {
        minIndex: Math.max(0, minIndex - PIVOT_FILTER_LEADING_OVERSCAN_SLACK),
        maxIndex: maxIndex + PIVOT_FILTER_LEADING_OVERSCAN_SLACK,
      };
      scheduleFetch();
    },
    openPanelFetch() {
      reset();
      search = "";
      range = { minIndex: 0, maxIndex: config.pageSize - 1 };
      void fetchWindow(alignWindowStart(0, config.pageSize), true);
    },
    setActive(next) {
      active = next;
    },
    setSearch(next) {
      search = next;
      if (!active) return;
      reset();
      emit();
      // A new question needs new answers; debounce so a keystroke run does not
      // fire a fetch per character.
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        range = { minIndex: 0, maxIndex: config.pageSize - 1 };
        void fetchWindow(0, true);
      }, VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS);
    },
    destroy() {
      seq += 1;
      inFlight.clear();
      if (debounce) clearTimeout(debounce);
      if (searchTimer) clearTimeout(searchTimer);
    },
  };
}

/**
 * PivotFilterMenu — pick values for one field, paged in from the server.
 *
 * Built on this binding's Popover rather than a hand-positioned panel: it brings
 * placement, collision flipping, Escape, click-outside and focus return with it.
 * The value list is windowed by VirtualizedItems in its sparse mode.
 *
 * Selection is held locally and mirrored out through `onChange`, so toggling a
 * value repaints the list in place instead of tearing down the open popover.
 */
export function PivotFilterMenu(props: PivotFilterMenuProps): ZenComponent<PivotFilterMenuProps> {
  let current: PivotFilterMenuProps = { ...props };
  let selection: PivotFilterSelection | undefined = current.selection;
  const disposer = new Disposer();

  const triggerClassFor = (active: boolean): string =>
    cn(
      "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-transition-colors",
      active
        ? "zen-text-zen-primary hover:zen-bg-zen-muted"
        : "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
      current.triggerClass,
    );

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.dataset.noDrag = "";
  trigger.setAttribute("aria-label", `Filter ${current.label}`);
  const triggerIcon = Icon({ name: "chevron-down", class: "zen-h-3.5 zen-w-3.5" });
  disposer.add(() => triggerIcon.destroy());
  if (current.triggerChildren) trigger.append(...toNodes(current.triggerChildren));
  else trigger.append(triggerIcon.el);
  const updateTrigger = () => {
    trigger.className = triggerClassFor(isFilterActive(selection));
  };
  updateTrigger();

  /* ---- the panel (persistent; only the body swaps as pages load) ---- */
  const panel = h("div", "zen-flex zen-flex-col zen-gap-2");

  const searchInput = Input({
    placeholder: `Search ${current.label}`,
    "aria-label": `Search ${current.label} values`,
    class: "zen-h-8",
    onInput: () => pages.setSearch(searchInput.el.value),
  });
  disposer.add(() => searchInput.destroy());

  const bodyEl = h("div");
  const footerEl = h("div");

  let list: ZenComponent<VirtualizedItemsSparseProps<string>> | null = null;

  const renderOptionRow = ({ item }: { item: string | undefined }): Child => {
    if (item === undefined) {
      // A skeleton, not a blank: an empty row reads as "no value" rather than "not yet".
      const row = h("div", "zen-flex zen-h-full zen-w-full zen-items-center zen-gap-2 zen-px-2");
      row.setAttribute("aria-hidden", "true");
      row.append(
        h(
          "div",
          "zen-size-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-muted/60 motion-safe:zen-animate-pulse",
        ),
        h("div", "zen-h-3 zen-w-3/4 zen-rounded-zen-sm zen-bg-zen-muted motion-safe:zen-animate-pulse"),
      );
      return row;
    }
    const selected = isValueSelected(selection, item);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", String(selected));
    btn.className = cn(
      "zen-flex zen-h-full zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-px-2 zen-text-left zen-text-sm zen-text-zen-foreground zen-transition-colors",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50",
    );
    btn.addEventListener("click", () => toggle(item));
    const indicator = h(
      "span",
      cn(
        "zen-flex zen-size-4 zen-shrink-0 zen-items-center zen-justify-center zen-border zen-border-zen-border",
        // A square box promises you can tick more than one; a radio does not lie
        // about a single-value menu.
        current.singleSelect ? "zen-rounded-full" : "zen-rounded-zen-sm",
        selected && "zen-bg-zen-primary zen-text-zen-primary-fg",
      ),
    );
    indicator.setAttribute("aria-hidden", "true");
    indicator.textContent = selected ? "✓" : "";
    const text = h("span", "zen-truncate");
    text.textContent = current.formatValue ? current.formatValue(item) : item;
    btn.append(indicator, text);
    return btn;
  };

  const loadingNode = (): HTMLElement => {
    const wrap = h("div", "zen-flex zen-items-center zen-justify-center zen-py-6");
    wrap.setAttribute("aria-busy", "true");
    const spinner = Loading({ size: "sm", label: "Loading values…" });
    wrap.append(spinner.el);
    return wrap;
  };

  const errorNode = (): HTMLElement => {
    // A failed fetch is NOT an empty result — saying "No matching values" sends
    // people looking for data that is not missing.
    const wrap = h("div", "zen-flex zen-flex-col zen-items-start zen-gap-1 zen-px-2 zen-py-3");
    wrap.setAttribute("role", "alert");
    const p = h("p", "zen-m-0 zen-text-sm zen-text-zen-error");
    p.textContent = "Could not load values.";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className =
      "zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline";
    retry.textContent = "Try again";
    retry.addEventListener("click", () => pages.openPanelFetch());
    wrap.append(p, retry);
    return wrap;
  };

  const emptyNode = (): HTMLElement => {
    const p = h("p", "zen-m-0 zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg");
    p.textContent = "No matching values";
    return p;
  };

  const renderFooter = () => {
    footerEl.replaceChildren();
    if (!isFilterActive(selection)) return;
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className =
      "zen-cursor-pointer zen-self-start zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline";
    clear.textContent = "Clear filter";
    clear.addEventListener("click", () => {
      selection = undefined;
      current.onChange(null);
      updateTrigger();
      renderBody();
      renderFooter();
    });
    footerEl.append(clear);
  };

  const renderBody = () => {
    if (pages.loading) {
      list?.destroy();
      list = null;
      bodyEl.replaceChildren(loadingNode());
      return;
    }
    if (pages.loadError) {
      list?.destroy();
      list = null;
      bodyEl.replaceChildren(errorNode());
      return;
    }
    if (pages.totalCount === 0) {
      list?.destroy();
      list = null;
      bodyEl.replaceChildren(emptyNode());
      return;
    }
    if (!list) {
      list = VirtualizedItems<string>({
        totalCount: pages.totalCount,
        // Sparse by global index: undefined means "not loaded", not "no value".
        getItem: (index) => pivotFilterWindowValueAt(pages.optionsWindows, index),
        onVisibleRange: (min, max) => pages.handleVisibleRange(min, max),
        estimateSize: 36,
        maxHeight: 256,
        overscan: 4,
        class: "zen-p-1",
        children: renderOptionRow,
      });
      const ul = document.createElement("ul");
      ul.setAttribute("role", "listbox");
      ul.setAttribute("aria-label", `${current.label} values`);
      ul.className = "zen-m-0 zen-list-none zen-p-0";
      ul.append(list.el);
      bodyEl.replaceChildren(ul);
    } else {
      // Re-read getItem for the new windows / selection under the same viewport.
      list.update({ totalCount: pages.totalCount });
    }
  };

  const pages = createOptionPages({
    pageSize: VIRTUAL_SCROLL_WINDOW_PAGE_SIZE,
    loadPage: async (offset, limit, search) => {
      if (!current.loadOptions) return { values: [], hasMore: false, total: 0 };
      const res = await current.loadOptions(current.columnKey, search, { offset, limit });
      return { values: res.values, hasMore: res.hasMore, total: res.total ?? res.values.length };
    },
    onUpdate: () => renderBody(),
  });
  disposer.add(() => pages.destroy());
  disposer.add(() => list?.destroy());

  const toggle = (value: string) => {
    let next: PivotFilterSelection | null;
    if (current.singleSelect) {
      next = { kind: "include", values: [value] };
    } else if (!selection || selection.kind === "all") {
      // No filter means everything is selected, so the first click is a DESELECT.
      const exclude = selection?.kind === "all" ? selection.exclude : [];
      const list = exclude.includes(value) ? exclude.filter((v) => v !== value) : [...exclude, value];
      if (list.length === 0) next = null;
      else
        next = {
          kind: "all",
          exclude: list,
          ...(selection?.kind === "all" && selection.optionSearch
            ? { optionSearch: selection.optionSearch }
            : {}),
        };
    } else {
      const values = selection.values.includes(value)
        ? selection.values.filter((v) => v !== value)
        : [...selection.values, value];
      next = values.length === 0 ? null : { kind: "include", values };
    }
    selection = next ?? undefined;
    current.onChange(next);
    updateTrigger();
    renderBody();
    renderFooter();
  };

  panel.append(searchInput.el, bodyEl, footerEl);

  const popover = Popover({
    trigger,
    children: panel,
    align: "start",
    class: "zen-w-72 zen-p-2",
    onOpenChange: (open) => {
      pages.setActive(open);
      if (open) {
        searchInput.el.value = "";
        pages.openPanelFetch();
        renderBody();
        renderFooter();
        // Autofocus the search field, matching React's `autoFocus`.
        requestAnimationFrame(() => searchInput.el.focus());
      }
    },
  });
  disposer.add(() => popover.destroy());

  renderBody();
  renderFooter();

  return {
    el: popover.el,
    update(next) {
      current = { ...current, ...next };
      if (next.selection !== undefined) selection = next.selection;
      updateTrigger();
      renderBody();
      renderFooter();
    },
    destroy() {
      disposer.dispose();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* PivotFieldChip                                                              */
/* -------------------------------------------------------------------------- */

export interface PivotFieldChipProps {
  fieldKey: string;
  fields: PivotField[];
  hasActiveFilter?: boolean;
  selection?: PivotFilterSelection;
  filters?: PivotFilters;
  loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
  onSelectionChange?: (selection: PivotFilterSelection | null) => void;
  onRemove?: () => void;
  zone?: PivotZone;
  aggregation?: PivotAggregation;
  onAggregationChange?: (aggregation: PivotAggregation) => void;
  /**
   * Move this field to another zone. THE KEYBOARD PATH: the ⋮ handle opens a menu
   * of zones, WAI-ARIA's asked-for alternative to a drag rather than a keyboard
   * mime of one.
   */
  onMoveToZone?: (zone: PivotZone) => void;
  singleSelect?: boolean;
  disabled?: boolean;
  /** Present for API parity with React; the drag handle is the wrapper here. */
  dragHandleProps?: Record<string, unknown>;
}

const AGGREGATIONS: readonly PivotAggregation[] = ["sum", "count", "avg", "min", "max"];

/**
 * PivotFieldChip — one field, in one zone. The label, filter summary and move
 * menu wording all come from core, so the bindings cannot describe the same state
 * differently.
 */
export function PivotFieldChip(props: PivotFieldChipProps): ZenComponent<PivotFieldChipProps> {
  let current: PivotFieldChipProps = { ...props };
  const disposer = new Disposer();
  let parts: AnyZenComponent[] = [];

  const wrapper = h("div", "zen-group zen-relative zen-flex zen-max-w-full zen-items-center zen-gap-1");

  const track = <T extends AnyZenComponent>(c: T): T => {
    parts.push(c);
    return c;
  };

  const render = () => {
    for (const p of parts) p.destroy();
    parts = [];

    const {
      fieldKey,
      fields,
      hasActiveFilter,
      selection,
      filters,
      loadMembers,
      onSelectionChange,
      onRemove,
      zone,
      aggregation,
      onAggregationChange,
      onMoveToZone,
      singleSelect,
      disabled,
    } = current;

    const label = fieldLabel(fields, fieldKey);
    const field = fields.find((f) => f.key === fieldKey);
    const isMeasure = field?.type === "measure";
    const filtered = hasActiveFilter ?? isFilterActive(selection);
    const summary = describeFilterSelection(selection);

    const children: Child[] = [];

    /* ⋮ move menu (keyboard path) or a decorative dot when no move handler */
    if (onMoveToZone) {
      const menuBtn = document.createElement("button");
      menuBtn.type = "button";
      menuBtn.dataset.noDrag = "";
      menuBtn.setAttribute("aria-label", `Move ${label}`);
      if (disabled) menuBtn.disabled = true;
      menuBtn.className =
        "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
      menuBtn.append(track(Icon({ name: "more-vertical", class: "zen-h-3 zen-w-3" })).el);

      const items: DropdownMenuItemSpec[] = [{ type: "label", label: `Move ${label} to` }];
      for (const z of PIVOT_ZONES) {
        if (z === "available" || z === zone) continue;
        items.push({ label: zoneLabel(z), onSelect: () => onMoveToZone(z) });
      }
      if (zone !== "available") {
        items.push({ type: "separator" });
        items.push({ label: "Remove from layout", onSelect: () => onMoveToZone("available") });
      }
      const menu = track(DropdownMenu({ trigger: menuBtn, items, align: "start" }));
      children.push(menu.el);
    } else {
      children.push(
        track(Icon({ name: "more-vertical", class: "zen-h-3 zen-w-3 zen-shrink-0 zen-text-zen-muted-fg/50" }))
          .el,
      );
    }

    /* type glyph */
    children.push(
      track(
        Icon({
          name: zone === "values" ? "plus" : "file",
          class: "zen-h-3 zen-w-3 zen-shrink-0 zen-text-zen-muted-fg",
        }),
      ).el,
    );

    /* label + filter summary */
    const labelSpan = h("span", cn("zen-min-w-0 zen-flex-1 zen-truncate", filtered && "zen-italic"));
    const nameSpan = h("span", "zen-font-medium");
    nameSpan.textContent = label;
    labelSpan.append(nameSpan);
    if (summary) {
      const sumSpan = h("span", "zen-font-normal");
      sumSpan.textContent = `: ${summary}`;
      labelSpan.append(sumSpan);
    }
    children.push(labelSpan);

    /* aggregation picker (a measure in Values) */
    if (zone === "values" && isMeasure && onAggregationChange && field) {
      const aggWrap = h("span", "zen-inline-block zen-shrink-0 zen-text-xs");
      const lab = h("label", "zen-sr-only");
      lab.htmlFor = `agg-${fieldKey}`;
      lab.textContent = `Aggregation for ${label}`;
      const select = document.createElement("select");
      select.id = `agg-${fieldKey}`;
      select.dataset.noDrag = "";
      select.className =
        "zen-h-6 zen-min-w-14 zen-cursor-pointer zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-1.5 zen-text-xs zen-text-zen-foreground";
      for (const a of AGGREGATIONS) {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        select.append(opt);
      }
      select.value = aggregation ?? defaultAggregationForField(field);
      select.addEventListener("change", () => onAggregationChange(select.value as PivotAggregation));
      aggWrap.append(lab, select);
      children.push(aggWrap);
    }

    /* filter menu (anything but Values) */
    if (zone !== "values" && loadMembers && onSelectionChange) {
      const menu = track(
        PivotFilterMenu({
          columnKey: fieldKey,
          label,
          selection,
          onChange: onSelectionChange,
          loadOptions: async (columnKey, optionSearch, pagination) => {
            // Every filter EXCEPT this field's own — a column's options are
            // narrowed by the others, never by itself.
            const otherFilters: PivotFilters = {};
            for (const [key, sel] of Object.entries(filters ?? {})) {
              if (key !== fieldKey) otherFilters[key] = sel;
            }
            const res = await loadMembers({
              fieldKey: columnKey,
              search: optionSearch.trim() ? optionSearch.trim() : undefined,
              offset: pagination?.offset,
              limit: pagination?.limit,
              filters: otherFilters,
            });
            return { values: res.values, hasMore: res.hasMore, total: res.total ?? res.values.length };
          },
          formatValue: (v) =>
            isMeasure ? Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }) : v,
          singleSelect,
        }),
      );
      children.push(menu.el);
    }

    /* remove button (anything but Available) */
    if (zone !== "available" && onRemove) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.dataset.noDrag = "";
      removeBtn.className =
        "zen-ml-1 zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
      removeBtn.setAttribute("aria-label", `Remove ${label} from ${zoneLabel(zone ?? "available")}`);
      removeBtn.append(track(Icon({ name: "x", class: "zen-h-3.5 zen-w-3.5" })).el);
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        onRemove();
      });
      children.push(removeBtn);
    }

    const badge = track(
      Badge({
        variant: "outline",
        class: cn(
          "zen-h-7 zen-max-w-full zen-cursor-grab zen-select-none zen-bg-zen-background zen-shadow-sm active:zen-cursor-grabbing",
          (zone === "rows" || zone === "values") && "zen-w-full",
          filtered ? "zen-border-zen-primary/30 zen-text-zen-primary" : "zen-text-zen-foreground",
          disabled && "zen-cursor-not-allowed zen-opacity-50",
        ),
        children,
      }),
    );
    wrapper.replaceChildren(badge.el);
  };

  render();
  disposer.add(() => {
    for (const p of parts) p.destroy();
  });

  return {
    el: wrapper,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      wrapper.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* PivotGrid                                                                   */
/* -------------------------------------------------------------------------- */

export interface PivotGridProps {
  layout: PivotLayout;
  totalRows: number;
  totalCols: number;
  rowHeaderDepth: number;
  colHeaderDepth: number;
  getCell: (row: number, col: number) => { value: unknown; isLoading?: boolean } | null;
  getRowHeader: (
    row: number,
    depth: number,
  ) => { value: string; rowSpan?: number; isVisible?: boolean; isLoading?: boolean } | null;
  getColHeader: (
    depth: number,
    col: number,
  ) => { value: string; colSpan?: number; isVisible?: boolean; isLoading?: boolean } | null;
  rowHeight?: number;
  colWidth?: number;
  rowHeaderWidth?: number;
  label?: string;
  onVisibleRangeChange?: (range: {
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
  }) => void;
}

const SKELETON_BAR = "zen-rounded-zen-sm zen-bg-zen-muted-fg/25 motion-safe:zen-animate-pulse";
const STICKY_CORNER =
  "zen-sticky zen-z-30 zen-box-border zen-border-r zen-border-zen-border zen-bg-zen-muted zen-shadow-[1px_0_0_0_var(--zen-border)]";
const STICKY_ROW_LABEL =
  "zen-sticky zen-z-20 zen-border-r zen-border-zen-border zen-shadow-[1px_0_0_0_var(--zen-border)]";

/**
 * PivotGrid — a table windowed in BOTH directions. It never sees your data: it
 * works out which coordinates are visible and asks for those. Rows and columns
 * are both windowed by hand here (no @tanstack/react-virtual, no new dependency),
 * from the same maths the React binding runs. Real <table> semantics rather than
 * role="grid", which would be a contract to honour arrow-key cell navigation.
 */
export function PivotGrid(props: PivotGridProps): ZenComponent<PivotGridProps> {
  let current: PivotGridProps = { ...props };
  const disposer = new Disposer();

  const el = h(
    "div",
    "zen-flex zen-h-full zen-w-full zen-min-h-0 zen-min-w-0 zen-flex-col zen-gap-2",
  );
  const scrollEl = h(
    "div",
    "zen-min-h-0 zen-w-full zen-min-w-0 zen-flex-1 zen-overflow-auto zen-overscroll-contain zen-border-l zen-border-t zen-border-zen-border zen-bg-zen-background",
  );
  scrollEl.setAttribute("role", "region");
  scrollEl.setAttribute("aria-label", current.label ?? "Pivot grid");
  scrollEl.tabIndex = 0;

  const table = h(
    "table",
    "zen-w-max zen-min-w-full zen-shrink-0 zen-border-separate zen-border-spacing-0 zen-text-zen-foreground",
  );
  table.style.borderCollapse = "separate";
  const thead = document.createElement("thead");
  thead.className = "zen-bg-zen-muted";
  const tbody = document.createElement("tbody");
  table.append(thead, tbody);
  scrollEl.append(table);
  el.append(scrollEl);

  let viewportWidth = 0;
  let lastKey = "";
  let lastReported = "";

  const stripe = (row: number) =>
    row % 2 === 1 ? "zen-bg-zen-muted" : "zen-bg-zen-background";

  const computeCols = (
    totalCols: number,
    scrollLeft: number,
    frozenWidth: number,
    colWidth: number,
  ) => {
    if (totalCols <= 0) {
      return { minIndex: 0, maxIndex: -1, items: [] as number[], padLeft: 0, padRight: 0 };
    }
    const left = Math.max(0, scrollLeft);
    const minIndex = Math.max(0, Math.floor((left - frozenWidth) / colWidth) - 4);
    const maxIndex = Math.min(
      totalCols - 1,
      Math.ceil((left + viewportWidth - frozenWidth) / colWidth) + 4,
    );
    const safeMax = Math.max(minIndex, maxIndex);
    const items: number[] = [];
    for (let i = minIndex; i <= safeMax; i++) items.push(i);
    return {
      minIndex,
      maxIndex: safeMax,
      items,
      padLeft: minIndex * colWidth,
      padRight: Math.max(0, (totalCols - safeMax - 1) * colWidth),
    };
  };

  const reportRange = (rowStart: number, rowEnd: number, colStart: number, colEnd: number) => {
    if (!current.onVisibleRangeChange) return;
    const key = `${rowStart}:${rowEnd}:${colStart}:${colEnd}`;
    if (key === lastReported) return;
    lastReported = key;
    current.onVisibleRangeChange({ rowStart, rowEnd, colStart, colEnd });
  };

  const render = (force = false) => {
    const {
      layout,
      totalRows,
      totalCols,
      rowHeaderDepth,
      colHeaderDepth,
      getCell,
      getRowHeader,
      getColHeader,
    } = current;
    const rowHeight = current.rowHeight ?? 25;
    const colWidth = current.colWidth ?? 200;
    const rowHeaderWidth = current.rowHeaderWidth ?? 160;
    const frozenWidth = rowHeaderDepth * rowHeaderWidth;

    const scrollTop = scrollEl.scrollTop;
    const scrollLeft = scrollEl.scrollLeft;
    const vpH = scrollEl.clientHeight || 400;

    let rowStart = 0;
    let rowEnd = -1;
    if (totalRows > 0) {
      rowStart = Math.max(0, Math.floor(scrollTop / rowHeight) - 6);
      rowEnd = Math.min(totalRows - 1, Math.ceil((scrollTop + vpH) / rowHeight) + 6);
    }
    const cols = computeCols(totalCols, scrollLeft, frozenWidth, colWidth);

    const key = `${rowStart}:${rowEnd}:${cols.minIndex}:${cols.maxIndex}:${totalRows}:${totalCols}:${rowHeaderDepth}:${colHeaderDepth}`;
    if (!force && key === lastKey) return;
    lastKey = key;

    table.style.width = `${frozenWidth + totalCols * colWidth}px`;

    const headerRows = Array.from({ length: Math.max(colHeaderDepth, 1) }, (_, i) => i);
    thead.replaceChildren();
    for (const headerRowIndex of headerRows) {
      const tr = document.createElement("tr");

      if (rowHeaderDepth > 0) {
        for (let depth = 0; depth < rowHeaderDepth; depth++) {
          const th = document.createElement("th");
          th.setAttribute("scope", "col");
          th.className = cn(
            STICKY_CORNER,
            "zen-px-2 zen-py-1 zen-text-left zen-align-bottom zen-text-sm zen-font-medium zen-capitalize zen-text-zen-muted-fg",
          );
          th.style.position = "sticky";
          th.style.left = `${depth * rowHeaderWidth}px`;
          th.style.top = `${headerRowIndex * rowHeight}px`;
          fixHeight(th, rowHeight);
          fixWidth(th, rowHeaderWidth);
          if (headerRowIndex === headerRows.length - 1) {
            const span = h("span", "zen-mt-auto zen-block");
            const text = layout.rows[depth]?.replace(/_/g, " ") || "";
            span.title = text;
            span.textContent = text;
            th.append(span);
          }
          tr.append(th);
        }
      }

      if (cols.padLeft > 0) {
        const th = document.createElement("th");
        th.setAttribute("aria-hidden", "true");
        th.className = "zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0";
        th.style.position = "sticky";
        th.style.top = `${headerRowIndex * rowHeight}px`;
        fixHeight(th, rowHeight);
        th.style.width = `${cols.padLeft}px`;
        th.style.minWidth = `${cols.padLeft}px`;
        tr.append(th);
      }

      for (const colIndex of cols.items) {
        const header = getColHeader(headerRowIndex, colIndex);
        if (header?.isVisible === false) continue;
        const span = header?.colSpan || 1;
        const th = document.createElement("th");
        th.setAttribute("scope", "col");
        th.colSpan = span;
        th.className =
          "zen-sticky zen-z-10 zen-truncate zen-border-b zen-border-r zen-border-zen-border/50 zen-bg-zen-background zen-px-2 zen-py-1 zen-text-left zen-text-xs zen-font-medium zen-text-zen-foreground";
        th.style.position = "sticky";
        th.style.top = `${headerRowIndex * rowHeight}px`;
        fixWidth(th, colWidth * span);
        fixHeight(th, rowHeight);
        if (header?.isLoading) th.append(h("div", cn("zen-h-3 zen-w-full", SKELETON_BAR)));
        else th.textContent = header?.value || "";
        tr.append(th);
      }

      if (cols.padRight > 0) {
        const th = document.createElement("th");
        th.setAttribute("aria-hidden", "true");
        th.className = "zen-border-0 zen-bg-zen-muted zen-p-0";
        th.style.width = `${cols.padRight}px`;
        th.style.minWidth = `${cols.padRight}px`;
        tr.append(th);
      }

      thead.append(tr);
    }

    tbody.replaceChildren();

    if (rowStart > 0) {
      const tr = document.createElement("tr");
      tr.setAttribute("aria-hidden", "true");
      const td = document.createElement("td");
      td.className = "zen-border-0 zen-p-0";
      td.style.height = `${rowStart * rowHeight}px`;
      tr.append(td);
      tbody.append(tr);
    }

    for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex++) {
      const tr = document.createElement("tr");
      tr.className = "zen-border-b zen-border-zen-border/60";

      if (rowHeaderDepth > 0) {
        for (let depth = 0; depth < rowHeaderDepth; depth++) {
          const header = getRowHeader(rowIndex, depth);
          if (header?.isVisible === false) continue;
          const th = document.createElement("th");
          th.setAttribute("scope", "row");
          th.rowSpan = header?.rowSpan || 1;
          th.className = cn(
            STICKY_ROW_LABEL,
            "zen-break-words zen-bg-zen-background zen-px-2 zen-py-1 zen-text-left zen-align-top zen-text-xs zen-font-medium zen-leading-tight zen-text-zen-foreground",
            rowIndex > 0 ? "zen-border-t zen-border-zen-border/50" : "zen-border-t-0",
          );
          th.style.left = `${depth * rowHeaderWidth}px`;
          fixWidth(th, rowHeaderWidth);
          if (header?.isLoading) {
            th.append(h("div", cn("zen-h-3 zen-w-1/2", SKELETON_BAR)));
          } else {
            const span = h("span", "zen-block");
            span.title = header?.value || "";
            span.textContent = header?.value || "";
            th.append(span);
          }
          tr.append(th);
        }
      }

      if (cols.padLeft > 0) {
        const td = document.createElement("td");
        td.setAttribute("aria-hidden", "true");
        td.className = cn("zen-border-0 zen-p-0", stripe(rowIndex));
        td.style.width = `${cols.padLeft}px`;
        tr.append(td);
      }

      for (const colIndex of cols.items) {
        const cell = getCell(rowIndex, colIndex);
        const td = document.createElement("td");
        td.className = cn(
          "zen-truncate zen-border-b zen-border-r zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-right zen-text-sm zen-tabular-nums",
          stripe(rowIndex),
        );
        fixWidth(td, colWidth);
        if (cell?.isLoading) td.append(h("div", cn("zen-ml-auto zen-h-3 zen-w-10", SKELETON_BAR)));
        else td.textContent = (cell?.value as string) ?? "-";
        tr.append(td);
      }

      if (cols.padRight > 0) {
        const td = document.createElement("td");
        td.setAttribute("aria-hidden", "true");
        td.className = cn("zen-border-0 zen-p-0", stripe(rowIndex));
        td.style.width = `${cols.padRight}px`;
        tr.append(td);
      }

      tbody.append(tr);
    }

    if (rowEnd >= 0) {
      const rest = (totalRows - (rowEnd + 1)) * rowHeight;
      if (rest > 0) {
        const tr = document.createElement("tr");
        tr.setAttribute("aria-hidden", "true");
        const td = document.createElement("td");
        td.className = "zen-border-0 zen-p-0";
        td.style.height = `${rest}px`;
        tr.append(td);
        tbody.append(tr);
      }
    }

    reportRange(rowStart, rowEnd, cols.minIndex, cols.maxIndex);
  };

  // Scroll fires per frame; coalesce to one rAF so we recompute the window at most
  // once a frame, not once an event.
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      render();
    });
  };
  scrollEl.addEventListener("scroll", onScroll, { passive: true });
  disposer.add(() => scrollEl.removeEventListener("scroll", onScroll));
  disposer.add(() => {
    if (frame) cancelAnimationFrame(frame);
  });

  const ro = new ResizeObserver((entries) => {
    viewportWidth = entries[0]?.contentRect.width ?? scrollEl.clientWidth;
    render(true);
  });
  ro.observe(scrollEl);
  disposer.add(() => ro.disconnect());

  viewportWidth = scrollEl.clientWidth;
  render(true);

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.label !== undefined) scrollEl.setAttribute("aria-label", current.label ?? "Pivot grid");
      render(true);
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* PivotWorkbench                                                              */
/* -------------------------------------------------------------------------- */

export interface PivotWorkbenchProps {
  fields: PivotField[];
  initialLayout?: PivotLayout;
  /** Fires on "View Data", not on every drag. */
  onLayoutApply?: (layout: PivotLayout) => void;
  class?: string;
  /** The grid. Rendered, never talked to. */
  children?: Child;
  totalRows?: number;
  totalCols?: number;
  onClearFilters?: () => void;
  showBuilder?: boolean;
  loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
}

/** Where a field sits inside its zone, or undefined if it is not in one. */
function indexInZone(layout: PivotLayout, fieldId: string, zone: PivotZone): number | undefined {
  const i =
    zone === "rows"
      ? layout.rows.indexOf(fieldId)
      : zone === "columns"
        ? layout.columns.indexOf(fieldId)
        : zone === "values"
          ? layout.values.findIndex((v) => v.id === fieldId)
          : -1;
  return i === -1 ? undefined : i;
}

/** Set or clear one field's filter. */
function withFilter(
  layout: PivotLayout,
  fieldKey: string,
  sel: PivotFilterSelection | null,
): PivotLayout {
  const filters = { ...layout.filters };
  if (sel) filters[fieldKey] = sel;
  else delete filters[fieldKey];
  return { ...layout, filters };
}

/**
 * PivotWorkbench — drag fields into zones, press View Data, get a layout.
 *
 * Holds a draft and an applied layout: dragging edits the draft, View Data
 * publishes it — the same split the List Report makes, because re-querying a
 * pivot on every drag is fine over 48 rows and hostile over 48 million. Every
 * layout rule comes from core, so the bindings cannot disagree about a drop.
 */
export function PivotWorkbench(props: PivotWorkbenchProps): ZenComponent<PivotWorkbenchProps> {
  let current: PivotWorkbenchProps = { ...props };
  const disposer = new Disposer();

  let draft: PivotLayout = current.initialLayout ?? createEmptyLayout();
  let applied: PivotLayout = current.initialLayout ?? createEmptyLayout();

  /** The field currently being dragged, read on drop. */
  let dragging: string | null = null;

  const root = h(
    "div",
    cn(
      "zen-flex zen-h-full zen-w-full zen-min-w-0 zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
      current.class,
    ),
  );

  // Every layout change says so out loud; a drag is otherwise silent.
  const live = h("div", "zen-sr-only");
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");

  const builderWrap = h("div", "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-bg-zen-background zen-p-2");
  const gridWrap = h("div", "zen-relative zen-min-h-0 zen-min-w-0 zen-flex-1 zen-bg-zen-background zen-p-2");

  root.append(live, builderWrap, gridWrap);

  // Re-created on every rebuild: a Disposer is single-use, so each render gets a
  // fresh one and the previous render's chips/zones are released first.
  let builderDisposer = new Disposer();
  let gridDisposer = new Disposer();
  disposer.add(() => builderDisposer.dispose());
  disposer.add(() => gridDisposer.dispose());

  const announce = (message: string) => {
    live.textContent = message;
  };

  const moveField = (fieldId: string, zone: PivotZone, index?: number) => {
    draft = moveFieldToZone(draft, fieldId, zone, { index });
    announce(describeMove(current.fields, fieldId, zone, index));
    renderBuilder();
  };

  /** Wrap a chip in a draggable container — the analogue of React's SortableChip. */
  const sortableChip = (fieldKey: string, zone: PivotZone, chipProps: PivotFieldChipProps): HTMLElement => {
    const chip = PivotFieldChip(chipProps);
    builderDisposer.add(() => chip.destroy());

    const wrap = h(
      "div",
      cn(
        "zen-max-w-full zen-touch-none",
        zone === "rows" || zone === "values" ? "zen-flex zen-w-full" : "zen-inline-flex",
      ),
    );
    wrap.draggable = true;
    wrap.dataset.fieldChipWrapper = "";
    wrap.dataset.fieldKey = fieldKey;
    wrap.append(chip.el);

    const onDragStart = (e: DragEvent) => {
      // A press on a control (menu, filter, remove, aggregation) must not start a
      // drag — the same guard React's onPointerDown stopPropagation gave those.
      if ((e.target as HTMLElement).closest("[data-no-drag], button, select, input, [role='menu']")) {
        e.preventDefault();
        return;
      }
      dragging = fieldKey;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", fieldKey);
      }
      wrap.classList.add("zen-relative", "zen-z-50", "zen-opacity-50");
    };
    const onDragEnd = (e: DragEvent) => {
      wrap.classList.remove("zen-relative", "zen-z-50", "zen-opacity-50");
      // A cancelled drag (Escape, or a drop that went nowhere) leaves dropEffect
      // "none". Match React's onDragCancel announcement.
      if (dragging && e.dataTransfer?.dropEffect === "none") announce("Move cancelled.");
      dragging = null;
    };
    wrap.addEventListener("dragstart", onDragStart);
    wrap.addEventListener("dragend", onDragEnd);
    builderDisposer.add(() => {
      wrap.removeEventListener("dragstart", onDragStart);
      wrap.removeEventListener("dragend", onDragEnd);
    });

    return wrap;
  };

  const chipProps = (fieldKey: string, zone: PivotZone): PivotFieldChipProps => ({
    fieldKey,
    fields: current.fields,
    zone,
    filters: draft.filters,
    selection: draft.filters[fieldKey],
    loadMembers: current.loadMembers,
    // Available previews an unplaced field, so its filter picks ONE member; a
    // placed field filters for real and takes as many as you like.
    singleSelect: zone === "available",
    onSelectionChange: (sel) => {
      // A filter change edits the draft silently — no rebuild, so an open filter
      // popover survives the toggle.
      draft = withFilter(draft, fieldKey, sel);
    },
    onMoveToZone: (z) => moveField(fieldKey, z),
    onRemove: zone === "available" ? undefined : () => moveField(fieldKey, "available"),
  });

  /** Wire a zone element so a drop reads the model and calls moveField. */
  const wireZoneDrop = (zoneEl: HTMLElement, zoneId: PivotZone) => {
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const fieldId = dragging ?? e.dataTransfer?.getData("text/plain") ?? "";
      if (!fieldId) return;
      // Prefer the chip you are over; fall back to the zone you are in. The index
      // comes from the model, never from parsing a DOM id.
      let index: number | undefined;
      const overWrapper = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-field-chip-wrapper]");
      if (
        overWrapper &&
        zoneEl.contains(overWrapper) &&
        overWrapper.dataset.fieldKey &&
        overWrapper.dataset.fieldKey !== fieldId
      ) {
        index = indexInZone(draft, overWrapper.dataset.fieldKey, zoneId);
      }
      dragging = null;
      moveField(fieldId, zoneId, index);
    };
    zoneEl.addEventListener("drop", onDrop);
    builderDisposer.add(() => zoneEl.removeEventListener("drop", onDrop));
  };

  const renderBuilder = () => {
    builderDisposer.dispose();
    builderDisposer = new Disposer();
    builderWrap.replaceChildren();
    if (current.showBuilder === false) return;

    const available = availableFieldsIn(draft, current.fields);

    /* header: counts, clear filters, View Data */
    const header = h("div", "zen-flex zen-items-center zen-justify-between zen-gap-2");
    const counts = h("span", "zen-text-xs zen-text-zen-muted-fg");
    counts.textContent = `${(current.totalRows ?? 0).toLocaleString()} rows · ${(current.totalCols ?? 0).toLocaleString()} cols`;
    header.append(counts);

    const actions = h("div", "zen-flex zen-items-center zen-gap-2");
    if (hasActiveFilters(draft.filters)) {
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className =
        "-zen-m-1 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-1 zen-text-sm zen-text-zen-muted-fg hover:zen-text-zen-foreground";
      clear.textContent = "Clear filters";
      clear.addEventListener("click", () => {
        if (current.onClearFilters) current.onClearFilters();
        else {
          draft = { ...draft, filters: {} };
          renderBuilder();
        }
      });
      actions.append(clear);
    }
    const viewData = Button({
      size: "sm",
      children: "View Data",
      onClick: () => {
        applied = draft;
        current.onLayoutApply?.(draft);
        renderGrid();
      },
    });
    builderDisposer.add(() => viewData.destroy());
    actions.append(viewData.el);
    header.append(actions);
    builderWrap.append(header);

    /* available fields (horizontal) */
    const availableChips = available.map((f) =>
      sortableChip(f.key, "available", chipProps(f.key, "available")),
    );
    const availableZone = PivotDropZone({
      id: "available",
      title: "Available Fields",
      horizontal: true,
      isEmpty: available.length === 0,
      children: availableChips,
    });
    builderDisposer.add(() => availableZone.destroy());
    wireZoneDrop(availableZone.el, "available");
    builderWrap.append(availableZone.el);

    /* values / rows / columns */
    const zonesGrid = h("div", "zen-grid zen-grid-cols-1 zen-gap-2 sm:zen-grid-cols-3");

    const valuesChips = draft.values.map((v) => {
      const p = chipProps(v.id, "values");
      p.aggregation = v.aggregation;
      p.onAggregationChange = (agg) => {
        draft = updateValueAggregation(draft, v.id, agg);
      };
      return sortableChip(v.id, "values", p);
    });
    const valuesZone = PivotDropZone({
      id: "values",
      title: "Values",
      isEmpty: draft.values.length === 0,
      children: valuesChips,
    });
    builderDisposer.add(() => valuesZone.destroy());
    wireZoneDrop(valuesZone.el, "values");

    const rowsChips = draft.rows.map((id) => sortableChip(id, "rows", chipProps(id, "rows")));
    const rowsZone = PivotDropZone({
      id: "rows",
      title: "Rows",
      isEmpty: draft.rows.length === 0,
      children: rowsChips,
    });
    builderDisposer.add(() => rowsZone.destroy());
    wireZoneDrop(rowsZone.el, "rows");

    const columnsChips = draft.columns.map((id) =>
      sortableChip(id, "columns", chipProps(id, "columns")),
    );
    const columnsZone = PivotDropZone({
      id: "columns",
      title: "Columns",
      isEmpty: draft.columns.length === 0,
      children: columnsChips,
    });
    builderDisposer.add(() => columnsZone.destroy());
    wireZoneDrop(columnsZone.el, "columns");

    zonesGrid.append(valuesZone.el, rowsZone.el, columnsZone.el);
    builderWrap.append(zonesGrid);
  };

  const renderGrid = () => {
    gridDisposer.dispose();
    gridDisposer = new Disposer();
    gridWrap.replaceChildren();
    if (isLayoutRenderable(applied)) {
      gridWrap.append(...toNodes(current.children));
      return;
    }
    const stack = h("div", "zen-flex zen-flex-col zen-gap-2");
    const alert = (title: string, description: string): HTMLElement => {
      const a = Alert({
        color: "warning",
        children: [
          AlertIcon({ children: Icon({ name: "info" }) }),
          AlertContent({
            children: [AlertTitle({ children: title }), AlertDescription({ children: description })],
          }),
        ],
      });
      gridDisposer.add(() => a.destroy());
      return a.el;
    };
    if (applied.values.length === 0) {
      stack.append(alert("Value field required", "Drop at least one field into Values to calculate data."));
    }
    if (applied.rows.length === 0 && applied.columns.length === 0) {
      stack.append(alert("Dimension required", "Drop at least one field into Rows or Columns."));
    }
    gridWrap.append(stack);
  };

  renderBuilder();
  renderGrid();

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      if (next.class !== undefined) {
        root.className = cn(
          "zen-flex zen-h-full zen-w-full zen-min-w-0 zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
          current.class,
        );
      }
      renderBuilder();
      renderGrid();
    },
    destroy() {
      disposer.dispose();
      root.remove();
    },
  };
}
