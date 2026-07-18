import {
  ObjectStatus, ObjectNumber, ObjectIdentifier, ObjectMarker,
  type ObjectStatusProps, type ObjectNumberProps,
  type ObjectIdentifierProps, type ObjectMarkerProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `icon` is an IconName string (or null via JS to suppress it), so it is an attr.
defineZenElement<ObjectStatusProps>({
  tag: "zen-object-status",
  factory: ObjectStatus,
  attrs: {
    state: "string",
    icon: "string",
    inverted: "boolean",
    "state-announcement": "string",
  },
});

// `value`/`unit` are Child -> JS properties. No `children` prop -> no slot.
defineZenElement<ObjectNumberProps>({
  tag: "zen-object-number",
  factory: ObjectNumber,
  attrs: { state: "string", emphasized: "boolean" },
  props: ["value", "unit"],
  childrenProp: false,
});

// `title`/`text` are Child -> JS properties. No `children` prop -> no slot.
defineZenElement<ObjectIdentifierProps>({
  tag: "zen-object-identifier",
  factory: ObjectIdentifier,
  props: ["title", "text"],
  childrenProp: false,
});

defineZenElement<ObjectMarkerProps>({
  tag: "zen-object-marker",
  factory: ObjectMarker,
  attrs: { type: "string", "show-label": "boolean", label: "string" },
  childrenProp: false,
});
