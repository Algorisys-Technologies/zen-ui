/**
 * The port queue — what the lead binding has shipped that the others have not yet.
 *
 * Since 13.8.0 each binding is versioned on its own. Solid is in production and
 * ships first (bindings.mjs, `lead`); React, vanilla and web-components are
 * brought to parity behind it. Before the split, a component in one binding and
 * not the others turned `check:parity` red until all four had it, which made a
 * Solid fix wait on three ports. Now the gap is allowed — but only if it is
 * WRITTEN DOWN here. That is what keeps "parity later" from becoming "parity
 * never": the gap is a line in a file, printed as QUEUED on every check run.
 *
 * The rules, enforced by check-parity.ts and check-props.ts:
 *   - a gap that is not listed here still FAILS (a component that skipped a
 *     binding without anyone deciding so);
 *   - a listed entry whose gap has closed FAILS too — delete the line when the
 *     port lands, so this file stays the truth and only shrinks;
 *   - the listed bindings must be exactly the ones that lack it.
 *
 * Not for design divergences (Select, Toast, the data-driven families) — those
 * are decisions and live in check-parity's DIVERGENT and bindings.mjs. This is
 * debt with a due date: the next release of each listed binding.
 *
 * React is still the API reference. A Solid-first API is reconciled when React
 * ports it — before React's release, not after.
 */

/**
 * Exported components (check-parity): "Name" -> the bindings that lack it, and
 * the release that introduced it.
 *
 *   ProcessMap: { lacking: ["react", "vanilla", "web-components"], from: "solid 13.9.0" },
 *
 * @type {Record<string, { lacking: string[]; from: string }>}
 */
export const QUEUED_COMPONENTS = {};

/**
 * Props (check-props): "Interface.member" -> the bindings that lack it.
 *
 *   "GanttProps.baseline": { lacking: ["react", "vanilla", "web-components"], from: "solid 13.9.0" },
 *
 * @type {Record<string, { lacking: string[]; from: string }>}
 */
export const QUEUED_PROPS = {};
