import { type JSX, splitProps } from "solid-js";
import { Accordion as KAccordion } from "@kobalte/core/accordion";
import { cn } from "../../lib/cn";

/**
 * Accordion — Solid port built on Kobalte Accordion.
 *
 *   <Accordion collapsible defaultValue={["basic"]}>
 *     <AccordionItem value="basic">
 *       <AccordionTrigger>Basic info</AccordionTrigger>
 *       <AccordionContent>…</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 *
 * API delta from Radix: Kobalte uses `collapsible` + `multiple` flags
 * (instead of Radix's `type="single" | "multiple"`). `value` /
 * `defaultValue` are always string[] under Kobalte. Animations use the
 * `data-expanded` / `data-closed` attributes Kobalte sets on the
 * Content element.
 */

// `onChange` is omitted from the DOM attributes: it collides with the
// generic DOM change-event handler, but Kobalte's root reports the new
// open value(s) instead.
export type AccordionProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children" | "onChange"
> & {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** When true, allows multiple items to be open at the same time. */
  multiple?: boolean;
  /** When true (single mode), the active item can be collapsed. */
  collapsible?: boolean;
  class?: string;
  children?: JSX.Element;
};

export const Accordion = (props: AccordionProps) => {
  const [local, rest] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "multiple",
    "collapsible",
    "class",
    "children",
  ]);
  return (
    <KAccordion
      {...rest}
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={local.onChange}
      multiple={local.multiple}
      collapsible={local.collapsible}
      class={local.class}
    >
      {local.children}
    </KAccordion>
  );
};

export type AccordionItemProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  value: string;
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
};

export const AccordionItem = (props: AccordionItemProps) => {
  const [local, rest] = splitProps(props, ["value", "disabled", "class", "children"]);
  return (
    <KAccordion.Item
      {...rest}
      value={local.value}
      disabled={local.disabled}
      class={cn("zen-border-b zen-border-zen-border last:zen-border-b-0", local.class)}
    >
      {local.children}
    </KAccordion.Item>
  );
};

// Kobalte's Trigger renders a <button>.
export type AccordionTriggerProps = Omit<
  JSX.HTMLAttributes<HTMLButtonElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const AccordionTrigger = (props: AccordionTriggerProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KAccordion.Header class="zen-flex">
      <KAccordion.Trigger
        {...rest}
        class={cn(
          "zen-flex zen-flex-1 zen-items-center zen-justify-between zen-gap-2",
          "zen-py-3 zen-px-1 zen-text-sm zen-font-medium zen-text-left",
          "zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "zen-transition-colors hover:zen-text-zen-foreground",
          "zen-text-zen-foreground",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset zen-rounded-zen-sm",
          // Rotate the trailing chevron when expanded.
          "[&[data-expanded]>svg.zen-acc-chevron]:zen-rotate-180",
          local.class,
        )}
      >
        {local.children}
        <svg
          class="zen-acc-chevron zen-transition-transform zen-duration-200 zen-text-zen-muted-fg zen-flex-shrink-0"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </KAccordion.Trigger>
    </KAccordion.Header>
  );
};

// Kobalte's Content renders a <div>. `rest` is forwarded to Content itself
// (not the inner div), matching the React binding where the outer
// Radix Content carries `{...props}` and only the inner div gets `class`.
export type AccordionContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const AccordionContent = (props: AccordionContentProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KAccordion.Content
      {...rest}
      /* core's keyframes interpolate height to --zen-collapsible-content-height,
       * a neutral name. core used to read Radix's --radix-accordion-content-height
       * directly, which Kobalte never sets — so this animation could not have run
       * here even once the class started generating. Kobalte publishes the same
       * measurement under its own name; this is the mapping. */
      style={{ "--zen-collapsible-content-height": "var(--kb-accordion-content-height)" }}
      class="zen-overflow-hidden zen-text-sm data-[closed]:zen-anim-accordion-up data-[expanded]:zen-anim-accordion-down"
    >
      <div class={cn("zen-pb-3 zen-px-1 zen-pt-0 zen-text-zen-foreground", local.class)}>
        {local.children}
      </div>
    </KAccordion.Content>
  );
};
