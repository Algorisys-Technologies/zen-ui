/**
 * Render into document.body — Radix's `Portal`.
 *
 * Why a dialog cannot just render in place: an ancestor with `overflow: hidden`
 * clips it, an ancestor with `transform`/`filter`/`will-change` becomes the
 * containing block for `position: fixed` (so a centered dialog centers on that
 * ancestor instead of the viewport), and any `z-index` stacking context traps it
 * under the page. All three look like a styling bug and none of them are.
 */

export interface PortalOptions {
  /** Where to mount. Defaults to document.body. */
  container?: HTMLElement;
}

export interface Portal {
  readonly container: HTMLElement;
  mount(node: Node): void;
  destroy(): void;
}

export function portal(opts: PortalOptions = {}): Portal {
  const container = opts.container ?? document.body;
  const mounted: Node[] = [];

  return {
    container,
    mount(node) {
      container.appendChild(node);
      mounted.push(node);
    },
    destroy() {
      for (const node of mounted) node.parentNode?.removeChild(node);
      mounted.length = 0;
    },
  };
}
