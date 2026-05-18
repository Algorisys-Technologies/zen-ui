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

const tabsListVariants = cva("inline-flex items-stretch", {
  variants: {
    variant: {
      underline:
        "border-b border-zen-border w-full gap-1",
      pills:
        "rounded-zen-md bg-zen-muted p-1 gap-1",
    },
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col items-start",
    },
  },
  compoundVariants: [
    {
      variant: "underline",
      orientation: "vertical",
      class: "border-b-0 border-r border-zen-border",
    },
    {
      variant: "pills",
      orientation: "vertical",
      class: "items-stretch",
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
    "inline-flex items-center justify-center whitespace-nowrap",
    "text-sm font-medium",
    "border-0 bg-transparent cursor-pointer",
    "transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring focus-visible:ring-inset",
  ].join(" "),
  {
    variants: {
      variant: {
        underline: [
          "px-3 py-2 -mb-px text-zen-muted-fg",
          "border-b-2 border-transparent",
          "hover:text-zen-foreground",
          "data-[state=active]:text-zen-primary data-[state=active]:border-zen-primary",
        ].join(" "),
        pills: [
          "px-3 py-1.5 rounded-zen-sm text-zen-muted-fg",
          "hover:text-zen-foreground",
          "data-[state=active]:bg-zen-background data-[state=active]:text-zen-foreground data-[state=active]:shadow-zen-xs",
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
      "mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring rounded-zen-sm",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
