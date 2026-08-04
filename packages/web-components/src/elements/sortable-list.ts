import { SortableList, type SortableListProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-sortable-list items='[{"id":"a","content":"Alpha"}]'>
 *
 * `items` is json AND a property. A row's `content` may be a Node, which JSON
 * cannot express, so a caller with rich rows sets `el.items = […]`.
 *
 * `onReorder` is REQUIRED by the factory — the list is always controlled — so the
 * element defaults it to a no-op when neither the property nor a listener is set.
 * Without that the component throws on connect and a purely declarative
 * `<zen-sortable-list items="…">` could not be put on a page at all, which is the
 * one thing this layer exists to make possible. The `zen-reorder` event still
 * fires either way, so the declarative caller listens for it and writes the order
 * back.
 */
defineZenElement<SortableListProps>({
  tag: "zen-sortable-list",
  factory: (props) => SortableList({ ...props, onReorder: props.onReorder ?? (() => {}) }),
  /*
   * `handle` is json, not boolean, because it DEFAULTS TO TRUE.
   *
   * An absent boolean attribute is passed to the factory as an explicit `false`
   * (see define.ts: `props[prop] = type === "boolean" ? false : undefined`),
   * which is right for a default-false prop — banner.ts says so at its `sticky`
   * — and silently inverts a default-true one. As json, absent stays undefined so
   * the factory's own default wins, and `handle="false"` still parses to false.
   */
  attrs: {
    items: "json",
    orientation: "string",
    disabled: "boolean",
    handle: "json",
    announcements: "json",
  },
  props: ["items", "announcements", "onReorder", "onDragStart", "onDragEnd"],
  events: { onReorder: "zen-reorder", onDragStart: "zen-drag-start", onDragEnd: "zen-drag-end" },
  childrenProp: false,
});
