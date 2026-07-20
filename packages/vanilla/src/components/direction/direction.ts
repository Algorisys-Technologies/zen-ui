import { type Direction, readDocumentDirection } from "@algorisys/zen-ui-core";
import { applyProps, Disposer, setChildren, type BaseProps, type ZenComponent } from "../../lib/component";

export type { Direction };

export interface DirectionProviderProps extends BaseProps {
  /**
   * Reading direction for everything inside. Omit it and the document's own
   * `dir` is used — which is what an app that sets `dir` on <html> already
   * wants, with no zen-ui code at all.
   */
  dir?: Direction;
}

/**
 * DirectionProvider — sets the reading direction for a subtree.
 *
 * This binding has no headless primitive library, so there is no JS context to
 * feed: it sets `dir` on a real element, which is what CSS logical properties
 * and the BiDi algorithm already honour, and what `directionOf()` in core reads
 * when zen-ui's own components decide which way ArrowLeft means. One mechanism,
 * visible in the DOM, no bookkeeping.
 *
 * That makes it the SAME component as the React and Solid ones from a caller's
 * point of view — set a direction, everything inside follows — even though
 * those two additionally have to inform Radix and Kobalte.
 *
 * Most apps set `dir` on <html> and never need this. Reach for it to flip a
 * subtree against the document, which is exactly the case a document-level
 * attribute cannot express.
 */
export function DirectionProvider(props: DirectionProviderProps = {}): ZenComponent<DirectionProviderProps> {
  let current = { ...props };
  const el = document.createElement("div");
  // A wrapper that must not disturb layout: the element exists to carry `dir`,
  // not to be a box. `contents` keeps its children in the parent's flow.
  el.style.display = "contents";
  const disposer = new Disposer();
  let remove: (() => void) | undefined;
  const render = () => {
    const { dir, children, ...rest } = current;
    el.setAttribute("dir", dir ?? readDocumentDirection());
    setChildren(el, children);
    remove?.();
    remove = applyProps(el, rest as Record<string, unknown>);
  };
  render();
  disposer.add(() => remove?.());
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { disposer.dispose(); el.remove(); } };
}
