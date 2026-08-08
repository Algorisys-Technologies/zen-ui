import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type VariantProps } from "class-variance-authority";
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
declare const Tabs: React.ForwardRefExoticComponent<TabsPrimitive.TabsProps & React.RefAttributes<HTMLDivElement>>;
declare const tabsListVariants: (props?: ({
    variant?: "underline" | "pills" | null | undefined;
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>, VariantProps<typeof tabsListVariants> {
}
declare const TabsList: React.ForwardRefExoticComponent<TabsListProps & React.RefAttributes<HTMLDivElement>>;
declare const tabsTriggerVariants: (props?: ({
    variant?: "underline" | "pills" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>, VariantProps<typeof tabsTriggerVariants> {
}
declare const TabsTrigger: React.ForwardRefExoticComponent<TabsTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const TabsContent: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
//# sourceMappingURL=tabs.d.ts.map