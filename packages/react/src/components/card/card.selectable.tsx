import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../lib/cn";

/**
 * SelectableCard — radio-as-a-card pattern for onboarding "pick one"
 * questions (goal picker, plan picker, use-case picker). Selectable
 * cards consistently outperform classic radio lists for these
 * questions: bigger tap targets, room for icon + description,
 * decision-feel rather than option-feel.
 *
 *   <SelectableCardGroup value={goal} onValueChange={setGoal}>
 *     <SelectableCard value="invoice" title="Send invoices" icon={<I />}>
 *       Bill customers and track payments.
 *     </SelectableCard>
 *     <SelectableCard value="track" title="Track expenses" icon={<E />}>
 *       Log receipts and categorize spending.
 *     </SelectableCard>
 *   </SelectableCardGroup>
 *
 * Built on Radix RadioGroup so:
 *   - exactly-one selection, native radio-group keyboard nav (arrows +
 *     Home/End), proper form submission semantics,
 *   - controlled (`value` + `onValueChange`) or uncontrolled
 *     (`defaultValue`) state,
 *   - `disabled` works per-item or at the group level.
 *
 * The underlying `<input type="radio">` is visually hidden (Radix's
 * RadioGroupItem renders a button — we wrap its label so the whole
 * card surface is the click target).
 */

const SelectableCardGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("zen-grid zen-gap-3", className)}
    {...props}
  />
));
SelectableCardGroup.displayName = "SelectableCardGroup";

export interface SelectableCardProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    "children" | "title"
  > {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  /** Trailing badge slot (top-right) — typically a Badge with
   *  "Most popular" / "Best value" / "5+ users" style copy. */
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

const SelectableCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  SelectableCardProps
>(({ className, title, icon, badge, children, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "zen-group zen-relative zen-w-full zen-text-left",
      "zen-rounded-zen-md zen-border-2 zen-border-zen-border zen-bg-zen-background",
      "zen-p-4 zen-cursor-pointer zen-transition-colors",
      /* hover (only when not selected and not disabled) */
      "hover:zen-border-zen-muted-fg",
      /* selected state — primary ring + soft tint */
      "data-[state=checked]:zen-border-zen-primary data-[state=checked]:zen-bg-zen-primary-soft",
      /* disabled */
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50 disabled:hover:zen-border-zen-border",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      className,
    )}
    {...props}
  >
    {/* Top row: icon + title (+ optional badge) + check indicator */}
    <div className="zen-flex zen-items-start zen-gap-3">
      {icon ? (
        <span
          aria-hidden
          className={cn(
            "zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0",
            "zen-h-8 zen-w-8 zen-rounded-zen-sm",
            "zen-bg-zen-muted zen-text-zen-muted-fg",
            "group-data-[state=checked]:zen-bg-zen-primary group-data-[state=checked]:zen-text-zen-primary-fg",
          )}
        >
          {icon}
        </span>
      ) : null}
      <div className="zen-flex-1 zen-min-w-0">
        <div className="zen-flex zen-items-center zen-gap-2">
          {title ? (
            <span className="zen-text-sm zen-font-semibold zen-text-zen-foreground">
              {title}
            </span>
          ) : null}
          {badge ? <span className="zen-ml-auto">{badge}</span> : null}
        </div>
        {children ? (
          <div className="zen-text-xs zen-text-zen-muted-fg zen-mt-1 zen-leading-relaxed">
            {children}
          </div>
        ) : null}
      </div>
    </div>

    {/* Top-right check indicator — only visible when selected. */}
    <RadioGroupPrimitive.Indicator
      className={cn(
        "zen-absolute zen-top-2.5 zen-right-2.5",
        "zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-5 zen-w-5 zen-rounded-zen-full",
        "zen-bg-zen-primary zen-text-zen-primary-fg",
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
SelectableCard.displayName = "SelectableCard";

export { SelectableCard, SelectableCardGroup };
