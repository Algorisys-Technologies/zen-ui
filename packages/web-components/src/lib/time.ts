import type { ZenComponent } from "@algorisys/zen-ui-vanilla";

/**
 * Times for the shop-floor elements (<zen-state-timeline>, <zen-andon-board>,
 * <zen-rate-bars>, <zen-planned-vs-actual>, <zen-shift-navigator>).
 *
 * Their factories take `Date | number` everywhere a moment is meant, and an
 * attribute (or the json inside one) can only hand over a string. So a string is
 * revived here, in one place, the same way for all five:
 *
 * - all digits (`"1794636000000"`) -> that epoch number. `new Date("1794…")` is
 *   Invalid Date, so a numeric attribute has to be recognised, not parsed.
 * - anything else -> `new Date(s)`, i.e. an ISO string. Write the offset
 *   (`2026-11-13T06:00:00Z`); a bare date-time is read in the browser's zone.
 * - `undefined` and `null` survive as themselves. A segment's `end: null` means
 *   "still going" and must not become the epoch.
 *
 * A Date or a number set as a PROPERTY passes through untouched.
 */
export type TimeIn = Date | number | string | null | undefined;

export function asTime(value: TimeIn): Date | number | null | undefined {
  if (typeof value !== "string") return value;
  const s = value.trim();
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : new Date(s);
}

/**
 * Wrap a factory so `revive` runs on the props it is built with AND on every
 * later `update()`. lib/define.ts calls `factory` once and then `update` directly,
 * so reviving in the factory alone would hand the next attribute change its raw
 * strings — the chart would draw right once and break on the first edit.
 *
 * `revive` gets partial props on update (vanilla's update merges), so it must
 * only touch keys that are present.
 */
export function revived<P, E extends Element>(
  factory: (props: P) => ZenComponent<P, E>,
  revive: (props: Partial<P>) => Partial<P>,
): (props: P) => ZenComponent<P, E> {
  return (props) => {
    const inner = factory(revive(props) as P);
    /* `el` is read through, not copied: AndonTile swaps its root between a
       <div> and a <button> when `onClick` comes and goes, and its handle's `el`
       follows. Any other member of the handle is forwarded as it is. */
    const handle = Object.defineProperties(
      {},
      Object.getOwnPropertyDescriptors(inner),
    ) as ZenComponent<P, E>;
    Object.defineProperty(handle, "el", { configurable: true, enumerable: true, get: () => inner.el });
    Object.defineProperty(handle, "update", {
      configurable: true,
      enumerable: true,
      value: (next: Partial<P>) => inner.update(revive(next)),
    });
    return handle;
  };
}

/** Revive the listed keys of a props object, leaving absent keys absent. */
export function reviveKeys<P>(props: Partial<P>, keys: readonly (keyof P)[]): Partial<P> {
  const out = { ...props } as Record<keyof P, unknown>;
  for (const key of keys) {
    if (key in out) out[key] = asTime(out[key] as TimeIn);
  }
  return out as Partial<P>;
}

/** Revive the listed time fields of each record in an array (absent -> left alone). */
export function reviveEach<T>(list: readonly T[] | undefined, keys: readonly (keyof T)[]): T[] | undefined {
  if (!Array.isArray(list)) return list as T[] | undefined;
  return list.map((item) => reviveKeys<T>(item, keys) as T);
}
