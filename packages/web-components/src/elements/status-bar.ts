import { StatusBar, type StatusBarProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-status-bar items='[{"id":"branch","icon":"flag","label":"main"},
 *                         {"id":"cursor","label":"Ln 42, Col 7","align":"end"}]'>
 *
 * `items` is the data collection — authorable inline as JSON, or set as
 * `el.items = [...]`. Only the property form can carry `onSelect` (a function)
 * or an element label, so clickable items are set from script. Setting
 * `el.items` again keeps the bar's DOM, so an `announce` item is still read
 * out when its text changes.
 *
 * `zen-collapse` fires with the ids that gave way (`event.detail`), as
 * `onCollapse` does.
 */
defineZenElement<StatusBarProps>({
  tag: "zen-status-bar",
  factory: StatusBar,
  attrs: {
    items: "json",
    variant: "string",
    size: "string",
    label: "string",
  },
  props: ["items"],
  events: { onCollapse: "zen-collapse" },
  childrenProp: false,
});
