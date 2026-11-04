import { Show } from "solid-js";
import { type NavItem, isNew, isUpdated } from "../nav";
import { cn } from "../lib/cn";

/**
 * The demo site's "New" / "Updated" mark beside a catalogue entry, from its
 * `since` / `updated` versions in nav.ts. One component, so the sidebar and the
 * catalogue cards cannot disagree. New is the stronger mark; Updated is quiet.
 */
export const NavTag = (props: { item: NavItem; class?: string }) => (
  <Show
    when={isNew(props.item)}
    fallback={
      <Show when={isUpdated(props.item)}>
        <span
          class={cn(
            "zen-rounded-zen-sm zen-border zen-border-solid zen-border-zen-border zen-px-1.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg",
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
        "zen-rounded-zen-sm zen-bg-zen-primary-soft zen-px-1.5 zen-py-px zen-text-xs zen-font-medium zen-text-zen-primary-soft-fg",
        props.class,
      )}
    >
      New
    </span>
  </Show>
);
