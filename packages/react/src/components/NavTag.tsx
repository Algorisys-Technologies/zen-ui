import { type NavItem, isNew, isUpdated } from "../nav";
import { cn } from "../lib/cn";

/**
 * The demo site's "New" / "Updated" mark beside a catalogue entry, from its
 * `since` / `updated` versions in nav.ts. One component, so the sidebar and the
 * catalogue cards cannot disagree. New is green, Updated yellow, each in the
 * theme's soft background with its matching text colour.
 */
export function NavTag({ item, className }: { item: NavItem; className?: string }) {
  if (isNew(item))
    return (
      <span
        className={cn(
          "zen-rounded-zen-sm zen-bg-zen-success-soft zen-px-1.5 zen-py-px zen-text-xs zen-font-medium zen-text-zen-success-soft-fg",
          className,
        )}
      >
        New
      </span>
    );
  if (isUpdated(item))
    return (
      <span
        className={cn(
          "zen-rounded-zen-sm zen-bg-zen-warning-soft zen-px-1.5 zen-py-px zen-text-xs zen-font-medium zen-text-zen-warning-soft-fg",
          className,
        )}
      >
        Updated
      </span>
    );
  return null;
}
