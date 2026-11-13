import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../../lib/cn";

/**
 * RadioGroup + RadioGroupItem — built on @radix-ui/react-radio-group.
 *
 *   <RadioGroup value={x} onValueChange={setX} label="Plan">
 *     <RadioGroupItem value="a" label="A" />
 *     <RadioGroupItem value="b" id="b" /> <label htmlFor="b">B</label>
 *   </RadioGroup>
 *
 * Radix supplies roving tabindex, arrow-key navigation, keyboard
 * activation, ARIA, and form submission (name + value).
 */

export type RadioSize = "sm" | "md" | "lg";

export interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /** Names the group — the question the options answer. Wired to the group's
   *  `aria-labelledby`, so a screen reader announces it before the options. */
  label?: React.ReactNode;
  /** Help text under the options, wired to the group's `aria-describedby`. */
  description?: React.ReactNode;
}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, label, description, children, ...props }, ref) => {
  const uid = React.useId();
  // Without a label or description the root IS the item container, exactly as
  // before these props existed; with one, the root stacks heading, items and
  // help text, and the items get a container of their own.
  if (label == null && description == null) {
    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn("zen-grid zen-gap-2", className)}
        {...props}
      >
        {children}
      </RadioGroupPrimitive.Root>
    );
  }
  const labelId = label != null ? `${uid}-label` : undefined;
  const descriptionId = description != null ? `${uid}-description` : undefined;
  // A caller's own aria-labelledby / aria-describedby are kept, ours appended.
  const join = (...ids: (string | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn("zen-flex zen-flex-col zen-gap-2", className)}
      {...props}
      aria-labelledby={join(props["aria-labelledby"], labelId)}
      aria-describedby={join(props["aria-describedby"], descriptionId)}
    >
      {label != null ? (
        <span
          id={labelId}
          className="zen-text-sm zen-font-medium zen-leading-none zen-text-zen-foreground"
        >
          {label}
        </span>
      ) : null}
      <div
        className={
          props.orientation === "horizontal" ? "zen-flex zen-gap-3" : "zen-grid zen-gap-2"
        }
      >
        {children}
      </div>
      {description != null ? (
        <div id={descriptionId} className="zen-text-xs zen-text-zen-muted-fg">
          {description}
        </div>
      ) : null}
    </RadioGroupPrimitive.Root>
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const ITEM_SIZES: Record<RadioSize, string> = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5",
};

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  size?: RadioSize;
  /** The option's text. Renders a `<label>` around the radio, so clicking the
   *  text selects it and the text becomes the radio's accessible name. */
  label?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ label, ...props }, ref) => {
  const radio = <RadioGroupRadio ref={ref} {...props} />;
  if (label == null) return radio;
  return (
    <label className="zen-inline-flex zen-items-center zen-gap-2 zen-text-sm">
      {radio}
      <span>{label}</span>
    </label>
  );
});

const RadioGroupRadio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  Omit<RadioGroupItemProps, "label">
>(({ className, size = "md", ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      // zen-p-0: a <button>'s default padding is 1px 6px, which left a 16px
      // radio 2px of content width and squeezed the dot into a 2×8 bar.
      "zen-aspect-square zen-p-0 zen-rounded-zen-full zen-border zen-border-zen-border zen-text-zen-primary",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "data-[state=checked]:zen-border-zen-primary",
      ITEM_SIZES[size],
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="zen-flex zen-items-center zen-justify-center">
      <span className="zen-block zen-h-2 zen-w-2 zen-rounded-zen-full zen-bg-zen-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupRadio.displayName = RadioGroupPrimitive.Item.displayName;
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
