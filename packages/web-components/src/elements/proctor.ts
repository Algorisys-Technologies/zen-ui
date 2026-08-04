import {
  ProctorStreamGrid,
  ProctorFlagOverlay,
  type ProctorStreamGridProps,
  type ProctorFlagOverlayProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-proctor-stream-grid> and <zen-proctor-flag-overlay>
 *
 * `participants` is json AND a property, but the json path is the LESS useful
 * one here and that is worth saying: a participant's `stream` is a MediaStream,
 * which JSON cannot express at all, so markup can only seed the posters, names
 * and flags. Anything live arrives through `el.participants = […]`.
 *
 * No slot: the tiles come from `participants`.
 */
defineZenElement<ProctorStreamGridProps>({
  tag: "zen-proctor-stream-grid",
  factory: ProctorStreamGrid,
  attrs: {
    participants: "json",
    "min-tile-width": "string",
    max: "number",
    "empty-message": "string",
  },
  props: ["participants", "onSelect", "renderActions", "emptyMessage"],
  events: { onSelect: "zen-select" },
  childrenProp: false,
});

defineZenElement<ProctorFlagOverlayProps>({
  tag: "zen-proctor-flag-overlay",
  factory: ProctorFlagOverlay,
  attrs: { flags: "json", max: "number" },
  props: ["flags"],
  childrenProp: false,
});
