import { type JSX, splitProps } from "solid-js";
import { Tabs as KTabs } from "@kobalte/core/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

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

export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
};

export const Tabs = (props: TabsProps) => {
  const [local] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "orientation",
    "activationMode",
    "disabled",
    "class",
    "children",
  ]);
  return (
    <KTabs
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={local.onChange}
      orientation={local.orientation}
      activationMode={local.activationMode}
      disabled={local.disabled}
      class={local.class}
    >
      {local.children}
    </KTabs>
  );
};

const tabsListVariants = cva("inline-flex items-stretch", {
  variants: {
    variant: {
      underline: "border-b border-zen-border w-full gap-1",
      pills: "rounded-zen-md bg-zen-muted p-1 gap-1",
    },
    orientation: {
      // flex-wrap so a horizontal tab list with many tabs wraps to multiple
      // rows instead of overflowing/clipping its container.
      horizontal: "flex-row flex-wrap",
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

export type TabsListProps = VariantProps<typeof tabsListVariants> & {
  class?: string;
  children?: JSX.Element;
};

export const TabsList = (props: TabsListProps) => {
  const [local] = splitProps(props, ["variant", "orientation", "class", "children"]);
  return (
    <KTabs.List
      data-variant={local.variant ?? "underline"}
      class={cn(
        tabsListVariants({ variant: local.variant, orientation: local.orientation }),
        local.class,
      )}
    >
      {local.children}
    </KTabs.List>
  );
};

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
          "data-[selected]:text-zen-primary data-[selected]:border-zen-primary",
        ].join(" "),
        pills: [
          "px-3 py-1.5 rounded-zen-sm text-zen-muted-fg",
          "hover:text-zen-foreground",
          "data-[selected]:bg-zen-background data-[selected]:text-zen-foreground data-[selected]:shadow-zen-xs",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  },
);

export type TabsTriggerProps = VariantProps<typeof tabsTriggerVariants> & {
  value: string;
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
};

export const TabsTrigger = (props: TabsTriggerProps) => {
  const [local] = splitProps(props, ["variant", "value", "disabled", "class", "children"]);
  return (
    <KTabs.Trigger
      value={local.value}
      disabled={local.disabled}
      class={cn(tabsTriggerVariants({ variant: local.variant }), local.class)}
    >
      {local.children}
    </KTabs.Trigger>
  );
};

export type TabsContentProps = {
  value: string;
  class?: string;
  children?: JSX.Element;
};

export const TabsContent = (props: TabsContentProps) => {
  const [local] = splitProps(props, ["value", "class", "children"]);
  return (
    <KTabs.Content
      value={local.value}
      class={cn(
        "mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring rounded-zen-sm",
        local.class,
      )}
    >
      {local.children}
    </KTabs.Content>
  );
};

export { tabsListVariants, tabsTriggerVariants };
