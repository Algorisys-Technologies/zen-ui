import { UploadCollection, type UploadCollectionProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-upload-collection items='[…]'>
 *
 * `items` is json AND a property, like <zen-timeline>: a list of already
 * uploaded files is markup-shaped, but a live one is written by the transport
 * through `el.items = […]`.
 *
 * The three handlers are events. They are OPT-IN by presence — the element only
 * passes a callback to the factory once someone listens — which is exactly what
 * this component needs, because the buttons are presence-gated: with no
 * `zen-remove` listener there is no delete button, matching
 * `UploadCollection({ items })` with no `onRemove`.
 *
 * `detail` is the item for remove and retry; for rename it is the two arguments
 * as an array, `[item, name]`, since a CustomEvent carries one payload.
 *
 * No slot: the files come from `items`.
 */
defineZenElement<UploadCollectionProps>({
  tag: "zen-upload-collection",
  factory: UploadCollection,
  attrs: { items: "json", "empty-message": "string", disabled: "boolean" },
  props: ["items", "emptyMessage"],
  events: {
    onRemove: "zen-remove",
    onRetry: "zen-retry",
    onRename: "zen-rename",
  },
  childrenProp: false,
});
