import { type NavItem, isNew, isUpdated } from "../nav";

/**
 * The demo site's "New" / "Updated" mark beside a catalogue entry, from its
 * `since` / `updated` versions in nav.ts. One function, so the sidebar and the
 * catalogue cards cannot disagree. New is green, Updated yellow, each in the
 * theme's soft background with its matching text colour. Null when unmarked.
 */
export function navTag(item: NavItem, className = ""): HTMLElement | null {
  const tone = isNew(item) ? "success" : isUpdated(item) ? "warning" : undefined;
  if (!tone) return null;
  const span = document.createElement("span");
  span.className =
    `zen-rounded-zen-sm zen-bg-zen-${tone}-soft zen-px-1.5 zen-py-px zen-text-xs zen-font-medium zen-text-zen-${tone}-soft-fg ${className}`.trim();
  span.textContent = tone === "success" ? "New" : "Updated";
  return span;
}
