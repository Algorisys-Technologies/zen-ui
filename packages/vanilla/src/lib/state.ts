/**
 * Controlled / uncontrolled resolution — what every Radix and Kobalte root does
 * for free, written out.
 *
 * The React API this mirrors:
 *   value          present -> CONTROLLED. The caller owns it; we never write it.
 *   defaultValue   present -> UNCONTROLLED. We own it; the caller is told.
 *   onValueChange  called either way, always with the value the caller should see.
 *
 * The subtle half is that a controlled component must still REPORT a change it
 * refuses to make. Swallowing the callback because the value did not change is how
 * a controlled Tabs becomes a dead control: the caller never learns the user
 * clicked, so it never updates `value`, so nothing ever moves.
 */

export interface Controllable<T> {
  /** The current value. */
  get(): T;
  /**
   * Request a change. Notifies the caller always; writes only when uncontrolled.
   * No-ops when the value is unchanged, so callers can call it freely.
   */
  set(next: T): void;
  /** True when the caller owns the value. */
  readonly controlled: boolean;
  /** Push a new controlled value in (from `update()`). */
  sync(next: T | undefined): void;
  /** Run `fn` whenever the value changes, for either reason. */
  subscribe(fn: (v: T) => void): () => void;
}

export function controllable<T>(opts: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (v: T) => void;
  /** Compare values; defaults to Object.is. Pass one for arrays/objects. */
  equals?: (a: T, b: T) => boolean;
}): Controllable<T> {
  const equals = opts.equals ?? Object.is;
  const controlled = opts.value !== undefined;
  let current = controlled ? (opts.value as T) : opts.defaultValue;
  const subs = new Set<(v: T) => void>();

  const emit = (v: T) => {
    for (const fn of subs) fn(v);
  };

  return {
    controlled,
    get: () => current,
    set(next) {
      if (equals(next, current)) return;
      // Report BEFORE deciding whether to store. A controlled caller's whole job
      // is to hear this and hand back a new `value`.
      opts.onChange?.(next);
      if (controlled) return;
      current = next;
      emit(current);
    },
    sync(next) {
      if (next === undefined || equals(next, current)) return;
      current = next;
      emit(current);
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}
