/**
 * Sidebar logic shared by every binding: what the collapsed rail's tooltip
 * says, and when it says nothing. One copy, so the four bindings cannot
 * disagree about which rows get a tooltip.
 */

export type SidebarCollapseMode = "icon" | "labelled" | "hidden";

/** Marks a row the rail tooltip may describe. Set by SidebarMenuButton. */
export const SIDEBAR_MENU_BUTTON_ATTR = "data-sidebar-menu-button";

/**
 * The tooltip a collapsed rail shows for a menu row, or null for none.
 *
 * - An explicit `data-tooltip` always wins.
 * - On the icon rail the row's label is hidden, so the tooltip is the label.
 * - On the labelled rail the label is on screen, so a tooltip would only say
 *   it twice; it appears only when the label is truncated.
 *
 * The label is the row's first direct `<span>` that is not a badge — the
 * same element the collapsed styles fade, so what the tooltip reads is what
 * the rail stopped showing.
 */
export function sidebarRailTooltip(row: HTMLElement, mode: SidebarCollapseMode): string | null {
  const explicit = row.getAttribute("data-tooltip");
  if (explicit) return explicit;
  const label = Array.from(row.children).find(
    (c): c is HTMLElement => c.tagName === "SPAN" && !c.hasAttribute("data-sidebar-badge"),
  );
  const text = label?.textContent?.trim();
  if (!label || !text) return null;
  if (mode === "labelled" && label.scrollWidth <= label.clientWidth) return null;
  return text;
}

/**
 * Publish the width a sidebar's scrollbar takes as `--zen-sidebar-gutter` on
 * the sidebar itself (0px when nothing overflows).
 *
 * The whole sidebar is one scroller, with its header and footer stuck to its
 * ends, so a single scrollbar runs its full height and every section sits in
 * the same client width. On a rail that width is what the tiles are centred
 * in, so the rail widths add the gutter: the scrollbar gets a strip of its
 * own instead of eating 10px of an 80px rail and throwing every label 5px off
 * its icon. Its width is the platform's (thin is 10px in Chrome, different
 * elsewhere, 0 for overlay scrollbars), so it is measured, not assumed.
 *
 * Also sets scroll padding the height of the stuck header and footer, so
 * a row scrolled into view is never left underneath one of them.
 *
 * Re-measured whenever the sidebar or a child changes size (a rail's tiles
 * are taller than an expanded row's, so collapsing can start an overflow).
 * Returns a cleanup.
 */
export function watchSidebarScrollbar(el: HTMLElement): () => void {
  let gutter = -1;
  const update = () => {
    // offsetWidth - clientWidth also counts the borders (the sidebar has one).
    const cs = getComputedStyle(el);
    const borders = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    const g = Math.max(0, Math.round(el.offsetWidth - el.clientWidth - borders));
    if (g !== gutter) {
      gutter = g;
      el.style.setProperty("--zen-sidebar-gutter", `${g}px`);
    }
    // The stuck header and footer sit over the scrolling menu, so a row
    // scrolled into view (keyboard focus, scrollIntoView) would land behind
    // one of them. Scroll padding the size of each keeps it in the clear.
    let top = 0;
    let bottom = 0;
    for (const c of Array.from(el.children)) {
      const ccs = getComputedStyle(c);
      if (ccs.position !== "sticky") continue;
      const h = (c as HTMLElement).offsetHeight;
      if (ccs.top !== "auto") top = Math.max(top, h);
      else if (ccs.bottom !== "auto") bottom = Math.max(bottom, h);
    }
    el.style.scrollPaddingTop = top ? `${top}px` : "";
    el.style.scrollPaddingBottom = bottom ? `${bottom}px` : "";
  };
  const ro = new ResizeObserver(update);
  const observeChildren = () => {
    ro.disconnect();
    ro.observe(el);
    for (const c of Array.from(el.children)) ro.observe(c);
  };
  const mo = new MutationObserver(() => {
    observeChildren();
    update();
  });
  observeChildren();
  mo.observe(el, { childList: true });
  update();
  return () => {
    ro.disconnect();
    mo.disconnect();
    el.style.removeProperty("--zen-sidebar-gutter");
    el.style.scrollPaddingTop = "";
    el.style.scrollPaddingBottom = "";
  };
}

/** Seconds or milliseconds from a computed `transition-duration` entry. */
const toMs = (t: string): number => (t.trim().endsWith("ms") ? parseFloat(t) : parseFloat(t) * 1000) || 0;

/**
 * Call `done` once `el`'s width transition has finished, or after its
 * computed duration plus delay if no `transitionend` arrives (the width did
 * not change, the tab is hidden, a reduced-motion 0.01ms transition). Returns
 * a cancel.
 *
 * Collapsing into the labelled rail uses it to sequence the move: the rail
 * narrows with the rows still laid out as rows, and only then do they become
 * tiles. Switching the layout on the first frame made the menu finish at once
 * while the width spent the whole duration catching up, so the sidebar
 * looked slower than its own contents.
 */
export function afterWidthTransition(el: HTMLElement, done: () => void): () => void {
  const cs = getComputedStyle(el);
  const longest = (v: string) => Math.max(0, ...v.split(",").map(toMs));
  const wait = longest(cs.transitionDuration) + longest(cs.transitionDelay);
  let finished = false;
  const onEnd = (e: TransitionEvent) => {
    if (e.target === el && e.propertyName === "width") finish();
  };
  const timer = setTimeout(() => finish(), wait + 50);
  const stop = () => {
    clearTimeout(timer);
    el.removeEventListener("transitionend", onEnd);
  };
  function finish() {
    if (finished) return;
    finished = true;
    stop();
    done();
  }
  el.addEventListener("transitionend", onEnd);
  return () => {
    finished = true;
    stop();
  };
}
