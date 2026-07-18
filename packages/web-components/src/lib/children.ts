import type { Child } from "@algorisys/zen-ui-vanilla";

/**
 * Detach and return the element's light-DOM children so a factory can adopt them.
 *
 * A vanilla factory renders its own root and appends it back into the host. If
 * the host still held its original children at that point, they would sit
 * alongside the rendered node — the caller's `Save` text stranded next to the
 * `<button>` that was supposed to contain it. So the children are removed here and
 * handed to the factory as its `children` prop; the factory moves them into the
 * element it builds.
 *
 * Returns real Nodes (not cloned): a `ZenComponent` passed as a child would have
 * been flattened to text by cloning, and moving the live node preserves it.
 */
export function captureChildren(host: HTMLElement): Child[] {
  const nodes = Array.from(host.childNodes);
  for (const n of nodes) n.remove();
  return nodes as Child[];
}
