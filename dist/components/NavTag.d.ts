import { type NavItem } from "../nav";
/**
 * The demo site's "New" / "Updated" mark beside a catalogue entry, from its
 * `since` / `updated` versions in nav.ts. One component, so the sidebar and the
 * catalogue cards cannot disagree. New is green, Updated yellow, each in the
 * theme's soft background with its matching text colour.
 */
export declare function NavTag({ item, className }: {
    item: NavItem;
    className?: string;
}): import("react").JSX.Element | null;
//# sourceMappingURL=NavTag.d.ts.map