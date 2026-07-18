import { type JSX, splitProps } from "solid-js";
import { RadioGroup as KRadioGroup } from "@kobalte/core/radio-group";
import { cn } from "../../lib/cn";

/**
 * SelectableCard — radio-as-a-card pattern for onboarding "pick one"
 * questions (goal picker, plan picker, use-case picker). Solid port
 * built on Kobalte's RadioGroup.
 *
 *   <SelectableCardGroup value={goal()} onValueChange={setGoal}>
 *     <SelectableCard value="invoice" title="Send invoices" icon={<I />}>
 *       Bill customers and track payments.
 *     </SelectableCard>
 *     <SelectableCard value="track" title="Track expenses" icon={<E />}>
 *       Log receipts and categorize spending.
 *     </SelectableCard>
 *   </SelectableCardGroup>
 *
 * Kobalte handles exactly-one selection, full keyboard nav (arrows +
 * Home/End), and form submission semantics via a hidden radio input.
 *
 * API delta from the React (Radix) binding: the prop is `onValueChange`
 * on the React side; in Solid we use `onChange` to match Kobalte's
 * idiom across the rest of the binding. Both forms are accepted.
 */

// `onChange` is omitted from the DOM attributes: this group reports the new
// value string directly, which collides with the DOM's change event.
export type SelectableCardGroupProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Alias for onChange, for parity with the React `onValueChange` name. */
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  class?: string;
  children?: JSX.Element;
};

export const SelectableCardGroup = (props: SelectableCardGroupProps) => {
  const [local, rest] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "onValueChange",
    "name",
    "disabled",
    "required",
    "orientation",
    "class",
    "children",
  ]);
  return (
    <KRadioGroup
      {...rest}
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={(v) => {
        local.onChange?.(v);
        local.onValueChange?.(v);
      }}
      name={local.name}
      disabled={local.disabled}
      required={local.required}
      orientation={local.orientation}
      class={cn("zen-grid zen-gap-3", local.class)}
    >
      {local.children}
    </KRadioGroup>
  );
};

export type SelectableCardProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  value: string;
  title?: JSX.Element;
  icon?: JSX.Element;
  /** Trailing badge slot (top-right) — typically a Badge component with
   *  "Most popular" / "Best value" / "5+ users" style copy. */
  badge?: JSX.Element;
  children?: JSX.Element;
  disabled?: boolean;
  class?: string;
};

export const SelectableCard = (props: SelectableCardProps) => {
  const [local, rest] = splitProps(props, [
    "value",
    "title",
    "icon",
    "badge",
    "children",
    "disabled",
    "class",
  ]);
  return (
    <KRadioGroup.Item
      {...rest}
      value={local.value}
      disabled={local.disabled}
      class={cn(
        "zen-group zen-relative zen-w-full zen-text-left",
        "zen-rounded-zen-md zen-border-2 zen-border-zen-border zen-bg-zen-background",
        "zen-p-4 zen-cursor-pointer zen-transition-colors",
        // hover (only when not selected and not disabled)
        "hover:zen-border-zen-muted-fg",
        // selected — primary ring + soft tint (Kobalte uses data-checked)
        "data-[checked]:zen-border-zen-primary data-[checked]:zen-bg-zen-primary-soft",
        // disabled
        "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50",
        "data-[disabled]:hover:zen-border-zen-border",
        "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
        local.class,
      )}
    >
      <KRadioGroup.ItemInput class="zen-sr-only" />
      <KRadioGroup.ItemControl class="zen-contents">
        {/* Top row: icon + title (+ optional badge) */}
        <div class="zen-flex zen-items-start zen-gap-3">
          {local.icon ? (
            <span
              aria-hidden="true"
              class={cn(
                "zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0",
                "zen-h-8 zen-w-8 zen-rounded-zen-sm",
                "zen-bg-zen-muted zen-text-zen-muted-fg",
                "group-data-[checked]:zen-bg-zen-primary group-data-[checked]:zen-text-zen-primary-fg",
              )}
            >
              {local.icon}
            </span>
          ) : null}
          <div class="zen-flex-1 zen-min-w-0">
            <div class="zen-flex zen-items-center zen-gap-2">
              {local.title ? (
                <KRadioGroup.ItemLabel class="zen-text-sm zen-font-semibold zen-text-zen-foreground">
                  {local.title}
                </KRadioGroup.ItemLabel>
              ) : null}
              {local.badge ? <span class="zen-ml-auto">{local.badge}</span> : null}
            </div>
            {local.children ? (
              <div class="zen-text-xs zen-text-zen-muted-fg zen-mt-1 zen-leading-relaxed">
                {local.children}
              </div>
            ) : null}
          </div>
        </div>

        {/* Top-right check indicator — only visible when selected. */}
        <KRadioGroup.ItemIndicator
          class={cn(
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
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </KRadioGroup.ItemIndicator>
      </KRadioGroup.ItemControl>
    </KRadioGroup.Item>
  );
};
