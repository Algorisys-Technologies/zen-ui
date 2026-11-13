import { GenealogyGraph, type GenealogyGraphProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-genealogy-graph nodes='[…]' edges='[{"from":"LOT-77","to":"WO-10042"}]' focus="WO-10042">
 *
 * Data-driven: no slot. `nodes` and `edges` are json attributes and JS
 * properties; an edge runs from an input to what it went into.
 *
 * `focus` — the item traced — is an ATTRIBUTE ONLY. As a property it would be
 * the host's `focus()` method, and replacing that with a string breaks every
 * caller that moves focus to an element it was handed (a dialog returning
 * focus, a skip link). define.ts gives every attribute a reflecting accessor,
 * so this file takes that one back off the prototype after defining the
 * element; the native method shows through again. Set it with
 * `el.setAttribute("focus", id)` — it is a string, so nothing is lost.
 * `default-focus` is the uncontrolled start; with neither, the first node.
 *
 * `zen-focus-change` (detail: the id) fires when a node is clicked. With
 * `focus` set, it is a request: set the attribute to follow it.
 */
defineZenElement<GenealogyGraphProps>({
  tag: "zen-genealogy-graph",
  factory: GenealogyGraph,
  attrs: {
    nodes: "json",
    edges: "json",
    focus: "string",
    "default-focus": "string",
    "max-depth": "number",
  },
  props: ["nodes", "edges"],
  events: { onFocusChange: "zen-focus-change" },
  childrenProp: false,
});

if (typeof customElements !== "undefined") {
  const ctor = customElements.get("zen-genealogy-graph");
  if (ctor && Object.prototype.hasOwnProperty.call(ctor.prototype, "focus")) {
    delete (ctor.prototype as { focus?: unknown }).focus;
  }
}
