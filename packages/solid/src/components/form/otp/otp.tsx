import {
  type JSX,
  For,
  Show,
  createContext,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import { cn } from "../../../lib/cn";
import "./otp.css";

/**
 * InputOTP — Solid port. One `<input>` per digit, zero dependencies.
 *
 *   <InputOTP value={code()} onValueChange={setCode} maxLength={6} />
 *
 * Custom layout (compound API):
 *
 *   <InputOTP value={code()} onValueChange={setCode} maxLength={6}>
 *     <InputOTPGroup>...</InputOTPGroup>
 *   </InputOTP>
 */

export type InputOTPProps = {
  value?: string;
  defaultValue?: string;
  /** Primary change handler. */
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. */
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  maxLength?: number;
  groupSizes?: number[];
  separator?: JSX.Element;
  children?: JSX.Element;
  class?: string;
  containerClass?: string;
  disabled?: boolean;
  /** Transform pasted text before extracting digits. */
  pasteTransformer?: (text: string) => string;
  /** CSS color for the default slot border. Defaults to `--zen-color-border`. */
  borderColor?: string;
  /** CSS color for the focused slot border. Defaults to `--zen-color-primary`. */
  focusBorderColor?: string;
  /** Extra classes applied to every digit input. */
  slotClass?: string;
};

// --- Context ---------------------------------------------------------------

type OTPContextValue = {
  value: () => string;
  maxLength: () => number;
  disabled: () => boolean | undefined;
  slotClass: () => string | undefined;
  setRef: (index: number, el: HTMLInputElement | null) => void;
  updateValue: (next: string) => void;
  focusInput: (index: number) => void;
  applyDigits: (digits: string) => void;
  sanitize: (raw: string) => string;
};

const OTPContext = createContext<OTPContextValue>();

function useOTPContext() {
  const ctx = useContext(OTPContext);
  if (!ctx) {
    throw new Error("InputOTP subcomponents must be used within <InputOTP>");
  }
  return ctx;
}

function digitsOnly(text: string) {
  return text.replace(/\D/g, "");
}

function sanitizePastedText(
  text: string,
  maxLength: number,
  pasteTransformer?: (text: string) => string,
) {
  const transformed = pasteTransformer ? pasteTransformer(text) : text;
  return digitsOnly(transformed).slice(0, maxLength);
}

const defaultGroupSizes = (maxLength: number): number[] => {
  if (maxLength === 6) return [3, 3];
  if (maxLength === 4) return [4];
  if (maxLength === 5) return [5];
  return [maxLength];
};

// --- The component ---------------------------------------------------------

export const InputOTP = (rawProps: InputOTPProps) => {
  const props = mergeProps({ maxLength: 6, defaultValue: "" }, rawProps);

  const isControlled = () => props.value !== undefined;
  const [uncontrolled, setUncontrolled] = createSignal(props.defaultValue);
  const value = () => (isControlled() ? (props.value as string) : uncontrolled());
  const maxLength = () => props.maxLength;

  const refs: (HTMLInputElement | null)[] = [];
  const setRef = (index: number, el: HTMLInputElement | null) => {
    refs[index] = el;
  };
  const focusInput = (index: number) => {
    const el = refs[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const emitChange = (v: string) => (props.onValueChange ?? props.onChange)?.(v);

  const updateValue = (next: string) => {
    const sanitized = digitsOnly(next).slice(0, maxLength());
    if (!isControlled()) setUncontrolled(sanitized);
    emitChange(sanitized);
    if (sanitized.length === maxLength()) props.onComplete?.(sanitized);
  };

  const sanitize = (raw: string) =>
    sanitizePastedText(raw, maxLength(), props.pasteTransformer);

  const applyDigits = (digits: string) => {
    const sanitized = sanitize(digits);
    if (!sanitized) return;
    updateValue(sanitized);
    focusInput(Math.min(sanitized.length, maxLength()) - 1);
  };

  const handleContainerPaste = (e: ClipboardEvent) => {
    if (props.disabled) return;
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    const sanitized = sanitize(text);
    if (!sanitized) return;
    e.preventDefault();
    e.stopPropagation();
    applyDigits(sanitized);
  };

  const style = (): JSX.CSSProperties => ({
    ...(props.borderColor ? { "--zen-otp-slot-border": props.borderColor } : {}),
    ...(props.focusBorderColor
      ? { "--zen-otp-slot-focus-border": props.focusBorderColor }
      : {}),
  });

  const ctx: OTPContextValue = {
    value,
    maxLength,
    disabled: () => props.disabled,
    slotClass: () => props.slotClass,
    setRef,
    updateValue,
    focusInput,
    applyDigits,
    sanitize,
  };

  return (
    <OTPContext.Provider value={ctx}>
      <div
        class={cn(
          "zen-flex zen-items-center zen-gap-2 has-[:disabled]:zen-opacity-50",
          props.containerClass,
          props.class,
        )}
        style={style()}
        onPaste={handleContainerPaste}
      >
        <Show
          when={props.children}
          fallback={
            <DefaultSlots
              maxLength={maxLength()}
              groupSizes={props.groupSizes}
              separator={props.separator}
            />
          }
        >
          {props.children}
        </Show>
      </div>
    </OTPContext.Provider>
  );
};

const DefaultSlots = (props: {
  maxLength: number;
  groupSizes?: number[];
  separator?: JSX.Element;
}) => {
  const groups = createMemo(() => {
    const sizes = props.groupSizes ?? defaultGroupSizes(props.maxLength);
    const out: { start: number; size: number }[] = [];
    let cursor = 0;
    for (const size of sizes) {
      out.push({ start: cursor, size });
      cursor += size;
    }
    return out;
  });

  return (
    <For each={groups()}>
      {(g, gi) => (
        <>
          <Show when={gi() > 0}>
            {props.separator ?? <InputOTPSeparator />}
          </Show>
          <InputOTPGroup>
            <For each={Array.from({ length: g.size }, (_, i) => g.start + i)}>
              {(idx) => <InputOTPSlot index={idx} />}
            </For>
          </InputOTPGroup>
        </>
      )}
    </For>
  );
};

// --- Compound parts --------------------------------------------------------

export type InputOTPGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
  class?: string;
  children?: JSX.Element;
};

export const InputOTPGroup = (props: InputOTPGroupProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div {...rest} class={cn("zen-flex zen-items-center zen-gap-2", local.class)}>
      {local.children}
    </div>
  );
};

const slotBaseClass = cn(
  "zen-otp-slot zen-h-11 zen-w-11 zen-rounded-zen-md zen-bg-zen-background zen-p-0",
  "zen-text-center zen-text-base zen-font-medium zen-text-zen-foreground zen-tabular-nums",
  "zen-transition-colors",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
);

// `disabled` is re-declared below only to keep it documented alongside
// `index`; its type is identical to the DOM's, so no Omit is required for it.
export type InputOTPSlotProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "class"> & {
  index: number;
  class?: string;
  disabled?: boolean;
};

export const InputOTPSlot = (rawProps: InputOTPSlotProps) => {
  const [local, rest] = splitProps(rawProps, ["index", "class", "disabled"]);
  const ctx = useOTPContext();
  const char = () => ctx.value()[local.index] ?? "";
  const isDisabled = () => ctx.disabled() || local.disabled;

  const handleInput = (
    e: InputEvent & { currentTarget: HTMLInputElement },
  ) => {
    const digits = ctx.sanitize(e.currentTarget.value);
    const v = ctx.value();
    const i = local.index;
    const max = ctx.maxLength();

    if (digits.length > 1) {
      ctx.applyDigits(digits);
      return;
    }
    if (!digits) {
      ctx.updateValue(v.slice(0, i) + v.slice(i + 1));
      return;
    }
    const next = (v.slice(0, i) + digits + v.slice(i + 1)).slice(0, max);
    ctx.updateValue(next);
    if (i < max - 1) ctx.focusInput(i + 1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const v = ctx.value();
    const i = local.index;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (char()) {
        ctx.updateValue(v.slice(0, i) + v.slice(i + 1));
        return;
      }
      if (i > 0) {
        const prev = i - 1;
        ctx.updateValue(v.slice(0, prev) + v.slice(prev + 1));
        ctx.focusInput(prev);
      }
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      ctx.focusInput(i - 1);
      return;
    }
    if (e.key === "ArrowRight" && i < ctx.maxLength() - 1) {
      e.preventDefault();
      ctx.focusInput(i + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    e.preventDefault();
    ctx.applyDigits(text);
  };

  return (
    <input
      {...rest}
      ref={(el) => ctx.setRef(local.index, el)}
      type="text"
      inputmode="numeric"
      autocomplete={local.index === 0 ? "one-time-code" : "off"}
      aria-label={`Digit ${local.index + 1} of ${ctx.maxLength()}`}
      disabled={isDisabled()}
      value={char()}
      class={cn(slotBaseClass, ctx.slotClass(), local.class)}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={(e) => e.currentTarget.select()}
    />
  );
};

export type InputOTPSeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string;
};

export const InputOTPSeparator = (props: InputOTPSeparatorProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div {...rest} role="separator" class={local.class}>
      <DashIcon />
    </div>
  );
};

const DashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden>
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);
