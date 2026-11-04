import { Show } from "solid-js";
import { type NavItem, isNew, isUpdated } from "../nav";
import { cn } from "../lib/cn";

/**
 * The demo site's "New" / "Updated" mark beside a catalogue entry, from its
 * `since` / `updated` versions in nav.ts. One component, so the sidebar and the
 * catalogue cards cannot disagree. New is green, Updated yellow, each in the
 * theme's soft background with its matching text colour.
 */
export const NavTag = (props: { item: NavItem; class?: string }) => (
  <Show
    when={isNew(props.item)}
    fallback={
      <Show when={isUpdated(props.item)}>
        <span
          class={cn(
            "zen-rounded-zen-sm zen-bg-zen-warning-soft zen-px-1.5 zen-py-px zen-text-xs zen-font-medium zen-text-zen-warning-soft-fg",
            props.class,
          )}
        >
          Updated
        </span>
      </Show>
    }
  >
    <span
      class={cn(
        "zen-rounded-zen-sm zen-bg-zen-success-soft zen-px-1.5 zen-py-px zen-text-xs zen-font-medium zen-text-zen-success-soft-fg",
        props.class,
      )}
    >
      New
    </span>
  </Show>
);
