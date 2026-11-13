/**
 * Sidebar logic shared by every binding.
 */
/**
 * Call `done` once `el`'s transition of `property` has finished, or after its
 * computed duration plus delay if no `transitionend` arrives (the value did
 * not change, the tab is hidden, a reduced-motion 0.01ms transition). Returns
 * a cancel.
 *
 * "Finished" means every OTHER property that started transitioning on `el`
 * has ended too, not only `property`. Callers remove `el` in `done`, and a
 * transition still running on a removed element never reports its end where
 * a document-level listener can hear it: Kobalte tracks running transitions
 * that way (`@kobalte/utils`, a `transitionrun` listener on body) and kept
 * every such element forever. The sidebar's sub-list eases `margin` beside
 * `grid-template-rows`, so each collapse of an open group leaked its list and
 * a listener, and Kobalte's after-transition callbacks stopped running for
 * good once its map could no longer empty.
 */
export declare function afterTransition(el: HTMLElement, property: string, done: () => void): () => void;
/**
 * `afterTransition` for the sidebar's width: how the sidebar knows a collapse
 * or expand is over, and stops clipping and keeping its rows to one line
 * (`data-transitioning`).
 */
export declare const afterWidthTransition: (el: HTMLElement, done: () => void) => (() => void);
