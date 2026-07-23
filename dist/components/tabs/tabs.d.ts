import { type JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
/**
 * Tabs — Solid port built on Kobalte Tabs.
 *
 *   <Tabs defaultValue="overview">
 *     <TabsList>
 *       <TabsTrigger value="overview">Overview</TabsTrigger>
 *       <TabsTrigger value="activity">Activity</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="overview">…</TabsContent>
 *     <TabsContent value="activity">…</TabsContent>
 *   </Tabs>
 *
 * Two visual styles via `variant` on TabsList — "underline" (default,
 * document-style) or "pills" (segmented switcher).
 */
export type TabsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children" | "onChange"> & {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    orientation?: "horizontal" | "vertical";
    activationMode?: "automatic" | "manual";
    disabled?: boolean;
    class?: string;
    children?: JSX.Element;
};
export declare const Tabs: (props: TabsProps) => JSX.Element;
declare const tabsListVariants: (props?: ({
    variant?: "underline" | "pills" | null | undefined;
    orientation?: "horizontal" | "vertical" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type TabsListProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & VariantProps<typeof tabsListVariants> & {
    class?: string;
    children?: JSX.Element;
};
export declare const TabsList: (props: TabsListProps) => JSX.Element;
declare const tabsTriggerVariants: (props?: ({
    variant?: "underline" | "pills" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type TabsTriggerProps = Omit<JSX.HTMLAttributes<HTMLButtonElement>, "class" | "children"> & VariantProps<typeof tabsTriggerVariants> & {
    value: string;
    disabled?: boolean;
    class?: string;
    children?: JSX.Element;
};
export declare const TabsTrigger: (props: TabsTriggerProps) => JSX.Element;
export type TabsContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    value: string;
    class?: string;
    children?: JSX.Element;
};
export declare const TabsContent: (props: TabsContentProps) => JSX.Element;
export { tabsListVariants, tabsTriggerVariants };
//# sourceMappingURL=tabs.d.ts.map