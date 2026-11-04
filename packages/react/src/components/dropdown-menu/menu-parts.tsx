import { cn } from "../../lib/cn";

/**
 * The look DropdownMenu and ContextMenu share. Radix scopes each menu's parts
 * to its own root, so a DropdownMenuItem cannot render inside a ContextMenu
 * (in Solid, Kobalte shares one set of item parts and ContextMenu reuses them
 * outright). Here the two menus are separate components over one set of
 * classes and icons, which is what keeps them from drifting apart in look.
 */

export const menuContentClass = (className?: string) =>
  cn(
    "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
    className,
  );

export const menuSubTriggerClass = (inset?: boolean, className?: string) =>
  cn(
    "zen-flex zen-cursor-default zen-items-center zen-gap-2 zen-select-none zen-rounded-zen-sm zen-px-2 zen-py-zen-menu-y zen-text-sm zen-outline-none",
    "data-[state=open]:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted",
    inset && "zen-pl-8",
    className,
  );

export const menuItemClass = (variant: "default" | "destructive", inset?: boolean, className?: string) =>
  cn(
    "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-zen-menu-y zen-text-sm zen-outline-none",
    "data-[highlighted]:zen-bg-zen-muted",
    "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
    variant === "destructive" &&
      "zen-text-zen-error data-[highlighted]:zen-bg-zen-error-soft data-[highlighted]:zen-text-zen-error-soft-fg",
    inset && "zen-pl-8",
    className,
  );

/** Checkbox and radio items: room on the start side for the indicator. */
export const menuIndicatorItemClass = (className?: string) =>
  cn(
    "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-zen-menu-y zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
    "data-[highlighted]:zen-bg-zen-muted",
    "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
    className,
  );

export const menuIndicatorSlotClass =
  "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center";

export const menuLabelClass = (inset?: boolean, className?: string) =>
  cn(
    "zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
    inset && "zen-pl-8",
    className,
  );

export const menuSeparatorClass = (className?: string) =>
  cn("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", className);

export const menuShortcutClass = (className?: string) =>
  cn("zen-ml-auto zen-text-xs zen-tracking-widest zen-text-zen-muted-fg", className);

/* ----------------------------- inline icons (no external deps) ----------- */
export const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
export const DotIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" />
  </svg>
);
export const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="zen-ml-auto">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
