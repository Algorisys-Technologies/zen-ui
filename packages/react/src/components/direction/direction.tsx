import * as React from "react";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";
import {
  type Direction,
  readDocumentDirection,
  observeDocumentDirection,
} from "@algorisys/zen-ui-core";

export type { Direction };

export interface DirectionProviderProps {
  /**
   * Reading direction for everything inside. Omit it and the document's own
   * `dir` is used and kept in sync — which is what an app that sets `dir` on
   * <html> already wants, with no zen-ui code at all.
   */
  dir?: Direction;
  children?: React.ReactNode;
}

/**
 * DirectionProvider — tells the Radix primitives which way the page reads.
 *
 * CSS handles most of RTL on its own: logical properties flip, flex and grid
 * flip, text aligns by reading direction. What CSS cannot reach is the
 * JavaScript deciding which SIDE a submenu opens on, what Left and Right mean
 * in a menu, and which way a slider fills. Radix keeps that in its own context
 * and defaults to "ltr" whatever `document.dir` says — so without this, an RTL
 * app looks right and behaves left.
 *
 *   <DirectionProvider>        // follows <html dir>, live
 *     <App />
 *   </DirectionProvider>
 *
 * Render it once near the root, above anything from zen-ui. It renders no
 * element of its own, so it never affects layout.
 *
 * NOTE — zen-ui's OWN components (Carousel, Rating, Tree, OTP, …) do not read
 * this. They resolve direction from the DOM with `directionOf()` in core, which
 * sees the effective `dir` at their own position in the tree, so they are
 * correct inside an rtl subtree of an ltr page and need no provider at all.
 * This exists purely because Radix cannot do that.
 */
export const DirectionProvider: React.FC<DirectionProviderProps> = ({ dir, children }) => {
  const [documentDir, setDocumentDir] = React.useState<Direction>(readDocumentDirection);

  React.useEffect(() => {
    // The attribute may have changed between render and effect.
    setDocumentDir(readDocumentDirection());
    return observeDocumentDirection(setDocumentDir);
  }, []);

  return <RadixDirectionProvider dir={dir ?? documentDir}>{children}</RadixDirectionProvider>;
};
