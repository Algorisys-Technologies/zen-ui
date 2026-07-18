import {
  type JSX,
  createContext,
  createRenderEffect,
  createSignal,
  splitProps,
  useContext,
} from "solid-js";
import { DropdownMenu as KDropdown, type DropdownMenuRootProps } from "@kobalte/core/dropdown-menu";
import { cn } from "../../lib/cn";

/**
 * DropdownMenu — Solid port built on Kobalte DropdownMenu.
 *
 * Action-menu primitive (kebab menus, user menus, context-style menus).
 * NOT a form-input replacement — for that use <Select>.
 *
 *   <DropdownMenu>
 *     <DropdownMenuTrigger as={Button}>Options</DropdownMenuTrigger>
 *     <DropdownMenuContent align="end">
 *       <DropdownMenuLabel>My account</DropdownMenuLabel>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem onSelect={…}>Profile</DropdownMenuItem>
 *       <DropdownMenuItem variant="destructive" onSelect={signOut}>Sign out</DropdownMenuItem>
 *
 *       <DropdownMenuCheckboxItem checked={x()} onChange={setX}>Show toolbar</DropdownMenuCheckboxItem>
 *
 *       <DropdownMenuRadioGroup value={r()} onChange={setR}>
 *         <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
 *         <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
 *       </DropdownMenuRadioGroup>
 *
 *       <DropdownMenuSub>
 *         <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
 *         <DropdownMenuSubContent>…</DropdownMenuSubContent>
 *       </DropdownMenuSub>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 */

export const DropdownMenuTrigger = KDropdown.Trigger;
export const DropdownMenuGroup = KDropdown.Group;
export const DropdownMenuPortal = KDropdown.Portal;
export const DropdownMenuSub = KDropdown.Sub;
export const DropdownMenuRadioGroup = KDropdown.RadioGroup;

/** Mirrors React/Radix's `align` on DropdownMenuContent. */
export type DropdownMenuAlign = "start" | "center" | "end";

/** React's DropdownMenuContent defaults `sideOffset` to 4; keep the bindings identical. */
const DEFAULT_SIDE_OFFSET = 4;

const PLACEMENT_BY_ALIGN = {
  start: "bottom-start",
  center: "bottom",
  end: "bottom-end",
} as const satisfies Record<DropdownMenuAlign, NonNullable<DropdownMenuRootProps["placement"]>>;

/**
 * Radix positions the menu from <DropdownMenuContent align sideOffset>, but Kobalte
 * positions it from the ROOT (`placement` / `gutter`) — its Content accepts neither
 * prop, and would render `align` as a stray DOM attribute. To keep the two bindings'
 * APIs identical, Content accepts align/sideOffset and hands them to the root through
 * this context. Registration runs during render, while the menu is still closed, so
 * the placement is already correct the first time it opens.
 */
type MenuPlacementContextValue = {
  setAlign: (align: DropdownMenuAlign) => void;
  setSideOffset: (offset: number) => void;
};

const MenuPlacementContext = createContext<MenuPlacementContextValue>();

/**
 * Root. Forwards every Kobalte root prop; an explicit `placement`/`gutter` wins over
 * the one derived from Content's `align`/`sideOffset`.
 */
export const DropdownMenu = (props: DropdownMenuRootProps) => {
  const [align, setAlign] = createSignal<DropdownMenuAlign>("start");
  const [sideOffset, setSideOffset] = createSignal(DEFAULT_SIDE_OFFSET);
  return (
    <MenuPlacementContext.Provider value={{ setAlign, setSideOffset }}>
      <KDropdown placement={PLACEMENT_BY_ALIGN[align()]} gutter={sideOffset()} {...props} />
    </MenuPlacementContext.Provider>
  );
};

export type DropdownMenuContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
  /** Alignment against the trigger. Mirrors React/Radix. Default "start". */
  align?: DropdownMenuAlign;
  /** Gap in px between trigger and menu. Mirrors React/Radix. Default 4. */
  sideOffset?: number;
};

export const DropdownMenuContent = (props: DropdownMenuContentProps) => {
  // align/sideOffset are consumed here, never forwarded — Kobalte's Content has no
  // such props and would leak them onto the DOM node.
  const [local, rest] = splitProps(props, ["class", "children", "align", "sideOffset"]);
  const placement = useContext(MenuPlacementContext);
  createRenderEffect(() => {
    placement?.setAlign(local.align ?? "start");
    placement?.setSideOffset(local.sideOffset ?? DEFAULT_SIDE_OFFSET);
  });
  return (
    <KDropdown.Portal>
      <KDropdown.Content
        {...rest}
        class={cn(
          "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
          local.class,
        )}
      >
        {local.children}
      </KDropdown.Content>
    </KDropdown.Portal>
  );
};

export type DropdownMenuSubTriggerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
  inset?: boolean;
};

export const DropdownMenuSubTrigger = (props: DropdownMenuSubTriggerProps) => {
  const [local, rest] = splitProps(props, ["class", "inset", "children"]);
  return (
    <KDropdown.SubTrigger
      {...rest}
      class={cn(
        "zen-flex zen-cursor-default zen-items-center zen-gap-2 zen-select-none zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
        "data-[expanded]:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted",
        local.inset && "zen-pl-8",
        local.class,
      )}
    >
      {local.children}
      <ChevronRightIcon />
    </KDropdown.SubTrigger>
  );
};

export type DropdownMenuSubContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const DropdownMenuSubContent = (props: DropdownMenuSubContentProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <KDropdown.Portal>
      <KDropdown.SubContent
        {...rest}
        class={cn(
          "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
          local.class,
        )}
      >
        {local.children}
      </KDropdown.SubContent>
    </KDropdown.Portal>
  );
};

// `onSelect` is omitted from the DOM attributes: Kobalte's Item takes a
// `() => void` action callback, which collides with the DOM's select event.
export type DropdownMenuItemProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children" | "onSelect"
> & {
  class?: string;
  children?: JSX.Element;
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onSelect?: () => void;
};

export const DropdownMenuItem = (props: DropdownMenuItemProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "inset",
    "variant",
    "disabled",
    "onSelect",
    "children",
  ]);
  return (
    <KDropdown.Item
      {...rest}
      disabled={local.disabled}
      onSelect={local.onSelect}
      class={cn(
        "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
        "data-[highlighted]:zen-bg-zen-muted",
        "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
        local.variant === "destructive" &&
          "zen-text-zen-error data-[highlighted]:zen-bg-zen-error-soft data-[highlighted]:zen-text-zen-error-soft-fg",
        local.inset && "zen-pl-8",
        local.class,
      )}
    >
      {local.children}
    </KDropdown.Item>
  );
};

// `onChange`/`onSelect` are omitted from the DOM attributes: Kobalte's CheckboxItem
// reports the new checked state and takes a `() => void` action callback, which
// collide with the DOM's change/select events.
export type DropdownMenuCheckboxItemProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children" | "onChange" | "onSelect"
> & {
  class?: string;
  children?: JSX.Element;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onSelect?: () => void;
  disabled?: boolean;
};

export const DropdownMenuCheckboxItem = (props: DropdownMenuCheckboxItemProps) => {
  const [local, rest] = splitProps(props, ["class", "checked", "onChange", "disabled", "children"]);
  return (
    <KDropdown.CheckboxItem
      {...rest}
      checked={local.checked}
      onChange={local.onChange}
      disabled={local.disabled}
      class={cn(
        "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
        "data-[highlighted]:zen-bg-zen-muted",
        "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
        local.class,
      )}
    >
      <span class="zen-absolute zen-left-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center">
        <KDropdown.ItemIndicator>
          <CheckIcon />
        </KDropdown.ItemIndicator>
      </span>
      {local.children}
    </KDropdown.CheckboxItem>
  );
};

// `onSelect` omitted for the same reason as DropdownMenuItem.
export type DropdownMenuRadioItemProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children" | "onSelect"
> & {
  class?: string;
  children?: JSX.Element;
  value: string;
  onSelect?: () => void;
  disabled?: boolean;
};

export const DropdownMenuRadioItem = (props: DropdownMenuRadioItemProps) => {
  const [local, rest] = splitProps(props, ["class", "value", "disabled", "children"]);
  return (
    <KDropdown.RadioItem
      {...rest}
      value={local.value}
      disabled={local.disabled}
      class={cn(
        "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
        "data-[highlighted]:zen-bg-zen-muted",
        "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
        local.class,
      )}
    >
      <span class="zen-absolute zen-left-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center">
        <KDropdown.ItemIndicator>
          <DotIcon />
        </KDropdown.ItemIndicator>
      </span>
      {local.children}
    </KDropdown.RadioItem>
  );
};

// Kobalte's GroupLabel renders a <span>.
export type DropdownMenuLabelProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
  inset?: boolean;
};

export const DropdownMenuLabel = (props: DropdownMenuLabelProps) => {
  const [local, rest] = splitProps(props, ["class", "inset", "children"]);
  return (
    <KDropdown.GroupLabel
      {...rest}
      class={cn(
        "zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
        local.inset && "zen-pl-8",
        local.class,
      )}
    >
      {local.children}
    </KDropdown.GroupLabel>
  );
};

// Kobalte's Separator renders an <hr>.
export type DropdownMenuSeparatorProps = Omit<JSX.HTMLAttributes<HTMLHRElement>, "class"> & {
  class?: string;
};

export const DropdownMenuSeparator = (props: DropdownMenuSeparatorProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <KDropdown.Separator
      {...rest}
      class={cn("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", local.class)}
    />
  );
};

export type DropdownMenuShortcutProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const DropdownMenuShortcut = (props: DropdownMenuShortcutProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      {...rest}
      class={cn("zen-ml-auto zen-text-xs zen-tracking-widest zen-text-zen-muted-fg", local.class)}
    >
      {local.children}
    </span>
  );
};

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const DotIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="zen-ml-auto">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
