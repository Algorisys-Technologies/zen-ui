import {
  DiagramCanvas,
  ArchitectureDraw,
  type DiagramCanvasProps,
  type ArchitectureDrawProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-diagram-canvas provider="yappydraw" height="32rem">
 * <zen-architecture-draw label="System design">
 *
 * `value` is a string either way — draw.io XML or a YappyDraw JSON document — so
 * a diagram genuinely can be seeded from markup, though a real one is long
 * enough that a property reads better.
 *
 * `sandbox` is exposed as an attribute deliberately: overriding it is a security
 * decision, and one a consumer must be able to make without forking the
 * component. Read the note beside the default in the vanilla source before
 * narrowing it — dropping `allow-same-origin` gives the frame an opaque origin
 * and stops most editors loading their own assets.
 *
 * ArchitectureDraw takes its actions from light-DOM children.
 */
defineZenElement<DiagramCanvasProps>({
  tag: "zen-diagram-canvas",
  factory: DiagramCanvas,
  attrs: {
    provider: "string",
    value: "string",
    src: "string",
    sandbox: "string",
    height: "string",
    title: "string",
  },
  props: ["onChange", "onSave", "onReady", "onError"],
  events: {
    onChange: "zen-change",
    onSave: "zen-save",
    onReady: "zen-ready",
    onError: "zen-error",
  },
  childrenProp: false,
});

defineZenElement<ArchitectureDrawProps>({
  tag: "zen-architecture-draw",
  factory: ArchitectureDraw,
  attrs: {
    provider: "string",
    value: "string",
    src: "string",
    sandbox: "string",
    height: "string",
    title: "string",
    label: "string",
  },
  props: ["label", "onChange", "onSave", "onReady", "onError"],
  events: {
    onChange: "zen-change",
    onSave: "zen-save",
    onReady: "zen-ready",
    onError: "zen-error",
  },
  childrenProp: "actions",
});
