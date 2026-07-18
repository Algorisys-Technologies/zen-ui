import * as React from "react";
import { cn } from "../../../lib/cn";
import "./otp.css";

/**
 * InputOTP — one `<input>` per digit. Drop-in:
 *
 *   <InputOTP value={code} onValueChange={setCode} maxLength={6} />
 *
 * Custom layout (compound API):
 *
 *   <InputOTP value={code} onValueChange={setCode} maxLength={6}>
 *     <InputOTPGroup>...</InputOTPGroup>
 *   </InputOTP>
 */

// --- Props interface (named, single source of truth) -----------------------

export interface InputOTPProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "value" | "defaultValue" | "onChange" | "children"
  > {
  value?: string;
  defaultValue?: string;
  /** Primary change handler. */
  onValueChange?: (value: string) => void;
  /** @deprecated Use `onValueChange`. */
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  maxLength?: number;
  groupSizes?: number[];
  separator?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  /** Transform pasted text before extracting digits. */
  pasteTransformer?: (text: string) => string;
  /**
   * CSS color for the default slot border. Defaults to `--zen-color-border`
   * (theme-aware — visible in dark mode).
   */
  borderColor?: string;
  /**
   * CSS color for the focused slot border. Defaults to `--zen-color-primary`.
   */
  focusBorderColor?: string;
  /** Extra classes applied to every digit input. */
  slotClassName?: string;
}

// --- Context ---------------------------------------------------------------

type OTPContextValue = {
  value: string;
  maxLength: number;
  disabled?: boolean;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  updateValue: (next: string) => void;
  focusInput: (index: number) => void;
  applyDigits: (digits: string) => void;
  pasteTransformer?: (text: string) => string;
  slotClassName?: string;
};

const OTPInputContext = React.createContext<OTPContextValue | null>(null);

function useOTPContext() {
  const ctx = React.useContext(OTPInputContext);
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

// --- Default layout helpers ------------------------------------------------

const defaultGroupSizes = (maxLength: number): number[] => {
  if (maxLength === 6) return [3, 3];
  if (maxLength === 4) return [4];
  if (maxLength === 5) return [5];
  return [maxLength];
};

function renderDefaultSlots(
  maxLength: number,
  groupSizes: number[] | undefined,
  separator: React.ReactNode,
): React.ReactNode {
  const sizes = groupSizes ?? defaultGroupSizes(maxLength);
  const out: React.ReactNode[] = [];
  let cursor = 0;
  sizes.forEach((size, gi) => {
    if (gi > 0) {
      out.push(<React.Fragment key={`sep-${gi}`}>{separator}</React.Fragment>);
    }
    const slots = Array.from({ length: size }, (_, i) => (
      <InputOTPSlot key={cursor + i} index={cursor + i} />
    ));
    out.push(<InputOTPGroup key={`grp-${gi}`}>{slots}</InputOTPGroup>);
    cursor += size;
  });
  return out;
}

// --- The component ---------------------------------------------------------

export const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      onChange,
      onComplete,
      maxLength = 6,
      groupSizes,
      separator = <InputOTPSeparator />,
      children,
      className,
      containerClassName,
      disabled,
      pasteTransformer,
      borderColor,
      focusBorderColor,
      slotClassName,
      style,
      ...rest
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const valueChangeHandler = onValueChange ?? onChange;

    const updateValue = React.useCallback(
      (next: string) => {
        const sanitized = digitsOnly(next).slice(0, maxLength);
        if (!isControlled) {
          setUncontrolledValue(sanitized);
        }
        valueChangeHandler?.(sanitized);
        if (sanitized.length === maxLength) {
          onComplete?.(sanitized);
        }
      },
      [isControlled, maxLength, valueChangeHandler, onComplete],
    );

    const focusInput = React.useCallback((index: number) => {
      const el = inputRefs.current[index];
      if (el) {
        el.focus();
        el.select();
      }
    }, []);

    const applyDigits = React.useCallback(
      (digits: string) => {
        const sanitized = sanitizePastedText(digits, maxLength, pasteTransformer);
        if (!sanitized) return;
        updateValue(sanitized);
        focusInput(Math.min(sanitized.length, maxLength) - 1);
      },
      [focusInput, maxLength, pasteTransformer, updateValue],
    );

    const handleContainerPaste = React.useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const text = e.clipboardData.getData("text");
        if (!text) return;
        const sanitized = sanitizePastedText(text, maxLength, pasteTransformer);
        if (!sanitized) return;
        e.preventDefault();
        e.stopPropagation();
        applyDigits(sanitized);
      },
      [applyDigits, disabled, maxLength, pasteTransformer],
    );

    React.useImperativeHandle(ref, () => inputRefs.current[0] as HTMLInputElement);

    const otpStyle = React.useMemo(
      () =>
        ({
          ...(borderColor && { "--zen-otp-slot-border": borderColor }),
          ...(focusBorderColor && { "--zen-otp-slot-focus-border": focusBorderColor }),
        }) as React.CSSProperties,
      [borderColor, focusBorderColor],
    );

    const context = React.useMemo(
      () => ({
        value,
        maxLength,
        disabled,
        inputRefs,
        updateValue,
        focusInput,
        applyDigits,
        pasteTransformer,
        slotClassName,
      }),
      [
        value,
        maxLength,
        disabled,
        updateValue,
        focusInput,
        applyDigits,
        pasteTransformer,
        slotClassName,
      ],
    );

    const content =
      children ?? renderDefaultSlots(maxLength, groupSizes, separator);

    return (
      <OTPInputContext.Provider value={context}>
        <div
          className={cn(
            "zen-flex zen-items-center zen-gap-2 has-[:disabled]:zen-opacity-50",
            containerClassName,
            className,
          )}
          style={{ ...otpStyle, ...style }}
          onPasteCapture={handleContainerPaste}
          {...rest}
        >
          {content}
        </div>
      </OTPInputContext.Provider>
    );
  },
);
InputOTP.displayName = "InputOTP";

// --- Compound parts --------------------------------------------------------

export const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("zen-flex zen-items-center zen-gap-2", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const slotBaseClassName = cn(
  "zen-otp-slot zen-h-11 zen-w-11 zen-rounded-zen-md zen-bg-zen-background zen-p-0",
  "zen-text-center zen-text-base zen-font-medium zen-text-zen-foreground zen-tabular-nums",
  "zen-transition-colors",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
);

export const InputOTPSlot = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentPropsWithoutRef<"input">, "value"> & {
    index: number;
  }
>(
  (
    {
      index,
      className,
      disabled: slotDisabled,
      onChange: onChangeProp,
      onKeyDown: onKeyDownProp,
      onPaste: onPasteProp,
      onFocus: onFocusProp,
      ...props
    },
    ref,
  ) => {
    const {
      value,
      maxLength,
      disabled,
      inputRefs,
      updateValue,
      focusInput,
      applyDigits,
      pasteTransformer,
      slotClassName: contextSlotClassName,
    } = useOTPContext();
    const isDisabled = disabled || slotDisabled;
    const char = value[index] ?? "";

    const setRef = React.useCallback(
      (el: HTMLInputElement | null) => {
        inputRefs.current[index] = el;
        if (typeof ref === "function") {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      },
      [index, inputRefs, ref],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(e);
      const raw = e.target.value;
      const digits = sanitizePastedText(raw, maxLength, pasteTransformer);

      if (digits.length > 1) {
        applyDigits(digits);
        return;
      }

      if (!digits) {
        updateValue(value.slice(0, index) + value.slice(index + 1));
        return;
      }

      const next = (value.slice(0, index) + digits + value.slice(index + 1)).slice(
        0,
        maxLength,
      );
      updateValue(next);
      if (index < maxLength - 1) {
        focusInput(index + 1);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDownProp?.(e);
      if (e.defaultPrevented) return;

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

      if (e.key === "ArrowRight" && index < maxLength - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      onPasteProp?.(e);
      if (e.defaultPrevented) return;
      const text = e.clipboardData.getData("text");
      if (!text) return;
      e.preventDefault();
      applyDigits(text);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocusProp?.(e);
      e.target.select();
    };

    return (
      <input
        ref={setRef}
        type="text"
        inputMode="numeric"
        autoComplete={index === 0 ? "one-time-code" : "off"}
        aria-label={`Digit ${index + 1} of ${maxLength}`}
        disabled={isDisabled}
        value={char}
        className={cn(slotBaseClassName, contextSlotClassName, className)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        {...props}
      />
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

export const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <DashIcon />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

const DashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);
