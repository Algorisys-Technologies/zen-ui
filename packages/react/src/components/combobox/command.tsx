import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "../../lib/cn";

/**
 * Command primitives — styled wrappers around `cmdk`. Headless command-
 * palette / autocomplete engine: built-in fuzzy filtering, keyboard nav
 * (arrow keys, home/end, enter), accessibility. Used by Combobox below.
 *
 *   <Command>
 *     <CommandInput placeholder="Search…" />
 *     <CommandList>
 *       <CommandEmpty>No results.</CommandEmpty>
 *       <CommandGroup heading="Recent">
 *         <CommandItem onSelect={…}>Foo</CommandItem>
 *       </CommandGroup>
 *     </CommandList>
 *   </Command>
 */

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "zen-flex zen-h-full zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-bg-zen-background zen-text-zen-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = "Command";

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    className="zen-flex zen-items-center zen-border-b zen-border-zen-border zen-px-3"
    cmdk-input-wrapper=""
  >
    <SearchIcon />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "zen-flex zen-h-10 zen-w-full zen-bg-transparent zen-py-3 zen-text-sm zen-outline-none",
        "placeholder:zen-text-zen-muted-fg",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("zen-max-h-72 zen-overflow-y-auto zen-overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandLoading = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Loading>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Loading>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Loading
    ref={ref}
    className={cn("zen-py-4 zen-text-center zen-text-sm zen-text-zen-muted-fg", className)}
    {...props}
  />
));
CommandLoading.displayName = CommandPrimitive.Loading.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "zen-overflow-hidden zen-p-1 zen-text-zen-foreground",
      "[&_[cmdk-group-heading]]:zen-px-2 [&_[cmdk-group-heading]]:zen-py-1.5 [&_[cmdk-group-heading]]:zen-text-xs [&_[cmdk-group-heading]]:zen-font-semibold [&_[cmdk-group-heading]]:zen-text-zen-muted-fg",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
      "data-[selected=true]:zen-bg-zen-muted",
      "data-[disabled=true]:zen-pointer-events-none data-[disabled=true]:zen-opacity-50",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="zen-mr-2 zen-shrink-0 zen-opacity-50" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};
