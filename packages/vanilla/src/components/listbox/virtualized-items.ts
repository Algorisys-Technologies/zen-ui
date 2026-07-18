import { cn } from "../../lib/cn";
import {
  Disposer,
  toNodes,
  type AnyZenComponent,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * VirtualizedItems — a drop-in scrolling viewport that renders only the visible
 * window of a long item list, so a list of 10,000 rows costs the ~15 that are on
 * screen rather than 10,000 DOM nodes.
 *
 *   const list = VirtualizedItems({
 *     items: hugeArray,
 *     estimateSize: 36,
 *     maxHeight: 300,
 *     children: ({ item }) => Option({ value: item.value, label: item.label }),
 *   });
 *   surface.append(list.el);
 *
 * ## What this is a port OF, and what it deliberately is not
 *
 * React's `<VirtualizedItems>` is powered by `@tanstack/react-virtual` and slots
 * INSIDE Radix's `<SelectContent>` / `<DropdownMenuContent>`, letting Radix own the
 * scroll container's chrome. Two facts change the shape here:
 *
 *  - There is no `@tanstack/react-virtual` and adding one is forbidden (no new
 *    runtime deps). The windowing maths — total size, which rows intersect the
 *    viewport, where each row sits — is small and lives below. It is the honest
 *    cost of the port, the same way `focus-trap` / `dismissable` are.
 *  - Vanilla's `Select` and `DropdownMenu` are data-driven (`options` / `items`
 *    arrays), not compound trees you nest arbitrary children into — that divergence
 *    is documented on each. So there is no `SelectContent` to live inside. This is
 *    therefore a standalone windowed viewport: it owns its own scroll container
 *    (React notes the helper "owns the scroll container" too), and the caller drops
 *    it wherever a long list is needed.
 *
 * Everything React's API promises is kept: the same two modes (dense array vs
 * server-paged sparse), the same prop names (`estimateSize`, `maxHeight`,
 * `overscan`, `children`, `getKey`, `totalCount`, `getItem`, `onVisibleRange`), and
 * the render-prop `children` that produces one row.
 *
 * There is no render loop. The viewport rebuilds its rows only when the visible
 * WINDOW changes — scrolling within the current window touches nothing — mirroring
 * how react-virtual only re-renders when its virtual items change.
 */

interface VirtualizedItemsCommon {
  /** Row height in px. A number for a fixed row, or a function for variable rows. Defaults to 36. */
  estimateSize?: number | ((index: number) => number);
  /** Max height of the scrolling viewport in px. Defaults to 280. */
  maxHeight?: number;
  /** Rows to render above / below the viewport for smoother scroll. Defaults to 6. */
  overscan?: number;
  /** Merged onto the viewport element; the caller's class wins. */
  class?: string;
}

/** Every item is in memory. */
export interface VirtualizedItemsDenseProps<T> extends VirtualizedItemsCommon {
  items: T[];
  children: (args: { item: T; index: number }) => Child;
  /** Optional key extractor; defaults to the index. Written to each row's `data-key`. */
  getKey?: (item: T, index: number) => string | number;
}

/**
 * The list is longer than what is loaded: `totalCount` rows exist, `getItem`
 * answers for the ones that have arrived and `undefined` for the ones that have
 * not, and `onVisibleRange` says which are needed next. Fetch there, then call
 * `update()` once the page lands.
 */
export interface VirtualizedItemsSparseProps<T> extends VirtualizedItemsCommon {
  totalCount: number;
  getItem: (index: number) => T | undefined;
  /** Fires when the visible window (including overscan) changes. Fetch here. */
  onVisibleRange?: (minIndex: number, maxIndex: number) => void;
  /** `item` is undefined where the page has not loaded — render a skeleton. */
  children: (args: { item: T | undefined; index: number }) => Child;
}

/**
 * A discriminated union rather than one loose shape: dense callers keep `item: T`
 * exactly as before, and only sparse ones have to think about `undefined`.
 */
export type VirtualizedItemsProps<T> =
  | VirtualizedItemsDenseProps<T>
  | VirtualizedItemsSparseProps<T>;

const isSparse = <T>(p: VirtualizedItemsProps<T>): p is VirtualizedItemsSparseProps<T> =>
  (p as VirtualizedItemsSparseProps<T>).totalCount !== undefined;

/** Recursively pull every ZenComponent out of a render result so we can destroy it. */
function collectComponents(child: Child, acc: AnyZenComponent[]): void {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) {
    for (const c of child) collectComponents(c, acc);
    return;
  }
  if (
    typeof child === "object" &&
    "el" in child &&
    typeof (child as AnyZenComponent).destroy === "function" &&
    (child as AnyZenComponent).el instanceof Element
  ) {
    acc.push(child as AnyZenComponent);
  }
}

// Overloads, not a bare union parameter: TypeScript cannot infer T THROUGH a union,
// so a single `props: Dense<T> | Sparse<T>` signature silently makes every
// `children: ({ item }) => …` an implicit any. Overloads let the caller pick a branch
// first and infer T from `items`, exactly as React's do.
export function VirtualizedItems<T>(
  props: VirtualizedItemsDenseProps<T>,
): ZenComponent<VirtualizedItemsDenseProps<T>>;
export function VirtualizedItems<T>(
  props: VirtualizedItemsSparseProps<T>,
): ZenComponent<VirtualizedItemsSparseProps<T>>;
export function VirtualizedItems<T>(
  props: VirtualizedItemsProps<T>,
): ZenComponent<VirtualizedItemsProps<T>> {
  let current: VirtualizedItemsProps<T> = { ...props };

  // The viewport: it owns the scroll. The spacer inside it is as tall as the whole
  // list so the native scrollbar is honest; rows are absolutely positioned within it.
  const el = document.createElement("div");
  const spacer = document.createElement("div");
  spacer.style.position = "relative";
  spacer.style.width = "100%";
  el.append(spacer);

  const disposer = new Disposer();
  // ZenComponents produced by the currently-mounted rows, so destroy() releases them.
  let mountedComponents: AnyZenComponent[] = [];

  /* -------------------------------------------------------------- windowing maths */

  let count = 0;
  // For a fixed row height these stay 0 / [] and the maths is O(1) multiplication;
  // for a variable one, `offsets` is a prefix-sum table (length count + 1).
  let fixedSize = 0;
  let offsets: number[] = [];

  const rebuildGeometry = () => {
    // Call the predicate directly in the condition — storing it in a variable
    // does not narrow the union, which is what broke the type here.
    count = isSparse(current) ? current.totalCount : current.items.length;
    const estimate = current.estimateSize ?? 36;

    if (typeof estimate === "number") {
      fixedSize = estimate;
      offsets = [];
      return;
    }
    fixedSize = 0;
    offsets = new Array(count + 1);
    offsets[0] = 0;
    for (let i = 0; i < count; i++) offsets[i + 1] = offsets[i] + estimate(i);
  };

  const sizeOf = (index: number): number =>
    fixedSize > 0 ? fixedSize : offsets[index + 1] - offsets[index];

  const offsetOf = (index: number): number =>
    fixedSize > 0 ? index * fixedSize : offsets[index];

  const totalSize = (): number =>
    count === 0 ? 0 : fixedSize > 0 ? count * fixedSize : offsets[count];

  /** First index whose row contains `y` (a scroll offset in px), clamped to the list. */
  const indexAtOffset = (y: number): number => {
    if (count === 0) return 0;
    if (y <= 0) return 0;
    if (fixedSize > 0) return Math.min(count - 1, Math.floor(y / fixedSize));
    // Binary search the prefix sums for a variable row height.
    let lo = 0;
    let hi = count - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (offsets[mid + 1] <= y) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  /* ------------------------------------------------------------------ row painting */

  // The window currently in the DOM. `-1:-1` means "nothing painted yet".
  let painted = { start: -1, end: -1 };
  let rangeReported = "";

  const viewportHeight = (): number => el.clientHeight || current.maxHeight || 280;

  /** The [start, end] index range to mount, overscan included, for the current scroll. */
  const visibleRange = (): [number, number] => {
    if (count === 0) return [-1, -1];
    const overscan = current.overscan ?? 6;
    const top = el.scrollTop;
    const first = indexAtOffset(top);
    const last = indexAtOffset(top + viewportHeight());
    return [Math.max(0, first - overscan), Math.min(count - 1, last + overscan)];
  };

  const clearRows = () => {
    for (const c of mountedComponents) c.destroy();
    mountedComponents = [];
    spacer.replaceChildren();
  };

  const paintRow = (index: number): HTMLElement => {
    // Branch on the predicate so the union narrows in each arm. `current` is the
    // union; a stored boolean would not narrow it. sparse children accept an
    // undefined item; dense mode always indexes a materialized array.
    let key: string | number = index;
    let content: Child;
    if (isSparse(current)) {
      content = current.children({ item: current.getItem(index), index });
    } else {
      const dense = current.items[index];
      if (current.getKey && dense !== undefined) key = current.getKey(dense, index);
      content = current.children({ item: dense, index });
    }

    const row = document.createElement("div");
    row.style.position = "absolute";
    row.style.top = "0";
    row.style.left = "0";
    row.style.width = "100%";
    row.style.transform = `translateY(${offsetOf(index)}px)`;
    row.style.height = `${sizeOf(index)}px`;
    row.dataset.key = String(key);

    collectComponents(content, mountedComponents);
    row.append(...toNodes(content));
    return row;
  };

  const reportRange = (start: number, end: number) => {
    if (!isSparse(current) || !current.onVisibleRange) return;
    const key = `${start}:${end}`;
    if (key === rangeReported) return;
    rangeReported = key;
    current.onVisibleRange(start, end);
  };

  /** Rebuild the mounted window if — and only if — the visible window changed. */
  const sync = (force = false) => {
    spacer.style.height = `${totalSize()}px`;
    const [start, end] = visibleRange();

    if (!force && start === painted.start && end === painted.end) return;
    painted = { start, end };

    clearRows();
    if (start >= 0) {
      const frag = document.createDocumentFragment();
      for (let i = start; i <= end; i++) frag.append(paintRow(i));
      spacer.append(frag);
      reportRange(start, end);
    }
  };

  /* ----------------------------------------------------------------------- wiring */

  const applyStyle = () => {
    el.className = cn("zen-overflow-y-auto", current.class);
    el.style.maxHeight = `${current.maxHeight ?? 280}px`;
  };

  // Scroll fires per frame; coalesce to one rAF so we recompute the window at most
  // once a frame, not once an event.
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      sync();
    });
  };
  el.addEventListener("scroll", onScroll, { passive: true });
  disposer.add(() => el.removeEventListener("scroll", onScroll));
  disposer.add(() => {
    if (frame) cancelAnimationFrame(frame);
  });

  // The viewport's own size can change (CSS, a resized container) without a scroll;
  // recompute the window when it does.
  const ro = new ResizeObserver(() => sync());
  ro.observe(el);
  disposer.add(() => ro.disconnect());
  disposer.add(clearRows);

  applyStyle();
  rebuildGeometry();
  sync(true);

  return {
    el,
    update(next) {
      current = { ...current, ...next } as VirtualizedItemsProps<T>;
      applyStyle();
      rebuildGeometry();
      // The data or geometry may have changed under the same visible window, so force
      // a rebuild rather than trusting the start/end short-circuit.
      rangeReported = "";
      sync(true);
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
