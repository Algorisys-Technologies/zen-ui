import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "../../../lib/cn";

/**
 * Select — compound API built on @radix-ui/react-select.
 *
 *   <Select value={v} onValueChange={setV}>
 *     <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
 *     <SelectContent>
 *       <SelectGroup>
 *         <SelectLabel>Group</SelectLabel>
 *         <SelectItem value="a">A</SelectItem>
 *       </SelectGroup>
 *     </SelectContent>
 *   </Select>
 *
 * Radix supplies positioning + collision detection, keyboard navigation
 * (Arrow keys, typeahead, Home/End), focus trap, dismissal, ARIA, and
 * form submission via name + value.
 *
 * Or data-driven, the shape the Solid and vanilla bindings take — pass
 * `options` and the trigger, list, label and error message are drawn for you:
 *
 *   <Select
 *     label="Country"
 *     placeholder="Choose a country"
 *     options={[{ value: "us", label: "United States" }, { value: "ca", label: "Canada" }]}
 *     value={country}
 *     onChange={setCountry}   // the value string, or null
 *   />
 *
 * Without `options` it is exactly the Radix root it always was, so the compound
 * form above keeps working.
 *
 * Note: Radix Select is **single-select**. For multi-select use a Combobox
 * primitive (deferred — see todo.md).
 */

/** One choice. `label` may be any node; a string is what typeahead matches. */
export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/** The data-driven form: the same props as the Solid and vanilla `Select`. */
export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  /** The chosen value string, or null when cleared. */
  onChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  /** A label above the trigger, associated with it. */
  label?: string;
  /** An error under the trigger; marks it invalid and describes it. */
  errorMessage?: string;
  /** Marked invalid without a message (the form shows its own): aria-invalid and the error border. */
  invalid?: boolean;
  /** Open the list when the select mounts, as an inline editor does. */
  defaultOpen?: boolean;
  /** The list opened or closed. */
  onOpenChange?: (open: boolean) => void;
  /** Lands on the trigger, so `<label htmlFor={id}>` names the control. */
  id?: string;
  /** Names the control when no visible `label` does. Lands on the trigger. */
  "aria-label"?: string;
}

type SelectRootProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> & {
  /** Marked invalid without a message (the form shows its own): the trigger's aria-invalid and the error border. */
  invalid?: boolean;
  options?: undefined;
};

/* Radix refuses an item whose value is "" (it is the "nothing chosen" value),
   so an "All" or "None" option would throw. It is keyed by a private sentinel
   instead; callers still see "" — the same trick the Solid binding uses. */
const EMPTY_OPTION_KEY = "\u0000zen-empty";
const toKey = (value: string) => (value === "" ? EMPTY_OPTION_KEY : value);
const fromKey = (key: string) => (key === EMPTY_OPTION_KEY ? "" : key);

/** `invalid` on the root reaches the trigger, the control that has focus. */
const SelectInvalidContext = React.createContext(false);

/**
 * Radix's Root, plus `invalid`: marked invalid without a message (the form
 * shows its own), so the trigger carries aria-invalid and the error border.
 */
const SelectRoot = ({ invalid = false, ...props }: SelectRootProps) => (
  <SelectInvalidContext.Provider value={invalid}>
    <SelectPrimitive.Root {...props} />
  </SelectInvalidContext.Provider>
);

/** The data-driven Select: everything drawn from `options`. */
const OptionsSelect = (props: SelectProps) => {
  const {
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled,
  required,
  name,
  className,
  label,
  errorMessage,
  invalid,
  defaultOpen,
  onOpenChange,
  id,
  "aria-label": ariaLabel,
  } = props;
  const autoId = React.useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const errorId = `${autoId}-error`;
  const known = (v: string | undefined) => v !== undefined && options.some((o) => o.value === v);
  /* Controlled when the `value` KEY is passed, even as undefined. The Solid
     call — `value={v ?? undefined}` with nothing chosen yet — passes
     undefined first and a string later, which React would otherwise read as a
     switch from uncontrolled to controlled (and warn). A value no option has
     shows the placeholder — Radix's "" — rather than a blank trigger. */
  const isControlled = "value" in props && defaultValue === undefined;
  const controlled = isControlled ? (known(value) ? toKey(value!) : "") : undefined;
  const isInvalid = !!errorMessage || !!invalid;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={triggerId} className="zen-text-sm zen-font-medium zen-text-zen-foreground zen-block zen-mb-1">
          {label}
        </label>
      )}
      <SelectRoot
        value={controlled}
        defaultValue={defaultValue !== undefined && known(defaultValue) ? toKey(defaultValue) : undefined}
        onValueChange={(key) => onChange?.(key ? fromKey(key) : null)}
        disabled={disabled}
        required={required}
        name={name}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        invalid={isInvalid}
      >
        <SelectTrigger id={triggerId} aria-label={ariaLabel} aria-describedby={errorMessage ? errorId : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={toKey(option.value)} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      {errorMessage && (
        <p id={errorId} className="zen-text-xs zen-text-zen-error zen-mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

/**
 * Radix's Root, plus `invalid`: marked invalid without a message (the form
 * shows its own), so the trigger carries aria-invalid and the error border.
 * Given `options`, the whole control instead — see OptionsSelect.
 */
const Select = (props: SelectRootProps | SelectProps) =>
  props.options ? <OptionsSelect {...props} /> : <SelectRoot {...(props as SelectRootProps)} />;
Select.displayName = "Select";
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    /** Marked invalid: aria-invalid and the error border. Also set by `<Select invalid>`. */
    invalid?: boolean;
  }
>(({ className, children, invalid, ...props }, ref) => {
  const rootInvalid = React.useContext(SelectInvalidContext);
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "zen-flex zen-h-zen-control zen-w-full zen-items-center zen-justify-between zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        // Marked invalid (aria-invalid="true", from `invalid` or the caller):
        // the error border, as Input and Combobox show theirs.
        "aria-[invalid=true]:zen-border-zen-error",
        "[&>span]:zen-line-clamp-1",
        className,
      )}
      {...props}
      // A screen reader is told through aria-invalid, on the control that has
      // focus; a caller's own aria-invalid stands when `invalid` is not set.
      aria-invalid={invalid || rootInvalid ? "true" : props["aria-invalid"]}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("zen-flex zen-cursor-default zen-items-center zen-justify-center zen-py-1", className)}
    {...props}
  >
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("zen-flex zen-cursor-default zen-items-center zen-justify-center zen-py-1", className)}
    {...props}
  >
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        "zen-relative zen-z-50 zen-max-h-96 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-md",
        position === "popper" &&
          "data-[side=bottom]:zen-translate-y-1 data-[side=left]:-zen-translate-x-1 data-[side=right]:zen-translate-x-1 data-[side=top]:-zen-translate-y-1",
        className,
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "zen-p-1",
          position === "popper" &&
            "zen-h-[var(--radix-select-trigger-height)] zen-w-full zen-min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-zen-menu-y zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      className,
    )}
    {...props}
  >
    <span className="zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
