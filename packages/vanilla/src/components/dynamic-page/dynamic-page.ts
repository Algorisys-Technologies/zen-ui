import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { Icon } from "../icon/icon";

/**
 * DynamicPage — the vanilla port of the React reference.
 *
 * A page whose header COLLAPSES ("snaps") as the content scrolls, leaving a
 * sticky title bar behind, plus an optional floating footer. This underpins the
 * List Report and Object Page floorplans; the snapping is the whole component.
 *
 *   const page = DynamicPage({
 *     class: "zen-h-[420px]",
 *     children: [
 *       DynamicPageTitle({ heading: "Order 4711", subheading: "Acme Corp", actions: save }),
 *       DynamicPageHeader({ "aria-label": "Order details", children: facts }),
 *       rows,
 *       DynamicPageFooter({ children: [cancel, submit] }),
 *     ],
 *   });
 *
 * ## Why still compound, when Accordion took the data
 *
 * These are content SLOTS that render where you put them, not actions that move
 * between two elements — so, unlike Accordion, both React and Solid keep the
 * compound API and so does this. React wires the parts through context; a sub-part
 * deep in the tree finds its root without being handed anything. There is no
 * context here, but there does not need to be: the parts are DIRECT children of
 * the root, so the root connects them itself by looking for a brand. The caller
 * never wires anything — the footgun the Accordion note warns about
 * (`AccordionItem({ root })`) does not exist here.
 *
 * ## Why the ROOT is the scroll container
 *
 * The root scrolls; the title is `sticky top-0` inside it. Snapping is driven by
 * that element's `scrollTop`, never by `window` — this repo's demo shell already
 * owns page scrolling. Being self-contained is also what lets the page work inside
 * any container. The root therefore needs a BOUNDED height from its parent
 * (`h-full`, a grid track, a fixed height); a root free to grow to its content
 * never scrolls, and the header never snaps.
 *
 * ## State vocabulary
 *
 * Emits React's `data-state` — `"expanded" | "snapped"` on the title,
 * `"expanded" | "collapsed"` on the header. See PORTING.md.
 */

/** Slop before a scroll counts as intent to snap. Pixels, not rem: this is a
 *  scroll measurement, not a design token. */
const SNAP_THRESHOLD_PX = 8;

let uid = 0;

/**
 * The root hands each sub-part this once, at connect time. It is the vanilla
 * stand-in for the React context: no provider, no lookup, just an object.
 */
interface DynamicPageContext {
  readonly headerId: string;
  headerPinnable(): boolean;
  showFooter(): boolean;
  getExpanded(): boolean;
  /** Title click / a sub-part requesting the toggle. */
  requestExpanded(v: boolean): void;
  getPinned(): boolean;
  setPinned(v: boolean): void;
}

/** Brand a sub-part carries so the root can find and wire it among its children.
 *  The description avoids the `zen-` prefix on purpose: check-css-live scans source
 *  for `zen-*` tokens, and a Symbol description that looked like a utility would be
 *  read as a class that generates no CSS. */
const PART = Symbol("dynamic-page-part");

interface PartInternals {
  readonly kind: "title" | "header" | "footer";
  /** Store the context and paint the initial state. */
  connect(ctx: DynamicPageContext): void;
  /** Re-read the context and repaint — called by the root on any state change. */
  paint(): void;
  /** The element the root measures (title height for the pin offset; header
   *  height for the snap overflow guard). */
  readonly measureEl?: HTMLElement;
}

type PartHandle<P> = ZenComponent<P> & { readonly [PART]: PartInternals };

const isPart = (v: unknown): v is PartHandle<unknown> =>
  typeof v === "object" && v !== null && PART in v;

const ROOT_CLASS = cn(
  "zen-relative zen-flex zen-h-full zen-flex-col zen-overflow-y-auto zen-bg-zen-background zen-text-zen-foreground",
  // Scroll anchoring would "helpfully" subtract the collapsing header's height
  // from scrollTop, dropping us back to 0, which re-expands the header — the snap
  // would undo itself.
  "zen-[overflow-anchor:none]",
);

/* ────────────────────────────────────────────────────────────────────────── */
/*  Root                                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

export interface DynamicPageProps extends BaseProps {
  /** Controlled expanded state of the header. */
  headerExpanded?: boolean;
  /** Uncontrolled initial expanded state (default true). */
  defaultHeaderExpanded?: boolean;
  onHeaderExpandedChange?: (expanded: boolean) => void;
  /** Offer the pin toggle that keeps the header expanded while scrolling. Default true. */
  headerPinnable?: boolean;
  /** Set false to hide a DynamicPageFooter without removing the page. Default true. */
  showFooter?: boolean;
}

export function DynamicPage(props: DynamicPageProps = {}): ZenComponent<DynamicPageProps> {
  let current: DynamicPageProps = { ...props };
  const el = document.createElement("div");
  const headerId = `zen-dynamic-page-${++uid}`;
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let titlePart: PartInternals | undefined;
  let headerPart: PartInternals | undefined;
  let footerPart: PartInternals | undefined;

  const expanded = controllable<boolean>({
    value: current.headerExpanded,
    defaultValue: current.defaultHeaderExpanded ?? true,
    onChange: (v) => current.onHeaderExpandedChange?.(v),
  });

  let pinned = false;

  const setPinned = (v: boolean) => {
    if (pinned === v) return;
    pinned = v;
    if (pinned) el.setAttribute("data-header-pinned", "");
    else el.removeAttribute("data-header-pinned");
    headerPart?.paint();
  };

  const ctx: DynamicPageContext = {
    headerId,
    headerPinnable: () => current.headerPinnable ?? true,
    showFooter: () => current.showFooter ?? true,
    getExpanded: () => expanded.get(),
    requestExpanded: (v) => expanded.set(v),
    getPinned: () => pinned,
    setPinned,
  };

  const syncExpandedAttr = (v: boolean) => {
    if (v) el.setAttribute("data-header-expanded", "");
    else el.removeAttribute("data-header-expanded");
  };

  // Collect children in order: append every node, and wire the branded parts.
  const collect = (child: Child) => {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) {
      child.forEach(collect);
      return;
    }
    if (isPart(child)) {
      const internals = child[PART];
      if (internals.kind === "title") titlePart = internals;
      else if (internals.kind === "header") headerPart = internals;
      else footerPart = internals;
      internals.connect(ctx);
      el.append(child.el);
      return;
    }
    el.append(...toNodes(child));
  };

  const renderRoot = () => {
    el.className = cn(ROOT_CLASS, current.class);
    const { class: _c, children: _ch, headerExpanded: _he, defaultHeaderExpanded: _dhe,
      onHeaderExpandedChange: _ohc, headerPinnable: _hp, showFooter: _sf, ...rest } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  renderRoot();
  syncExpandedAttr(expanded.get());
  if (pinned) el.setAttribute("data-header-pinned", "");
  collect(current.children);

  // A page that stops being pinnable must not strand a pinned header, which would
  // be permanently un-snappable with no control left to release it.
  if (!(current.headerPinnable ?? true) && pinned) setPinned(false);

  // Expanded changed (scroll, title click, or a synced controlled value): flip the
  // root attribute and repaint the two parts that depend on it.
  disposer.add(
    expanded.subscribe((v) => {
      syncExpandedAttr(v);
      titlePart?.paint();
      headerPart?.paint();
    }),
  );

  // The snap itself.
  const onScroll = () => {
    if (pinned) return;
    const top = el.scrollTop;
    if (top <= 0) {
      expanded.set(true);
      return;
    }
    if (top <= SNAP_THRESHOLD_PX) return;
    // Refuse to snap when collapsing would destroy the very scroll distance that
    // triggered it: the scroller would clamp back to 0, we would re-expand, and the
    // header would flap for as long as the user scrolled. Fiori draws the same
    // line — a header is not snappable if the content does not overflow.
    const headerH = headerPart?.measureEl?.offsetHeight ?? 0;
    if (el.scrollHeight - el.clientHeight - headerH <= SNAP_THRESHOLD_PX) return;
    expanded.set(false);
  };
  el.addEventListener("scroll", onScroll, { passive: true });
  disposer.add(() => el.removeEventListener("scroll", onScroll));

  // A pinned header sticks directly BELOW the title, which means it needs the
  // title's height as an offset. Published as a custom property and written
  // imperatively: this changes on resize, not on render.
  const titleEl = titlePart?.measureEl;
  if (titleEl && typeof ResizeObserver !== "undefined") {
    const sync = () =>
      el.style.setProperty("--zen-dynamic-page-title-h", `${titleEl.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(titleEl);
    disposer.add(() => ro.disconnect());
  }

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      renderRoot();
      if (next.headerExpanded !== undefined) expanded.sync(next.headerExpanded);
      if (next.headerPinnable !== undefined) {
        if (!(next.headerPinnable ?? true) && pinned) setPinned(false);
        headerPart?.paint();
      }
      if (next.showFooter !== undefined) footerPart?.paint();
    },
    destroy() {
      disposer.dispose();
      removeProps?.();
      el.remove();
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Title                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export interface DynamicPageTitleProps extends BaseProps {
  heading: Child;
  subheading?: Child;
  /** Rendered at the trailing edge; does not collapse. */
  actions?: Child;
  breadcrumbs?: Child;
  /** Extra title content shown only while the header is EXPANDED. */
  expandedContent?: Child;
  /** Extra title content shown only while the header is SNAPPED — the way to keep
   *  the facts you lose to the collapse. */
  snappedContent?: Child;
}

export function DynamicPageTitle(props: DynamicPageTitleProps): PartHandle<DynamicPageTitleProps> {
  let current: DynamicPageTitleProps = { ...props };
  let ctx: DynamicPageContext | null = null;

  const el = document.createElement("div");
  el.className = cn(
    // Sticky at ALL times — only the header below it ever collapses.
    "zen-sticky zen-top-0 zen-z-20 zen-shrink-0 zen-bg-zen-background zen-px-4 zen-pb-2 zen-pt-3",
  );

  const breadcrumbSlot = document.createElement("div");
  breadcrumbSlot.className = "zen-mb-1 zen-min-w-0";

  const row = document.createElement("div");
  row.className = "zen-flex zen-items-start zen-justify-between zen-gap-4";

  const leftCol = document.createElement("div");
  leftCol.className = "zen-min-w-0 zen-flex-1";

  const h2 = document.createElement("h2");
  h2.className = "zen-m-0";

  // The heading IS the expand/collapse control: the header toggles on a title
  // click, and a11y wants a real button carrying aria-expanded. One element
  // satisfies both, and its text is the accessible name.
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className =
    "zen-group zen-inline-flex zen-max-w-full zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-bg-transparent zen-px-1 zen-py-0.5 zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
  btn.addEventListener("click", () => ctx?.requestExpanded(!ctx.getExpanded()));

  const headingSpan = document.createElement("span");
  headingSpan.className = "zen-truncate";

  const chevron = Icon({ name: "chevron-up", size: 16, class: "zen-shrink-0 zen-text-zen-muted-fg" });

  const subheading = document.createElement("p");
  subheading.className = "zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg";

  /** Holds expandedContent OR snappedContent — the one the current state wants. */
  const extraSlot = document.createElement("div");

  const actionsSlot = document.createElement("div");
  actionsSlot.className = "zen-flex zen-shrink-0 zen-items-center zen-gap-2";

  const childrenSlot = document.createElement("div");
  childrenSlot.style.display = "contents";

  btn.append(headingSpan, chevron.el);
  h2.append(btn);
  leftCol.append(h2);
  row.append(leftCol);
  el.append(row);

  const isExpanded = () => (ctx ? ctx.getExpanded() : true);
  const has = (v: Child) => v != null && v !== false;

  /** Rebuild the parts that come straight from props (called on create + update). */
  const render = () => {
    headingSpan.replaceChildren(...toNodes(current.heading));

    if (has(current.breadcrumbs)) {
      breadcrumbSlot.replaceChildren(...toNodes(current.breadcrumbs));
      if (!breadcrumbSlot.isConnected) el.insertBefore(breadcrumbSlot, row);
    } else {
      breadcrumbSlot.remove();
    }

    // Rebuild the left column deterministically: h2, subheading?, extraSlot,
    // childrenSlot — extraSlot before children so the snapped/expanded facts sit
    // with the title, not after the caller's extra content.
    const left: Node[] = [h2];
    if (has(current.subheading)) {
      subheading.replaceChildren(...toNodes(current.subheading));
      left.push(subheading);
    }
    left.push(extraSlot);
    childrenSlot.replaceChildren(...toNodes(current.children));
    left.push(childrenSlot);
    leftCol.replaceChildren(...left);

    if (has(current.actions)) {
      actionsSlot.replaceChildren(...toNodes(current.actions));
      if (actionsSlot.parentElement !== row) row.append(actionsSlot);
    } else {
      actionsSlot.remove();
    }

    paint();
  };

  /** Update everything the expanded state drives. */
  const paint = () => {
    const open = isExpanded();
    el.setAttribute("data-state", open ? "expanded" : "snapped");
    btn.setAttribute("aria-expanded", String(open));
    if (ctx) btn.setAttribute("aria-controls", ctx.headerId);
    chevron.update({ name: open ? "chevron-up" : "chevron-down" });
    extraSlot.replaceChildren(...toNodes(open ? current.expandedContent : current.snappedContent));
  };

  render();

  const internals: PartInternals = {
    kind: "title",
    measureEl: el,
    connect(next) {
      ctx = next;
      paint();
    },
    paint,
  };

  return {
    el,
    [PART]: internals,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      chevron.destroy();
      el.remove();
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Header                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export interface DynamicPageHeaderProps extends BaseProps {
  "aria-label"?: string;
  pinLabel?: string;
  unpinLabel?: string;
}

export function DynamicPageHeader(props: DynamicPageHeaderProps = {}): PartHandle<DynamicPageHeaderProps> {
  let current: DynamicPageHeaderProps = { ...props };
  let ctx: DynamicPageContext | null = null;

  // 1fr → 0fr on a grid row collapses to zero without anyone measuring the
  // content, and animates, which `height: auto` cannot. The transition-property
  // is spelled as an arbitrary PROPERTY, not `zen-transition-[…]`, which Uno has
  // no arbitrary-value form of and would emit nothing for.
  const el = document.createElement("div");

  const inner = document.createElement("div");
  inner.className = "zen-min-h-0 zen-overflow-hidden";

  const row = document.createElement("div");
  row.className = "zen-flex zen-items-end zen-justify-between zen-gap-4 zen-px-4 zen-pb-3 zen-pt-1";

  const content = document.createElement("div");
  content.className = "zen-min-w-0 zen-flex-1";

  const pinBtn = document.createElement("button");
  pinBtn.type = "button";
  const pinIcon = Icon({ name: "lock", size: 14 });
  pinBtn.append(pinIcon.el);
  pinBtn.addEventListener("click", () => ctx?.setPinned(!ctx.getPinned()));

  row.append(content);
  inner.append(row);
  el.append(inner);

  const isExpanded = () => (ctx ? ctx.getExpanded() : true);

  const render = () => {
    content.replaceChildren(...toNodes(current.children));
    el.setAttribute("role", "region");
    el.setAttribute("aria-label", current["aria-label"] ?? "Page header");
    paint();
  };

  const paint = () => {
    const open = isExpanded();
    const pinned = ctx ? ctx.getPinned() : false;
    const pinnable = ctx ? ctx.headerPinnable() : true;

    el.className = cn(
      "zen-grid zen-shrink-0 zen-overflow-hidden zen-border-b zen-border-zen-border zen-bg-zen-background zen-[transition-property:grid-template-rows] zen-duration-200 zen-ease-out",
      open ? "zen-grid-rows-[1fr]" : "zen-grid-rows-[0fr]",
      // Pinned: ride along under the sticky title instead of scrolling away. The
      // border-b sits on THIS element, outside the clipped row, so a collapsed
      // header still draws the line under the title.
      pinned && "zen-sticky zen-z-10",
      current.class,
    );
    el.setAttribute("data-state", open ? "expanded" : "collapsed");
    if (ctx) el.id = ctx.headerId;
    // Collapsed content is clipped, not removed — without this it keeps its place
    // in the tab order and the accessibility tree.
    el.toggleAttribute("inert", !open);
    if (pinned) el.style.top = "var(--zen-dynamic-page-title-h, 0px)";
    else el.style.removeProperty("top");

    if (pinnable) {
      pinBtn.className = cn(
        "zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-transparent zen-text-zen-muted-fg zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        pinned && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
      );
      pinBtn.setAttribute("aria-pressed", String(pinned));
      pinBtn.setAttribute("aria-label", pinned ? (current.unpinLabel ?? "Unpin header") : (current.pinLabel ?? "Pin header"));
      if (pinBtn.parentElement !== row) row.append(pinBtn);
    } else {
      pinBtn.remove();
    }
  };

  render();

  const internals: PartInternals = {
    kind: "header",
    measureEl: el,
    connect(next) {
      ctx = next;
      paint();
    },
    paint,
  };

  return {
    el,
    [PART]: internals,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      pinIcon.destroy();
      el.remove();
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Footer                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export type DynamicPageFooterProps = BaseProps;

export function DynamicPageFooter(props: DynamicPageFooterProps = {}): PartHandle<DynamicPageFooterProps> {
  let current: DynamicPageFooterProps = { ...props };
  let ctx: DynamicPageContext | null = null;

  // mt-auto pins the bar to the bottom when the content is too short to fill the
  // page; sticky keeps it there once the content overflows. pointer-events-none on
  // the rail so the floating bar's margins do not swallow clicks meant for the
  // content scrolling underneath it.
  const el = document.createElement("div");
  el.className = "zen-pointer-events-none zen-sticky zen-bottom-0 zen-z-30 zen-mt-auto zen-shrink-0 zen-p-3";

  const bar = document.createElement("div");
  el.append(bar);

  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, children, ...rest } = current;
    bar.className = cn(
      "zen-pointer-events-auto zen-flex zen-items-center zen-justify-end zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-shadow-lg",
      className,
    );
    bar.replaceChildren(...toNodes(children));
    removeProps?.();
    removeProps = applyProps(bar, rest as Record<string, unknown>);
    paint();
  };

  const paint = () => {
    // showFooter toggles the footer without removing the page — the React binding
    // returns null; here the rail is simply hidden.
    el.style.display = ctx && !ctx.showFooter() ? "none" : "";
  };

  render();

  const internals: PartInternals = {
    kind: "footer",
    connect(next) {
      ctx = next;
      paint();
    },
    paint,
  };

  return {
    el,
    [PART]: internals,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      removeProps?.();
      el.remove();
    },
  };
}
