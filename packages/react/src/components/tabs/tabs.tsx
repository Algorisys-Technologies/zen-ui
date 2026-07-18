import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Tabs — Radix-backed compound API. Use for switching between related
 * sections inside the same page or card (e.g. "Personal / Address /
 * Identity / Review" on a settings page; "Overview / Activity / Notes"
 * on a customer record).
 *
 *   <Tabs defaultValue="overview">
 *     <TabsList>
 *       <TabsTrigger value="overview">Overview</TabsTrigger>
 *       <TabsTrigger value="activity">Activity</TabsTrigger>
 *       <TabsTrigger value="notes">Notes</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="overview">…</TabsContent>
 *     <TabsContent value="activity">…</TabsContent>
 *     <TabsContent value="notes">…</TabsContent>
 *   </Tabs>
 *
 * Differs from Stepper in two ways:
 *   - Tabs are non-linear (any tab is always clickable; no completion
 *     semantics).
 *   - Tabs don't track progress through a flow — use Stepper when each
 *     step depends on validating the previous one.
 *
 * Two visual styles via `variant` on TabsList:
 *   - "underline" (default) — minimalist line under the active trigger,
 *     reads as document-style tabbed navigation.
 *   - "pills" — soft-bg pills inside a contained track, reads more like
 *     a segmented control / switcher.
 */

const Tabs = TabsPrimitive.Root;

/* ----------------------------- TabsList ------------------------------ */

const tabsListVariants = cva("zen-inline-flex zen-items-stretch", {
  variants: {
    variant: {
      underline:
        "zen-border-b zen-border-zen-border zen-w-full zen-gap-1",
      pills:
        "zen-rounded-zen-md zen-bg-zen-muted zen-p-1 zen-gap-1",
    },
    orientation: {
      // flex-wrap so a horizontal tab list with many tabs wraps to multiple
      // rows instead of overflowing/clipping its container.
      horizontal: "zen-flex-row zen-flex-wrap",
      vertical: "zen-flex-col zen-items-start",
    },
  },
  compoundVariants: [
    {
      variant: "underline",
      orientation: "vertical",
      class: "zen-border-b-0 zen-border-r zen-border-zen-border",
    },
    {
      variant: "pills",
      orientation: "vertical",
      class: "zen-items-stretch",
    },
  ],
  defaultVariants: {
    variant: "underline",
    orientation: "horizontal",
  },
});

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, orientation, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    /* Radix wires aria-orientation + arrow-key nav from
     * orientation; we pass it through and re-use it for styling. */
    data-variant={variant ?? "underline"}
    className={cn(tabsListVariants({ variant, orientation }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/* ----------------------------- TabsTrigger --------------------------- */

const tabsTriggerVariants = cva(
  [
    "zen-inline-flex zen-items-center zen-justify-center zen-whitespace-nowrap",
    "zen-text-sm zen-font-medium",
    "zen-border-0 zen-bg-transparent zen-cursor-pointer",
    "zen-transition-colors",
    "disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
  ].join(" "),
  {
    variants: {
      variant: {
        underline: [
          "zen-px-3 zen-py-2 -zen-mb-px zen-text-zen-muted-fg",
          "zen-border-b-2 zen-border-transparent",
          "hover:zen-text-zen-foreground",
          "data-[state=active]:zen-text-zen-primary data-[state=active]:zen-border-zen-primary",
        ].join(" "),
        pills: [
          "zen-px-3 zen-py-1.5 zen-rounded-zen-sm zen-text-zen-muted-fg",
          "hover:zen-text-zen-foreground",
          "data-[state=active]:zen-bg-zen-background data-[state=active]:zen-text-zen-foreground data-[state=active]:zen-shadow-zen-xs",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/* ----------------------------- TabsContent --------------------------- */

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "zen-mt-3 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring zen-rounded-zen-sm",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
