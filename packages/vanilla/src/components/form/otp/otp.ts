import { cn } from "../../../lib/cn";
import { applyProps, Disposer, toNodes, type Child, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";
import "./otp.css";

/**
 * InputOTP — one `<input>` per digit. Zero-dependency one-time-code field with
 * paste, keyboard nav (arrows + backspace-across-slots), mobile autocomplete
 * (`one-time-code`) and per-instance theming via `--zen-*`.
 *
 *   InputOTP({ maxLength: 6, value: code, onValueChange: (v) => …, groupSizes: [3, 3] })
 *
 * ## The divergence, and why this side of it
 *
 * React exposes a compound API — `<InputOTP>` wrapping `<InputOTPGroup>` /
 * `<InputOTPSlot>` / `<InputOTPSeparator>` — that works because of React CONTEXT:
 * each `<InputOTPSlot index={n}>` finds the shared value and the sibling-input
 * refs through the tree without the caller wiring anything. React ALSO ships the
 * exact data-driven form this uses — `maxLength` + `groupSizes` + `separator`
 * render the default layout when no children are given (`renderDefaultSlots`).
 *
 * With no framework there is no tree and no context, so a faithful compound port
 * would have to be `InputOTPSlot({ root: otp, index: n })`: the caller
 * hand-threading the parent into every slot, with a chance to get the index or the
 * root wrong on each one, purely to look like React. That is syntax-porting, which
 * LOOPS XXXVI forbids and which select.ts rejected for the same reason. So this
 * takes the data — the layout React already derives from `maxLength`/`groupSizes` —
 * and drops the compound sub-parts. The single `InputOTP` export belongs on
 * check-parity's DIVERGENT list alongside Select for the same reason.
 */

// --- Props -----------------------------------------------------------------

export interface InputOTPProps {
  value?: string;
  defaultValue?: string;
  /** Primary change handler. */
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. */
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  maxLength?: number;
  groupSizes?: number[];
  /** Rendered between groups. Defaults to a dash. A fresh copy is used per gap. */
  separator?: Child;
  disabled?: boolean;
  /** Transform pasted text before extracting digits. */
  pasteTransformer?: (text: string) => string;
  /**
   * CSS color for the default slot border. Defaults to `--zen-color-border`
   * (theme-aware — visible in dark mode).
   */
  borderColor?: string;
  /** CSS color for the focused slot border. Defaults to `--zen-color-primary`. */
  focusBorderColor?: string;
  /** Extra classes applied to every digit input. */
  slotClassName?: string;
  class?: string;
  containerClassName?: string;
  id?: string;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

// --- Pure helpers ----------------------------------------------------------

const digitsOnly = (text: string) => text.replace(/\D/g, "");

const sanitizePastedText = (
  text: string,
  maxLength: number,
  pasteTransformer?: (text: string) => string,
) => digitsOnly(pasteTransformer ? pasteTransformer(text) : text).slice(0, maxLength);

const defaultGroupSizes = (maxLength: number): number[] => {
  if (maxLength === 6) return [3, 3];
  if (maxLength === 4) return [4];
  if (maxLength === 5) return [5];
  return [maxLength];
};

// Our own trusted static SVG — the one innerHTML exception PORTING.md allows.
const DASH = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="12" x2="18" y2="12"/></svg>`;

const defaultSeparator = (): HTMLElement => {
  const d = document.createElement("div");
  d.setAttribute("role", "separator");
  d.innerHTML = DASH;
  return d;
};

const SLOT_BASE = cn(
  "zen-otp-slot zen-h-11 zen-w-11 zen-rounded-zen-md zen-bg-zen-background zen-p-0",
  "zen-text-center zen-text-base zen-font-medium zen-text-zen-foreground zen-tabular-nums",
  "zen-transition-colors",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
);

// --- The component ---------------------------------------------------------

export function InputOTP(props: InputOTPProps): ZenComponent<InputOTPProps> {
  let current: InputOTPProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let slotCleanups: Array<() => void> = [];
  let inputs: HTMLInputElement[] = [];

  const state = controllable<string>({
    value: current.value,
    defaultValue: current.defaultValue ?? "",
    onChange: (v) => (current.onValueChange ?? current.onChange)?.(v),
  });

  const focusInput = (index: number) => {
    const input = inputs[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  // Report and (uncontrolled) store a new value, fire onComplete when full, and
  // repaint the slots. Controlled callers hear onChange and hand a value back
  // through update({ value }); the explicit repaint enforces the controlled
  // invariant — an edit the caller does not accept is reflected back off.
  const updateValue = (next: string) => {
    const maxLength = current.maxLength ?? 6;
    const sanitized = digitsOnly(next).slice(0, maxLength);
    state.set(sanitized);
    if (sanitized.length === maxLength) current.onComplete?.(sanitized);
    repaint();
  };

  const applyDigits = (digits: string) => {
    const maxLength = current.maxLength ?? 6;
    const sanitized = sanitizePastedText(digits, maxLength, current.pasteTransformer);
    if (!sanitized) return;
    updateValue(sanitized);
    focusInput(Math.min(sanitized.length, maxLength) - 1);
  };

  const repaint = () => {
    const value = state.get();
    for (let i = 0; i < inputs.length; i++) inputs[i].value = value[i] ?? "";
  };

  const buildSeparator = (): Node[] => {
    if (current.separator !== undefined && current.separator !== null && current.separator !== false) {
      // Clone so the same passed node is never moved between gaps.
      return toNodes(current.separator).map((n) => n.cloneNode(true));
    }
    return [defaultSeparator()];
  };

  const makeSlot = (index: number): HTMLInputElement => {
    const maxLength = current.maxLength ?? 6;
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.autocomplete = index === 0 ? "one-time-code" : "off";
    input.setAttribute("aria-label", `Digit ${index + 1} of ${maxLength}`);
    input.disabled = Boolean(current.disabled);
    input.value = state.get()[index] ?? "";
    input.className = cn(SLOT_BASE, current.slotClassName);

    const onInput = () => {
      const max = current.maxLength ?? 6;
      const value = state.get();
      const digits = sanitizePastedText(input.value, max, current.pasteTransformer);

      if (digits.length > 1) {
        applyDigits(digits);
        return;
      }
      if (!digits) {
        updateValue(value.slice(0, index) + value.slice(index + 1));
        return;
      }
      const nextValue = (value.slice(0, index) + digits + value.slice(index + 1)).slice(0, max);
      updateValue(nextValue);
      if (index < max - 1) focusInput(index + 1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const max = current.maxLength ?? 6;
      const value = state.get();
      const char = value[index] ?? "";

      if (e.key === "Backspace") {
        e.preventDefault();
        if (char) {
          updateValue(value.slice(0, index) + value.slice(index + 1));
          return;
        }
        if (index > 0) {
          const prev = index - 1;
          updateValue(value.slice(0, prev) + value.slice(prev + 1));
          focusInput(prev);
        }
        return;
      }
      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
        return;
      }
      if (e.key === "ArrowRight" && index < max - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text");
      if (!text) return;
      e.preventDefault();
      applyDigits(text);
    };

    const onFocus = () => input.select();

    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKeyDown);
    input.addEventListener("paste", onPaste);
    input.addEventListener("focus", onFocus);
    slotCleanups.push(() => {
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKeyDown);
      input.removeEventListener("paste", onPaste);
      input.removeEventListener("focus", onFocus);
    });

    return input;
  };

  const render = () => {
    for (const c of slotCleanups) c();
    slotCleanups = [];

    const {
      class: className,
      containerClassName,
      borderColor,
      focusBorderColor,
      maxLength = 6,
      groupSizes,
      id,
      // interpreted elsewhere or not forwarded to the element:
      value: _value,
      defaultValue: _defaultValue,
      onValueChange: _onValueChange,
      onChange: _onChange,
      onComplete: _onComplete,
      pasteTransformer: _pasteTransformer,
      slotClassName: _slotClassName,
      separator: _separator,
      disabled: _disabled,
      ...rest
    } = current;

    el.className = cn(
      "zen-flex zen-items-center zen-gap-2 has-[:disabled]:zen-opacity-50",
      containerClassName,
      className,
    );
    if (id) el.id = id;

    if (borderColor) el.style.setProperty("--zen-otp-slot-border", borderColor);
    else el.style.removeProperty("--zen-otp-slot-border");
    if (focusBorderColor) el.style.setProperty("--zen-otp-slot-focus-border", focusBorderColor);
    else el.style.removeProperty("--zen-otp-slot-focus-border");

    const sizes = groupSizes ?? defaultGroupSizes(maxLength);
    inputs = [];
    el.replaceChildren();
    let cursor = 0;

    sizes.forEach((size, gi) => {
      if (gi > 0) el.append(...buildSeparator());
      const group = document.createElement("div");
      group.className = "zen-flex zen-items-center zen-gap-2";
      for (let s = 0; s < size; s++) {
        const input = makeSlot(cursor + s);
        group.append(input);
        inputs.push(input);
      }
      el.append(group);
      cursor += size;
    });

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  // Container-level paste, capture phase: mirrors React's onPasteCapture. It runs
  // before any slot's own paste listener and stops it, so a paste anywhere in the
  // field fills from the first slot regardless of which input received it.
  const onContainerPaste = (e: ClipboardEvent) => {
    if (current.disabled) return;
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    const max = current.maxLength ?? 6;
    const sanitized = sanitizePastedText(text, max, current.pasteTransformer);
    if (!sanitized) return;
    e.preventDefault();
    e.stopPropagation();
    applyDigits(sanitized);
  };
  el.addEventListener("paste", onContainerPaste, true);

  render();
  disposer.add(state.subscribe(repaint));
  disposer.add(() => el.removeEventListener("paste", onContainerPaste, true));
  disposer.add(() => {
    for (const c of slotCleanups) c();
    slotCleanups = [];
  });
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(next.value);
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
