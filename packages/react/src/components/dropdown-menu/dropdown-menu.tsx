import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../../lib/cn";

/**
 * DropdownMenu — built on @radix-ui/react-dropdown-menu.
 *
 * Action-menu primitive (kebab menus, user menus, context-style menus).
 * NOT a form-input replacement — for that use the upcoming <Select> primitive.
 *
 * Compound API:
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild><Button>Options</Button></DropdownMenuTrigger>
 *     <DropdownMenuContent>
 *       <DropdownMenuLabel>My account</DropdownMenuLabel>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem onSelect={...}>Profile</DropdownMenuItem>
 *       <DropdownMenuItem onSelect={...}>Settings</DropdownMenuItem>
 *       <DropdownMenuItem variant="destructive" onSelect={...}>Sign out</DropdownMenuItem>
 *
 *       <DropdownMenuSeparator />
 *
 *       <DropdownMenuCheckboxItem checked={x} onCheckedChange={setX}>Show toolbar</DropdownMenuCheckboxItem>
 *
 *       <DropdownMenuRadioGroup value={r} onValueChange={setR}>
 *         <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
 *         <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
 *       </DropdownMenuRadioGroup>
 *
 *       <DropdownMenuSub>
 *         <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
 *         <DropdownMenuSubContent>...</DropdownMenuSubContent>
 *       </DropdownMenuSub>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 *
 * Radix supplies: positioning, collision detection, keyboard nav
 * (Arrow/Home/End/typeahead), focus trap, dismissal, controlled/uncontrolled
 * state, and full ARIA. Theming via --zen-* CSS variables.
 */

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "zen-flex zen-cursor-default zen-items-center zen-gap-2 zen-select-none zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
      "data-[state=open]:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted",
      inset && "zen-pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
  }
>(({ className, inset, variant = "default", ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      variant === "destructive" &&
        "zen-text-zen-error data-[highlighted]:zen-bg-zen-error-soft data-[highlighted]:zen-text-zen-error-soft-fg",
      inset && "zen-pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      className,
    )}
    {...props}
  >
    <span className="zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotIcon />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
      inset && "zen-pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "zen-ml-auto zen-text-xs zen-tracking-widest zen-text-zen-muted-fg",
      className,
    )}
    {...props}
  />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

/* ----------------------------- inline icons (no external deps) ----------- */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const DotIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="zen-ml-auto">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
